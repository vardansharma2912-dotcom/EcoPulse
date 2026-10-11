import { describe, it, expect } from 'vitest'
import {
  getWeeklyChartData,
  weeklySeries,
  getWeekComparison,
  computeStreaksFromCompletions,
  groupCompletionsByDate,
  getAchievements,
} from '../analytics'
import { generateSampleCompletions, hasDemoCompletions } from '../sampleData'
import { appReducer } from '../../state/reducer'
import type { Completion, Reminder, AppState } from '../../types'

describe('Pure Analytics Functions', () => {
  const baseDate = new Date(2026, 9, 11) // Sunday 11 Oct 2026

  it('getWeeklyChartData returns 7 days of Mon-Sun data with correct aggregates', () => {
    const mockCompletions: Completion[] = [
      {
        id: 'c1',
        reminderId: 'r1',
        title: 'Turn off lights',
        date: '2026-10-05', // Monday
        completedAt: '2026-10-05T09:00:00Z',
        kWh: 0.12,
        costSaved: 0.96,
        tariffAtTime: 8,
      },
      {
        id: 'c2',
        reminderId: 'r2',
        title: 'Switch off fan',
        date: '2026-10-05', // Monday
        completedAt: '2026-10-05T10:00:00Z',
        kWh: 0.3,
        costSaved: 2.4,
        tariffAtTime: 8,
      },
      {
        id: 'c3',
        reminderId: 'r1',
        title: 'Turn off lights',
        date: '2026-10-11', // Sunday
        completedAt: '2026-10-11T12:00:00Z',
        kWh: 0.12,
        costSaved: 0.96,
        tariffAtTime: 8,
      },
    ]

    const chartData = getWeeklyChartData(mockCompletions, baseDate)
    expect(chartData).toHaveLength(7)
    expect(chartData[0].day).toBe('Mon')
    expect(chartData[0].dateKey).toBe('2026-10-05')
    expect(chartData[0].actions).toBe(2)
    expect(chartData[0].kwh).toBe(0.42)

    expect(chartData[1].day).toBe('Tue')
    expect(chartData[1].actions).toBe(0)
    expect(chartData[1].kwh).toBe(0)

    expect(chartData[6].day).toBe('Sun')
    expect(chartData[6].dateKey).toBe('2026-10-11')
    expect(chartData[6].actions).toBe(1)
    expect(chartData[6].kwh).toBe(0.12)
    // weeklySeries alias verification
    expect(weeklySeries(mockCompletions, baseDate)).toEqual(chartData)
  })

  it('getWeekComparison correctly calculates this week vs last week and flags hasLastWeekData', () => {
    // When last week has NO completions
    const onlyThisWeek: Completion[] = [
      {
        id: 'c1',
        reminderId: 'r1',
        title: 'Lights',
        date: '2026-10-06',
        completedAt: '2026-10-06T10:00:00Z',
        kWh: 0.2,
        costSaved: 1.6,
        tariffAtTime: 8,
      },
    ]

    const comp1 = getWeekComparison(onlyThisWeek, baseDate)
    expect(comp1.thisWeekActions).toBe(1)
    expect(comp1.thisWeekKwh).toBe(0.2)
    expect(comp1.lastWeekActions).toBe(0)
    expect(comp1.hasLastWeekData).toBe(false)

    // When last week HAS completions
    const bothWeeks: Completion[] = [
      ...onlyThisWeek,
      {
        id: 'c2',
        reminderId: 'r1',
        title: 'Lights',
        date: '2026-09-29', // Previous week Monday
        completedAt: '2026-09-29T10:00:00Z',
        kWh: 0.15,
        costSaved: 1.2,
        tariffAtTime: 8,
      },
    ]

    const comp2 = getWeekComparison(bothWeeks, baseDate)
    expect(comp2.thisWeekActions).toBe(1)
    expect(comp2.lastWeekActions).toBe(1)
    expect(comp2.hasLastWeekData).toBe(true)
    expect(comp2.kwhDiff).toBe(0.05)
    expect(comp2.actionsDiff).toBe(0)
  })

  it('computeStreaksFromCompletions correctly computes current and longest streaks', () => {
    expect(computeStreaksFromCompletions([], baseDate)).toEqual({
      currentStreak: 0,
      longestStreak: 0,
    })

    const completions3Days: Completion[] = [
      { id: '1', reminderId: 'r1', title: 'A', date: '2026-10-09', completedAt: '...', kWh: 0.1, costSaved: 0.8, tariffAtTime: 8 },
      { id: '2', reminderId: 'r1', title: 'A', date: '2026-10-10', completedAt: '...', kWh: 0.1, costSaved: 0.8, tariffAtTime: 8 },
      { id: '3', reminderId: 'r1', title: 'A', date: '2026-10-11', completedAt: '...', kWh: 0.1, costSaved: 0.8, tariffAtTime: 8 },
    ]

    const streakRes = computeStreaksFromCompletions(completions3Days, baseDate)
    expect(streakRes.currentStreak).toBe(3)
    expect(streakRes.longestStreak).toBe(3)

    // With a gap: 5-day streak earlier, then a gap, then 2-day current streak
    const completionsWithGap: Completion[] = [
      // 5-day historical streak
      { id: 'h1', reminderId: 'r', title: 'A', date: '2026-10-01', completedAt: '...', kWh: 0.1, costSaved: 0.8, tariffAtTime: 8 },
      { id: 'h2', reminderId: 'r', title: 'A', date: '2026-10-02', completedAt: '...', kWh: 0.1, costSaved: 0.8, tariffAtTime: 8 },
      { id: 'h3', reminderId: 'r', title: 'A', date: '2026-10-03', completedAt: '...', kWh: 0.1, costSaved: 0.8, tariffAtTime: 8 },
      { id: 'h4', reminderId: 'r', title: 'A', date: '2026-10-04', completedAt: '...', kWh: 0.1, costSaved: 0.8, tariffAtTime: 8 },
      { id: 'h5', reminderId: 'r', title: 'A', date: '2026-10-05', completedAt: '...', kWh: 0.1, costSaved: 0.8, tariffAtTime: 8 },
      // Missed Oct 6, 7, 8, 9
      // Current 2-day streak (Oct 10, 11)
      { id: 'c1', reminderId: 'r', title: 'A', date: '2026-10-10', completedAt: '...', kWh: 0.1, costSaved: 0.8, tariffAtTime: 8 },
      { id: 'c2', reminderId: 'r', title: 'A', date: '2026-10-11', completedAt: '...', kWh: 0.1, costSaved: 0.8, tariffAtTime: 8 },
    ]

    const gapRes = computeStreaksFromCompletions(completionsWithGap, baseDate)
    expect(gapRes.currentStreak).toBe(2)
    expect(gapRes.longestStreak).toBe(5)
  })

  it('groupCompletionsByDate groups completions into reverse chronological order', () => {
    const list: Completion[] = [
      { id: '1', reminderId: 'r1', title: 'Lamp', date: '2026-10-09', completedAt: '2026-10-09T10:00:00Z', kWh: 0.05, costSaved: 0.4, tariffAtTime: 8 },
      { id: '2', reminderId: 'r2', title: 'Fan', date: '2026-10-11', completedAt: '2026-10-11T14:00:00Z', kWh: 0.3, costSaved: 2.4, tariffAtTime: 8 },
      { id: '3', reminderId: 'r3', title: 'PC', date: '2026-10-11', completedAt: '2026-10-11T09:00:00Z', kWh: 0.2, costSaved: 1.6, tariffAtTime: 8 },
    ]

    const grouped = groupCompletionsByDate(list, '2026-10-11')
    expect(grouped).toHaveLength(2)
    expect(grouped[0].dateKey).toBe('2026-10-11')
    expect(grouped[0].completions).toHaveLength(2)
    expect(grouped[0].totalKwh).toBe(0.5)
    expect(grouped[0].totalCost).toBe(4)

    expect(grouped[1].dateKey).toBe('2026-10-09')
    expect(grouped[1].completions).toHaveLength(1)
  })

  it('getAchievements dynamically computes locked and unlocked badges without persisting them', () => {
    const emptyBadges = getAchievements([], { currentStreak: 0, longestStreak: 0 })
    expect(emptyBadges.every((b) => !b.unlocked)).toBe(true)
    expect(emptyBadges.find((b) => b.id === 'actions-10')?.progressText).toBe('0/10 actions')

    // Create 10 actions with total 1.2 kWh and 7-day streak
    const mock10Actions: Completion[] = Array.from({ length: 10 }, (_, i) => ({
      id: `c-${i}`,
      reminderId: 'r1',
      title: 'Action',
      date: `2026-10-${String(i + 1).padStart(2, '0')}`,
      completedAt: '...',
      kWh: 0.12,
      costSaved: 0.96,
      tariffAtTime: 8,
    }))

    const badges = getAchievements(mock10Actions, { currentStreak: 7, longestStreak: 7 })
    const firstAction = badges.find((b) => b.id === 'first-action')
    const streak3 = badges.find((b) => b.id === 'streak-3')
    const streak7 = badges.find((b) => b.id === 'streak-7')
    const actions10 = badges.find((b) => b.id === 'actions-10')
    const actions25 = badges.find((b) => b.id === 'actions-25')
    const kwh1 = badges.find((b) => b.id === 'kwh-1')

    expect(firstAction?.unlocked).toBe(true)
    expect(streak3?.unlocked).toBe(true)
    expect(streak7?.unlocked).toBe(true)
    expect(actions10?.unlocked).toBe(true)
    expect(kwh1?.unlocked).toBe(true) // 10 * 0.12 = 1.2 kWh >= 1.0
    expect(actions25?.unlocked).toBe(false)
    expect(actions25?.progressText).toBe('10/25 actions')
  })
})

