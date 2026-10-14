import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { ReminderCard } from '../ReminderCard'
import { formatRecurrence, formatEnergyEstimate, renderStatusBadge } from '../reminderUtils'
import type { Reminder } from '../../../types'

describe('ReminderCard', () => {
  const mockReminder: Reminder = {
    id: 'rem-1',
    title: 'Turn off air conditioner when leaving room',
    category: 'cooling',
    time: '08:30',
    recurrence: 'daily',
    active: true,
    applianceWatts: 1500,
    avoidedHours: 4,
    createdAt: '2026-10-01T00:00:00Z',
  }

  const defaultProps = {
    reminder: mockReminder,
    status: 'upcoming' as const,
    isMenuOpen: false,
    onToggleMenu: vi.fn(),
    onCloseMenu: vi.fn(),
    onComplete: vi.fn(),
    onUndo: vi.fn(),
    onOpenEdit: vi.fn(),
    onOpenSnooze: vi.fn(),
    onToggleActive: vi.fn(),
    onOpenDelete: vi.fn(),
  }

  it('renders title, category chip, and status chip in header area', () => {
    const html = renderToString(<ReminderCard {...defaultProps} />)

    expect(html).toContain('Turn off air conditioner when leaving room')
    expect(html).toContain('Cooling')
    expect(html).toContain('Upcoming today')
  })

  it('renders the ⋮ menu button with required accessibility attributes', () => {
    const html = renderToString(<ReminderCard {...defaultProps} />)

    expect(html).toContain('aria-label="More actions for Turn off air conditioner when leaving room"')
    expect(html).toContain('aria-haspopup="menu"')
    expect(html).toContain('aria-expanded="false"')
  })

  it('renders menu dropdown options when isMenuOpen is true', () => {
    const html = renderToString(<ReminderCard {...defaultProps} isMenuOpen={true} />)

    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('Snooze reminder')
    expect(html).toContain('Edit reminder')
    expect(html).toContain('Deactivate')
    expect(html).toContain('Delete reminder')
  })

  it('renders primary Done button when reminder is not yet done', () => {
    const html = renderToString(<ReminderCard {...defaultProps} status="upcoming" />)

    expect(html).toContain('Done')
    expect(html).not.toContain('Undo Done')
  })

  it('renders secondary Undo Done button when reminder is completed', () => {
    const html = renderToString(<ReminderCard {...defaultProps} status="done" />)

    expect(html).toContain('Undo Done')
    expect(html).toContain('Done today')
  })

  it('disables Done button when reminder is inactive', () => {
    const inactiveReminder: Reminder = { ...mockReminder, active: false }
    const html = renderToString(<ReminderCard {...defaultProps} reminder={inactiveReminder} />)

    expect(html).toContain('disabled=""')
    expect(html).toContain('Inactive')
  })

  it('renders recurrence and calculated energy estimate correctly in combined meta row', () => {
    const html = renderToString(<ReminderCard {...defaultProps} />)

    expect(html).toContain('08:30 • Daily (Every day)')
    expect(html).toContain('1500W × 4h ≈ 6.00 kWh/action')
  })

  it('renders snoozed timestamp when reminder is snoozed', () => {
    const snoozedReminder: Reminder = {
      ...mockReminder,
      snoozedUntil: '2026-10-14T10:00:00Z',
    }
    const html = renderToString(
      <ReminderCard {...defaultProps} reminder={snoozedReminder} status="snoozed" />
    )

    expect(html).toContain('Snoozed')
    expect(html).toContain('Snoozed until')
  })

  it('supports very long titles with 80+ chars without dropping layout classes', () => {
    const longTitleReminder: Reminder = {
      ...mockReminder,
      title: 'Ensure all campus research laboratory cooling systems and fume hoods are securely powered down at close',
    }
    const html = renderToString(<ReminderCard {...defaultProps} reminder={longTitleReminder} />)

    expect(html).toContain('Ensure all campus research laboratory cooling systems')
    expect(html).toContain('line-clamp-2')
    expect(html).toContain('break-words')
  })

  describe('helpers', () => {
    it('formatRecurrence formats once, weekdays, and specific days', () => {
      expect(formatRecurrence({ ...mockReminder, recurrence: 'once' })).toBe('Once')
      expect(formatRecurrence({ ...mockReminder, recurrence: 'weekdays' })).toBe('Weekdays (Mon – Fri)')
      expect(formatRecurrence({ ...mockReminder, recurrence: 'weekly', days: [1, 3, 5] })).toBe(
        'Weekly (Mon, Wed, Fri)'
      )
    })

    it('formatEnergyEstimate handles missing or zero wattages gracefully', () => {
      expect(formatEnergyEstimate({ ...mockReminder, applianceWatts: undefined })).toBe('No energy estimate set')
      expect(formatEnergyEstimate({ ...mockReminder, applianceWatts: 0 })).toBe('No energy estimate set')
    })

    it('renderStatusBadge covers all reminder statuses', () => {
      const activeDone = renderToString(renderStatusBadge('done', true))
      expect(activeDone).toContain('Done today')

      const activeOverdue = renderToString(renderStatusBadge('overdue', true))
      expect(activeOverdue).toContain('Overdue')

      const activeNotDue = renderToString(renderStatusBadge('not-due', true))
      expect(activeNotDue).toContain('Not due today')

      const inactive = renderToString(renderStatusBadge('upcoming', false))
      expect(inactive).toContain('Inactive')
    })
  })
})
