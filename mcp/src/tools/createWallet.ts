import { z } from 'zod'
import { createBarzAgent, type BarzAgent } from '@barzkit/sdk'
import type { ToolCallback } from '../types.js'

export const createWalletSchema = {
  chain: z.enum(['sepolia', 'base-sepolia', 'base']).describe('Blockchain network'),
  ownerKey: z.string().describe('Owner private key (0x...)'),
  pimlicoApiKey: z.string().describe('Pimlico bundler API key'),
  gasless: z.boolean().optional().describe('Enable gasless transactions (default: true)'),
}

export function createWalletHandler(
  getAgent: () => BarzAgent | null,
  setAgent: (agent: BarzAgent) => void,
): ToolCallback<typeof createWalletSchema> {
  return async ({ chain, ownerKey, pimlicoApiKey, gasless }) => {
    try {
      const agent = await createBarzAgent({
        chain,
        owner: ownerKey as `0x${string}`,
        pimlico: { apiKey: pimlicoApiKey },
        gasless: gasless ?? true,
      })
      setAgent(agent)
      return {
        content: [{
          type: 'text' as const,
          text: `Wallet created!\nAddress: ${agent.address}\nChain: ${chain}\nGasless: ${gasless ?? true}`,
        }],
      }
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      }
    }
  }
}
