import { z } from 'zod'
import type { BarzAgent } from '@barzkit/sdk'
import type { ToolCallback } from '../types.js'

export const batchTransactionsSchema = {
  transactions: z.array(z.object({
    to: z.string().describe('Target address (0x...)'),
    value: z.string().optional().describe('ETH value in wei'),
    data: z.string().optional().describe('Calldata hex string'),
  })).describe('Array of transactions to execute atomically'),
}

export function batchTransactionsHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof batchTransactionsSchema> {
  return async ({ transactions }) => {
    const agent = getAgent()
    if (!agent) {
      return {
        content: [{ type: 'text' as const, text: 'Error: No wallet created. Use create_wallet first.' }],
        isError: true,
      }
    }

    try {
      const txs = transactions.map((tx) => ({
        to: tx.to as `0x${string}`,
        value: tx.value ? BigInt(tx.value) : undefined,
        data: tx.data as `0x${string}` | undefined,
      }))
      const hash = await agent.batchTransactions(txs)
      return {
        content: [{
          type: 'text' as const,
          text: `Batch of ${transactions.length} transactions sent!\nHash: ${hash}\nExplorer: ${agent.getExplorerUrl(hash)}`,
        }],
      }
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      }
    }
  }
}
