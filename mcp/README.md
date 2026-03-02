# @barzkit/mcp

MCP Server for self-custody AI agent wallets. Works with Claude Desktop, Cursor, Windsurf, VS Code Copilot, and any MCP-compatible client.

[![npm](https://img.shields.io/npm/v/@barzkit/mcp)](https://www.npmjs.com/package/@barzkit/mcp)

## Setup

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "barzkit": {
      "command": "npx",
      "args": ["@barzkit/mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "barzkit": {
      "command": "npx",
      "args": ["@barzkit/mcp"]
    }
  }
}
```

### Windsurf / VS Code Copilot

Same format — add to your MCP configuration file.

## Tools

| Tool | Description |
|------|-------------|
| `create_wallet` | Create a new ERC-4337 smart account on Sepolia, Base Sepolia, or Base |
| `send_transaction` | Send ETH or ERC-20 tokens to a recipient address |
| `check_balance` | Check wallet balance for ETH or specific token |
| `swap_tokens` | Swap tokens on Uniswap V3 |
| `lend_tokens` | Deposit tokens into Aave V3 lending pool |
| `batch_transactions` | Execute multiple transactions atomically in one UserOperation |
| `freeze_wallet` | Emergency freeze — kill switch |
| `unfreeze_wallet` | Resume normal wallet operations |
| `fetch_with_payment` | Fetch URL with automatic x402 payment |

## Usage

Once configured, ask your AI assistant:

- "Create a wallet on Sepolia with my key 0x... and Pimlico key pim_..."
- "Send 0.01 ETH to 0xABC..."
- "What's my wallet balance?"
- "Swap 0.1 ETH for USDC"
- "Freeze my wallet immediately"

The `create_wallet` tool must be called first to initialize the wallet before using any other tool.

## Programmatic Usage

```typescript
import { createBarzMcpServer } from '@barzkit/mcp'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

const server = createBarzMcpServer()
const transport = new StdioServerTransport()
await server.connect(transport)
```

## Prerequisites

- Node.js >= 18
- [Pimlico API key](https://dashboard.pimlico.io) (free tier: 100 UserOps/day)
- Owner private key

## License

MIT
