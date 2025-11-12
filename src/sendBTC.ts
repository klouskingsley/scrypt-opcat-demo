import {MempoolProvider, PrivateKey, DefaultSigner, ExtPsbt, Script} from '@opcat-labs/scrypt-ts-opcat'

async function sendBTC(
    fromPrivateKeyWIF: string,
    toAddress: string,
    amountSatoshis: bigint,
    feeRatePerByte: number
) {
    const privateKey = PrivateKey.fromWIF(fromPrivateKeyWIF);
    const signer = new DefaultSigner(privateKey)
    const provider = new MempoolProvider('opcat-testnet');
    const signerAddress = await signer.getAddress();
    console.log('Signer address:', signerAddress);
    
    const utxos = await provider.getUtxos(signerAddress);
    const psbt = new ExtPsbt({network: 'opcat-testnet'})
        .spendUTXO(utxos)
        .addOutput({
            script: Script.fromAddress(toAddress).toBuffer(),
            value: amountSatoshis,
            data: new Uint8Array()
        })
        .change(signerAddress, feeRatePerByte)
        .seal()

    const signedPsbt = await signer.signPsbt(psbt.toHex(), psbt.psbtOptions());
    psbt.combine(ExtPsbt.fromHex(signedPsbt));       
    psbt.finalizeAllInputs()

    const txHex = psbt.extractTransaction().toHex();
    const txId = await provider.broadcast(txHex);
    console.log(`Transaction sent with txId: ${txId}`);
}

sendBTC(
    'cRZ5SwQRXB75Epex3x9wdaeJ6H1fLkkwHvMWJDnU3S3JjA2djvFg',
    'moP2wuUKQ5aqXswdeGX4VoRjbbyd6bc123',
    10000n,
    0.01
)


