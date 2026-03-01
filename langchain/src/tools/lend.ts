import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import type { BarzAgent } from '@barzkit/sdk'

const schema = z.object({
  token: z.string().describe('Token to supply (symbol like USDC, WETH, DAI)'),
  amount: z.string().describe('Amount to supply in human units (e.g. "50")'),
  protocol: z.enum(['aave']).optional().describe('Lending protocol. Default: aave'),
})

/**
 * Supply tokens to Aave V3 lending pool.
 */
export class BarzLend extends StructuredTool {
  name = 'barz_lend'
  description =
    'Deposit tokens into Aave V3 lending pool to earn yield. Returns transaction hash and explorer link.'
  schema = schema

  constructor(private agent: BarzAgent) {
    super()
  }

  async _call(input: z.output<typeof schema>): Promise<string> {
    const hash = await this.agent.lend({
      token: input.token.toUpperCase(),
      amount: input.amount,
      protocol: input.protocol ?? 'aave',
    })
    return `Supplied ${input.amount} ${input.token.toUpperCase()} to Aave V3. Hash: ${hash}. Explorer: ${this.agent.getExplorerUrl(hash)}`
  }
}
