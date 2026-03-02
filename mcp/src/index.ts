import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createBarzMcpServer } from './server.js'

const server = createBarzMcpServer()
const transport = new StdioServerTransport()
await server.connect(transport)
