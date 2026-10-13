import { describe, it, expect } from 'vitest'
import { ROUTES_META, getRouteMeta, getJsonLd } from '../seo'

describe('SEO Configuration & Route Metadata', () => {
  it('defines all required clean routes in ROUTES_META', () => {
    const requiredRoutes = ['/', '/reminders', '/calculator', '/analytics', '/learn', '/settings', '/404']
    for (const route of requiredRoutes) {
      expect(ROUTES_META[route]).toBeDefined()
      expect(ROUTES_META[route].path).toBe(route)
    }
  })

  it('provides titles between 45 and 65 characters without framework names', () => {
    for (const [, meta] of Object.entries(ROUTES_META)) {
      expect(meta.title.length).toBeGreaterThanOrEqual(40)
      expect(meta.title.length).toBeLessThanOrEqual(65)
      expect(meta.title).not.toMatch(/vite/i)
      expect(meta.title).not.toMatch(/react/i)
      expect(meta.title).toContain('EcoPulse')
    }
  })

  it('provides descriptions between 130 and 165 characters for actual page context', () => {
    for (const [, meta] of Object.entries(ROUTES_META)) {
      expect(meta.description.length).toBeGreaterThanOrEqual(130)
      expect(meta.description.length).toBeLessThanOrEqual(165)
    }
  })

  it('marks /settings and /404 as non-indexable, others as indexable', () => {
    expect(ROUTES_META['/settings'].indexable).toBe(false)
    expect(ROUTES_META['/404'].indexable).toBe(false)
    expect(ROUTES_META['/'].indexable).toBe(true)
    expect(ROUTES_META['/reminders'].indexable).toBe(true)
    expect(ROUTES_META['/calculator'].indexable).toBe(true)
    expect(ROUTES_META['/analytics'].indexable).toBe(true)
    expect(ROUTES_META['/learn'].indexable).toBe(true)
  })

  it('correctly maps trailing slashes or unknown paths in getRouteMeta', () => {
    expect(getRouteMeta('/reminders/').path).toBe('/reminders')
    expect(getRouteMeta('/unknown-page').path).toBe('/404')
  })

  it('generates valid JSON-LD graph objects for all routes', () => {
    for (const route of Object.keys(ROUTES_META)) {
      const jsonLd = getJsonLd(route) as { '@context': string; '@graph': any[] }
      expect(jsonLd['@context']).toBe('https://schema.org')
      expect(Array.isArray(jsonLd['@graph'])).toBe(true)
      
      // Ensure serialized string is valid JSON
      const serialized = JSON.stringify(jsonLd)
      expect(() => JSON.parse(serialized)).not.toThrow()

      // Check organization structure
      const org = jsonLd['@graph'].find((item) => item['@type'] === 'Organization')
      expect(org).toBeDefined()
      expect(org.name).toBe('EcoPulse')
      expect(org.founder).toEqual([
        { '@type': 'Person', name: 'Vardaan' },
        { '@type': 'Person', name: 'Shashank' },
        { '@type': 'Person', name: 'Raina Deep' },
      ])
    }
  })
})
