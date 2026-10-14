import { describe, it, expect } from 'vitest'
import {
  getWeekGlanceDays,
  getWeekGlanceStats,
  getNextUpReminder,
} from '../dashboardWeek'
import type { Completion, Reminder } from '../../types'

describe('dashboardWeek: getWeekGlanceDays', () => {
  it('correctly maps 7 days from Monday to Sunday in local dates', () => {
    // Wednesday Oct 14, 2026
    const baseDate = new Date(2026, 9, 14, 12, 0, 0)
    const completions: Completion[] = [
      {
        id: 'c1',
        reminderId: 'r1',
        title: 'Light off',
        date: '2026-10-12', // Monday
        completedAt: '2026-10-12T09:00:00.000Z',
        kWh: 0.15,
        costSaved: 1.2,
        tariffAtTime: 8,
      },
    ]

    const days = getWeekGlanceDays(completions, baseDate)

    expect(days).toHaveLength(7)
    expect(days.map((d) => d.dayLabel)).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ])
    expect(days[0].dateKey).toBe('2026-10-12')
    expect(days[6].dateKey).toBe('2026-10-18')

    // Monday (Oct 12): completed
    expect(days[0].status).toBe('completed')
    expect(days[0].isPast).toBe(true)
    expect(days[0].isToday).toBe(false)
    expect(days[0].isFuture).toBe(false)
    expect(days[0].actionsCount).toBe(1)
    expect(days[0].kwhAvoided).toBe(0.15)

    // Tuesday (Oct 13): past with no actions -> missed (hatched)
    expect(days[1].status).toBe('missed')
    expect(days[1].isPast).toBe(true)
    expect(days[1].isToday).toBe(false)

    // Wednesday (Oct 14): today, no actions yet -> future/outline
    expect(days[2].isToday).toBe(true)
    expect(days[2].status).toBe('future')

    // Thursday through Sunday: future -> future (empty outline)
    for (let i = 3; i < 7; i++) {
      expect(days[i].isFuture).toBe(true)
      expect(days[i].status).toBe('future')
    }
  })

  it('marks today as completed when an action is completed today', () => {
    const baseDate = new Date(2026, 9, 14, 15, 0, 0) // Wednesday
    const completions: Completion[] = [
      {
        id: 'c2',
        reminderId: 'r1',
        title: 'AC off',
        date: '2026-10-14',
        completedAt: '2026-10-14T10:00:00.000Z',
        kWh: 0.5,
        costSaved: 4.0,
        tariffAtTime: 8,
      },
    ]

    const days = getWeekGlanceDays(completions, baseDate)
    const todayGlance = days.find((d) => d.isToday)
    expect(todayGlance).toBeDefined()
    expect(todayGlance?.status).toBe('completed')
    expect(todayGlance?.actionsCount).toBe(1)
  })

  it('handles Sunday baseDate near midnight correctly', () => {
    // Sunday Oct 18, 2026 at 23:59:00
    const sundayNearMidnight = new Date(2026, 9, 18, 23, 59, 0)
    const days = getWeekGlanceDays([], sundayNearMidnight)

    expect(days[0].dateKey).toBe('2026-10-12') // Mon
    expect(days[6].dateKey).toBe('2026-10-18') // Sun (today)
    expect(days[6].isToday).toBe(true)

    // Past 6 days (Mon-Sat) should all be missed (hatched)
    for (let i = 0; i < 6; i++) {
      expect(days[i].status).toBe('missed')
      expect(days[i].isPast).toBe(true)
    }
  })

  it('handles Monday baseDate right after midnight correctly', () => {
    // Monday Oct 19, 2026 at 00:01:00
    const mondayAfterMidnight = new Date(2026, 9, 19, 0, 1, 0)
    const days = getWeekGlanceDays([], mondayAfterMidnight)

    expect(days[0].dateKey).toBe('2026-10-19')
    expect(days[0].isToday).toBe(true)
    expect(days[0].status).toBe('future')
    expect(days[6].dateKey).toBe('2026-10-25')

    // Remaining 6 days are all future
    for (let i = 1; i < 7; i++) {
      expect(days[i].status).toBe('future')
      expect(days[i].isFuture).toBe(true)
    }
  })
})

