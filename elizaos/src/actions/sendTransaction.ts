import type {
  Action,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core'
import { parseEther } from 'viem'
import { BarzService } from '../services/barzService.js'

const SEND_PATTERN = /send\s+([\d.]+)\s+(\w+)\s+to\s+(0x[a-fA-F0-9]{40})/i

export const sendTransaction: Action = {
  name: 'SEND_TRANSACTION',
  description: 'Send ETH or tokens to an address. Example: "send 0.1 ETH to 0x..."',
  similes: [
    'SEND_ETH',
    'SEND_TOKENS',
    'TRANSFER',
    'TRANSFER_ETH',
    'TRANSFER_TOKENS',
    'PAY',
    'SEND_MONEY',
  ],
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'Send 0.01 ETH to 0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18' },
      },
      {
        name: '{{agentName}}',
        content: { text: 'Sent 0.01 ETH to 0x742d...bD18. Tx: https://sepolia.etherscan.io/tx/0x...' },
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

    const match = text.match(SEND_PATTERN)
    if (!match) {
      await callback?.({
        text: 'Could not parse transaction. Use format: "send 0.1 ETH to 0xAddress"',
      })
      return
    }

    const [, amount, token, to] = match
    const service = runtime.getService<BarzService>(BarzService.serviceType)
    const agent = service!.getAgent()

    try {
      if (token.toUpperCase() !== 'ETH') {
        await callback?.({
          text: `ERC-20 transfers via natural language coming soon. Currently supports ETH. Use the SDK directly for token transfers.`,
        })
        return
      }

      const hash = await agent.sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(amount),
      })

      const explorerUrl = agent.getExplorerUrl(hash)
      await callback?.({
        text: `Sent ${amount} ETH to ${to}.\nTx: ${explorerUrl}`,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      await callback?.({ text: `Transaction failed: ${msg}` })
    }
  },
}
