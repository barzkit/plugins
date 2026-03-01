import type {
  Action,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core'
import { BarzService } from '../services/barzService.js'

const LEND_PATTERN = /(?:lend|deposit|supply)\s+([\d.]+)\s+(\w+)/i

export const lendTokens: Action = {
  name: 'LEND_TOKENS',
  description: 'Supply tokens to Aave V3. Example: "lend 50 USDC"',
  similes: [
    'LEND',
    'DEPOSIT',
    'SUPPLY',
    'SUPPLY_TOKENS',
    'AAVE_DEPOSIT',
    'EARN_YIELD',
  ],
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'Lend 50 USDC on Aave' },
      },
      {
        name: '{{agentName}}',
        content: { text: 'Supplied 50 USDC to Aave V3. Tx: https://sepolia.etherscan.io/tx/0x...' },
      },
    ],
  ],

  async validate(runtime: IAgentRuntime, _message: Memory) {
    const service = runtime.getService<BarzService>(BarzService.serviceType)
    return service?.isInitialized() ?? false
  },

  async handler(
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: unknown,
    callback?: HandlerCallback
  ) {
    const text = typeof message.content === 'string'
      ? message.content
      : message.content?.text ?? ''

    const match = text.match(LEND_PATTERN)
    if (!match) {
      await callback?.({
        text: 'Could not parse lend request. Use format: "lend 50 USDC"',
      })
      return
    }

    const [, amount, token] = match
    const service = runtime.getService<BarzService>(BarzService.serviceType)
    const agent = service!.getAgent()

    try {
      const hash = await agent.lend({
        token: token.toUpperCase(),
        amount,
        protocol: 'aave',
      })

      const explorerUrl = agent.getExplorerUrl(hash)
      await callback?.({
        text: `Supplied ${amount} ${token.toUpperCase()} to Aave V3.\nTx: ${explorerUrl}`,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      await callback?.({ text: `Lend failed: ${msg}` })
    }
  },
}
