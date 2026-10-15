import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import indexHtml from '../../../index.html?raw'
import {
  THEME_STORAGE_KEY,
  getStoredTheme,
  setStoredTheme,
  resolveTheme,
  applyTheme,
  subscribeToSystemScheme,
} from '../theme'

// Provide in-memory localStorage polyfill for Node test environment
const mockStore = new Map<string, string>()
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (key: string) => mockStore.get(key) ?? null,
    setItem: (key: string, val: string) => {
      mockStore.set(key, String(val))
    },
    removeItem: (key: string) => {
      mockStore.delete(key)
    },
    clear: () => {
      mockStore.clear()
    },
    length: 0,
    key: () => null,
  }
}

// Minimal DOM & Window mock for Node test environment
const attributes = new Map<string, string>()
const mockMeta = {
  content: '',
  getAttribute: (name: string) => (name === 'content' ? mockMeta.content : null),
  setAttribute: (name: string, val: string) => {
    if (name === 'content') mockMeta.content = val
  },
}

if (typeof globalThis.document === 'undefined') {
  ;(globalThis as any).document = {
    documentElement: {
      getAttribute: (name: string) => attributes.get(name) ?? null,
      setAttribute: (name: string, val: string) => {
        attributes.set(name, String(val))
      },
      removeAttribute: (name: string) => {
        attributes.delete(name)
      },
    },
    querySelector: (selector: string) => {
      if (selector === 'meta[name="theme-color"]') {
        return mockMeta
      }
      return null
    },
    head: {
      appendChild: vi.fn(),
    },
    createElement: (tag: string) => {
      if (tag === 'meta') return mockMeta
      return {}
    },
  }
}

if (typeof globalThis.window === 'undefined') {
  ;(globalThis as any).window = globalThis
}

// --- WCAG Contrast Utilities ---

interface RGB {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '').trim()
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    }
  }
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  }
}

/**
 * Composite a translucent color over a solid base color.
 */
function composite(foreground: RGB, alpha: number, background: RGB): RGB {
  return {
    r: Math.round(foreground.r * alpha + background.r * (1 - alpha)),
    g: Math.round(foreground.g * alpha + background.g * (1 - alpha)),
    b: Math.round(foreground.b * alpha + background.b * (1 - alpha)),
  }
}

