import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'

// Mock @barzkit/sdk before importing server
vi.mock('@barzkit/sdk', () => ({
  createBarzAgent: vi.fn().mockResolvedValue({
    address: '0x1234567890abcdef1234567890abcdef12345678',
    chain: 'sepolia',
    owner: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    sendTransaction: vi.fn().mockResolvedValue('0xtxhash'),
    batchTransactions: vi.fn().mockResolvedValue('0xbatchhash'),
    getBalance: vi.fn().mockResolvedValue(1000000000000000000n),
    swap: vi.fn().mockResolvedValue('0xswaphash'),
    lend: vi.fn().mockResolvedValue('0xlendhash'),
    freeze: vi.fn().mockResolvedValue('0xfreezehash'),
    unfreeze: vi.fn().mockResolvedValue('0xunfreezehash'),
    fetchWithPayment: vi.fn().mockResolvedValue({
      status: 200,
      text: () => Promise.resolve('response body'),
    }),
    getExplorerUrl: vi.fn((hash: string) => `https://sepolia.etherscan.io/tx/${hash}`),
    getPermissions: vi.fn().mockReturnValue({}),
    updatePermissions: vi.fn(),
    enableX402: vi.fn(),
    waitForTransaction: vi.fn(),
    isActive: vi.fn().mockResolvedValue(true),
    on: vi.fn().mockReturnValue(() => {}),
    onWebhook: vi.fn().mockReturnValue(() => {}),
    removeAllListeners: vi.fn(),
  }),
}))

import { createBarzMcpServer } from '../src/server.js'
import { createWalletSchema, createWalletHandler } from '../src/tools/createWallet.js'
import { sendTransactionSchema, sendTransactionHandler } from '../src/tools/sendTransaction.js'
import { checkBalanceSchema, checkBalanceHandler } from '../src/tools/checkBalance.js'
import { swapSchema, swapHandler } from '../src/tools/swap.js'
import { lendSchema, lendHandler } from '../src/tools/lend.js'
import { batchTransactionsSchema, batchTransactionsHandler } from '../src/tools/batchTransactions.js'
import { freezeWalletSchema, freezeWalletHandler, unfreezeWalletSchema, unfreezeWalletHandler } from '../src/tools/freezeWallet.js'
import { fetchWithPaymentSchema, fetchWithPaymentHandler } from '../src/tools/fetchWithPayment.js'
import { subscribeWebhookSchema, subscribeWebhookHandler, removeListenersSchema, removeListenersHandler } from '../src/tools/events.js'

// ── Helper: extract registered tools from McpServer ──

function getRegisteredTools(server: ReturnType<typeof createBarzMcpServer>): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (server as any)._registeredTools as Record<string, unknown>
}

// ── Server Creation ──

describe('createBarzMcpServer', () => {
  it('creates a server without errors', () => {
    const server = createBarzMcpServer()
    expect(server).toBeDefined()
  })

  it('registers 11 tools', () => {
    const server = createBarzMcpServer()
    const tools = getRegisteredTools(server)
    expect(Object.keys(tools).length).toBe(11)
  })

  it('registers expected tool names', () => {
    const server = createBarzMcpServer()
    const tools = getRegisteredTools(server)
    const names = Object.keys(tools)

    expect(names).toContain('create_wallet')
    expect(names).toContain('send_transaction')
    expect(names).toContain('check_balance')
    expect(names).toContain('swap_tokens')
    expect(names).toContain('lend_tokens')
    expect(names).toContain('batch_transactions')
    expect(names).toContain('freeze_wallet')
    expect(names).toContain('unfreeze_wallet')
    expect(names).toContain('fetch_with_payment')
    expect(names).toContain('subscribe_webhook')
    expect(names).toContain('remove_listeners')
  })
})

// ── Tool Schemas ──

