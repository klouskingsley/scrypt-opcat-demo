# sCrypt OP_CAT Demo

A demonstration project for working with CAT20 tokens and Bitcoin transactions on the OP_CAT testnet using the sCrypt framework.

## Features

- 🪙 **CAT20 Token Transfers** - Send CAT20 tokens between addresses
- 💰 **Bitcoin Transfers** - Send BTC on the OP_CAT testnet
- 🔌 **OpenAPI Integration** - Complete TypeScript client for OP_CAT Layer APIs
- 🔧 **Automated Patches** - Includes patches for `@opcat-labs/cat-sdk` package

## Prerequisites

- Node.js (v16 or higher)
- Yarn

## Installation

```bash
yarn install
```

The `postinstall` script will automatically apply necessary patches to dependencies using `patch-package`.

## Project Structure

```
scrypt-opcat-demo/
├── src/
│   ├── sendCAT20.ts      # CAT20 token transfer implementation
│   ├── sendBTC.ts        # Bitcoin transfer implementation
│   └── openapi.ts        # TypeScript client for OP_CAT Layer APIs
├── patches/              # Package patches (auto-applied)
└── package.json
```

## Usage

### Send CAT20 Tokens

```bash
yarn sendCAT20
```

**Example code:**

```typescript
import { opcatOpenAPI } from './openapi';
import { singleSend } from '@opcat-labs/cat-sdk';

await sendCAT20(
    'f8a250901f310373c498a08e20e20df68a0b71487a426cdc58c7778aee60c7c2_0', // tokenId
    'cRZ5SwQRXB75Epex3x9wdaeJ6H1fLkkwHvMWJDnU3S3JjA2djvFg',           // private key (WIF)
    'moP2wuUKQ5aqXswdeGX4VoRjbbyd6bc123',                              // recipient address
    10n,                                                                 // amount
    0.01                                                                 // fee rate
);
```

### Send Bitcoin

```bash
yarn sendBTC
```

## OpenAPI Client

The project includes a TypeScript client for the OP_CAT Layer testnet APIs with the essential methods needed for CAT20 token operations.

### Available Methods

#### Tokens (CAT20)
- `getTokenById(tokenId)` - Get token information (name, symbol, decimals, etc.)
- `getTokenUtxosByOwner(tokenId, address, offset?, limit?)` - Get token UTXOs for an address
- `getTokenBalanceByAddress(tokenId, address)` - Get token balance for an address

### Usage Example

```typescript
import { opcatOpenAPI } from './src/openapi';

// Get token information
const tokenInfo = await opcatOpenAPI.getTokenById('your_token_id');
console.log(`Token: ${tokenInfo.name} (${tokenInfo.symbol})`);

// Get token balance
const balance = await opcatOpenAPI.getTokenBalanceByAddress(
    'your_token_id',
    'your_address'
);
console.log(`Balance: ${balance.confirmed} (confirmed)`);

// Get token UTXOs
const utxos = await opcatOpenAPI.getTokenUtxosByOwner(
    'your_token_id',
    'your_address',
    0,  // offset
    50  // limit
);
console.log(`Found ${utxos.total} UTXOs`);
```

### API Response Handling

The OpenAPI client automatically unwraps responses:
- When `response.code === 0`, it returns `response.data` directly
- When `response.code !== 0`, it throws an error with `response.msg`

This means you can use the returned data directly without checking the response code:

```typescript
// Before (manual unwrapping)
const response = await api.getTokenById(tokenId);
if (response.code === 0) {
    console.log(response.data.name);
}

// After (automatic unwrapping)
const tokenInfo = await opcatOpenAPI.getTokenById(tokenId);
console.log(tokenInfo.name); // Direct access to the data
```

## Package Patches

This project includes patches for `@opcat-labs/cat-sdk` to handle script hash conversion in CAT20 token transfers. The patches are automatically applied during `yarn install` via the `postinstall` script.

### What the Patch Does

The patch adds validation and automatic conversion logic to ensure that token UTXOs using script hashes are properly converted to full scripts before being processed. This resolves compatibility issues when working with different UTXO formats from various APIs.

### Regenerating Patches

If you modify files in `node_modules/@opcat-labs/cat-sdk`, regenerate the patch:

```bash
yarn patch-package @opcat-labs/cat-sdk
```

## Configuration

Edit the script files directly to configure:
- Private keys (use WIF format)
- Recipient addresses
- Token IDs
- Transfer amounts
- Fee rates

## Security Notes

⚠️ **Important Security Warnings:**

- Never commit private keys to version control
- Use environment variables for sensitive data in production
- This demo includes private keys for testing purposes only
- Always use testnet for development and testing

## API Documentation

For complete API documentation, visit:
- Testnet API: https://testnet-openapi.opcatlabs.io/

## Dependencies

- `@opcat-labs/cat-sdk` - CAT protocol SDK for token operations
- `@opcat-labs/scrypt-ts-opcat` - sCrypt TypeScript library for OP_CAT
- `patch-package` - Apply custom patches to node_modules

## Network

This project is configured for the **OP_CAT testnet**.

- Network: `opcat-testnet`
- API Endpoint: `https://testnet-openapi.opcatlabs.io/api`

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly on testnet
5. Submit a pull request

## Troubleshooting

### Insufficient Balance Error

Make sure your address has sufficient funds:
- BTC balance for transaction fees
- Token balance for CAT20 transfers

### UTXO Errors

If you encounter UTXO-related errors, verify:
- Address format is correct
- UTXOs are confirmed on-chain
- Token UTXOs match the expected format

### Patch Application Fails

If patches fail to apply:
1. Delete `node_modules`
2. Run `yarn install` again
3. Check for version conflicts in `package.json`

## Resources

- [OP_CAT Labs](https://opcatlabs.io/)

## Support

For issues and questions:
- Open an issue on GitHub
- Check the sCrypt documentation
- Visit the OP_CAT Labs Discord