describe('dashboardWeek: getWeekGlanceStats', () => {
  it('correctly calculates actions, kWh avoided, and best day', () => {
    const baseDate = new Date(2026, 9, 14, 12, 0, 0) // Wednesday
    const completions: Completion[] = [
      {
        id: 'c1',
        reminderId: 'r1',
        title: 'Task 1',
        date: '2026-10-12', // Monday
        completedAt: '2026-10-12T08:00:00Z',
        kWh: 0.2,
        costSaved: 1.6,
        tariffAtTime: 8,
      },
      {
        id: 'c2',
        reminderId: 'r2',
        title: 'Task 2',
        date: '2026-10-13', // Tuesday
        completedAt: '2026-10-13T09:00:00Z',
        kWh: 0.3,
        costSaved: 2.4,
        tariffAtTime: 8,
      },
      {
        id: 'c3',
        reminderId: 'r3',
        title: 'Task 3',
        date: '2026-10-13', // Tuesday
        completedAt: '2026-10-13T10:00:00Z',
        kWh: 0.4,
        costSaved: 3.2,
        tariffAtTime: 8,
      },
    ]

    const days = getWeekGlanceDays(completions, baseDate)
    const stats = getWeekGlanceStats(days, completions, baseDate)

    expect(stats.actionsThisWeek).toBe(3)
    expect(stats.kwhAvoidedThisWeek).toBe(0.9)
    expect(stats.bestDay).toBe('Tue')
    expect(stats.isEmpty).toBe(false)
  })

  it('returns bestDay as "-" and isEmpty=true when completions are empty', () => {
    const baseDate = new Date(2026, 9, 14, 12, 0, 0)
    const days = getWeekGlanceDays([], baseDate)
    const stats = getWeekGlanceStats(days, [], baseDate)

    expect(stats.actionsThisWeek).toBe(0)
    expect(stats.kwhAvoidedThisWeek).toBe(0)
    expect(stats.bestDay).toBe('-')
    expect(stats.isEmpty).toBe(true)
  })
})

describe('dashboardWeek: getNextUpReminder', () => {
  const sampleReminders: Reminder[] = [
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
      title: 'Afternoon Laptop Unplug',
      time: '14:30',
      category: 'computing',
      recurrence: 'daily',
      active: true,
      createdAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'r3',
      title: 'Night Desk Lamp Off',
      time: '22:00',
      category: 'lighting',
      recurrence: 'daily',
      active: true,
      createdAt: '2026-10-01T00:00:00Z',
    },
  ]

  it('selects the earliest upcoming reminder today when current time is earlier', () => {
    // 12:00 PM today
    const now = new Date(2026, 9, 14, 12, 0, 0)
    const nextUp = getNextUpReminder(sampleReminders, [], now)

    expect(nextUp).not.toBeNull()
    expect(nextUp?.type).toBe('today')
    expect(nextUp?.title).toBe('Afternoon Laptop Unplug')
    expect(nextUp?.time).toBe('14:30')
  })

  it('skips already completed reminders for today', () => {
    // 12:00 PM today, Afternoon Laptop Unplug is already done
    const now = new Date(2026, 9, 14, 12, 0, 0)
    const completions: Completion[] = [
      {
        id: 'comp1',
        reminderId: 'r2',
        title: 'Afternoon Laptop Unplug',
        date: '2026-10-14',
        completedAt: '2026-10-14T11:00:00Z',
        kWh: 0.1,
        costSaved: 0.8,
        tariffAtTime: 8,
      },
    ]

    const nextUp = getNextUpReminder(sampleReminders, completions, now)

    expect(nextUp).not.toBeNull()
    expect(nextUp?.type).toBe('today')
    expect(nextUp?.title).toBe('Night Desk Lamp Off')
    expect(nextUp?.time).toBe('22:00')
  })

  it('falls back to tomorrow when all reminders today have passed or are completed', () => {
    // 23:00 PM today (all today reminders 08:00, 14:30, 22:00 are in past)
    const now = new Date(2026, 9, 14, 23, 0, 0)
    const nextUp = getNextUpReminder(sampleReminders, [], now)

    expect(nextUp).not.toBeNull()
    expect(nextUp?.type).toBe('tomorrow')
    expect(nextUp?.title).toBe('Morning Window Airing')
    expect(nextUp?.time).toBe('08:00')
  })

  it('returns null when no reminders are scheduled for today or tomorrow', () => {
    const now = new Date(2026, 9, 14, 12, 0, 0)
    const nextUp = getNextUpReminder([], [], now)

    expect(nextUp).toBeNull()
  })

  it('ignores inactive reminders', () => {
    const inactiveReminders: Reminder[] = [
      {
        id: 'r1',
        title: 'Deactivated Task',
        time: '18:00',
        category: 'appliances',
        recurrence: 'daily',
        active: false,
        createdAt: '2026-10-01T00:00:00Z',
      },
    ]
    const now = new Date(2026, 9, 14, 12, 0, 0)
    const nextUp = getNextUpReminder(inactiveReminders, [], now)

    expect(nextUp).toBeNull()
  })
})
