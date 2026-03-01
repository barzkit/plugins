import type { StructuredTool } from '@langchain/core/tools'
import type { BarzAgent } from '@barzkit/sdk'
import { BarzSendTransaction } from './tools/sendTransaction.js'
import { BarzCheckBalance } from './tools/checkBalance.js'
import { BarzSwap } from './tools/swap.js'
import { BarzLend } from './tools/lend.js'
import { BarzBatchTransactions } from './tools/batchTransactions.js'
import { BarzFreezeWallet, BarzUnfreezeWallet } from './tools/freezeWallet.js'
import { BarzFetchWithPayment } from './tools/fetchWithPayment.js'

/**
 * Create all BarzKit LangChain tools from a BarzAgent instance.
 *
 * @param agent - An initialized BarzAgent from `createBarzAgent()`
 * @returns Array of 8 StructuredTool instances
 */
export function createBarzToolkit(agent: BarzAgent): StructuredTool[] {
  return [
    new BarzSendTransaction(agent),
    new BarzCheckBalance(agent),
    new BarzSwap(agent),
    new BarzLend(agent),
    new BarzBatchTransactions(agent),
    new BarzFreezeWallet(agent),
    new BarzUnfreezeWallet(agent),
    new BarzFetchWithPayment(agent),
  ]
}
