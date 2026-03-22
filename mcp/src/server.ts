import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { BarzAgent } from '@barzkit/sdk'

import { createWalletSchema, createWalletHandler } from './tools/createWallet.js'
import { sendTransactionSchema, sendTransactionHandler } from './tools/sendTransaction.js'
import { checkBalanceSchema, checkBalanceHandler } from './tools/checkBalance.js'
import { swapSchema, swapHandler } from './tools/swap.js'
import { lendSchema, lendHandler } from './tools/lend.js'
import { batchTransactionsSchema, batchTransactionsHandler } from './tools/batchTransactions.js'
import { freezeWalletSchema, freezeWalletHandler, unfreezeWalletSchema, unfreezeWalletHandler } from './tools/freezeWallet.js'
import { fetchWithPaymentSchema, fetchWithPaymentHandler } from './tools/fetchWithPayment.js'
import { subscribeWebhookSchema, subscribeWebhookHandler, removeListenersSchema, removeListenersHandler } from './tools/events.js'

/**
 * Create a BarzKit MCP server with all wallet management tools.
 */
export function createBarzMcpServer(): McpServer {
  const server = new McpServer({
    name: 'barzkit',
    version: '0.1.0',
  })

  let agent: BarzAgent | null = null
  const getAgent = () => agent
  const setAgent = (a: BarzAgent) => { agent = a }

  server.tool(
    'create_wallet',
    'Create a new self-custody AI agent wallet (ERC-4337 smart account). Must be called before any other tool.',
    createWalletSchema,
    createWalletHandler(getAgent, setAgent),
  )

  server.tool(
    'send_transaction',
    'Send ETH or ERC-20 tokens from the agent wallet to a recipient address.',
    sendTransactionSchema,
    sendTransactionHandler(getAgent),
  )

  server.tool(
    'check_balance',
    'Check the agent wallet balance for ETH or a specific ERC-20 token.',
    checkBalanceSchema,
    checkBalanceHandler(getAgent),
  )

  server.tool(
    'swap_tokens',
    'Swap tokens on Uniswap V3 via the agent wallet. Supports ETH, USDC, WETH, DAI.',
    swapSchema,
    swapHandler(getAgent),
  )

  server.tool(
    'lend_tokens',
    'Deposit tokens into Aave V3 lending pool via the agent wallet.',
    lendSchema,
    lendHandler(getAgent),
  )

  server.tool(
    'batch_transactions',
    'Execute multiple transactions atomically in a single UserOperation. One signature, one gas fee.',
    batchTransactionsSchema,
    batchTransactionsHandler(getAgent),
  )

  server.tool(
    'freeze_wallet',
    'Emergency freeze the agent wallet. Kill switch — immediately stops all transactions.',
    freezeWalletSchema,
    freezeWalletHandler(getAgent),
  )

  server.tool(
    'unfreeze_wallet',
    'Unfreeze the agent wallet to resume normal operations.',
    unfreezeWalletSchema,
    unfreezeWalletHandler(getAgent),
  )

  server.tool(
    'fetch_with_payment',
    'Fetch a URL with automatic x402 payment if the server returns HTTP 402. Handles machine-to-machine payments.',
    fetchWithPaymentSchema,
    fetchWithPaymentHandler(getAgent),
  )

  server.tool(
    'subscribe_webhook',
    'Subscribe to on-chain events (balance changes, incoming transfers, freeze/unfreeze) and forward them as POST to a webhook URL.',
    subscribeWebhookSchema,
    subscribeWebhookHandler(getAgent),
  )

  server.tool(
    'remove_listeners',
    'Remove all event listeners and webhooks. Stops chain polling.',
    removeListenersSchema,
    removeListenersHandler(getAgent),
  )

  return server
}
