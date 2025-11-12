import { singleSend, toTokenOwnerAddress, TX_OUTPUT_COUNT_MAX } from "@opcat-labs/cat-sdk";
import {opcatOpenAPI, TokenUtxo} from './openapi'
import { DefaultSigner, MempoolProvider, PrivateKey } from "@opcat-labs/scrypt-ts-opcat";

async function sendCAT20(
    tokenId: string,
    fromPrivateKeyWIF: string,
    toAddress: string,
    amountTokens: bigint,
    feeRatePerByte: number
) {
    
    const privateKey = PrivateKey.fromWIF(fromPrivateKeyWIF);
    const signer = new DefaultSigner(privateKey)
    const provider = new MempoolProvider('opcat-testnet');
    const signerAddress = await signer.getAddress();

    const balanceRes = await opcatOpenAPI.getTokenBalanceByAddress(tokenId, signerAddress);
    const tokenInfo = await opcatOpenAPI.getTokenById(tokenId);

    if (BigInt(balanceRes.confirmed) < amountTokens) {
        throw new Error(`Insufficient token balance. Current balance: ${balanceRes.confirmed}, required: ${amountTokens}`);
    }

    const tokenUtxos = await opcatOpenAPI.getTokenUtxosByOwner(tokenId, signerAddress, 0, 50);
    const selectedTokenUtxos = await filterTokenUtxosByAmount(tokenUtxos.utxos, amountTokens);
    selectedTokenUtxos.map(t => t.satoshis = Number(t.satoshis)); // convert satoshis to number, wrong type from openapi, will fix later
    
    const sendRes = await singleSend(
        signer,
        provider,
        tokenInfo.minterScriptHash,
        selectedTokenUtxos,
        [{address: toTokenOwnerAddress(toAddress), amount: amountTokens}],
        toTokenOwnerAddress(signerAddress),
        feeRatePerByte,
    )

    console.log(`Transaction sent with txId: ${sendRes.sendTxId}`);
}

async function filterTokenUtxosByAmount(tokenUtxos: TokenUtxo[], amount: bigint) {
    // 1. sort tokenUtxos by amount ascending
    // 2. select tokenUtxos until amount is reached
    tokenUtxos.sort((a, b) => {
        const diff = BigInt(a.state.amount) - BigInt(b.state.amount);
        return diff < 0n ? -1 : diff > 0n ? 1 : 0;
    });

    const selectedUtxos: TokenUtxo[] = [];
    let totalAmount = 0n;

    for (const utxo of tokenUtxos) {
        selectedUtxos.push(utxo);
        totalAmount += BigInt(utxo.state.amount);
        if (totalAmount >= amount) {
            break;
        }
    }

    if (totalAmount < amount) {
        throw new Error(`Insufficient token UTXOs. Current total: ${totalAmount}, required: ${amount}`);
    }

    return selectedUtxos;
}

sendCAT20(
    'f8a250901f310373c498a08e20e20df68a0b71487a426cdc58c7778aee60c7c2_0',
    'cRZ5SwQRXB75Epex3x9wdaeJ6H1fLkkwHvMWJDnU3S3JjA2djvFg',
    'moP2wuUKQ5aqXswdeGX4VoRjbbyd6bc123',
    10n,
    0.01
)