import { z } from 'zod'
import { parseEther } from 'viem'
import type { BarzAgent } from '@barzkit/sdk'
import type { ToolCallback } from '../types.js'

export const sendTransactionSchema = {
  to: z.string().describe('Recipient address (0x...)'),
  amount: z.string().describe('Amount to send in human units (e.g. "0.1")'),
  token: z.string().optional().describe('Token symbol: ETH, USDC, WETH. Default: ETH'),
}

export function sendTransactionHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof sendTransactionSchema> {
  return async ({ to, amount, token }) => {
    const agent = getAgent()
    if (!agent) {
      return {
        content: [{ type: 'text' as const, text: 'Error: No wallet created. Use create_wallet first.' }],
        isError: true,
      }
    }

    try {
      if (token && token.toUpperCase() !== 'ETH') {
        return {
          content: [{ type: 'text' as const, text: 'ERC-20 transfers coming soon. Currently supports ETH.' }],
          isError: true,
        }
      }

      const hash = await agent.sendTransaction({
        to: to as `0x${string}`,
        value: parseEther(amount),
      })
      return {
        content: [{
          type: 'text' as const,
          text: `Transaction sent!\nHash: ${hash}\nExplorer: ${agent.getExplorerUrl(hash)}`,
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
