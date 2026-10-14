import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { MonthlyCostBenchmarkCard } from '../MonthlyCostBenchmarkCard'
import type { Reminder } from '../../../types'

describe('MonthlyCostBenchmarkCard', () => {
  it('renders benchmark header, tariff rate, and presets', () => {
    const handleSelect = vi.fn()
    const html = renderToString(
      <MemoryRouter>
        <MonthlyCostBenchmarkCard
          tariff={8}
          currency="₹"
          selectedPreset="Ceiling fan (75 W)"
          onSelectPreset={handleSelect}
        />
      </MemoryRouter>
    )

    expect(html).toContain('Typical Monthly Run Costs')
    expect(html).toContain('8.00')
    expect(html).toContain('/kWh')
    expect(html).toContain('Ceiling fan')
    expect(html).toContain('AC 1.5 ton')
    expect(html).toContain('Laptop charger')
    expect(html).toContain('Desktop PC')
    expect(html).toContain('TV')
    expect(html).toContain('LED bulb')
    expect(html).toContain('No scheduled power-downs yet')
  })

  it('renders active reminders impact when reminders are present', () => {
    const handleSelect = vi.fn()
    const mockReminders: Reminder[] = [
      {
        id: 'rem-1',
        title: 'Ceiling fan off',
        category: 'cooling',
        time: '12:00',
        recurrence: 'daily',
        applianceWatts: 75,
        avoidedHours: 4,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ]

    const html = renderToString(
      <MemoryRouter>
        <MonthlyCostBenchmarkCard
          tariff={8}
          currency="₹"
          selectedPreset="LED bulb (9 W)"
          onSelectPreset={handleSelect}
          activeReminders={mockReminders}
        />
      </MemoryRouter>
    )

    expect(html).toContain('active habit')
    expect(html).toContain('0.30')
    expect(html).toContain('kWh/day')
    expect(html).toContain('View')
  })

  it('highlights the selected preset', () => {
    const handleSelect = vi.fn()
    const html = renderToString(
      <MemoryRouter>
        <MonthlyCostBenchmarkCard
          tariff={8}
          currency="₹"
          selectedPreset="Ceiling fan (75 W)"
          onSelectPreset={handleSelect}
        />
      </MemoryRouter>
    )

    expect(html).toContain('bg-emerald-800')
  })
})
