import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
    external: ['@barzkit/sdk', 'viem'],
  },
  {
    entry: { server: 'src/server.ts' },
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    treeshake: true,
    minify: false,
    external: ['@barzkit/sdk', 'viem'],
  },
])
