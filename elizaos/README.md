# @barzkit/elizaos

BarzKit plugin for [ElizaOS](https://github.com/elizaOS/eliza) — self-custody AI agent wallets with send, swap, lend, freeze, and x402 payments.

## Installation

```bash
npm install @barzkit/elizaos @barzkit/sdk
```

`@elizaos/core` is a peer dependency — your ElizaOS project already has it.

## Configuration

Add these to your ElizaOS character settings or `.env`:

```env
BARZ_OWNER_KEY=0x...       # Owner private key (hex, 32 bytes)
PIMLICO_API_KEY=pk_...     # Get one at https://dashboard.pimlico.io
BARZ_CHAIN=sepolia         # sepolia | base-sepolia | base
```

## Usage

```typescript
import { barzPlugin } from '@barzkit/elizaos'

// Register the plugin in your ElizaOS character config
const character = {
  name: 'DeFi Agent',
  plugins: [barzPlugin],
  settings: {
    secrets: {
      BARZ_OWNER_KEY: process.env.BARZ_OWNER_KEY,
      PIMLICO_API_KEY: process.env.PIMLICO_API_KEY,
      BARZ_CHAIN: 'sepolia',
    },
  },
}
```

Once registered, your agent responds to natural language:

- **"Send 0.01 ETH to 0x..."** — sends ETH via gasless UserOperation
- **"What is my balance?"** — checks wallet ETH balance
- **"Swap 100 USDC for WETH"** — swaps via Uniswap V3
- **"Lend 50 USDC"** — supplies to Aave V3
- **"Freeze the wallet"** — emergency kill switch
- **"Unfreeze the wallet"** — re-enables transactions
- **"Fetch https://api.example.com/data"** — x402 auto-payment fetch

## Actions

| Action | Trigger Examples |
|--------|-----------------|
| `SEND_TRANSACTION` | "send 0.1 ETH to 0x...", "transfer", "pay" |
| `CHECK_BALANCE` | "balance", "how much ETH", "wallet balance" |
| `SWAP_TOKENS` | "swap 100 USDC for WETH", "trade", "exchange" |
| `LEND_TOKENS` | "lend 50 USDC", "deposit", "supply" |
| `BATCH_TRANSACTIONS` | "batch transactions: [{...}]" |
| `FREEZE_WALLET` | "freeze", "lock wallet", "kill switch" |
| `UNFREEZE_WALLET` | "unfreeze", "unlock wallet", "resume" |
| `FETCH_WITH_PAYMENT` | "fetch https://...", "pay and fetch" |

## Architecture

```
@barzkit/elizaos (Plugin)
  ├── BarzService     — creates & holds BarzAgent via @barzkit/sdk
  ├── walletProvider  — injects wallet context (address, balance, status)
  └── 8 Actions       — NLP-parsed handlers for wallet operations
```

The plugin uses `BarzService` to manage the smart account lifecycle. Each action gets the service from the ElizaOS runtime, parses the user's message with regex, and calls the appropriate `BarzAgent` method.

## Provider

The `walletProvider` injects wallet context into the agent's conversation:

```
Agent wallet: 0x... on sepolia. Balance: 0.5 ETH. Status: active.
```

## Development

```bash
npm run build    # tsup build (ESM + DTS)
npm test         # vitest unit tests
npm run lint     # tsc --noEmit type check
npm run dev      # tsup watch mode
```

## License

MIT
