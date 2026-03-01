import type {
  Action,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core'
import { formatEther } from 'viem'
import { BarzService } from '../services/barzService.js'

export const checkBalance: Action = {
  name: 'CHECK_BALANCE',
  description: 'Check the agent wallet ETH balance',
  similes: [
    'GET_BALANCE',
    'WALLET_BALANCE',
    'HOW_MUCH_ETH',
    'SHOW_BALANCE',
    'MY_BALANCE',
    'BALANCE_CHECK',
  ],
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'What is my wallet balance?' },
      },
      {
        name: '{{agentName}}',
        content: { text: 'Your wallet balance is 0.5 ETH on sepolia.' },
      },
    ],
  ],

  async validate(runtime: IAgentRuntime, _message: Memory) {
    const service = runtime.getService<BarzService>(BarzService.serviceType)
    return service?.isInitialized() ?? false
  },

  async handler(
    runtime: IAgentRuntime,
    _message: Memory,
    _state?: State,
    _options?: unknown,
    callback?: HandlerCallback
  ) {
    const service = runtime.getService<BarzService>(BarzService.serviceType)
    const agent = service!.getAgent()

    try {
      const balance = await agent.getBalance()
      const balanceEth = formatEther(balance)

      await callback?.({
        text: `Wallet ${agent.address} on ${agent.chain}: ${balanceEth} ETH`,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      await callback?.({ text: `Failed to fetch balance: ${msg}` })
    }
  },
}
