import type { z } from 'zod'

/** MCP tool result */
export interface ToolResult {
  [key: string]: unknown
  content: { type: 'text'; text: string }[]
  isError?: boolean
}

/** Generic callback type for MCP tool handlers */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToolCallback<T extends Record<string, z.ZodType<any>>> = (
  args: { [K in keyof T]: z.infer<T[K]> },
  extra: unknown,
) => Promise<ToolResult>
