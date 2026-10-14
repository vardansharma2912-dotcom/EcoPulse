import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Logo } from '../Logo'

describe('Logo Component', () => {
  it('renders logo image with alt text', () => {
    const html = renderToString(<Logo size={32} />)
    expect(html).toContain('alt="EcoPulse logo"')
    expect(html).toContain('height:32px')
  })

  it('renders single-line brand name without tagline by default', () => {
    const html = renderToString(<Logo size={36} withWordmark />)
    expect(html).toContain('EcoPulse')
    expect(html).not.toContain('Smart Energy Reminder')
  })

  it('applies text-xl for desktop sidebar sizes (>= 36)', () => {
    const html = renderToString(<Logo size={36} withWordmark />)
    expect(html).toContain('text-xl')
    expect(html).toContain('font-semibold')
    expect(html).toContain('whitespace-nowrap')
  })

  it('applies text-lg for mobile header sizes (< 36)', () => {
    const html = renderToString(<Logo size={32} withWordmark />)
    expect(html).toContain('text-lg')
    expect(html).toContain('font-semibold')
    expect(html).toContain('whitespace-nowrap')
  })

  it('renders tagline only when showTagline is explicitly true', () => {
    const html = renderToString(<Logo size={40} withWordmark showTagline />)
    expect(html).toContain('EcoPulse')
    expect(html).toContain('Smart Energy Reminder')
  })
})
