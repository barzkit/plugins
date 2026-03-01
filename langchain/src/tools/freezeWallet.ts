import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import type { BarzAgent } from '@barzkit/sdk'

const emptySchema = z.object({})

/**
 * Emergency freeze the agent wallet — blocks all transactions.
 */
export class BarzFreezeWallet extends StructuredTool {
  name = 'barz_freeze_wallet'
  description =
    'Emergency freeze the agent wallet. Blocks all transactions until unfrozen. Use as a kill switch when suspicious activity is detected.'
  schema = emptySchema

  constructor(private agent: BarzAgent) {
    super()
  }

  async _call(): Promise<string> {
    await this.agent.freeze()
    return 'Wallet frozen. All transactions are blocked until unfrozen.'
  }
}

/**
 * Unfreeze the agent wallet — re-enables transactions.
 */
export class BarzUnfreezeWallet extends StructuredTool {
  name = 'barz_unfreeze_wallet'
  description =
    'Unfreeze the agent wallet. Re-enables transactions after a freeze.'
  schema = emptySchema

  constructor(private agent: BarzAgent) {
    super()
  }

  async _call(): Promise<string> {
    await this.agent.unfreeze()
    return 'Wallet unfrozen. Transactions are now enabled.'
  }
}