describe('Sample Demo Data and Preservation of Real Data', () => {
  const dummyReminders: Reminder[] = [
    {
      id: 'r-real-1',
      title: 'My Custom Lamp Reminder',
      category: 'lighting',
      time: '21:00',
      recurrence: 'daily',
      applianceWatts: 50,
      avoidedHours: 3,
      active: true,
      createdAt: '2026-10-01T00:00:00Z',
    },
  ]

  it('generates ~14 days of demo data strictly flagged with isDemo: true', () => {
    const samples = generateSampleCompletions(dummyReminders, new Date(2026, 9, 11), 8)
    expect(samples.length).toBeGreaterThanOrEqual(14)
    expect(samples.every((s) => s.isDemo === true)).toBe(true)
    expect(hasDemoCompletions(samples)).toBe(true)
  })

  it('LOAD_SAMPLE_DATA adds demo completions, and REMOVE_SAMPLE_DATA leaves authentic completions intact', () => {
    const realCompletion: Completion = {
      id: 'real-comp-1',
      reminderId: 'r-real-1',
      title: 'My Authentic Completed Action',
      date: '2026-10-11',
      completedAt: '2026-10-11T12:00:00Z',
      kWh: 0.15,
      costSaved: 1.2,
      tariffAtTime: 8,
      // isDemo is undefined / not set
    }

    let state: AppState = {
      reminders: dummyReminders,
      completions: [realCompletion],
      settings: { displayName: 'Student', tariffPerKwh: 8, notificationsEnabled: false },
      lastUpdated: '2026-10-11T12:00:00Z',
    }

    expect(state.completions).toHaveLength(1)
    expect(hasDemoCompletions(state.completions)).toBe(false)

    // 1. Load sample demo data
    state = appReducer(state, { type: 'LOAD_SAMPLE_DATA' })
    expect(state.completions.length).toBeGreaterThan(14)
    expect(hasDemoCompletions(state.completions)).toBe(true)

    // Verify the real completion is still inside the state
    const foundReal = state.completions.find((c) => c.id === 'real-comp-1')
    expect(foundReal).toBeDefined()
    expect(foundReal?.title).toBe('My Authentic Completed Action')

    // 2. Remove sample data
    state = appReducer(state, { type: 'REMOVE_SAMPLE_DATA' })

    // Only the real completion must remain
    expect(state.completions).toHaveLength(1)
    expect(state.completions[0].id).toBe('real-comp-1')
    expect(state.completions[0].title).toBe('My Authentic Completed Action')
    expect(state.completions[0].kWh).toBe(0.15)
    expect(state.completions[0].isDemo).toBeUndefined()
    expect(hasDemoCompletions(state.completions)).toBe(false)
  })
})
