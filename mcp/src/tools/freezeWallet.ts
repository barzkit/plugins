import type { BarzAgent } from "@barzkit/sdk";
import type { ToolCallback } from "../types.js";

export const freezeWalletSchema = {};

export function freezeWalletHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof freezeWalletSchema> {
  return async () => {
    const agent = getAgent();
    if (!agent) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: No wallet created. Use create_wallet first.",
          },
        ],
        isError: true,
      };
    }

    try {
      const hash = await agent.freeze();
      return {
        content: [
          {
            type: "text" as const,
            text: `Wallet frozen!\nHash: ${hash}\nExplorer: ${agent.getExplorerUrl(hash)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  };
}

export const unfreezeWalletSchema = {};

export function unfreezeWalletHandler(
  getAgent: () => BarzAgent | null,
): ToolCallback<typeof unfreezeWalletSchema> {
  return async () => {
    const agent = getAgent();
    if (!agent) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: No wallet created. Use create_wallet first.",
          },
        ],
        isError: true,
      };
    }

    try {
      const hash = await agent.unfreeze();
      return {
        content: [
          {
            type: "text" as const,
            text: `Wallet unfrozen!\nHash: ${hash}\nExplorer: ${agent.getExplorerUrl(hash)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  };
}
