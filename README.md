# BarzKit Plugins

Official plugins for [@barzkit/sdk](https://github.com/barzkit/sdk).

| Plugin | npm | Description |
|--------|-----|-------------|
| [elizaos](./elizaos) | [![npm](https://img.shields.io/npm/v/@barzkit/elizaos)](https://www.npmjs.com/package/@barzkit/elizaos) | ElizaOS framework integration — 8 actions, wallet provider, service |
| [langchain](./langchain) | [![npm](https://img.shields.io/npm/v/@barzkit/langchain)](https://www.npmjs.com/package/@barzkit/langchain) | LangChain StructuredTool integration — 8 tools with zod schemas |

## Publishing

Each plugin is published separately to npm under the `@barzkit` scope.

```bash
# Publish all plugins
bash publish.sh

# Or publish individually
cd elizaos && npm run build && npm test && npm publish --access public
cd langchain && npm run build && npm test && npm publish --access public
```
