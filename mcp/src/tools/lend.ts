import { z } from 'zod'
import type { BarzAgent } from '@barzkit/sdk'
import type { ToolCallback } from '../types.js'

export const lendSchema = {
  token: z.string().describe('Token to deposit (symbol like USDC, WETH, DAI)'),
  amount: z.string().describe('Amount to deposit in human units'),
  protocol: z.enum(['aave']).optional().describe('Lending protocol. Default: aave'),
}

export function lendHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof lendSchema> {
  return async ({ token, amount, protocol }) => {
    const agent = getAgent()
    if (!agent) {
      return {
        content: [{ type: 'text' as const, text: 'Error: No wallet created. Use create_wallet first.' }],
        isError: true,
      }
    }

    try {
      const hash = await agent.lend({
        token: token.toUpperCase(),
        amount,
        protocol: protocol ?? 'aave',
      })
      return {
        content: [{
          type: 'text' as const,
          text: `Deposited ${amount} ${token.toUpperCase()} into ${protocol ?? 'aave'}!\nHash: ${hash}\nExplorer: ${agent.getExplorerUrl(hash)}`,
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
