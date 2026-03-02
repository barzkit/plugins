import { z } from 'zod'
import type { BarzAgent } from '@barzkit/sdk'
import type { ToolCallback } from '../types.js'

export const fetchWithPaymentSchema = {
  url: z.string().url().describe('URL to fetch'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional().describe('HTTP method. Default: GET'),
  headers: z.record(z.string()).optional().describe('HTTP headers as key-value pairs'),
}

export function fetchWithPaymentHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof fetchWithPaymentSchema> {
  return async ({ url, method, headers }) => {
    const agent = getAgent()
    if (!agent) {
      return {
        content: [{ type: 'text' as const, text: 'Error: No wallet created. Use create_wallet first.' }],
        isError: true,
      }
    }

    try {
      const options: RequestInit = {}
      if (method) options.method = method
      if (headers) options.headers = headers

      const response = await agent.fetchWithPayment(url, options)
      const body = await response.text()
      const preview = body.length > 1000 ? body.slice(0, 1000) + '... (truncated)' : body
      return {
        content: [{
          type: 'text' as const,
          text: `Fetched ${url}\nStatus: ${response.status}\nResponse: ${preview}`,
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
