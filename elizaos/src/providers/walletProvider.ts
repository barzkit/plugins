import type {
  IAgentRuntime,
  Memory,
  Provider,
  State,
} from '@elizaos/core'
import { BarzService } from '../services/barzService.js'
import { formatEther } from 'viem'

/**
 * Provides wallet context to the agent's conversation.
 * Injects current address, chain, balance, and status.
 */
export const walletProvider: Provider = {
  name: 'barzWallet',
  description: 'BarzKit smart account wallet status and balance',

  async get(
    runtime: IAgentRuntime,
    _message: Memory,
    _state: State
  ) {
    const service = runtime.getService<BarzService>(BarzService.serviceType)
    if (!service?.isInitialized()) {
      return {
        text: 'Wallet not connected. BarzService is not initialized.',
      }
    }

    const agent = service.getAgent()

    try {
      const [balance, active] = await Promise.all([
        agent.getBalance(),
        agent.isActive(),
      ])

      const balanceEth = formatEther(balance)
      const status = active ? 'active' : 'frozen'

      return {
        text: `Agent wallet: ${agent.address} on ${agent.chain}. Balance: ${balanceEth} ETH. Status: ${status}.`,
        values: {
          address: agent.address,
          chain: agent.chain,
          balance: balanceEth,
          status,
        },
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      return {
        text: `Agent wallet: ${agent.address} on ${agent.chain}. Could not fetch balance: ${msg}`,
      }
    }
  },
}
