import type {
  Action,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core'
import { BarzService } from '../services/barzService.js'

export const batchTransactions: Action = {
  name: 'BATCH_TRANSACTIONS',
  description: 'Execute multiple transactions atomically. Pass a JSON array of {to, value?, data?} objects.',
  similes: [
    'BATCH',
    'MULTI_TX',
    'BATCH_SEND',
    'MULTI_TRANSFER',
    'ATOMIC_BATCH',
  ],
  examples: [
    [
      {
        name: '{{user1}}',
        content: {
          text: 'Batch transactions: [{"to":"0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18","value":"0"},{"to":"0x1234567890abcdef1234567890abcdef12345678","value":"0"}]',
        },
      },
      {
        name: '{{agentName}}',
        content: { text: 'Executed batch of 2 transactions. Tx: https://sepolia.etherscan.io/tx/0x...' },
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

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      await callback?.({
        text: 'Could not find a JSON array in the message. Provide transactions as: [{"to":"0x...","value":"0"}]',
      })
      return
    }

    let txs: Array<{ to: string; value?: string; data?: string }>
    try {
      txs = JSON.parse(jsonMatch[0])
    } catch {
      await callback?.({ text: 'Invalid JSON. Provide a valid JSON array of transactions.' })
      return
    }

    if (!Array.isArray(txs) || txs.length === 0) {
      await callback?.({ text: 'Transaction array is empty.' })
      return
    }

    const service = runtime.getService<BarzService>(BarzService.serviceType)
    const agent = service!.getAgent()

    try {
      const requests = txs.map((tx) => ({
        to: tx.to as `0x${string}`,
        value: tx.value ? BigInt(tx.value) : 0n,
        data: tx.data as `0x${string}` | undefined,
      }))

      const hash = await agent.batchTransactions(requests)
      const explorerUrl = agent.getExplorerUrl(hash)

      await callback?.({
        text: `Executed batch of ${txs.length} transactions.\nTx: ${explorerUrl}`,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      await callback?.({ text: `Batch transaction failed: ${msg}` })
    }
  },
}