describe('tool schemas', () => {
  it('create_wallet requires chain, ownerKey, pimlicoApiKey', () => {
    const schema = z.object(createWalletSchema)
    expect(schema.safeParse({ chain: 'sepolia', ownerKey: '0xabc', pimlicoApiKey: 'pim_123' }).success).toBe(true)
    expect(schema.safeParse({}).success).toBe(false)
    expect(schema.safeParse({ chain: 'invalid' }).success).toBe(false)
  })

  it('send_transaction requires to and amount', () => {
    const schema = z.object(sendTransactionSchema)
    expect(schema.safeParse({ to: '0xabc', amount: '0.1' }).success).toBe(true)
    expect(schema.safeParse({ to: '0xabc', amount: '0.1', token: 'USDC' }).success).toBe(true)
    expect(schema.safeParse({}).success).toBe(false)
  })

  it('check_balance accepts empty input', () => {
    const schema = z.object(checkBalanceSchema)
    expect(schema.safeParse({}).success).toBe(true)
    expect(schema.safeParse({ token: '0xabc' }).success).toBe(true)
  })

  it('swap_tokens requires from, to, amount', () => {
    const schema = z.object(swapSchema)
    expect(schema.safeParse({ from: 'ETH', to: 'USDC', amount: '1' }).success).toBe(true)
    expect(schema.safeParse({ from: 'ETH', to: 'USDC', amount: '1', slippage: 1.0 }).success).toBe(true)
    expect(schema.safeParse({ from: 'ETH' }).success).toBe(false)
  })

  it('lend_tokens requires token and amount', () => {
    const schema = z.object(lendSchema)
    expect(schema.safeParse({ token: 'USDC', amount: '100' }).success).toBe(true)
    expect(schema.safeParse({ token: 'USDC', amount: '100', protocol: 'aave' }).success).toBe(true)
    expect(schema.safeParse({ token: 'USDC', amount: '100', protocol: 'compound' }).success).toBe(false)
  })

  it('batch_transactions requires transactions array', () => {
    const schema = z.object(batchTransactionsSchema)
    expect(schema.safeParse({ transactions: [{ to: '0xabc' }, { to: '0xdef', value: '1000' }] }).success).toBe(true)
    expect(schema.safeParse({}).success).toBe(false)
  })

  it('freeze/unfreeze accept empty input', () => {
    expect(z.object(freezeWalletSchema).safeParse({}).success).toBe(true)
    expect(z.object(unfreezeWalletSchema).safeParse({}).success).toBe(true)
  })

  it('fetch_with_payment requires valid url', () => {
    const schema = z.object(fetchWithPaymentSchema)
    expect(schema.safeParse({ url: 'https://example.com' }).success).toBe(true)
    expect(schema.safeParse({ url: 'https://example.com', method: 'POST' }).success).toBe(true)
    expect(schema.safeParse({ url: 'not-a-url' }).success).toBe(false)
    expect(schema.safeParse({}).success).toBe(false)
  })

  it('subscribe_webhook requires event and url', () => {
    const schema = z.object(subscribeWebhookSchema)
    expect(schema.safeParse({ event: 'incoming', url: 'https://example.com/hook' }).success).toBe(true)
    expect(schema.safeParse({ event: 'balanceChange', url: 'https://example.com/hook' }).success).toBe(true)
    expect(schema.safeParse({ event: 'invalid', url: 'https://example.com/hook' }).success).toBe(false)
    expect(schema.safeParse({ event: 'incoming' }).success).toBe(false)
    expect(schema.safeParse({}).success).toBe(false)
  })

  it('remove_listeners accepts empty input', () => {
    expect(z.object(removeListenersSchema).safeParse({}).success).toBe(true)
  })
})

// ── Tool Handlers: no wallet error ──

