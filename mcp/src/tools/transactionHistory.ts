import { z } from 'zod'
import type { BarzAgent } from '@barzkit/sdk'
import type { ToolCallback } from '../types.js'

export const transactionHistorySchema = {
  limit: z.number().min(1).max(100).optional().describe('Number of transactions to return (default: 20, max: 100)'),
  offset: z.number().min(0).optional().describe('Number of transactions to skip (default: 0)'),
  start_block: z.string().optional().describe('Start block number (e.g. "1000000")'),
  end_block: z.string().optional().describe('End block number (e.g. "2000000")'),
}

export function transactionHistoryHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof transactionHistorySchema> {
  return async ({ limit, offset, start_block, end_block }) => {
    const agent = getAgent()
    if (!agent) {
      return {
        content: [{ type: 'text' as const, text: 'Error: No wallet created. Use create_wallet first.' }],
        isError: true,
      }
    }

    try {
      const txs = await agent.getTransactions({
        limit: limit ?? 20,
        offset: offset ?? 0,
        startBlock: start_block ? BigInt(start_block) : undefined,
        endBlock: end_block ? BigInt(end_block) : undefined,
      })

      if (txs.length === 0) {
        return {
          content: [{ type: 'text' as const, text: 'No transactions found.' }],
        }
      }

      const lines = txs.map((tx) => {
        const dir = tx.direction === 'incoming' ? 'IN' : 'OUT'
        const date = new Date(tx.timestamp * 1000).toISOString()
        return `[${dir}] ${date} | ${tx.status} | ${tx.value} wei\n  ${tx.explorerUrl}`
      })

      return {
        content: [{
          type: 'text' as const,
          text: `${txs.length} transactions:\n\n${lines.join('\n\n')}`,
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
