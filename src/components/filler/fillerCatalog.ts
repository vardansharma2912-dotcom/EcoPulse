import React from 'react'
import type { FillerDefinition } from './types'

// Lazy-load filler components to keep main bundle small
const LazyNextUp = React.lazy(() => import('./NextUpFiller'))
const LazyDidYouKnow = React.lazy(() => import('./DidYouKnowFiller'))
const LazyWeekGlance = React.lazy(() => import('./WeekGlanceFiller'))
const LazyWattageReference = React.lazy(() => import('./WattageReferenceFiller'))
const LazyWeekGlanceExpanded = React.lazy(() => import('./WeekGlanceExpandedFiller'))
const LazyCategoryBreakdown = React.lazy(() => import('./CategoryBreakdownFiller'))

export const FILLER_CATALOG: FillerDefinition[] = [
  // --- Tier S (160 - 240 px) ---
  {
    id: 'next-up',
    title: 'Next Scheduled Reminder',
    tier: 'S',
    pages: ['dashboard', 'reminders', 'analytics', 'learn'],
    minHeight: 140,
    idealHeight: 180,
    maxHeight: 240,
    priority: 80,
    canRender: (ctx) => Boolean(ctx.nextUpReminder),
    Component: LazyNextUp,
  },
  {
    id: 'did-you-know',
    title: 'Did You Know?',
    tier: 'S',
    pages: ['dashboard', 'calculator', 'reminders', 'analytics', 'learn'],
    minHeight: 140,
    idealHeight: 190,
    maxHeight: 240,
    priority: 70,
    canRender: () => true,
    Component: LazyDidYouKnow,
  },

  // --- Tier M (240 - 380 px) ---
  {
    id: 'wattage-reference',
    title: 'Quick Reference: Appliance Wattages',
    tier: 'M',
    pages: ['calculator'],
    minHeight: 220,
    idealHeight: 310,
    maxHeight: 380,
    priority: 95,
    canRender: () => true,
    Component: LazyWattageReference,
  },
  {
    id: 'week-glance',
    title: 'This Week at a Glance',
    tier: 'M',
    pages: ['dashboard', 'reminders', 'analytics', 'learn'],
    minHeight: 220,
    idealHeight: 300,
    maxHeight: 380,
    priority: 90,
    canRender: () => true,
    Component: LazyWeekGlance,
  },

  // --- Tier L (380 - 560 px) ---
  {
    id: 'week-glance-expanded',
    title: 'This Week at a Glance (Expanded)',
    tier: 'L',
    pages: ['dashboard', 'reminders', 'analytics', 'learn'],
    minHeight: 360,
    idealHeight: 460,
    maxHeight: 560,
    priority: 90,
    canRender: () => true,
    Component: LazyWeekGlanceExpanded,
  },
  {
    id: 'category-breakdown',
    title: 'Top Category Breakdown',
    tier: 'L',
    pages: ['dashboard', 'reminders', 'analytics', 'learn'],
    minHeight: 360,
    idealHeight: 440,
    maxHeight: 560,
    priority: 85,
    canRender: (ctx) => ctx.completions.length >= 3,
    Component: LazyCategoryBreakdown,
  },
]
