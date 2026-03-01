import { StructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import type { BarzAgent } from '@barzkit/sdk'

const schema = z.object({
  url: z.string().url().describe('URL to fetch'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional().describe('HTTP method. Default: GET'),
  headers: z.record(z.string()).optional().describe('HTTP headers as key-value pairs'),
})

/**
 * Fetch a URL with automatic x402 payment if the server returns HTTP 402.
 */
export class BarzFetchWithPayment extends StructuredTool {
  name = 'barz_fetch_with_payment'
  description =
    'Fetch a URL with automatic x402 payment if the server requires it. Handles HTTP 402 responses by paying and retrying. Returns the response body.'
  schema = schema

  constructor(private agent: BarzAgent) {
    super()
  }

  async _call(input: z.output<typeof schema>): Promise<string> {
    const options: RequestInit = {}
    if (input.method) options.method = input.method
    if (input.headers) options.headers = input.headers

    const response = await this.agent.fetchWithPayment(input.url, options)
    const body = await response.text()
    const preview = body.length > 1000 ? body.slice(0, 1000) + '... (truncated)' : body
    return `Fetched ${input.url} (status ${response.status}). Response: ${preview}`
  }
}
