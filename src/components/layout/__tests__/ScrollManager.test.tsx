import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { ScrollManager } from '../ScrollManager'

describe('ScrollManager Component', () => {
  it('renders an accessible live region without crashing', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/']}>
        <ScrollManager />
      </MemoryRouter>
    )

    expect(html).toContain('role="status"')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('sr-only')
  })
})
