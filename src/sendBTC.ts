import { toTokenOwnerAddress } from '@opcat-labs/cat-sdk';
import {MempoolProvider, PrivateKey, DefaultSigner, ExtPsbt, Script, SupportedNetwork, fromSupportedNetwork} from '@opcat-labs/scrypt-ts-opcat'

async function sendBTC(
    network: SupportedNetwork,
    fromPrivateKeyWIF: string,
    toAddress: string,
    amountSatoshis: bigint,
) {
    const privateKey = PrivateKey.fromWIF(fromPrivateKeyWIF);
    const signer = new DefaultSigner(privateKey)
    const provider = new MempoolProvider(network);
    const feeRate = await provider.getFeeRate()
    const signerAddress = await signer.getAddress();
    console.log('Signer address:', signerAddress);
    
    const utxos = await provider.getUtxos(signerAddress);
    const psbt = new ExtPsbt({network: network})
        .spendUTXO(utxos)
        .addOutput({
            script: Script.fromAddress(toAddress).toBuffer(),
            value: amountSatoshis,
            data: new Uint8Array()
        })
        .change(signerAddress, feeRate)
        .seal()

    const signedPsbt = await signer.signPsbt(psbt.toHex(), psbt.psbtOptions());
    psbt.combine(ExtPsbt.fromHex(signedPsbt));       
    psbt.finalizeAllInputs()

    const txHex = psbt.extractTransaction().toHex();
    const txId = await provider.broadcast(txHex);
    console.log(`Transaction sent with txId: ${txId}`);
}


console.log(Script.fromString('76a914949094e97e9879c3447a2302fa8096983f085de888ac').toAddress(fromSupportedNetwork('opcat-testnet')).toString())
console.log(('mmmbg4zo4ZsZixEUAZn36ADRNtPgWMty1e'))