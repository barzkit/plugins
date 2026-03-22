import { z } from 'zod'
import type { BarzAgent } from '@barzkit/sdk'
import type { ToolCallback } from '../types.js'

export const createSessionSchema = {
  expires_in: z.string().describe('Duration string (e.g. "24h", "1h", "30m", "7d")'),
  max_amount_per_tx: z.string().optional().describe('Max per-tx amount (e.g. "50 USDC")'),
  max_daily_spend: z.string().optional().describe('Max daily spend (e.g. "200 USDC")'),
  label: z.string().optional().describe('Optional label for this session'),
}

export function createSessionHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof createSessionSchema> {
  return async ({ expires_in, max_amount_per_tx, max_daily_spend, label }) => {
    const agent = getAgent()
    if (!agent) {
      return {
        content: [{ type: 'text' as const, text: 'Error: No wallet created. Use create_wallet first.' }],
        isError: true,
      }
    }

    try {
      const session = agent.createSession({
        expiresIn: expires_in,
        permissions: {
          ...(max_amount_per_tx && { maxAmountPerTx: max_amount_per_tx }),
          ...(max_daily_spend && { maxDailySpend: max_daily_spend }),
        },
        label,
      })

      return {
        content: [{
          type: 'text' as const,
          text: [
            `Session created!`,
            `ID: ${session.id}`,
            `Address: ${session.address}`,
            `Expires: ${new Date(session.expiresAt * 1000).toISOString()}`,
            `Private key: ${session.privateKey}`,
            label ? `Label: ${label}` : '',
          ].filter(Boolean).join('\n'),
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

export const listSessionsSchema = {}

export function listSessionsHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof listSessionsSchema> {
  return async () => {
    const agent = getAgent()
    if (!agent) {
      return {
        content: [{ type: 'text' as const, text: 'Error: No wallet created. Use create_wallet first.' }],
        isError: true,
      }
    }

    const sessions = agent.getSessions()
    if (sessions.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'No sessions found.' }],
      }
    }

    const lines = sessions.map((s) => {
      const status = s.isExpired() ? 'EXPIRED' : `${s.remainingTime()}s remaining`
      return `${s.label || s.id}: ${status}`
    })

    return {
      content: [{ type: 'text' as const, text: `${sessions.length} sessions:\n${lines.join('\n')}` }],
    }
  }
}

export const revokeSessionSchema = {
  session_id: z.string().describe('Session ID to revoke'),
}

export function revokeSessionHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof revokeSessionSchema> {
  return async ({ session_id }) => {
    const agent = getAgent()
    if (!agent) {
      return {
        content: [{ type: 'text' as const, text: 'Error: No wallet created. Use create_wallet first.' }],
        isError: true,
      }
    }

    const revoked = agent.revokeSession(session_id)
    return {
      content: [{
        type: 'text' as const,
        text: revoked ? `Session ${session_id} revoked.` : `Session ${session_id} not found.`,
      }],
      isError: revoked ? undefined : true,
    }
  }
}
