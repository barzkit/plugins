import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import type { BarzAgent } from '@barzkit/sdk'

const schema = z.object({
  transactions: z.array(
    z.object({
      to: z.string().describe('Target address (0x...)'),
      value: z.string().optional().describe('ETH value in wei. Default: "0"'),
      data: z.string().optional().describe('Calldata hex string (0x...)'),
    })
  ).describe('Array of transactions to execute atomically'),
})

/**
 * Execute multiple transactions atomically in a single UserOperation.
 */
export class BarzBatchTransactions extends StructuredTool {
  name = 'barz_batch_transactions'
  description =
    'Execute multiple transactions atomically in one operation. All succeed or all fail. One signature, one gas fee.'
  schema = schema

  constructor(private agent: BarzAgent) {
    super()
  }

  async _call(input: z.output<typeof schema>): Promise<string> {
    const requests = input.transactions.map((tx) => ({
      to: tx.to as `0x${string}`,
      value: tx.value ? BigInt(tx.value) : 0n,
      data: tx.data as `0x${string}` | undefined,
    }))

    const hash = await this.agent.batchTransactions(requests)
    return `Executed batch of ${input.transactions.length} transactions. Hash: ${hash}. Explorer: ${this.agent.getExplorerUrl(hash)}`
  }
}
