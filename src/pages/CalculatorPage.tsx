import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { useAppState } from '../state'
import { calculateKwh, calculateCost } from '../lib/energy'
import { ReminderFormDialog } from '../components/reminders/ReminderFormDialog'
import type { Reminder, ReminderCategory } from '../types'
import {
  Calculator as CalcIcon,
  Zap,
  Clock,
  Calendar,
  PlusCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react'

interface AppliancePreset {
  name: string
  watts: number
  category: ReminderCategory
  title: string
  typicalHours: number
}

const PRESETS: AppliancePreset[] = [
  { name: 'LED bulb (9 W)', watts: 9, category: 'lighting', title: 'Turn off LED bulb', typicalHours: 4 },
  { name: 'Tube light (36 W)', watts: 36, category: 'lighting', title: 'Switch off tube light', typicalHours: 4 },
  { name: 'Ceiling fan (75 W)', watts: 75, category: 'cooling', title: 'Switch off ceiling fan', typicalHours: 5 },
  { name: 'Laptop charger (65 W)', watts: 65, category: 'chargers', title: 'Unplug laptop charger', typicalHours: 3 },
  { name: 'Desktop PC (200 W)', watts: 200, category: 'computing', title: 'Power down desktop PC', typicalHours: 3 },
  { name: 'Monitor (30 W)', watts: 30, category: 'computing', title: 'Turn off external monitor', typicalHours: 4 },
  { name: 'AC 1.5 ton (1500 W)', watts: 1500, category: 'cooling', title: 'Power off air conditioner', typicalHours: 2 },
  { name: 'TV (100 W)', watts: 100, category: 'standby', title: 'Switch off TV power strip', typicalHours: 4 },
  { name: 'Phone charger (10 W)', watts: 10, category: 'chargers', title: 'Unplug phone charger', typicalHours: 8 },
  { name: 'Custom', watts: 100, category: 'other', title: 'Turn off appliance', typicalHours: 3 },
]

export const CalculatorPage: React.FC = () => {
  const { state, addReminder } = useAppState()
  const tariff = state.settings.tariffPerKwh

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
    const preset = PRESETS.find((p) => p.name === selectedPreset) || PRESETS[PRESETS.length - 1]
    const reminderToCreate: Omit<Reminder, 'id' | 'createdAt'> = {
      title: preset.title,
      category: preset.category,
      time: '18:00',
      recurrence: 'daily',
      applianceWatts: isValidWatts ? numWatts : preset.watts,
      avoidedHours: isValidHours ? numHours : preset.typicalHours,
      active: true,
    }
    setPrefilledReminder(reminderToCreate)
    setFormDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appliance Energy Calculator"
        description="Standalone what-if tool to model energy conservation and monetary savings across campus appliances."
      />

      {/* Standalone What-if Notice */}
      <div className="p-3.5 rounded-2xl glass-card flex items-start gap-3 border border-emerald-800/20 text-xs text-[#1e3f2b]">
        <HelpCircle className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <p className="leading-relaxed font-medium">
          <strong>Independent What-If Sandbox:</strong> This calculator models potential savings and does not alter your actual dashboard totals or log completed actions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs & Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card variant="glass-strong" className="space-y-4">
            <h2 className="text-sm font-bold text-[#14301f] uppercase tracking-wider flex items-center gap-2">
              <CalcIcon className="w-4 h-4 text-emerald-800" /> Appliance Configuration
            </h2>

            {/* Preset Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="preset-select" className="block text-xs font-semibold text-[#14301f]">
                  Appliance Preset
                </label>
                <span className="text-[11px] text-[#1e3f2b]">typical values, check your appliance label</span>
              </div>
              <select
                id="preset-select"
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full rounded-lg bg-white/95 border border-emerald-950/20 px-3.5 py-2 text-sm text-[#14301f] focus-visible:outline-2 focus-visible:outline-emerald-800 font-medium"
              >
                {PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Input
                label="Rated Power (Watts) *"
                type="number"
                step="1"
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
                hint="Editable wattage"
              />

              <Input
                label="Avoided Usage (Hours/day) *"
                type="number"
                step="0.5"
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
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-emerald-900/15 text-xs">
              <span className="text-[#183624] font-medium">
                Current Electricity Tariff: <strong className="text-emerald-950 font-bold">₹{tariff}/kWh</strong>
              </span>
              <Link
                to="/settings"
                className="text-emerald-800 hover:text-emerald-950 font-bold underline"
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

          {/* Mathematical Formula Breakdown Card */}
          <Card variant="glass" className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#14301f] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-800" /> Formula Breakdown with Your Values
            </h3>
            <div className="space-y-2 text-xs font-mono text-[#0f2819] bg-white/80 p-3.5 rounded-xl border border-emerald-900/10">
              <p>
                <span className="text-slate-600">// Energy Formula:</span> kWh = Watts × Hours ÷ 1000
              </p>
              <p className="font-bold text-emerald-950">
                kWh = {safeWatts}W × {safeHours}h ÷ 1000 = {dailyKwh.toFixed(3)} kWh/day
              </p>
              <p className="pt-1 border-t border-emerald-950/10">
                <span className="text-slate-600">// Cost Formula:</span> Cost = kWh × Tariff Rate
              </p>
              <p className="font-bold text-emerald-950">
                Cost = {dailyKwh.toFixed(3)} kWh × ₹{tariff} = ₹{dailyCost.toFixed(2)}/day
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column: Projection Estimates (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="glass-strong" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#14301f] uppercase tracking-wider">
                Conservation Estimates
              </h2>
              <Badge variant="emerald" size="sm">
                Estimates based on your inputs
              </Badge>
            </div>

            {/* Selected Days Box */}
            <div className="p-4 rounded-xl bg-emerald-800 text-white shadow-sm space-y-1">
              <p className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">
                For Selected {safeDays} Day{safeDays === 1 ? '' : 's'}
              </p>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-3xl font-extrabold tabular-nums tracking-tight">
                  {selectedPeriodKwh.toFixed(2)} <span className="text-base font-normal">kWh</span>
                </span>
                <span className="text-2xl font-extrabold tabular-nums tracking-tight">
                  ₹{selectedPeriodCost.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Horizon Timeline Projections */}
            <div className="space-y-2.5 pt-1">
              {/* Daily */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-emerald-900/10 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-800" />
                  <span className="font-semibold text-[#14301f]">Daily (1 day)</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#102819] tabular-nums">{dailyKwh.toFixed(2)} kWh</span>
                  <span className="text-slate-600 font-medium ml-2">₹{dailyCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Weekly */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-emerald-900/10 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-800" />
                  <span className="font-semibold text-[#14301f]">Weekly (7 days)</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#102819] tabular-nums">{weeklyKwh.toFixed(2)} kWh</span>
                  <span className="text-slate-600 font-medium ml-2">₹{weeklyCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Monthly */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-emerald-900/10 text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-800" />
                  <span className="font-semibold text-[#14301f]">Monthly (30 days)</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#102819] tabular-nums">{monthlyKwh.toFixed(2)} kWh</span>
                  <span className="text-slate-600 font-medium ml-2">₹{monthlyCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Annual */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/70 border border-emerald-900/10 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-800" />
                  <span className="font-semibold text-[#14301f]">Annual (365 days)</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-950 tabular-nums">{annualKwh.toFixed(2)} kWh</span>
                  <span className="text-emerald-900 font-bold ml-2">₹{annualCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#1e3f2b] italic text-center font-medium">
              Carbon and cost reductions depend on your regional energy grid and tariff bracket.
            </p>
          </Card>
        </div>
      </div>

      {/* Reminder Dialog prefilled from calculator */}
      {prefilledReminder && (
        <ReminderFormDialog
          open={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          onSave={(data) => {
            if (!('id' in data)) {
              addReminder(data)
            }
          }}
          initialReminder={{
            ...prefilledReminder,
            id: 'new-from-calc',
            createdAt: createdTimestamp,
          }}
        />
      )}
    </div>
  )
}
