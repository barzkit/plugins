import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  createBarzToolkit,
  BarzSendTransaction,
  BarzCheckBalance,
  BarzSwap,
  BarzLend,
  BarzBatchTransactions,
  BarzFreezeWallet,
  BarzUnfreezeWallet,
  BarzFetchWithPayment,
} from '../src/index.js'

// Mock BarzAgent — only need the shape, not real network calls
const mockAgent = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
  chain: 'sepolia',
  owner: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
} as never

// ── Toolkit ──

describe('createBarzToolkit', () => {
  it('returns 8 tools', () => {
    const tools = createBarzToolkit(mockAgent)
    expect(tools).toHaveLength(8)
  })

  it('each tool has name, description, schema', () => {
    const tools = createBarzToolkit(mockAgent)
    for (const tool of tools) {
      expect(tool.name).toBeTruthy()
      expect(tool.description).toBeTruthy()
      expect(tool.schema).toBeDefined()
    }
  })

  it('all tool names are unique', () => {
    const tools = createBarzToolkit(mockAgent)
    const names = tools.map((t) => t.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('all tool names start with barz_', () => {
    const tools = createBarzToolkit(mockAgent)
    for (const tool of tools) {
      expect(tool.name).toMatch(/^barz_/)
    }
  })
})

// ── Individual Tool Classes ──

const allToolClasses = [
  { Class: BarzSendTransaction, name: 'barz_send_transaction' },
  { Class: BarzCheckBalance, name: 'barz_check_balance' },
  { Class: BarzSwap, name: 'barz_swap' },
  { Class: BarzLend, name: 'barz_lend' },
  { Class: BarzBatchTransactions, name: 'barz_batch_transactions' },
  { Class: BarzFreezeWallet, name: 'barz_freeze_wallet' },
  { Class: BarzUnfreezeWallet, name: 'barz_unfreeze_wallet' },
  { Class: BarzFetchWithPayment, name: 'barz_fetch_with_payment' },
]

describe('tool classes', () => {
  for (const { Class, name } of allToolClasses) {
    describe(name, () => {
      it('has correct name', () => {
        const tool = new Class(mockAgent)
        expect(tool.name).toBe(name)
      })

      it('has non-empty description', () => {
        const tool = new Class(mockAgent)
        expect(tool.description.length).toBeGreaterThan(10)
      })

      it('has a zod schema', () => {
        const tool = new Class(mockAgent)
        expect(tool.schema).toBeDefined()
        expect(tool.schema._def).toBeDefined() // zod schema has _def
      })
    })
  }
})

// ── Schema Validation ──

describe('schema validation', () => {
  describe('barz_send_transaction', () => {
    const tool = new BarzSendTransaction(mockAgent)

    it('accepts valid input', () => {
      const result = tool.schema.safeParse({
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
        amount: '0.1',
      })
      expect(result.success).toBe(true)
    })

    it('accepts optional token', () => {
      const result = tool.schema.safeParse({
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
        amount: '0.1',
        token: 'USDC',
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing to', () => {
      const result = tool.schema.safeParse({ amount: '0.1' })
      expect(result.success).toBe(false)
    })

    it('rejects missing amount', () => {
      const result = tool.schema.safeParse({ to: '0xabc' })
      expect(result.success).toBe(false)
    })
  })

  describe('barz_check_balance', () => {
    const tool = new BarzCheckBalance(mockAgent)

    it('accepts empty input', () => {
      const result = tool.schema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('accepts token address', () => {
      const result = tool.schema.safeParse({ token: '0xA0b8...' })
      expect(result.success).toBe(true)
    })
  })

  describe('barz_swap', () => {
    const tool = new BarzSwap(mockAgent)

    it('accepts valid input', () => {
      const result = tool.schema.safeParse({
        from: 'USDC',
        to: 'WETH',
        amount: '100',
      })
      expect(result.success).toBe(true)
    })

    it('accepts optional slippage', () => {
      const result = tool.schema.safeParse({
        from: 'ETH',
        to: 'USDC',
        amount: '0.5',
        slippage: 1.0,
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing from', () => {
      const result = tool.schema.safeParse({ to: 'WETH', amount: '100' })
      expect(result.success).toBe(false)
    })
  })

  describe('barz_lend', () => {
    const tool = new BarzLend(mockAgent)

    it('accepts valid input', () => {
      const result = tool.schema.safeParse({ token: 'USDC', amount: '50' })
      expect(result.success).toBe(true)
    })

    it('accepts aave protocol', () => {
      const result = tool.schema.safeParse({
        token: 'USDC',
        amount: '50',
        protocol: 'aave',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid protocol', () => {
      const result = tool.schema.safeParse({
        token: 'USDC',
        amount: '50',
        protocol: 'compound',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('barz_batch_transactions', () => {
    const tool = new BarzBatchTransactions(mockAgent)

    it('accepts valid transactions array', () => {
      const result = tool.schema.safeParse({
        transactions: [
          { to: '0xabc' },
          { to: '0xdef', value: '1000' },
        ],
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty transactions', () => {
      const result = tool.schema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('barz_freeze/unfreeze', () => {
    it('freeze accepts empty input', () => {
      const tool = new BarzFreezeWallet(mockAgent)
      const result = tool.schema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('unfreeze accepts empty input', () => {
      const tool = new BarzUnfreezeWallet(mockAgent)
      const result = tool.schema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('barz_fetch_with_payment', () => {
    const tool = new BarzFetchWithPayment(mockAgent)

    it('accepts valid URL', () => {
      const result = tool.schema.safeParse({
        url: 'https://api.example.com/data',
      })
      expect(result.success).toBe(true)
    })

    it('accepts optional method and headers', () => {
      const result = tool.schema.safeParse({
        url: 'https://api.example.com/data',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid URL', () => {
      const result = tool.schema.safeParse({ url: 'not-a-url' })
      expect(result.success).toBe(false)
    })

    it('rejects invalid method', () => {
      const result = tool.schema.safeParse({
        url: 'https://example.com',
        method: 'PATCH',
      })
      expect(result.success).toBe(false)
    })
  })
})

// ── Description Quality ──

describe('tool descriptions contain keywords', () => {
  const tools = createBarzToolkit(mockAgent)

  const keywordMap: Record<string, string[]> = {
    barz_send_transaction: ['send', 'wallet'],
    barz_check_balance: ['balance', 'wallet'],
    barz_swap: ['swap', 'Uniswap'],
    barz_lend: ['Aave', 'lending'],
    barz_batch_transactions: ['atomic', 'transactions'],
    barz_freeze_wallet: ['freeze', 'kill switch'],
    barz_unfreeze_wallet: ['unfreeze'],
    barz_fetch_with_payment: ['x402', 'payment'],
  }

  for (const tool of tools) {
    const keywords = keywordMap[tool.name]
    if (keywords) {
      it(`${tool.name} description contains: ${keywords.join(', ')}`, () => {
        const lower = tool.description.toLowerCase()
        for (const kw of keywords) {
          expect(lower).toContain(kw.toLowerCase())
        }
      })
    }
  }
})
