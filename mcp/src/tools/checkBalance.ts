import { z } from 'zod'
import { formatEther } from 'viem'
import type { BarzAgent } from '@barzkit/sdk'
import type { ToolCallback } from '../types.js'

export const checkBalanceSchema = {
  token: z.string().optional().describe('Token contract address (0x...). Omit for ETH balance.'),
}

export function checkBalanceHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof checkBalanceSchema> {
  return async ({ token }) => {
    const agent = getAgent()
    if (!agent) {
      return {
        content: [{ type: 'text' as const, text: 'Error: No wallet created. Use create_wallet first.' }],
        isError: true,
      }
    }

    try {
      const balance = await agent.getBalance(
        token ? (token as `0x${string}`) : undefined,
      )
      const formatted = token ? balance.toString() : formatEther(balance)
      const unit = token ? 'tokens' : 'ETH'
      return {
        content: [{
          type: 'text' as const,
          text: `Wallet: ${agent.address}\nChain: ${agent.chain}\nBalance: ${formatted} ${unit}`,
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
