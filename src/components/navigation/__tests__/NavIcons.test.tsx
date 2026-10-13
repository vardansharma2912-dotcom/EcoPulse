import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import {
  DashboardNavIcon,
  RemindersNavIcon,
  CalculatorNavIcon,
  AnalyticsNavIcon,
  LearnNavIcon,
  SettingsNavIcon,
} from '../NavIcons'

describe('Animated NavIcons Component', () => {
  it('renders DashboardNavIcon with 4 rect elements', () => {
    const html = renderToString(<DashboardNavIcon />)
    expect(html).toContain('<svg')
    expect(html).toContain('viewBox="0 0 24 24"')
    // Contains 4 rect elements
    const rectCount = (html.match(/<rect/g) || []).length
    expect(rectCount).toBe(4)
  })

  it('renders RemindersNavIcon with bell body and swinging clapper', () => {
    const html = renderToString(<RemindersNavIcon isHovered={true} />)
    expect(html).toContain('<svg')
    expect(html).toContain('viewBox="0 0 24 24"')
    expect(html).toContain('<path')
  })

  it('renders CalculatorNavIcon with keypad keys', () => {
    const html = renderToString(<CalculatorNavIcon isHovered={true} />)
    expect(html).toContain('<svg')
    expect(html).toContain('<rect')
    expect(html).toContain('<line')
  })

  it('renders AnalyticsNavIcon with equalizer bars', () => {
    const html = renderToString(<AnalyticsNavIcon isHovered={true} />)
    expect(html).toContain('<svg')
    expect(html).toContain('M3 3v18h18')
  })

  it('renders LearnNavIcon with turning page leaf', () => {
    const html = renderToString(<LearnNavIcon isHovered={true} />)
    expect(html).toContain('<svg')
    expect(html).toContain('M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z')
    expect(html).toContain('M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z')
  })

  it('renders SettingsNavIcon with gear wheel and hub circle', () => {
    const html = renderToString(<SettingsNavIcon isHovered={true} />)
    expect(html).toContain('<svg')
    expect(html).toContain('<circle')
  })
})
