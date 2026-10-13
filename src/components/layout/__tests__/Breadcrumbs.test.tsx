import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { Breadcrumbs } from '../Breadcrumbs'

describe('Breadcrumbs Component', () => {
  it('renders accessible breadcrumb nav with ordered list, links, and aria-current', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/calculator']}>
        <Breadcrumbs items={[{ label: 'Calculator' }]} />
      </MemoryRouter>
    )

    expect(html).toContain('aria-label="Breadcrumb"')
    expect(html).toContain('<ol')
    expect(html).toContain('href="/"')
    expect(html).toContain('Dashboard')
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('Calculator')
  })
})
