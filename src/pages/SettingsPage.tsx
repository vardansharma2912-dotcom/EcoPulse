import React, { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { Badge } from '../components/ui/Badge'
import { useAppState } from '../state'
import { ALERTED_KEYS_STORAGE_KEY } from '../lib/storage'
import { hasDemoCompletions } from '../lib/sampleData'
import {
  Save,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Bell,
  BellOff,
  BellRing,
  Info,
  Calculator,
  Sparkles,
  Trash2,
} from 'lucide-react'

type PermissionState = 'unsupported' | 'not asked yet' | 'granted' | 'denied'

export const SettingsPage: React.FC = () => {
  const { state, updateSettings, resetData, loadSampleData, removeSampleData } = useAppState()
  const [displayName, setDisplayName] = useState(state.settings.displayName)
  const [tariff, setTariff] = useState(state.settings.tariffPerKwh.toString())
  const [tariffError, setTariffError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetConfirmInput, setResetConfirmInput] = useState('')
  const [testAlertSent, setTestAlertSent] = useState(false)

  const isDemoActive = hasDemoCompletions(state.completions)

  // Real browser notification permission state
  const [permissionState, setPermissionState] = useState<PermissionState>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return 'granted'
      if (Notification.permission === 'denied') return 'denied'
      return 'not asked yet'
    }
    return 'unsupported'
  })

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission()
        if (result === 'granted') {
          setPermissionState('granted')
          updateSettings({ notificationsEnabled: true })
        } else if (result === 'denied') {
          setPermissionState('denied')
          updateSettings({ notificationsEnabled: false })
        } else {
          setPermissionState('not asked yet')
        }
      } catch (err) {
        console.warn('[EcoPulse] Notification permission request error:', err)
      }
    }
  }

  const handleSendTestNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification('EcoPulse Test Alert', {
          body: 'Browser notifications are configured and working properly!',
          icon: '/favicon.svg',
        })
        notif.onclick = () => {
          window.focus()
          notif.close()
        }
        setTestAlertSent(true)
        setTimeout(() => setTestAlertSent(false), 4000)
      } catch (err) {
        console.warn('[EcoPulse] Test notification failed:', err)
      }
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    let hasErrors = false
    if (!displayName.trim()) {
      setNameError('Display name cannot be empty')
      hasErrors = true
    } else {
      setNameError(null)
    }

    const numericTariff = parseFloat(tariff)
    if (isNaN(numericTariff) || numericTariff <= 0) {
      setTariffError('Tariff must be a positive number greater than 0')
      hasErrors = true
    } else {
      setTariffError(null)
    }

    if (hasErrors) return

    updateSettings({
      displayName: displayName.trim(),
      tariffPerKwh: numericTariff,
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleConfirmReset = () => {
    if (resetConfirmInput.trim() !== 'RESET') return

    // Clear alerted keys storage entry as required by specification
    try {
      localStorage.removeItem(ALERTED_KEYS_STORAGE_KEY)
    } catch (err) {
      console.warn('[EcoPulse] Failed to clear alerted keys:', err)
    }

    resetData()
    setResetDialogOpen(false)
    setResetConfirmInput('')
    setDisplayName('College Student')
    setTariff('8')
    setNameError(null)
    setTariffError(null)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Settings & System Configuration"
        description="Configure your domestic electricity tariff, manage browser alerts, and handle application data."
      />

      {/* Main Settings Form on glass-strong */}
      <form onSubmit={handleSave}>
        <Card variant="glass-strong" className="space-y-5">
          <Input
            label="Student / User Display Name"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value)
              if (nameError) setNameError(null)
            }}
            placeholder="e.g. Vardaan"
            error={nameError || undefined}
            hint="Used to personalize dashboard greetings and exported environmental reports."
          />

          <Input
            label="Tariff Rate per kWh (₹ / unit)"
            type="number"
            step="0.1"
            min="0.1"
            value={tariff}
            onChange={(e) => {
              setTariff(e.target.value)
              if (tariffError) setTariffError(null)
            }}
            error={tariffError || undefined}
            hint="Default is ₹8/unit (placeholder, set from your electricity bill. Must be > 0)."
          />

          <div className="flex items-center justify-between pt-4 border-t border-emerald-950/10">
            {savedSuccess ? (
              <span className="text-xs text-emerald-800 flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" /> Preferences saved!
              </span>
            ) : (
              <span className="text-xs text-[#1e3f2b] font-medium">Persisted safely to browser localStorage</span>
            )}

            <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
              Save Settings
            </Button>
          </div>
        </Card>
      </form>

      {/* Units & Calculation Formula Explainer Card */}
      <Card variant="glass" className="space-y-3.5 p-5">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-800" />
          <h3 className="text-sm font-bold text-[#0f2819]">Units & Calculation Formulas</h3>
        </div>

        <div className="space-y-2 text-xs text-[#1e3f2b] leading-relaxed">
          <p>
            EcoPulse estimates electrical energy and financial savings using standard thermodynamic equations:
          </p>

          <div className="rounded-xl bg-white/60 p-3 border border-white/80 space-y-1.5 font-mono text-xs text-[#0f2819]">
            <p>
              <span className="font-semibold text-emerald-900">Energy (kWh):</span> Watts (W) × Hours avoided (h) ÷ 1000
            </p>
            <p>
              <span className="font-semibold text-emerald-900">Cost Saved (₹):</span> Energy (kWh) × Tariff (₹/kWh)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
            <div>
              <span className="font-bold text-[#0f2819]">1 Kilowatt-hour (kWh):</span> One commercial unit of electricity (1000 Watt-hours), equal to running a 1000 W appliance for 1 hour.
            </div>
            <div>
              <span className="font-bold text-[#0f2819]">Tariff Placeholder:</span> Typically ₹6 to ₹10 per kWh in Indian domestic utility slabs. Default is ₹8/kWh.
            </div>
          </div>
        </div>
      </Card>

      {/* Browser Notifications Settings Card */}
      <Card variant="glass-strong" className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#14301f] flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-800" /> Browser Notifications
              </h3>
              <Badge
                variant={
                  permissionState === 'granted'
                    ? 'emerald'
                    : permissionState === 'denied'
                    ? 'rose'
                    : 'amber'
                }
                size="sm"
              >
                {permissionState}
              </Badge>
            </div>
            <p className="text-xs text-[#1e3f2b] max-w-md leading-relaxed">
              When granted, desktop notifications trigger for due reminders alongside the glass banner alert.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {permissionState === 'granted' ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<BellRing className="w-3.5 h-3.5 text-emerald-800" />}
                onClick={handleSendTestNotification}
              >
                {testAlertSent ? 'Sent!' : 'Send Test Alert'}
              </Button>
            ) : permissionState === 'denied' ? (
              <span className="text-xs text-rose-800 font-semibold flex items-center gap-1">
                <BellOff className="w-3.5 h-3.5" /> Blocked
              </span>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={<Bell className="w-3.5 h-3.5" />}
                onClick={handleRequestPermission}
              >
                Enable Notifications
              </Button>
            )}
          </div>
        </div>

        {/* Informative Instructions for Denied or Not Asked States */}
        {permissionState === 'denied' && (
          <div className="rounded-xl border border-rose-300/40 bg-rose-50/60 p-3 text-xs text-rose-950 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <BellOff className="w-3.5 h-3.5 text-rose-700" /> Notifications are blocked in your browser
            </p>
            <p className="leading-relaxed">
              To re-enable: click the lock/tune icon in your browser address bar (Site Settings), switch Notifications from "Block" to "Allow", and reload this page.
            </p>
          </div>
        )}

        {/* Honest Architecture & Tab Lifecycle Disclaimer */}
        <div className="rounded-xl border border-emerald-950/10 bg-white/40 p-3 text-xs text-[#14301f] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">Honest note:</span> Alerts only fire while EcoPulse is open in an active browser tab. Closed tabs and sleeping devices can't be notified. Missed reminders show as <span className="font-semibold text-rose-900">Overdue</span> when you return.
          </p>
        </div>
      </Card>

      {/* Sample Data for Demos Card */}
      <Card variant="glass" className="space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <h3 className="text-sm font-bold text-[#0f2819]">Demonstration Sample Data</h3>
              {isDemoActive ? (
                <Badge variant="amber" size="sm">Demo Active</Badge>
              ) : (
                <Badge variant="neutral" size="sm">No Demo Data</Badge>
              )}
            </div>
            <p className="text-xs text-[#1e3f2b] mt-1 leading-relaxed">
              For grading and presentation walkthroughs: populates ~14 days of sample completions to visualize graphs, streaks, and milestone badges. Real completions are strictly preserved.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isDemoActive ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5 text-amber-900" />}
                onClick={removeSampleData}
              >
                Remove Sample Data
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Sparkles className="w-3.5 h-3.5 text-amber-700" />}
                onClick={loadSampleData}
              >
                Load Sample Data
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Data Management & Reset Section */}
      <Card variant="glass" className="border-rose-400/50 bg-rose-50/60 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700" /> Reset Application Data
            </h3>
            <p className="text-xs text-[#183624] mt-1 max-w-md font-semibold leading-relaxed">
              Restores default starter reminders, clears completion logs, and clears notification alert history.
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => {
              setResetConfirmInput('')
              setResetDialogOpen(true)
            }}
          >
            Reset All
          </Button>
        </div>
      </Card>

      {/* Reset Confirmation Dialog on glass-strong requiring typing RESET */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        title="Confirm Data Reset"
        description="Are you sure you want to reset all EcoPulse data?"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#183624] leading-relaxed font-medium">
            This will permanently remove all logged completions, custom reminders, and alerted notifications history, restoring the 6 default starter reminders.
          </p>

          <div className="rounded-xl bg-amber-500/10 border border-amber-300/40 p-3 text-xs text-amber-950">
            To prevent accidental data loss, please type <span className="font-mono font-bold text-rose-900">RESET</span> below to confirm.
          </div>

          <Input
            label='Type "RESET" to confirm'
            value={resetConfirmInput}
            onChange={(e) => setResetConfirmInput(e.target.value)}
            placeholder="RESET"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-950/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setResetDialogOpen(false)
                setResetConfirmInput('')
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={resetConfirmInput.trim() !== 'RESET'}
              onClick={handleConfirmReset}
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
