import {deployClosedMinterToken, mintClosedMinterToken, toTokenOwnerAddress} from '@opcat-labs/cat-sdk'
import {DefaultSigner, MempoolProvider, PrivateKey, SupportedNetwork, toByteString} from '@opcat-labs/scrypt-ts-opcat'
import * as fs from 'fs'
import path from 'path'

interface TokenInfo {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
}

const tokenInfos: TokenInfo[] = [
    {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        totalSupply: '120695462',
    },
    {
        name: 'Tether',
        symbol: 'USDT',
        decimals: 6,
        totalSupply: '190053424041',
    },
    {
        name: 'Ripple',
        symbol: 'XRP',
        decimals: 6,
        totalSupply: '99985752852',
    },
    {
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18,
        totalSupply: '137736213 ',
    },
    {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        totalSupply: '77454628498 ',
    },
    {
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9,
        totalSupply: '615208827',
    },
    {
        name: 'Dogecoin',
        symbol: 'DOGE',
        decimals: 8,
        totalSupply: '152015716383',
    },
    {
        name: 'Bitcoin Cash',
        symbol: 'BCH',
        decimals: 8,
        totalSupply: '19961203',
    }
];

const deployerPrivateKey = ''
const network: SupportedNetwork = 'opcat-mainnet'

const deployOneToken = async (token: TokenInfo) => {
    const signer = new DefaultSigner(PrivateKey.fromWIF(deployerPrivateKey))
    const signerAddress = await signer.getAddress();
    console.log('Deployer address:', signerAddress)
    const signerTokenOwner = toTokenOwnerAddress(signerAddress);
    const iconFile = fs.readFileSync(path.join(__dirname, `./icons/${token.symbol.toLowerCase()}.png`))
    const provider = new MempoolProvider(network)
    console.log('Deploying token:', token.symbol, await provider.getFeeRate())
    const deployRes = await deployClosedMinterToken(
        signer,
        provider,
        {
            metadata: {
                name: token.name,
                symbol: token.symbol,
                decimals: BigInt(token.decimals),
                hasAdmin: false,
                icon: {
                    type: 'image/png',
                    body: iconFile.toString('hex'),
                }
            }
        },
        await provider.getFeeRate(),
    );
    console.log('Deployed token:', token.symbol, 'Token ID:', deployRes.tokenId)
    await new Promise(resolve => setTimeout(resolve, 2000)) // wait for 5 seconds before minting
    const mintRes = await mintClosedMinterToken(
        signer,
        provider,
        deployRes.deployPsbt.getUtxo(0),
        deployRes.hasAdmin,
        deployRes.adminScriptHash,
        deployRes.tokenId,
        signerTokenOwner,
        BigInt(token.totalSupply) * BigInt(10) ** BigInt(token.decimals),
        signerAddress,
        await provider.getFeeRate(),
    )
    console.log('Minted token:', token.symbol, 'Tx ID:', mintRes.mintTxId)
}

const main = async () => {
    for (const token of tokenInfos.slice(0, 1)) {
        await deployOneToken(token)
        await new Promise(resolve => setTimeout(resolve, 5000))
    }
}

main()