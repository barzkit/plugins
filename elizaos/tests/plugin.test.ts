import { describe, it, expect } from 'vitest'
import { barzPlugin, BarzService } from '../src/index.js'
import { sendTransaction } from '../src/actions/sendTransaction.js'
import { checkBalance } from '../src/actions/checkBalance.js'
import { swapTokens } from '../src/actions/swap.js'
import { lendTokens } from '../src/actions/lend.js'
import { batchTransactions } from '../src/actions/batchTransactions.js'
import { freezeWallet, unfreezeWallet } from '../src/actions/freezeWallet.js'
import { fetchWithPayment } from '../src/actions/fetchWithPayment.js'
import { walletProvider } from '../src/providers/walletProvider.js'

// ── Plugin Structure ──

describe('barzPlugin', () => {
  it('has required plugin fields', () => {
    expect(barzPlugin.name).toBe('barzkit')
    expect(barzPlugin.description).toBeTruthy()
    expect(barzPlugin.actions).toBeDefined()
    expect(barzPlugin.providers).toBeDefined()
    expect(barzPlugin.services).toBeDefined()
  })

  it('registers all 8 actions', () => {
    expect(barzPlugin.actions).toHaveLength(8)
    const names = barzPlugin.actions!.map((a) => a.name)
    expect(names).toContain('SEND_TRANSACTION')
    expect(names).toContain('CHECK_BALANCE')
    expect(names).toContain('SWAP_TOKENS')
    expect(names).toContain('LEND_TOKENS')
    expect(names).toContain('BATCH_TRANSACTIONS')
    expect(names).toContain('FREEZE_WALLET')
    expect(names).toContain('UNFREEZE_WALLET')
    expect(names).toContain('FETCH_WITH_PAYMENT')
  })

  it('registers wallet provider', () => {
    expect(barzPlugin.providers).toHaveLength(1)
    expect(barzPlugin.providers![0].name).toBe('barzWallet')
  })

  it('registers BarzService', () => {
    expect(barzPlugin.services).toHaveLength(1)
  })
})

// ── Action Shape Validation ──

const allActions = [
  sendTransaction,
  checkBalance,
  swapTokens,
  lendTokens,
  batchTransactions,
  freezeWallet,
  unfreezeWallet,
  fetchWithPayment,
]

describe('action shape', () => {
  for (const action of allActions) {
    describe(action.name, () => {
      it('has name and description', () => {
        expect(action.name).toBeTruthy()
        expect(action.description).toBeTruthy()
      })

      it('has handler and validate functions', () => {
        expect(typeof action.handler).toBe('function')
        expect(typeof action.validate).toBe('function')
      })

      it('has similes array', () => {
        expect(Array.isArray(action.similes)).toBe(true)
        expect(action.similes!.length).toBeGreaterThan(0)
      })

      it('has examples array', () => {
        expect(Array.isArray(action.examples)).toBe(true)
        expect(action.examples!.length).toBeGreaterThan(0)
      })

      it('validate returns false without BarzService', async () => {
        const mockRuntime = {
          getService: () => null,
          getSetting: () => null,
        }
        const result = await action.validate(mockRuntime as never)
        expect(result).toBe(false)
      })
    })
  }
})

// ── Provider Validation ──

describe('walletProvider', () => {
  it('has name and get function', () => {
    expect(walletProvider.name).toBe('barzWallet')
    expect(typeof walletProvider.get).toBe('function')
  })

  it('returns fallback when service not initialized', async () => {
    const mockRuntime = {
      getService: () => null,
    }
    const result = await walletProvider.get(
      mockRuntime as never,
      {} as never,
      {} as never
    )
    expect(result.text).toContain('not connected')
  })
})

// ── BarzService Validation ──

describe('BarzService', () => {
  it('has static serviceType', () => {
    expect(BarzService.serviceType).toBe('barz')
  })

  it('starts uninitialized', () => {
    const service = new BarzService()
    expect(service.isInitialized()).toBe(false)
  })

  it('getAgent throws when not initialized', () => {
    const service = new BarzService()
    expect(() => service.getAgent()).toThrow('not initialized')
  })

  it('initialize throws without BARZ_OWNER_KEY', async () => {
    const service = new BarzService()
    const mockRuntime = {
      getSetting: () => null,
    }
    await expect(service.initialize(mockRuntime as never)).rejects.toThrow('BARZ_OWNER_KEY')
  })

  it('initialize throws without PIMLICO_API_KEY', async () => {
    const service = new BarzService()
    const mockRuntime = {
      getSetting: (key: string) => key === 'BARZ_OWNER_KEY' ? '0xabc' : null,
    }
    await expect(service.initialize(mockRuntime as never)).rejects.toThrow('PIMLICO_API_KEY')
  })
})
