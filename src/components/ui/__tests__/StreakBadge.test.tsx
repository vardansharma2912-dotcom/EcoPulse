import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { StreakBadge } from '../StreakBadge'

describe('StreakBadge Component', () => {
  it('renders correct aria-label and tier name for 7 days (Blaze level)', () => {
    const html = renderToString(<StreakBadge days={7} />)
    expect(html).toContain('aria-label="Current streak: 7 days, Blaze level"')
    expect(html).toContain('Blaze')
  })

  it('renders correct aria-label and tier name for 1 day (Spark level)', () => {
    const html = renderToString(<StreakBadge days={1} />)
    expect(html).toContain('aria-label="Current streak: 1 day, Spark level"')
    expect(html).toContain('Spark')
  })

  it('renders correct aria-label and tier name for 0 days (Dormant level)', () => {
    const html = renderToString(<StreakBadge days={0} />)
    expect(html).toContain('aria-label="Current streak: 0 days, Dormant level"')
    expect(html).toContain('Dormant')
  })

  it('renders correct aria-label and max level indicator for 100+ days (Legend level)', () => {
    const html = renderToString(<StreakBadge days={100} showProgress={true} />)
    expect(html).toContain('aria-label="Current streak: 100 days, Legend level"')
    expect(html).toContain('Legend')
    expect(html).toContain('Max level achieved!')
  })

  it('renders progress bar and days to next tier when showProgress is true', () => {
    const html = renderToString(<StreakBadge days={3} showProgress={true} />)
    // 3 days is Flame (min 3, next 7) -> 4 more days to Blaze
    expect(html).toContain('4 more days to Blaze')
  })

  it('renders compact mode without text labels when compact is true', () => {
    const html = renderToString(<StreakBadge days={15} compact={true} />)
    expect(html).toContain('aria-label="Current streak: 15 days, Inferno level"')
    expect(html).toContain('svg')
  })

  it('renders locked pill with lock icon and locked aria-label when isLocked is true', () => {
    const html = renderToString(<StreakBadge days={14} compact={true} isLocked={true} animated={false} />)
    expect(html).toContain('aria-label="Locked streak level: Inferno"')
    // Renders lock icon and neutral slate pill, not the colored flame svg
    expect(html).toContain('lucide-lock')
    expect(html).not.toContain('stop-color')
  })

  it('renders static badge without crash when animated is false', () => {
    const html = renderToString(<StreakBadge days={7} animated={false} />)
    expect(html).toContain('aria-label="Current streak: 7 days, Blaze level"')
    expect(html).toContain('Blaze')
  })
})
