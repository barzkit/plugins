import { z } from 'zod'
import type { BarzAgent } from '@barzkit/sdk'
import type { ToolCallback } from '../types.js'

export const swapSchema = {
  from: z.string().describe('Token to swap from (symbol like USDC, WETH, or ETH)'),
  to: z.string().describe('Token to swap to (symbol like USDC, WETH, or ETH)'),
  amount: z.string().describe('Amount to swap in human units (e.g. "100")'),
  slippage: z.number().optional().describe('Max slippage in percent. Default: 0.5'),
}

export function swapHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof swapSchema> {
  return async ({ from, to, amount, slippage }) => {
    const agent = getAgent()
    if (!agent) {
      return {
        content: [{ type: 'text' as const, text: 'Error: No wallet created. Use create_wallet first.' }],
        isError: true,
      }
    }

    try {
      const hash = await agent.swap({
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount,
        slippage: slippage ?? 0.5,
      })
      return {
        content: [{
          type: 'text' as const,
          text: `Swapped ${amount} ${from.toUpperCase()} for ${to.toUpperCase()}!\nHash: ${hash}\nExplorer: ${agent.getExplorerUrl(hash)}`,
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
