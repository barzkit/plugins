import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import type { BarzAgent } from '@barzkit/sdk'

const schema = z.object({
  from: z.string().describe('Token to swap from (symbol like USDC, WETH, or ETH)'),
  to: z.string().describe('Token to swap to (symbol like USDC, WETH, or ETH)'),
  amount: z.string().describe('Amount to swap in human units (e.g. "100")'),
  slippage: z.number().optional().describe('Max slippage in percent. Default: 0.5'),
})

/**
 * Swap tokens via Uniswap V3 through the agent wallet.
 */
export class BarzSwap extends StructuredTool {
  name = 'barz_swap'
  description =
    'Swap tokens on Uniswap V3 via the agent wallet. Supports ETH, USDC, WETH, DAI. Returns transaction hash and explorer link.'
  schema = schema

  constructor(private agent: BarzAgent) {
    super()
  }

  async _call(input: z.output<typeof schema>): Promise<string> {
    const hash = await this.agent.swap({
      from: input.from.toUpperCase(),
      to: input.to.toUpperCase(),
      amount: input.amount,
      slippage: input.slippage ?? 0.5,
    })
    return `Swapped ${input.amount} ${input.from.toUpperCase()} for ${input.to.toUpperCase()}. Hash: ${hash}. Explorer: ${this.agent.getExplorerUrl(hash)}`
  }
}
