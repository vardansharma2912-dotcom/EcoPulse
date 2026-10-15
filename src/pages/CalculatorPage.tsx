import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { CountUp } from '../components/ui/CountUp'
import { useToast } from '../context/useToast'
import { useAppState } from '../state'
import { calculateKwh, calculateCost } from '../lib/energy'
import { containerVariants, cardVariants } from '../lib/motionVariants'
import { ReminderFormDialog } from '../components/reminders/ReminderFormDialog'
import { useGapMeasure } from '../components/filler/useGapMeasure'
import { FillerSlot } from '../components/filler/FillerSlot'
import type { Reminder } from '../types'
import {
  Zap,
  Clock,
  Calendar,
  PlusCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Bell,
} from 'lucide-react'
import { PRESETS } from '../components/calculator/presets'
import { MonthlyCostBenchmarkCard } from '../components/calculator/MonthlyCostBenchmarkCard'

export const CalculatorPage: React.FC = () => {
  const { state, addReminder } = useAppState()
  const { showToast } = useToast()
  const tariff = state.settings.tariffPerKwh
  const currency = state.settings.currency || '₹'

  React.useEffect(() => {
    try {
      localStorage.setItem('ecopulse_calc_visited_v1', 'true')
    } catch {
      // Ignore
    }
  }, [])

  const [selectedPreset, setSelectedPreset] = useState<string>('Ceiling fan (75 W)')
  const [watts, setWatts] = useState<string>('75')
  const [hours, setHours] = useState<string>('4')
  const [days, setDays] = useState<string>('1')

  const [formDialogOpen, setFormDialogOpen] = useState<boolean>(false)
  const [prefilledReminder, setPrefilledReminder] = useState<Omit<Reminder, 'id' | 'createdAt'> | null>(null)
  const [createdTimestamp] = useState(() => new Date().toISOString())

  const [errors, setErrors] = useState<{
    watts?: string
    hours?: string
    days?: string
  }>({})

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName)
    const preset = PRESETS.find((p) => p.name === presetName)
    if (preset && preset.name !== 'Custom') {
      setWatts(String(preset.watts))
      setHours(String(preset.typicalHours))
      setErrors((prev) => ({ ...prev, watts: undefined, hours: undefined }))
    }
  }

  // Parse & validate values
  const numWatts = parseFloat(watts)
  const numHours = parseFloat(hours)
  const numDays = parseFloat(days)

  const isValidWatts = !isNaN(numWatts) && numWatts >= 0 && numWatts <= 10000
  const isValidHours = !isNaN(numHours) && numHours >= 0 && numHours <= 24
  const isValidDays = !isNaN(numDays) && numDays >= 1 && numDays <= 365

  const isValid = isValidWatts && isValidHours && isValidDays

  // Calculation Math using pure energy.ts functions
  const safeWatts = isValidWatts ? numWatts : 0
  const safeHours = isValidHours ? numHours : 0
  const safeDays = isValidDays ? numDays : 1

  const dailyKwh = calculateKwh(safeWatts, safeHours)
  const dailyCost = calculateCost(dailyKwh, tariff)

  const selectedPeriodKwh = calculateKwh(safeWatts, safeHours * safeDays)
  const selectedPeriodCost = calculateCost(selectedPeriodKwh, tariff)

  const weeklyKwh = calculateKwh(safeWatts, safeHours * 7)
  const weeklyCost = calculateCost(weeklyKwh, tariff)

  const monthlyKwh = calculateKwh(safeWatts, safeHours * 30)
  const monthlyCost = calculateCost(monthlyKwh, tariff)

  const annualKwh = calculateKwh(safeWatts, safeHours * 365)
  const annualCost = calculateCost(annualKwh, tariff)

  const handleOpenReminderDialog = () => {
    const preset = PRESETS.find((p) => p.name === selectedPreset)
    setPrefilledReminder({
      title: preset ? preset.title : `Turn off ${watts}W appliance`,
      category: preset ? preset.category : 'other',
      time: '18:00',
      recurrence: 'daily',
      applianceWatts: safeWatts,
      avoidedHours: safeHours,
      active: true,
    })
    setFormDialogOpen(true)
  }

  const handleSaveReminder = (data: Omit<Reminder, 'id' | 'createdAt'> | Reminder) => {
    if (!('id' in data)) {
      addReminder(data)
      showToast('Reminder created from calculator!')
    }
  }

  // Column measurement refs for adaptive FillerSlot
  const leftColContentRef = useRef<HTMLDivElement>(null)
  const rightColContentRef = useRef<HTMLDivElement>(null)

  const leftMeasure = useGapMeasure({
    hostRef: leftColContentRef,
    targetRef: rightColContentRef,
    deps: [watts, hours, days, tariff, selectedPreset],
  })

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 lg:space-y-6 flex-1 flex flex-col"
    >
      <PageHeader
        title="Calculator"
        description="Calculator: how much a habit saves."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Math Formulas (7 cols) */}
        <div className="lg:col-span-7 space-y-5 flex flex-col">
          {/* Content Wrapper observed by useGapMeasure */}
          <div ref={leftColContentRef} className="space-y-5 flex flex-col">
            <motion.div variants={cardVariants}>
            <Card variant="glass-strong" className="space-y-4">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Interactive Calculator
              </h2>

              {/* Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1.5">
                  Choose an appliance preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESETS.map((preset) => {
                    const isSelected = selectedPreset === preset.name
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handlePresetChange(preset.name)}
                        className={`text-left p-2.5 rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                            : 'bg-white/60 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/10 text-[var(--text-primary)] border-white/80 dark:border-white/10'
                        }`}
                      >
                        <p className="truncate">{preset.name}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Number Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <Input
                  label="Power (Watts) *"
                  type="number"
                  step="any"
                  min="0"
                  max="10000"
                  value={watts}
                  onChange={(e) => {
                    setWatts(e.target.value)
                    const v = parseFloat(e.target.value)
                    if (isNaN(v) || v < 0 || v > 10000) {
                      setErrors((prev) => ({ ...prev, watts: '0 – 10,000 W' }))
                    } else {
                      setErrors((prev) => ({ ...prev, watts: undefined }))
                    }
                  }}
                  error={errors.watts}
                  hint="Appliance power rating"
                />

                <Input
                  label="Avoided (Hours/day) *"
                  type="number"
                  step="any"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => {
                    setHours(e.target.value)
                    const v = parseFloat(e.target.value)
                    if (isNaN(v) || v < 0 || v > 24) {
                      setErrors((prev) => ({ ...prev, hours: '0 – 24 hours' }))
                    } else {
                      setErrors((prev) => ({ ...prev, hours: undefined }))
                    }
                  }}
                  error={errors.hours}
                  hint="Hours powered down"
                />

                <Input
                  label="Duration (Days) *"
                  type="number"
                  step="1"
                  min="1"
                  max="365"
                  value={days}
                  onChange={(e) => {
                    setDays(e.target.value)
                    const v = parseFloat(e.target.value)
                    if (isNaN(v) || v < 1 || v > 365) {
                      setErrors((prev) => ({ ...prev, days: '1 – 365 days' }))
                    } else {
                      setErrors((prev) => ({ ...prev, days: undefined }))
                    }
                  }}
                  error={errors.days}
                  hint="Default: 1 day"
                />
              </div>

              {/* Current Tariff Rate with Link to Settings */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-emerald-900/15 dark:border-white/10 text-xs">
                <span className="text-[var(--text-secondary)] font-medium">
                  Current Electricity Tariff: <strong className="text-emerald-950 dark:text-emerald-300 font-bold">{currency}{tariff}/kWh</strong>
                </span>
                <Link
                  to="/settings"
                  className="text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 font-bold underline"
                >
                  Change in Settings →
                </Link>
              </div>

              {/* Action to create reminder */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  icon={<PlusCircle className="w-4 h-4" />}
                  onClick={handleOpenReminderDialog}
                  disabled={!isValid}
                >
                  Create reminder from this
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Mathematical Formula Breakdown Card */}
          <motion.div variants={cardVariants}>
            <Card variant="glass" className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-800 dark:text-[#3ecf8e]" /> Formula Breakdown with Your Values
              </h3>
              <div className="space-y-2 text-xs font-mono text-[var(--text-primary)] bg-white/80 dark:bg-white/5 p-3.5 rounded-xl border border-emerald-900/10 dark:border-white/10">
                <p>
                  <span className="text-slate-600 dark:text-[#9db8a6]">// Energy Formula:</span> kWh = Watts × Hours ÷ 1000
                </p>
                <p className="font-bold text-emerald-950 dark:text-[#3ecf8e]">
                  kWh = {safeWatts}W × {safeHours}h ÷ 1000 = {dailyKwh.toFixed(3)} kWh/day
                </p>
                <p className="pt-1 border-t border-emerald-950/10 dark:border-white/10">
                  <span className="text-slate-600 dark:text-[#9db8a6]">// Cost Formula:</span> Cost = kWh × Tariff Rate
                </p>
                <p className="font-bold text-emerald-950 dark:text-[#3ecf8e]">
                  Cost = {dailyKwh.toFixed(3)} kWh × {currency}{tariff} = {currency}{dailyCost.toFixed(2)}/day
                </p>
              </div>
            </Card>
          </motion.div>
          </div>

          {/* Adaptive FillerSlot in Left Column (lg+ only, appears if gap >= 160 px) */}
          <div className="hidden lg:block pt-1">
            <FillerSlot
              page="calculator"
              gap={leftMeasure.gap}
              selectedPreset={selectedPreset}
              onSelectPreset={handlePresetChange}
            />
          </div>
        </div>

        {/* Right Column: Projection Estimates with CountUp (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          {/* Content Wrapper observed by useGapMeasure */}
          <div ref={rightColContentRef} className="space-y-4 flex flex-col">
            <motion.div variants={cardVariants}>
            <Card variant="glass-strong" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Conservation Estimates
                </h2>
                <Badge variant="emerald" size="sm">
                  Estimates based on your inputs
                </Badge>
              </div>

              {/* Selected Days Box with CountUp */}
              <div className="p-4 rounded-xl bg-emerald-800 text-white shadow-sm space-y-1">
                <p className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">
                  For Selected {safeDays} Day{safeDays === 1 ? '' : 's'}
                </p>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-3xl font-extrabold tabular-nums tracking-tight">
                    <CountUp value={selectedPeriodKwh} decimals={2} /> <span className="text-base font-normal">kWh</span>
                  </span>
                  <span className="text-2xl font-extrabold tabular-nums tracking-tight">
                    <CountUp value={selectedPeriodCost} decimals={2} prefix={currency} />
                  </span>
                </div>
              </div>

              {/* Horizon Timeline Projections with CountUp */}
              <div className="space-y-2.5 pt-1">
                {/* Daily */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-emerald-900/10 dark:border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                    <span className="font-semibold text-[var(--text-primary)]">Daily (1 day)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[var(--text-primary)] tabular-nums">
                      <CountUp value={dailyKwh} decimals={2} suffix=" kWh" />
                    </span>
                    <span className="text-slate-600 dark:text-[var(--text-secondary)] font-medium ml-2">
                      <CountUp value={dailyCost} decimals={2} prefix={currency} />
                    </span>
                  </div>
                </div>

                {/* Weekly */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-emerald-900/10 dark:border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                    <span className="font-semibold text-[var(--text-primary)]">Weekly (7 days)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[var(--text-primary)] tabular-nums">
                      <CountUp value={weeklyKwh} decimals={2} suffix=" kWh" />
                    </span>
                    <span className="text-slate-600 dark:text-[var(--text-secondary)] font-medium ml-2">
                      <CountUp value={weeklyCost} decimals={2} prefix={currency} />
                    </span>
                  </div>
                </div>

                {/* Monthly */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-emerald-900/10 dark:border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                    <span className="font-semibold text-[var(--text-primary)]">Monthly (30 days)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[var(--text-primary)] tabular-nums">
                      <CountUp value={monthlyKwh} decimals={2} suffix=" kWh" />
                    </span>
                    <span className="text-slate-600 dark:text-[var(--text-secondary)] font-medium ml-2">
                      <CountUp value={monthlyCost} decimals={2} prefix={currency} />
                    </span>
                  </div>
                </div>

                {/* Annual */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-white/[0.06] border border-emerald-900/10 dark:border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                    <span className="font-semibold text-[var(--text-primary)]">Annual (365 days)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-950 dark:text-emerald-300 tabular-nums">
                      <CountUp value={annualKwh} decimals={2} suffix=" kWh" />
                    </span>
                    <span className="text-emerald-900 dark:text-emerald-400 font-bold ml-2">
                      <CountUp value={annualCost} decimals={2} prefix={currency} />
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Practical Assumptions & FAQ */}
          <motion.div variants={cardVariants}>
            <Card variant="glass" className="space-y-2 p-4 text-xs">
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" /> <span className="text-[var(--text-primary)]">Calculation Assumptions</span>
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                1 unit of electricity equals 1 kilowatt-hour (1 kWh = 1000 Watt-hours).
                Calculations represent potential avoided consumption. Real savings depend on continuous appliance operation and seasonal duty cycles.
              </p>
            </Card>
          </motion.div>

          {/* Contextual Navigation Links */}
          <motion.div variants={cardVariants}>
            <Card variant="glass" className="p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                Connected Energy Actions
              </h3>
              <div className="space-y-2 text-xs">
                <Link
                  to="/reminders"
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-white/60 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/10 border border-emerald-900/10 dark:border-white/10 transition-all text-slate-800 dark:text-[var(--text-primary)]"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-950 dark:text-[var(--text-primary)]">Turn Estimates into Habits</p>
                      <p className="text-[11px] text-slate-600 dark:text-[var(--text-secondary)]">Schedule recurring power-down alerts in Energy Reminders</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 transition-transform group-hover:translate-x-1 shrink-0" />
                </Link>

                <Link
                  to="/learn"
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-white/60 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/10 border border-emerald-900/10 dark:border-white/10 transition-all text-slate-800 dark:text-[var(--text-primary)]"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-950 dark:text-[var(--text-primary)]">Campus Conservation Principles</p>
                      <p className="text-[11px] text-slate-600 dark:text-[var(--text-secondary)]">Explore dorm appliance habits in Energy Conservation Guides</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 transition-transform group-hover:translate-x-1 shrink-0" />
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Typical Monthly Run Costs (lg and up only) */}
          <motion.div variants={cardVariants} className="hidden lg:block flex-1 flex flex-col">
            <MonthlyCostBenchmarkCard
              tariff={tariff}
              currency={currency}
              selectedPreset={selectedPreset}
              onSelectPreset={handlePresetChange}
              activeReminders={state.reminders.filter((r) => r.active)}
              className="flex-1"
            />
          </motion.div>
          </div>
        </div>
      </div>

      {/* Modal / Drawer for creating reminder */}
      <ReminderFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSave={handleSaveReminder}
        initialReminder={
          prefilledReminder
            ? {
                ...prefilledReminder,
                id: 'new',
                createdAt: createdTimestamp,
              }
            : null
        }
      />
    </motion.div>
  )
}
