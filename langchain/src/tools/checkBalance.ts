import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { formatEther } from 'viem'
import type { BarzAgent } from '@barzkit/sdk'

const schema = z.object({
  token: z.string().optional().describe('Token contract address (0x...). Omit for ETH balance.'),
})

/**
 * Check the AI agent wallet balance.
 */
export class BarzCheckBalance extends StructuredTool {
  name = 'barz_check_balance'
  description =
    'Check the agent wallet balance for ETH or a specific ERC-20 token. Returns the balance with wallet address and chain.'
  schema = schema

  constructor(private agent: BarzAgent) {
    super()
  }

  async _call(input: z.output<typeof schema>): Promise<string> {
    const balance = await this.agent.getBalance(
      input.token ? (input.token as `0x${string}`) : undefined
    )
    const formatted = input.token ? balance.toString() : formatEther(balance)
    const unit = input.token ?? 'ETH'
    return `Wallet ${this.agent.address} on ${this.agent.chain}: ${formatted} ${unit}`
  }
}
