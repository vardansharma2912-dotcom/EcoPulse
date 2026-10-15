export type ThemeMode = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'ecopulse_theme_v1'

/**
 * Reads stored theme choice from localStorage.
 * Default is strictly 'light' if not set or invalid.
 */
export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === 'system' || raw === 'light' || raw === 'dark') {
      return raw
    }
  } catch {
    // Ignore localStorage access restrictions
  }
  return 'light'
}

/**
 * Persists theme choice to localStorage under versioned key.
 */
export function setStoredTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Ignore localStorage access restrictions
  }
}

/**
 * Resolves effective theme ('light' | 'dark') from setting.
 * When 'system', inspects prefers-color-scheme media query.
 */
export function resolveTheme(theme: ThemeMode): ResolvedTheme {
  if (theme === 'dark') return 'dark'
  if (theme === 'light') return 'light'
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

/**
 * Applies theme attributes to DOM:
 * 1. Sets data-theme attribute on <html> element
 * 2. Updates <meta name="theme-color"> tag
 */
export function applyTheme(theme: ThemeMode): ResolvedTheme {
  const resolved = resolveTheme(theme)
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', resolved)

    // Sync theme-color meta tag for browser chrome & PWA
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    const themeColor = resolved === 'dark' ? '#08140d' : '#e6f4ea'
    if (metaTheme) {
      metaTheme.setAttribute('content', themeColor)
    } else {
      const newMeta = document.createElement('meta')
      newMeta.name = 'theme-color'
      newMeta.content = themeColor
      document.head.appendChild(newMeta)
    }
  }
  return resolved
}

/**
 * Subscribes to live OS color scheme changes when theme setting is 'system'.
 * Returns an unbind cleanup function.
 */
export function subscribeToSystemScheme(
  getThemeMode: () => ThemeMode,
  onChange: (resolved: ResolvedTheme) => void
): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {}
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const listener = (e: MediaQueryListEvent) => {
    if (getThemeMode() === 'system') {
      const resolved: ResolvedTheme = e.matches ? 'dark' : 'light'
      applyTheme('system')
      onChange(resolved)
    }
  }

  mediaQuery.addEventListener('change', listener)
  return () => {
    mediaQuery.removeEventListener('change', listener)
  }
}
