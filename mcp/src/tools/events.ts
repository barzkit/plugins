import { z } from 'zod'
import type { BarzAgent } from '@barzkit/sdk'
import type { ToolCallback } from '../types.js'

const EVENT_NAMES = ['transaction', 'balanceChange', 'incoming', 'frozen', 'unfrozen', 'error'] as const

export const subscribeWebhookSchema = {
  event: z.enum(EVENT_NAMES).describe('Event type to subscribe to'),
  url: z.string().url().describe('Webhook URL to receive POST notifications'),
}

export function subscribeWebhookHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof subscribeWebhookSchema> {
  return async ({ event, url }) => {
    const agent = getAgent()
    if (!agent) {
      return {
        content: [{ type: 'text' as const, text: 'Error: No wallet created. Use create_wallet first.' }],
        isError: true,
      }
    }

    try {
      agent.onWebhook(event, url)
      return {
        content: [{
          type: 'text' as const,
          text: `Subscribed to "${event}" events.\nWebhook URL: ${url}\nThe agent will POST event data to this URL when "${event}" occurs on-chain.`,
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

export const removeListenersSchema = {}

export function removeListenersHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof removeListenersSchema> {
  return async () => {
    const agent = getAgent()
    if (!agent) {
      return {
        content: [{ type: 'text' as const, text: 'Error: No wallet created. Use create_wallet first.' }],
        isError: true,
      }
    }

    try {
      agent.removeAllListeners()
      return {
        content: [{
          type: 'text' as const,
          text: 'All event listeners and webhooks removed. Chain polling stopped.',
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
