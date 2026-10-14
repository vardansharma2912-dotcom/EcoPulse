import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { ThisWeekGlanceCard } from '../ThisWeekGlanceCard'
import type { Reminder, Completion } from '../../../types'

describe('ThisWeekGlanceCard', () => {
  const baseDate = new Date(2026, 9, 14, 12, 0, 0) // Wednesday Oct 14, 2026

  const reminders: Reminder[] = [
    {
      id: 'r1',
      title: 'Morning Window Airing',
      time: '08:00',
      category: 'cooling',
      recurrence: 'daily',
      active: true,
      createdAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'r2',
      title: 'Night Desk Lamp Off',
      time: '22:00',
      category: 'lighting',
      recurrence: 'daily',
      active: true,
      createdAt: '2026-10-01T00:00:00Z',
    },
  ]

  it('renders empty state text when there are no completions', () => {
    const html = renderToString(
      <MemoryRouter>
        <ThisWeekGlanceCard
          reminders={reminders}
          completions={[]}
          baseDate={baseDate}
        />
      </MemoryRouter>
    )

    expect(html).toContain('This Week at a Glance')
    expect(html).toContain('Complete your first reminder to see your week here')

    // Ensure 0s-as-stats are NOT rendered
    expect(html).not.toContain('Energy Avoided')
    expect(html).not.toContain('most active')
  })

  it('renders 7 days of dots and day labels', () => {
    const html = renderToString(
      <MemoryRouter>
        <ThisWeekGlanceCard
          reminders={reminders}
          completions={[]}
          baseDate={baseDate}
        />
      </MemoryRouter>
    )

    expect(html).toContain('Mon')
    expect(html).toContain('Tue')
    expect(html).toContain('Wed')
    expect(html).toContain('Thu')
    expect(html).toContain('Fri')
    expect(html).toContain('Sat')
    expect(html).toContain('Sun')
  })

  it('renders 3 stat tiles when completions exist', () => {
    const completions: Completion[] = [
      {
        id: 'c1',
        reminderId: 'r1',
        title: 'Morning Window Airing',
        date: '2026-10-12',
        completedAt: '2026-10-12T08:00:00Z',
        kWh: 0.25,
        costSaved: 2.0,
        tariffAtTime: 8,
      },
    ]

    const html = renderToString(
      <MemoryRouter>
        <ThisWeekGlanceCard
          reminders={reminders}
          completions={completions}
          baseDate={baseDate}
        />
      </MemoryRouter>
    )

    expect(html).toContain('Actions')
    expect(html).toContain('Energy Avoided')
    expect(html).toContain('Best Day')
    expect(html).toContain('Mon')
  })

  it('shows next up reminder for today when available', () => {
    const html = renderToString(
      <MemoryRouter>
        <ThisWeekGlanceCard
          reminders={reminders}
          completions={[]}
          baseDate={baseDate}
        />
      </MemoryRouter>
    )

    // At 12:00, Night Desk Lamp Off (22:00) is upcoming
    expect(html).toContain('Next up:')
    expect(html).toContain('Night Desk Lamp Off')
    expect(html).toContain('22:00')
    expect(html).toContain('Open reminders')
  })

  it('shows all caught up message when no upcoming reminders remain', () => {
    const html = renderToString(
      <MemoryRouter>
        <ThisWeekGlanceCard
          reminders={[]}
          completions={[]}
          baseDate={baseDate}
        />
      </MemoryRouter>
    )

    expect(html).toContain('All caught up for today')
    expect(html).toContain('Open reminders')
  })
})
