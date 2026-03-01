import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { parseEther } from 'viem'
import type { BarzAgent } from '@barzkit/sdk'

const schema = z.object({
  to: z.string().describe('Recipient address (0x...)'),
  amount: z.string().describe('Amount to send in human units (e.g. "0.1")'),
  token: z.string().optional().describe('Token symbol: ETH, USDC, WETH. Default: ETH'),
})

/**
 * Send ETH or tokens from the AI agent wallet.
 */
export class BarzSendTransaction extends StructuredTool {
  name = 'barz_send_transaction'
  description =
    'Send ETH or ERC-20 tokens from the AI agent wallet to a recipient address. Use this when the user asks to transfer, send, or pay crypto to someone.'
  schema = schema

  constructor(private agent: BarzAgent) {
    super()
  }

  async _call(input: z.output<typeof schema>): Promise<string> {
    if (input.token && input.token.toUpperCase() !== 'ETH') {
      return 'ERC-20 transfers via tool coming soon. Currently supports ETH.'
    }

    const hash = await this.agent.sendTransaction({
      to: input.to as `0x${string}`,
      value: parseEther(input.amount),
    })
    return `Transaction sent. Hash: ${hash}. Explorer: ${this.agent.getExplorerUrl(hash)}`
  }
}
