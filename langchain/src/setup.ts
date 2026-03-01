import type { StructuredTool } from '@langchain/core/tools'
import { createBarzAgent, type AgentConfig } from '@barzkit/sdk'
import { createBarzToolkit } from './toolkit.js'

/**
 * Create BarzKit LangChain tools from config.
 * Initializes a BarzAgent and returns all tools ready for use with LangChain agents.
 *
 * @example
 * ```typescript
 * const tools = await createBarzTools({
 *   chain: 'sepolia',
 *   owner: '0x...',
 *   pimlico: { apiKey: 'pim_...' },
 * })
 *
 * const agent = createToolCallingAgent({ llm, tools, prompt })
 * ```
 */
export async function createBarzTools(config: AgentConfig): Promise<StructuredTool[]> {
  const agent = await createBarzAgent(config)
  return createBarzToolkit(agent)
}