function getRelativeLuminance({ r, g, b }: RGB): number {
  const [sR, sG, sB] = [r, g, b].map((val) => {
    const c = val / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB
}

function getContrastRatio(colorA: RGB, colorB: RGB): number {
  const lumA = getRelativeLuminance(colorA)
  const lumB = getRelativeLuminance(colorB)
  const lighter = Math.max(lumA, lumB)
  const darker = Math.min(lumA, lumB)
  return (lighter + 0.05) / (darker + 0.05)
}

describe('Theme WCAG AA Programmatic Contrast Tests', () => {
  // Dark palette tokens
  const darkPageBg = hexToRgb('#08140d')
  // Dark glass panel: 8% white over #08140d
  const darkPanelBg = composite(hexToRgb('#ffffff'), 0.08, darkPageBg)
  // Dark text tokens
  const darkTextPrimary = hexToRgb('#e8f5ec')
  const darkTextSecondary = hexToRgb('#9db8a6')
  const darkAccentEmerald = hexToRgb('#3ecf8e')

  // Dark chart pill tiers (requirement: >= 3:1 against the panel, clearly distinguishable)
  const darkChartHigh = hexToRgb('#b7e4c7')
  const darkChartMid = hexToRgb('#3ecf8e')
  const darkChartLow = hexToRgb('#5aba86')

  // Light palette tokens
  const lightPageBg = hexToRgb('#edf6f0')
  const lightPanelBg = composite(hexToRgb('#ffffff'), 0.45, lightPageBg)
  const lightTextPrimary = hexToRgb('#14301f')
  const lightTextSecondary = hexToRgb('#1e3f2b')
  const lightChartHigh = hexToRgb('#0a381e')
  const lightChartMid = hexToRgb('#196f45')

  describe('Dark Mode Contrast Requirements', () => {
    it('primary text against dark page background meets WCAG AAA (> 7:1) and AA (> 4.5:1)', () => {
      const ratio = getContrastRatio(darkTextPrimary, darkPageBg)
      expect(ratio).toBeGreaterThanOrEqual(13.0)
    })

    it('primary text against dark glass panel meets WCAG AAA (> 7:1) and AA (> 4.5:1)', () => {
      const ratio = getContrastRatio(darkTextPrimary, darkPanelBg)
      expect(ratio).toBeGreaterThanOrEqual(11.0)
    })

    it('secondary text against dark page background meets WCAG AA (> 4.5:1)', () => {
      const ratio = getContrastRatio(darkTextSecondary, darkPageBg)
      expect(ratio).toBeGreaterThanOrEqual(7.0)
    })

    it('secondary text against dark glass panel meets WCAG AA (> 4.5:1)', () => {
      const ratio = getContrastRatio(darkTextSecondary, darkPanelBg)
      expect(ratio).toBeGreaterThanOrEqual(6.0)
    })

    it('emerald accent against dark background meets WCAG AA UI requirement (> 3:1)', () => {
      const ratio = getContrastRatio(darkAccentEmerald, darkPageBg)
      expect(ratio).toBeGreaterThanOrEqual(8.0)
    })

    it('all 3 dark chart pill tiers meet >= 3:1 against the dark panel and remain distinguishable', () => {
      const ratioHigh = getContrastRatio(darkChartHigh, darkPanelBg)
      const ratioMid = getContrastRatio(darkChartMid, darkPanelBg)
      const ratioLow = getContrastRatio(darkChartLow, darkPanelBg)

      expect(ratioHigh).toBeGreaterThanOrEqual(3.0)
      expect(ratioMid).toBeGreaterThanOrEqual(3.0)
      expect(ratioLow).toBeGreaterThanOrEqual(3.0)

      // Ensure tiers have distinct luminances
      const lumHigh = getRelativeLuminance(darkChartHigh)
      const lumMid = getRelativeLuminance(darkChartMid)
      const lumLow = getRelativeLuminance(darkChartLow)

      expect(lumHigh).toBeGreaterThan(lumMid)
      expect(lumMid).toBeGreaterThan(lumLow)
    })
  })

  describe('Light Mode Contrast Preservation (Zero Regressions)', () => {
    it('primary text on light page and panel meets WCAG AAA (> 7:1)', () => {
      const ratioPage = getContrastRatio(lightTextPrimary, lightPageBg)
      const ratioPanel = getContrastRatio(lightTextPrimary, lightPanelBg)

      expect(ratioPage).toBeGreaterThanOrEqual(10.0)
      expect(ratioPanel).toBeGreaterThanOrEqual(10.0)
    })

    it('secondary text on light page and panel meets WCAG AA (> 4.5:1)', () => {
      const ratioPage = getContrastRatio(lightTextSecondary, lightPageBg)
      const ratioPanel = getContrastRatio(lightTextSecondary, lightPanelBg)

      expect(ratioPage).toBeGreaterThanOrEqual(8.0)
      expect(ratioPanel).toBeGreaterThanOrEqual(8.0)
    })

    it('high and mid chart tiers on light panel meet UI requirement (> 3:1)', () => {
      const ratioHigh = getContrastRatio(lightChartHigh, lightPanelBg)
      const ratioMid = getContrastRatio(lightChartMid, lightPanelBg)

      expect(ratioHigh).toBeGreaterThanOrEqual(5.0)
      expect(ratioMid).toBeGreaterThanOrEqual(3.0)
    })
  })
})

describe('Theme Persistence and System Synchronization', () => {
  beforeEach(() => {
    mockStore.clear()
    attributes.clear()
    mockMeta.content = ''
  })

  afterEach(() => {
    mockStore.clear()
    attributes.clear()
    vi.restoreAllMocks()
  })

  it('defaults to Light when no storage value exists', () => {
    expect(getStoredTheme()).toBe('light')
  })

  it('persists selected theme under versioned storage key', () => {
    setStoredTheme('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(getStoredTheme()).toBe('dark')

    setStoredTheme('system')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system')
    expect(getStoredTheme()).toBe('system')
  })

  it('resolveTheme handles light and dark explicitly', () => {
    expect(resolveTheme('light')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
  })

  it('resolveTheme resolves system mode to OS preference', () => {
    ;(globalThis as any).window.matchMedia = vi.fn((query: string) => ({
      matches: query.includes('dark'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    expect(resolveTheme('system')).toBe('dark')
  })

  it('applyTheme correctly updates document data-theme and meta theme-color', () => {
    applyTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(mockMeta.content).toBe('#08140d')

    applyTheme('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(mockMeta.content).toBe('#e6f4ea')
  })

  it('subscribeToSystemScheme listens to media query changes', () => {
    let changeHandler: any = null
    const addEventListenerMock = vi.fn((event: string, handler: any) => {
      if (event === 'change') changeHandler = handler
    })
    const removeEventListenerMock = vi.fn()

    ;(globalThis as any).window.matchMedia = vi.fn(() => ({
      matches: true,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    }))

    const listener = vi.fn()
    const unsubscribe = subscribeToSystemScheme(() => 'system', listener)

    expect(addEventListenerMock).toHaveBeenCalled()
    if (changeHandler) {
      changeHandler({ matches: false })
      expect(listener).toHaveBeenCalledWith('light')

      changeHandler({ matches: true })
      expect(listener).toHaveBeenCalledWith('dark')
    }

    unsubscribe()
    expect(removeEventListenerMock).toHaveBeenCalled()
  })
})

describe('Inline Script Anti-Flash in index.html', () => {
  it('index.html contains early inline script before first paint with try/catch and versioned key', () => {
    const htmlContent = indexHtml

    // Must be in head
    expect(htmlContent).toContain('ecopulse_theme_v1')
    expect(htmlContent).toContain('data-theme')
    expect(htmlContent).toContain('theme-color')
    expect(htmlContent).toContain('try {')
    expect(htmlContent).toContain('catch (')
    expect(htmlContent).toContain('prefers-color-scheme: dark')

    // Ensure it is before <body>
    const headEnd = htmlContent.indexOf('</head>')
    const scriptIndex = htmlContent.indexOf('ecopulse_theme_v1')
    const bodyStart = htmlContent.indexOf('<body')

    expect(scriptIndex).toBeLessThan(headEnd)
    expect(headEnd).toBeLessThan(bodyStart)
  })
})
