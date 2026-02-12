import { DefaultSigner, MempoolProvider, PrivateKey, SupportedNetwork } from "@opcat-labs/scrypt-ts-opcat";
import {burnToken} from '@opcat-labs/cat-sdk'


const getTrackerUrl = (mempoolProvider: MempoolProvider) => `${(mempoolProvider as any).getMempoolApiHost()}/api/tracker`

export async function burnAllTokens(
    privateKeyWif: string,
    network: SupportedNetwork
) {
    const signer = new DefaultSigner(PrivateKey.fromWIF(privateKeyWif))
    const address = await signer.getAddress()
    console.log('address', address)
    const provider = new MempoolProvider(network)
    const trackerUrl = getTrackerUrl(provider)
    const balancesResp: any = await (await fetch(`${trackerUrl}/api/addresses/${address}/balances`)).json()
    const balances = balancesResp.data.balances;
    console.log('balances', balances)

    for (let balance of balances) {
        try {
            console.log('start burn', balance)
            const tokenInfoResp: any = await (await fetch(`${trackerUrl}/api/tokens/${balance.tokenId}`)).json()
            const tokenInfo = tokenInfoResp.data;
            const tokenUtxosResp: any = await (await fetch(`${trackerUrl}/api/tokens/${balance.tokenId}/addresses/${address}/utxos`)).json()
            const tokenUtxos: any[] = tokenUtxosResp.data.utxos;
            console.log('utxoCount', tokenUtxos.length)
            const stepCount = 9;
            for (let i = 0; i < tokenUtxos.length; i+= stepCount) {
                console.log(`start burn ${i} ~ ${i+stepCount}`)
                const utxos = tokenUtxos.slice(i * stepCount, (i + 1) * stepCount)
                const burnRes = await burnToken(
                    signer,
                    provider,
                    tokenInfo.minterScriptHash,
                    utxos,
                    await provider.getFeeRate(),
                    tokenInfo.hasAdmin || false,
                    tokenInfo.adminScriptHash || ''
                );
                console.log('burn txid', burnRes.burnTxid)
            }
        } catch (err) {
            console.log('burn error')
            console.error(err)
        }

    }
}

burnAllTokens('', 'opcat-testnet')