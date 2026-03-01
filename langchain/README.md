# @barzkit/langchain

BarzKit tools for [LangChain](https://github.com/langchain-ai/langchainjs) — give AI agents self-custody wallets with send, swap, lend, freeze, and x402 payments.

## Installation

```bash
npm install @barzkit/langchain @barzkit/sdk @langchain/core zod
```

## Quick Start

```typescript
import { createBarzTools } from '@barzkit/langchain'
import { ChatAnthropic } from '@langchain/anthropic'
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents'
import { ChatPromptTemplate } from '@langchain/core/prompts'

// 1. Create all BarzKit tools
const tools = await createBarzTools({
  chain: 'sepolia',
  owner: process.env.BARZ_OWNER_KEY as `0x${string}`,
  pimlico: { apiKey: process.env.PIMLICO_API_KEY! },
})

// 2. Create LangChain agent
const llm = new ChatAnthropic({ model: 'claude-sonnet-4-5-20250514' })
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a DeFi agent with a self-custody wallet.'],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}'],
])
const agent = createToolCallingAgent({ llm, tools, prompt })
const executor = new AgentExecutor({ agent, tools })

// 3. Use natural language
await executor.invoke({ input: 'Send 0.01 ETH to 0x742d...' })
await executor.invoke({ input: 'Swap 100 USDC for WETH' })
await executor.invoke({ input: 'What is my wallet balance?' })
```

## Tools

| Tool | Parameters | Description |
|------|-----------|-------------|
| `barz_send_transaction` | `to`, `amount`, `token?` | Send ETH or tokens |
| `barz_check_balance` | `token?` | Check wallet balance |
| `barz_swap` | `from`, `to`, `amount`, `slippage?` | Swap on Uniswap V3 |
| `barz_lend` | `token`, `amount`, `protocol?` | Supply to Aave V3 |
| `barz_batch_transactions` | `transactions[]` | Atomic multi-call |
| `barz_freeze_wallet` | _(none)_ | Emergency freeze |
| `barz_unfreeze_wallet` | _(none)_ | Unfreeze wallet |
| `barz_fetch_with_payment` | `url`, `method?`, `headers?` | x402 auto-payment fetch |

## Usage Patterns

### From config (recommended)

```typescript
import { createBarzTools } from '@barzkit/langchain'

const tools = await createBarzTools({
  chain: 'sepolia',
  owner: '0x...',
  pimlico: { apiKey: 'pim_...' },
})
```

### From existing agent

```typescript
import { createBarzAgent } from '@barzkit/sdk'
import { createBarzToolkit } from '@barzkit/langchain'

const agent = await createBarzAgent({ ... })
const tools = createBarzToolkit(agent)
```

### Individual tools

```typescript
import { BarzSwap, BarzCheckBalance } from '@barzkit/langchain'
import { createBarzAgent } from '@barzkit/sdk'

const agent = await createBarzAgent({ ... })
const tools = [new BarzSwap(agent), new BarzCheckBalance(agent)]
```

## Development

```bash
npm run build    # tsup build (ESM + DTS)
npm test         # vitest unit tests
npm run lint     # tsc --noEmit type check
```

## License

MIT
