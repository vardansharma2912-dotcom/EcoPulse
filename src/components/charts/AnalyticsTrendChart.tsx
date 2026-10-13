import React, { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Completion } from '../../types'
import { addDays, todayKey, parseDateKey } from '../../lib/dates'
import { TrendingUp, AlertCircle } from 'lucide-react'

export interface AnalyticsTrendChartProps {
  completions: Completion[]
  className?: string
  height?: number
}

interface TrendPoint {
  dayLabel: string
  currentDate: string
  thisPeriodKwh: number
  previousPeriodKwh: number
}

export const AnalyticsTrendChart: React.FC<AnalyticsTrendChartProps> = ({
  completions,
  className = '',
  height = 240,
}) => {
  // Check if there are at least 3 distinct days of completions
  const distinctDays = useMemo(() => {
    return new Set(completions.map((c) => c.date)).size
  }, [completions])

  // Build 7-day comparative trend: last 7 days vs previous 7 days
  const chartData = useMemo<TrendPoint[]>(() => {
    if (distinctDays < 3) return []

    const todayStr = todayKey()
    const todayDate = parseDateKey(todayStr)
    const points: TrendPoint[] = []

    // Pre-aggregate kWh by date
    const dateMap = new Map<string, number>()
    for (const c of completions) {
      dateMap.set(c.date, (dateMap.get(c.date) || 0) + (c.kWh || 0))
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    for (let i = 6; i >= 0; i--) {
      const curDate = addDays(todayDate, -i)
      const prevDate = addDays(todayDate, -i - 7)

      const curKey = todayKey(curDate)
      const prevKey = todayKey(prevDate)

      points.push({
        dayLabel: dayNames[curDate.getDay()],
        currentDate: curKey,
        thisPeriodKwh: Number((dateMap.get(curKey) || 0).toFixed(2)),
        previousPeriodKwh: Number((dateMap.get(prevKey) || 0).toFixed(2)),
      })
    }

    return points
  }, [completions, distinctDays])

  if (distinctDays < 3) {
    return (
      <div className={`h-full flex flex-col items-center justify-center rounded-2xl bg-white/40 border border-white/60 p-6 sm:p-8 text-center space-y-2 ${className}`}>
        <div className="w-10 h-10 rounded-full bg-emerald-900/10 flex items-center justify-center text-emerald-800 mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold text-[#0f2819]">Trend History Pending</p>
        <p className="text-xs text-[#1e3f2b] max-w-sm mx-auto leading-relaxed">
          Historical trend comparison requires at least 3 distinct days of activity ({distinctDays}/3 recorded). Continue checking off reminders to unlock this multi-period comparative curve.
        </p>
      </div>
    )
  }

  return (
    <div className={`h-full flex flex-col justify-between space-y-3 ${className}`}>
      {/* Header with Legend Top Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-800" />
          <h3 className="text-sm font-bold text-[#0f2819]">7-Day Comparative Trajectory</h3>
        </div>

        {/* Legend "This period / Previous" Top Right */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-[#0a381e]">
            <span className="w-3.5 h-1.5 rounded-full bg-[#196f45]" />
            <span>This period</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-600">
            <span className="w-3.5 h-0 border-t-2 border-dashed border-[#8fa398]" />
            <span>Previous</span>
          </div>
        </div>
      </div>

      <div
        role="img"
        aria-label="7-day comparative energy conservation trend area chart"
        style={{ height: `${height}px` }}
        className="w-full pt-2"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="emeraldTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#196f45" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#196f45" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(20, 48, 31, 0.08)" />
            <XAxis
              dataKey="dayLabel"
              stroke="#1e3f2b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(20, 48, 31, 0.2)' }}
            />
            <YAxis
              stroke="#1e3f2b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(20, 48, 31, 0.2)' }}
              allowDecimals={true}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as TrendPoint
                  return (
                    <div className="rounded-xl border border-white/80 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md text-xs">
                      <p className="font-bold text-[#0f2819]">{data.dayLabel} ({data.currentDate})</p>
                      <p className="font-semibold text-emerald-800 mt-1">
                        This period: {data.thisPeriodKwh.toFixed(2)} kWh
                      </p>
                      <p className="text-stone-600">
                        Previous 7d: {data.previousPeriodKwh.toFixed(2)} kWh
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            {/* Previous Period: dashed grey-green line */}
            <Area
              type="monotone"
              dataKey="previousPeriodKwh"
              stroke="#8fa398"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="none"
              isAnimationActive={true}
            />
            {/* This Period: solid emerald line with soft green gradient fill */}
            <Area
              type="monotone"
              dataKey="thisPeriodKwh"
              stroke="#196f45"
              strokeWidth={2.5}
              fill="url(#emeraldTrendGradient)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
