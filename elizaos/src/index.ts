import type { Plugin } from '@elizaos/core'
import { BarzService } from './services/barzService.js'
import { walletProvider } from './providers/walletProvider.js'
import { sendTransaction } from './actions/sendTransaction.js'
import { checkBalance } from './actions/checkBalance.js'
import { swapTokens } from './actions/swap.js'
import { lendTokens } from './actions/lend.js'
import { batchTransactions } from './actions/batchTransactions.js'
import { freezeWallet, unfreezeWallet } from './actions/freezeWallet.js'
import { fetchWithPayment } from './actions/fetchWithPayment.js'

/**
 * BarzKit plugin for ElizaOS.
 *
 * Gives ElizaOS agents self-custody smart account wallets with:
 * - Send ETH transactions
 * - Check wallet balance
 * - Swap tokens (Uniswap V3)
 * - Lend tokens (Aave V3)
 * - Batch transactions (atomic multi-call)
 * - Freeze/unfreeze wallet (kill switch)
 * - x402 fetch with payment
 *
 * Required environment variables (set in ElizaOS character settings or .env):
 * - `BARZ_OWNER_KEY` — owner private key (hex)
 * - `PIMLICO_API_KEY` — Pimlico bundler/paymaster key
 * - `BARZ_CHAIN` — target chain (default: 'sepolia')
 */
export const barzPlugin: Plugin = {
  name: 'barzkit',
  description: 'Self-custody AI agent wallets via BarzKit — send, swap, lend, freeze, and x402 payments',
  services: [BarzService],
  providers: [walletProvider],
  actions: [
    sendTransaction,
    checkBalance,
    swapTokens,
    lendTokens,
    batchTransactions,
    freezeWallet,
    unfreezeWallet,
    fetchWithPayment,
  ],
}

export { BarzService } from './services/barzService.js'
export { walletProvider } from './providers/walletProvider.js'
export { sendTransaction } from './actions/sendTransaction.js'
export { checkBalance } from './actions/checkBalance.js'
export { swapTokens } from './actions/swap.js'
export { lendTokens } from './actions/lend.js'
export { batchTransactions } from './actions/batchTransactions.js'
export { freezeWallet, unfreezeWallet } from './actions/freezeWallet.js'
export { fetchWithPayment } from './actions/fetchWithPayment.js'