describe('tools without wallet return error', () => {
  const noAgent = () => null

  it('sendTransactionHandler', async () => {
    const result = await sendTransactionHandler(noAgent)({ to: '0x1', amount: '0.1' }, {})
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('No wallet created')
  })

  it('checkBalanceHandler', async () => {
    const result = await checkBalanceHandler(noAgent)({}, {})
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('No wallet created')
  })

  it('swapHandler', async () => {
    const result = await swapHandler(noAgent)({ from: 'ETH', to: 'USDC', amount: '1' }, {})
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('No wallet created')
  })

  it('lendHandler', async () => {
    const result = await lendHandler(noAgent)({ token: 'USDC', amount: '100' }, {})
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('No wallet created')
  })

  it('batchTransactionsHandler', async () => {
    const result = await batchTransactionsHandler(noAgent)({ transactions: [{ to: '0x1' }] }, {})
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('No wallet created')
  })

  it('freezeWalletHandler', async () => {
    const result = await freezeWalletHandler(noAgent)({}, {})
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('No wallet created')
  })

  it('unfreezeWalletHandler', async () => {
    const result = await unfreezeWalletHandler(noAgent)({}, {})
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('No wallet created')
  })

  it('fetchWithPaymentHandler', async () => {
    const result = await fetchWithPaymentHandler(noAgent)({ url: 'https://example.com' }, {})
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('No wallet created')
  })

  it('subscribeWebhookHandler', async () => {
    const result = await subscribeWebhookHandler(noAgent)({ event: 'incoming', url: 'https://example.com/hook' }, {})
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('No wallet created')
  })

  it('removeListenersHandler', async () => {
    const result = await removeListenersHandler(noAgent)({}, {})
    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('No wallet created')
  })
})

// ── Tool Handlers: with wallet ──

