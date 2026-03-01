import type {
  Action,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core'
import { BarzService } from '../services/barzService.js'

const SWAP_PATTERN = /swap\s+([\d.]+)\s+(\w+)\s+(?:to|for)\s+(\w+)/i

export const swapTokens: Action = {
  name: 'SWAP_TOKENS',
  description: 'Swap tokens via Uniswap V3. Example: "swap 100 USDC for WETH"',
  similes: [
    'SWAP',
    'EXCHANGE_TOKENS',
    'TRADE',
    'CONVERT_TOKENS',
    'TOKEN_SWAP',
    'DEX_SWAP',
  ],
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'Swap 100 USDC for WETH' },
      },
      {
        name: '{{agentName}}',
        content: { text: 'Swapped 100 USDC for WETH. Tx: https://sepolia.etherscan.io/tx/0x...' },
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

    const match = text.match(SWAP_PATTERN)
    if (!match) {
      await callback?.({
        text: 'Could not parse swap. Use format: "swap 100 USDC for WETH"',
      })
      return
    }

    const [, amount, from, to] = match
    const service = runtime.getService<BarzService>(BarzService.serviceType)
    const agent = service!.getAgent()

    try {
      const hash = await agent.swap({
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount,
        slippage: 0.5,
      })

      const explorerUrl = agent.getExplorerUrl(hash)
      await callback?.({
        text: `Swapped ${amount} ${from.toUpperCase()} for ${to.toUpperCase()}.\nTx: ${explorerUrl}`,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      await callback?.({ text: `Swap failed: ${msg}` })
    }
  },
}
