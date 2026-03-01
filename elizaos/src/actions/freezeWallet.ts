import type {
  Action,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core'
import { BarzService } from '../services/barzService.js'

export const freezeWallet: Action = {
  name: 'FREEZE_WALLET',
  description: 'Freeze the agent wallet. Emergency kill switch — blocks all transactions.',
  similes: [
    'FREEZE',
    'LOCK_WALLET',
    'KILL_SWITCH',
    'EMERGENCY_STOP',
    'PAUSE_WALLET',
  ],
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'Freeze the wallet' },
      },
      {
        name: '{{agentName}}',
        content: { text: 'Wallet frozen. All transactions are blocked until unfrozen.' },
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
      await agent.freeze()
      await callback?.({
        text: `Wallet frozen. All transactions are blocked until you unfreeze it.`,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      await callback?.({ text: `Failed to freeze wallet: ${msg}` })
    }
  },
}

export const unfreezeWallet: Action = {
  name: 'UNFREEZE_WALLET',
  description: 'Unfreeze the agent wallet. Re-enables transactions.',
  similes: [
    'UNFREEZE',
    'UNLOCK_WALLET',
    'RESUME_WALLET',
    'UNPAUSE_WALLET',
    'REACTIVATE_WALLET',
  ],
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'Unfreeze the wallet' },
      },
      {
        name: '{{agentName}}',
        content: { text: 'Wallet unfrozen. Transactions are now enabled.' },
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
      await agent.unfreeze()
      await callback?.({
        text: `Wallet unfrozen. Transactions are now enabled.`,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      await callback?.({ text: `Failed to unfreeze wallet: ${msg}` })
    }
  },
}
