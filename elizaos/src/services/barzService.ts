import { Service, type IAgentRuntime } from '@elizaos/core'
import {
  createBarzAgent,
  type BarzAgent,
  type SupportedChain,
} from '@barzkit/sdk'

/**
 * BarzService manages the lifecycle of a BarzKit smart account agent.
 *
 * Reads configuration from ElizaOS runtime settings:
 * - `BARZ_OWNER_KEY` — owner private key (hex)
 * - `PIMLICO_API_KEY` — Pimlico bundler/paymaster API key
 * - `BARZ_CHAIN` — target chain (default: 'sepolia')
 */
export class BarzService extends Service {
  static override serviceType = 'barz'
  capabilityDescription = 'Self-custody smart account wallet via BarzKit SDK'

  private agent: BarzAgent | null = null

  /** Initialize the BarzKit agent from runtime settings */
  async initialize(runtime: IAgentRuntime): Promise<void> {
    this.runtime = runtime

    const ownerKey = runtime.getSetting('BARZ_OWNER_KEY')
    if (!ownerKey || typeof ownerKey !== 'string') {
      throw new Error(
        'BarzService: BARZ_OWNER_KEY not set. Add it to your ElizaOS character settings or .env file.'
      )
    }

    const pimlicoApiKey = runtime.getSetting('PIMLICO_API_KEY')
    if (!pimlicoApiKey || typeof pimlicoApiKey !== 'string') {
      throw new Error(
        'BarzService: PIMLICO_API_KEY not set. Get one at https://dashboard.pimlico.io'
      )
    }

    const chainRaw = runtime.getSetting('BARZ_CHAIN')
    const chain = (typeof chainRaw === 'string' ? chainRaw : 'sepolia') as SupportedChain

    this.agent = await createBarzAgent({
      chain,
      owner: ownerKey as `0x${string}`,
      pimlico: { apiKey: pimlicoApiKey },
    })
  }

  /** Get the initialized BarzAgent instance */
  getAgent(): BarzAgent {
    if (!this.agent) {
      throw new Error(
        'BarzService: agent not initialized. Ensure BarzService.initialize() has been called.'
      )
    }
    return this.agent
  }

  /** Check if the agent is initialized */
  isInitialized(): boolean {
    return this.agent !== null
  }

  async stop(): Promise<void> {
    this.agent = null
  }

  static override async start(runtime: IAgentRuntime): Promise<BarzService> {
    const service = new BarzService()
    await service.initialize(runtime)
    return service
  }
}
