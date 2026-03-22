import { z } from 'zod'
import { parseEther } from 'viem'
import type { BarzAgent } from '@barzkit/sdk'
import type { ToolCallback } from '../types.js'

const txSchema = z.object({
  to: z.string().describe('Recipient address (0x...)'),
  amount: z.string().optional().describe('ETH amount in human units (e.g. "0.1")'),
  data: z.string().optional().describe('Calldata hex string'),
})

export const dryRunSchema = {
  transactions: z.array(txSchema).min(1).describe('Transactions to simulate (1 or more)'),
}

export function dryRunHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof dryRunSchema> {
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
        value: tx.amount ? parseEther(tx.amount) : 0n,
        data: tx.data as `0x${string}` | undefined,
      }))

      const result = await agent.dryRun(txs.length === 1 ? txs[0] : txs)

      const lines = [
        `Success: ${result.success}`,
        `Gas estimate: ${result.gasEstimate}`,
        `Gas cost: ${result.gasCostETH}`,
        `Permissions: ${result.permissionCheck.passed ? 'passed' : 'failed'}`,
      ]

      if (result.error) lines.push(`Error: ${result.error}`)
      if (result.permissionCheck.violations.length > 0) {
        lines.push(`Violations: ${result.permissionCheck.violations.join('; ')}`)
      }

      return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
        isError: !result.success ? true : undefined,
      }
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      }
    }
  }
}
