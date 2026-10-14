import { describe, it, expect } from 'vitest'
import { selectFiller } from '../selection'
import type { FillerContext, FillerDefinition } from '../types'
import React from 'react'

const DummyComp: React.FC<{ height: number }> = () => null

const mockContext: FillerContext = {
  reminders: [
    {
      id: 'rem-1',
      title: 'Switch off study desk lamp',
      category: 'lighting',
      time: '23:00',
      recurrence: 'daily',
      active: true,
      applianceWatts: 15,
      avoidedHours: 7,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  completions: [
    {
      id: 'c-1',
      reminderId: 'rem-1',
      title: 'Switch off study desk lamp',
      date: '2026-10-14',
      completedAt: '2026-10-14T10:00:00.000Z',
      kWh: 0.105,
      costSaved: 0.84,
      tariffAtTime: 8,
    },
    {
      id: 'c-2',
      reminderId: 'rem-1',
      title: 'Power down laptop charger',
      date: '2026-10-13',
      completedAt: '2026-10-13T10:00:00.000Z',
      kWh: 0.2,
      costSaved: 1.6,
      tariffAtTime: 8,
    },
    {
      id: 'c-3',
      reminderId: 'rem-1',
      title: 'Unplug kettle',
      date: '2026-10-12',
      completedAt: '2026-10-12T10:00:00.000Z',
      kWh: 0.5,
      costSaved: 4.0,
      tariffAtTime: 8,
    },
  ],
  tariff: 8,
  currency: '₹',
  nextUpReminder: {
    id: 'rem-1',
    title: 'Switch off study desk lamp',
    category: 'lighting',
    time: '23:00',
    recurrence: 'daily',
    active: true,
    applianceWatts: 15,
    avoidedHours: 7,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
}

describe('Filler Selection Algorithm', () => {
  it('returns null when gap is 100 px (below minimum threshold of 160 px)', () => {
    const result = selectFiller('dashboard', 100, mockContext)
    expect(result).toBeNull()
  })

  it('picks Tier S when gap is 170 px', () => {
    const result = selectFiller('dashboard', 170, mockContext)
    expect(result).not.toBeNull()
    if (result && result.type === 'single') {
      expect(result.filler.tier).toBe('S')
      expect(result.height).toBe(170 - 16) // 154 px
    }
  })

  it('picks Tier M when gap is 260 px', () => {
    const result = selectFiller('dashboard', 260, mockContext)
    expect(result).not.toBeNull()
    if (result && result.type === 'single') {
      expect(result.filler.tier).toBe('M')
      expect(result.height).toBe(260 - 16) // 244 px
    }
  })

  it('picks Tier L when gap is 400 px', () => {
    const result = selectFiller('dashboard', 400, mockContext)
    expect(result).not.toBeNull()
    if (result && result.type === 'single') {
      expect(result.filler.tier).toBe('L')
      expect(result.height).toBe(400 - 16) // 384 px
    }
  })

  it('picks Tier XL (stacked two Tier M cards) when gap is 600 px on a page with two Tier M fillers', () => {
    // Provide a catalog with two Tier M fillers for testing Tier XL
    const testCatalog: FillerDefinition[] = [
      {
        id: 'm-1',
        title: 'M1',
        tier: 'M',
        pages: ['dashboard'],
        minHeight: 220,
        idealHeight: 300,
        maxHeight: 380,
        priority: 90,
        canRender: () => true,
        Component: DummyComp,
      },
      {
        id: 'm-2',
        title: 'M2',
        tier: 'M',
        pages: ['dashboard'],
        minHeight: 220,
        idealHeight: 300,
        maxHeight: 380,
        priority: 80,
        canRender: () => true,
        Component: DummyComp,
      },
    ]

    const result = selectFiller('dashboard', 600, mockContext, testCatalog)
    expect(result).not.toBeNull()
    if (result && result.type === 'double') {
      expect(result.fillers).toHaveLength(2)
      expect(result.fillers[0].id).toBe('m-1')
      expect(result.fillers[1].id).toBe('m-2')
      const totalH = result.heights[0] + result.heights[1] + 16
      expect(totalH).toBe(600 - 16) // exact breathing room
    }
  })

  it('returns null when gap is 900 px (exceeds max two Tier M cards, no small filler stretched)', () => {
    const result = selectFiller('dashboard', 900, mockContext)
    expect(result).toBeNull()
  })

  it('enforces guards: category breakdown returns null if completions < 3', () => {
    const lowCompletionsContext: FillerContext = {
      ...mockContext,
      completions: [mockContext.completions[0]], // only 1 completion
    }

    const testCatalog: FillerDefinition[] = [
      {
        id: 'category-breakdown',
        title: 'Categories',
        tier: 'L',
        pages: ['dashboard'],
        minHeight: 360,
        idealHeight: 440,
        maxHeight: 560,
        priority: 85,
        canRender: (ctx) => ctx.completions.length >= 3,
        Component: DummyComp,
      },
    ]

    const result = selectFiller('dashboard', 400, lowCompletionsContext, testCatalog)
    expect(result).toBeNull()
  })

  it('enforces guards: next-up returns null if nextUpReminder is null', () => {
    const noNextUpContext: FillerContext = {
      ...mockContext,
      nextUpReminder: null,
    }

    const testCatalog: FillerDefinition[] = [
      {
        id: 'next-up',
        title: 'Next Up',
        tier: 'S',
        pages: ['dashboard'],
        minHeight: 140,
        idealHeight: 180,
        maxHeight: 240,
        priority: 80,
        canRender: (ctx) => ctx.nextUpReminder !== null,
        Component: DummyComp,
      },
    ]

    const result = selectFiller('dashboard', 180, noNextUpContext, testCatalog)
    expect(result).toBeNull()
  })

  it('never picks duplicate fillers on the same page for Tier XL', () => {
    // Only 1 Tier M filler in catalog
    const singleMCatalog: FillerDefinition[] = [
      {
        id: 'm-single',
        title: 'M Single',
        tier: 'M',
        pages: ['dashboard'],
        minHeight: 220,
        idealHeight: 300,
        maxHeight: 380,
        priority: 90,
        canRender: () => true,
        Component: DummyComp,
      },
    ]

    // Tier XL requires 2 distinct Tier M cards; if only 1 is available, it returns null
    const result = selectFiller('dashboard', 600, mockContext, singleMCatalog)
    expect(result).toBeNull()
  })
})
