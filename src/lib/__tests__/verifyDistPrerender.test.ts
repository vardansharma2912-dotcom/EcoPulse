import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('Prerendered Distribution Artifacts', () => {
  const distDir = path.resolve(process.cwd(), 'dist')

  it('generates dist/sitemap.xml with indexable routes only', () => {
    const sitemapPath = path.join(distDir, 'sitemap.xml')
    expect(fs.existsSync(sitemapPath)).toBe(true)

    const content = fs.readFileSync(sitemapPath, 'utf-8')
    expect(content).toContain('https://eco-pulse-flame.vercel.app/')
    expect(content).toContain('https://eco-pulse-flame.vercel.app/reminders')
    expect(content).toContain('https://eco-pulse-flame.vercel.app/calculator')
    expect(content).toContain('https://eco-pulse-flame.vercel.app/analytics')
    expect(content).toContain('https://eco-pulse-flame.vercel.app/learn')

    // Disallowed / non-indexable routes must NOT be in sitemap
    expect(content).not.toContain('/settings')
    expect(content).not.toContain('/404')
  })

  it('generates dist/robots.txt with sitemap reference and /settings disallow', () => {
    const robotsPath = path.join(distDir, 'robots.txt')
    expect(fs.existsSync(robotsPath)).toBe(true)

    const content = fs.readFileSync(robotsPath, 'utf-8')
    expect(content).toContain('Disallow: /settings')
    expect(content).toContain('Sitemap: https://eco-pulse-flame.vercel.app/sitemap.xml')
  })

  it('generates dist/404.html with noindex', () => {
    const notFoundPath = path.join(distDir, '404.html')
    expect(fs.existsSync(notFoundPath)).toBe(true)

    const content = fs.readFileSync(notFoundPath, 'utf-8')
    expect(content).toContain('content="noindex, nofollow"')
    expect(content).toContain('<title>Page Not Found (404) · EcoPulse Energy Saver</title>')
  })
})
