import type {
  Action,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  State,
} from '@elizaos/core'
import { BarzService } from '../services/barzService.js'

const URL_PATTERN = /(?:fetch|pay|get)\s+(https?:\/\/\S+)/i

export const fetchWithPayment: Action = {
  name: 'FETCH_WITH_PAYMENT',
  description: 'Fetch a URL with automatic x402 payment. Example: "fetch https://api.example.com/data"',
  similes: [
    'X402_FETCH',
    'PAY_AND_FETCH',
    'HTTP_PAYMENT',
    'PAID_REQUEST',
    'MACHINE_PAYMENT',
  ],
  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'Fetch https://api.example.com/premium-data' },
      },
      {
        name: '{{agentName}}',
        content: { text: 'Fetched https://api.example.com/premium-data (status 200). Response: {...}' },
      },
    ],
  ],

  async validate(runtime: IAgentRuntime, _message: Memory) {
    const service = runtime.getService<BarzService>(BarzService.serviceType)
    return service?.isInitialized() ?? false
  },

  async handler(
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: unknown,
    callback?: HandlerCallback
  ) {
    const text = typeof message.content === 'string'
      ? message.content
      : message.content?.text ?? ''

    const match = text.match(URL_PATTERN)
    if (!match) {
      await callback?.({
        text: 'Could not find a URL. Use format: "fetch https://api.example.com/data"',
      })
      return
    }

    const [, url] = match
    const service = runtime.getService<BarzService>(BarzService.serviceType)
    const agent = service!.getAgent()

    try {
      const response = await agent.fetchWithPayment(url)
      const body = await response.text()

      const preview = body.length > 500
        ? body.slice(0, 500) + '... (truncated)'
        : body

      await callback?.({
        text: `Fetched ${url} (status ${response.status}).\nResponse:\n${preview}`,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      await callback?.({ text: `Fetch with payment failed: ${msg}` })
    }
  },
}
