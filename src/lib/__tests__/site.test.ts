import { describe, it, expect } from 'vitest'
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, absoluteUrl } from '../site'

describe('site.ts - Site Configuration', () => {
  it('exports expected branding constants', () => {
    expect(SITE_NAME).toBe('EcoPulse')
    expect(SITE_TAGLINE).toBe('Smart Energy Saving Reminder')
    expect(SITE_DESCRIPTION).toContain('energy-saving')
    expect(SITE_URL).toMatch(/^https?:\/\//)
  })

  it('formats absolute URLs without double slashes or trailing slashes for subpages', () => {
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`)
    expect(absoluteUrl('')).toBe(`${SITE_URL}/`)
    expect(absoluteUrl('/calculator')).toBe(`${SITE_URL}/calculator`)
    expect(absoluteUrl('reminders')).toBe(`${SITE_URL}/reminders`)
    expect(absoluteUrl('/learn/')).toBe(`${SITE_URL}/learn`)
  })
})