describe('tools with wallet', () => {
  function createMockAgent() {
    return {
      address: '0x1234567890abcdef1234567890abcdef12345678' as const,
      chain: 'sepolia' as const,
      owner: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as const,
      sendTransaction: vi.fn().mockResolvedValue('0xtxhash'),
      batchTransactions: vi.fn().mockResolvedValue('0xbatchhash'),
      getBalance: vi.fn().mockResolvedValue(1000000000000000000n),
      swap: vi.fn().mockResolvedValue('0xswaphash'),
      lend: vi.fn().mockResolvedValue('0xlendhash'),
      freeze: vi.fn().mockResolvedValue('0xfreezehash'),
      unfreeze: vi.fn().mockResolvedValue('0xunfreezehash'),
      fetchWithPayment: vi.fn().mockResolvedValue({
        status: 200,
        text: () => Promise.resolve('response body'),
      }),
      getExplorerUrl: vi.fn((hash: string) => `https://sepolia.etherscan.io/tx/${hash}`),
      getPermissions: vi.fn().mockReturnValue({}),
      updatePermissions: vi.fn(),
      enableX402: vi.fn(),
      waitForTransaction: vi.fn(),
      isActive: vi.fn().mockResolvedValue(true),
      on: vi.fn().mockReturnValue(() => {}),
      onWebhook: vi.fn().mockReturnValue(() => {}),
      removeAllListeners: vi.fn(),
    }
  }

  let mockAgent: ReturnType<typeof createMockAgent>

  beforeEach(() => {
    mockAgent = createMockAgent()
  })

  it('send_transaction calls agent.sendTransaction', async () => {
    const handler = sendTransactionHandler(() => mockAgent as never)
    const result = await handler({ to: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', amount: '0.1' }, {})

    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toContain('0xtxhash')
    expect(result.content[0].text).toContain('Explorer')
    expect(mockAgent.sendTransaction).toHaveBeenCalled()
  })

  it('check_balance returns formatted balance', async () => {
    const handler = checkBalanceHandler(() => mockAgent as never)
    const result = await handler({}, {})

    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toContain('1')
    expect(result.content[0].text).toContain('ETH')
    expect(mockAgent.getBalance).toHaveBeenCalled()
  })

  it('swap_tokens calls agent.swap', async () => {
    const handler = swapHandler(() => mockAgent as never)
    const result = await handler({ from: 'ETH', to: 'USDC', amount: '1' }, {})

    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toContain('0xswaphash')
    expect(mockAgent.swap).toHaveBeenCalledWith({
      from: 'ETH', to: 'USDC', amount: '1', slippage: 0.5,
    })
  })

  it('lend_tokens calls agent.lend', async () => {
    const handler = lendHandler(() => mockAgent as never)
    const result = await handler({ token: 'USDC', amount: '100' }, {})

    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toContain('0xlendhash')
    expect(mockAgent.lend).toHaveBeenCalledWith({
      token: 'USDC', amount: '100', protocol: 'aave',
    })
  })

  it('batch_transactions calls agent.batchTransactions', async () => {
    const handler = batchTransactionsHandler(() => mockAgent as never)
    const result = await handler({ transactions: [{ to: '0xabc' }, { to: '0xdef', value: '1000' }] }, {})

    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toContain('0xbatchhash')
    expect(result.content[0].text).toContain('2 transactions')
  })

  it('freeze_wallet calls agent.freeze', async () => {
    const handler = freezeWalletHandler(() => mockAgent as never)
    const result = await handler({}, {})

    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toContain('frozen')
    expect(mockAgent.freeze).toHaveBeenCalled()
  })

  it('unfreeze_wallet calls agent.unfreeze', async () => {
    const handler = unfreezeWalletHandler(() => mockAgent as never)
    const result = await handler({}, {})

    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toContain('unfrozen')
    expect(mockAgent.unfreeze).toHaveBeenCalled()
  })

  it('fetch_with_payment calls agent.fetchWithPayment', async () => {
    const handler = fetchWithPaymentHandler(() => mockAgent as never)
    const result = await handler({ url: 'https://api.example.com' }, {})

    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toContain('200')
    expect(result.content[0].text).toContain('response body')
    expect(mockAgent.fetchWithPayment).toHaveBeenCalled()
  })

  it('subscribe_webhook calls agent.onWebhook', async () => {
    const handler = subscribeWebhookHandler(() => mockAgent as never)
    const result = await handler({ event: 'incoming', url: 'https://example.com/hook' }, {})

    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toContain('Subscribed')
    expect(result.content[0].text).toContain('incoming')
    expect(mockAgent.onWebhook).toHaveBeenCalledWith('incoming', 'https://example.com/hook')
  })

  it('remove_listeners calls agent.removeAllListeners', async () => {
    const handler = removeListenersHandler(() => mockAgent as never)
    const result = await handler({}, {})

    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toContain('removed')
    expect(mockAgent.removeAllListeners).toHaveBeenCalled()
  })

  it('send_transaction returns error for non-ETH tokens', async () => {
    const handler = sendTransactionHandler(() => mockAgent as never)
    const result = await handler({ to: '0xabc', amount: '100', token: 'USDC' }, {})

    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('ERC-20')
  })
})

// ── Error Handling ──

describe('error handling', () => {
  it('catches and returns errors from agent methods', async () => {
    const errorAgent = {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'sepolia',
      sendTransaction: vi.fn().mockRejectedValue(new Error('insufficient funds')),
      getExplorerUrl: vi.fn(),
    }

    const handler = sendTransactionHandler(() => errorAgent as never)
    const result = await handler({ to: '0xabc', amount: '999' }, {})

    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('insufficient funds')
  })
})

// ── create_wallet handler ──

describe('create_wallet handler', () => {
  it('creates wallet and returns address', async () => {
    let storedAgent: unknown = null
    const handler = createWalletHandler(
      () => storedAgent as never,
      (a) => { storedAgent = a },
    )

    const result = await handler({
      chain: 'sepolia',
      ownerKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      pimlicoApiKey: 'pim_test',
    }, {})

    expect(result.isError).toBeUndefined()
    expect(result.content[0].text).toContain('Wallet created')
    expect(result.content[0].text).toContain('0x1234567890abcdef1234567890abcdef12345678')
    expect(storedAgent).not.toBeNull()
  })
})
