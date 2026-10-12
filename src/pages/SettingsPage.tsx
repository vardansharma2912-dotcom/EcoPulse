import React, { useState } from 'react'
import { motion } from 'motion/react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { Badge } from '../components/ui/Badge'
import { useAppState } from '../state'
import { useToast } from '../context/useToast'
import { useTour } from '../context/useTour'
import { ALERTED_KEYS_STORAGE_KEY, clearState } from '../lib/storage'
import { hasDemoCompletions } from '../lib/sampleData'
import { sendBrowserNotification } from '../lib/notifications'
import { containerVariants, cardVariants } from '../lib/motionVariants'
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
  Compass,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import { Logo } from '../components/ui/Logo'

type PermissionState = 'unsupported' | 'not asked yet' | 'granted' | 'denied'

export const SettingsPage: React.FC = () => {
  const { state, updateSettings, resetData, loadSampleData, removeSampleData } = useAppState()
  const { showToast } = useToast()
  const { openTour } = useTour()
  const [displayName, setDisplayName] = useState(state.settings.displayName)
  const [tariff, setTariff] = useState(state.settings.tariffPerKwh.toString())
  const [tariffError, setTariffError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetConfirmInput, setResetConfirmInput] = useState('')
  const [testAlertSent, setTestAlertSent] = useState(false)
  const [testFeedback, setTestFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

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
          showToast('Desktop notifications enabled!')
          setTestFeedback({
            type: 'success',
            message: 'Permission granted! Desktop notifications are now enabled in EcoPulse.',
          })
        } else if (result === 'denied') {
          setPermissionState('denied')
          updateSettings({ notificationsEnabled: false })
          setTestFeedback({
            type: 'error',
            message: 'Notifications were blocked in your browser. Re-enable them in browser site settings.',
          })
        } else {
          setPermissionState('not asked yet')
        }
      } catch (err) {
        console.warn('[EcoPulse] Notification permission request error:', err)
      }
    }
  }

  const handleSendTestNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setTestFeedback({
        type: 'error',
        message: 'Desktop notifications are not supported in this browser.',
      })
      return
    }

    let currentPerm = Notification.permission
    if (currentPerm === 'default') {
      try {
        currentPerm = await Notification.requestPermission()
        setPermissionState(currentPerm === 'granted' ? 'granted' : currentPerm === 'denied' ? 'denied' : 'not asked yet')
        if (currentPerm === 'granted') {
          updateSettings({ notificationsEnabled: true })
        }
      } catch (err) {
        console.warn('[EcoPulse] Permission request failed:', err)
      }
    }

    if (currentPerm !== 'granted') {
      setTestFeedback({
        type: 'error',
        message: 'Notification permission is currently blocked or not granted.',
      })
      return
    }

    // Ensure setting is active
    if (!state.settings.notificationsEnabled) {
      updateSettings({ notificationsEnabled: true })
    }

    const res = sendBrowserNotification('EcoPulse Desktop Alert Test', {
      body: 'Notifications are working! Your energy-saving reminders will pop up at their scheduled times.',
      icon: '/icon-192.png',
      badge: '/favicon-32.png',
    })

    if (res.success) {
      setTestAlertSent(true)
      showToast('Desktop alert test dispatched!')
      setTestFeedback({
        type: 'success',
        message: 'Desktop notification sent! If a banner didn\'t pop up in the bottom-right corner, check the Windows Notification Center (press Win + N) or verify that Windows "Do Not Disturb" (Focus Assist) is turned off.',
      })
      setTimeout(() => setTestAlertSent(false), 5000)
    } else {
      setTestFeedback({
        type: 'error',
        message: res.error || 'Failed to dispatch desktop notification.',
      })
    }
  }

  const handleClearAlertedKeys = () => {
    try {
      localStorage.removeItem(ALERTED_KEYS_STORAGE_KEY)
      showToast('Alert locks cleared!')
      setTestFeedback({
        type: 'success',
        message: 'Cleared today\'s reminder alert locks! Reminders scheduled for earlier today can now trigger alerts again.',
      })
    } catch (err) {
      console.warn('[EcoPulse] Failed to clear alert keys:', err)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    let hasErrors = false
    if (displayName.trim().length > 40) {
      setNameError('Display name must be 40 characters or fewer')
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
    showToast('Settings saved!')
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleConfirmReset = () => {
    if (resetConfirmInput.trim() !== 'RESET') return

    clearState()
    resetData()
    setResetDialogOpen(false)
    setResetConfirmInput('')
    setDisplayName('')
    setTariff('8')
    setNameError(null)
    setTariffError(null)
    showToast('All application data reset!')
  }

  const handleLoadSample = () => {
    loadSampleData()
    showToast('Sample data loaded!')
  }

  const handleRemoveSample = () => {
    removeSampleData()
    showToast('Sample data removed!')
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-2xl"
    >
      <PageHeader
        title="Settings & System Configuration"
        description="Configure your domestic electricity tariff, manage browser alerts, and handle application data."
      />

      {/* Main Settings Form on glass-strong */}
      <motion.div variants={cardVariants}>
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

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                icon={<Compass className="w-4 h-4" />}
                onClick={() => openTour(false)}
              >
                Replay tour
              </Button>
              <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
                Save Settings
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </motion.div>

    {/* Units & Calculation Formula Explainer Card */}
    <motion.div variants={cardVariants}>
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
    </motion.div>

    {/* Browser Notifications Settings Card */}
    <motion.div variants={cardVariants}>
      <Card variant="glass-strong" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#14301f] flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-800" /> Desktop Notifications
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
                {permissionState === 'granted' ? 'Allowed' : permissionState === 'denied' ? 'Blocked' : 'Not Requested'}
              </Badge>
            </div>
            <p className="text-xs text-[#1e3f2b] max-w-md leading-relaxed">
              When permitted, native desktop popups alert you when reminders are due, even if you are browsing another tab or window.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {permissionState === 'granted' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<BellRing className="w-3.5 h-3.5 text-emerald-800" />}
                  onClick={handleSendTestNotification}
                >
                  {testAlertSent ? 'Alert Sent!' : 'Send Test Alert'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw className="w-3.5 h-3.5 text-[#1e3f2b]" />}
                  onClick={handleClearAlertedKeys}
                  title="Resets alert memory for today so scheduled reminders can fire again immediately"
                >
                  Reset Today's Alert Locks
                </Button>
              </>
            ) : permissionState === 'denied' ? (
              <span className="text-xs text-rose-800 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100/50 border border-rose-200">
                <BellOff className="w-4 h-4 text-rose-700" /> Blocked in Browser
              </span>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={<Bell className="w-3.5 h-3.5" />}
                onClick={handleRequestPermission}
              >
                Enable Desktop Notifications
              </Button>
            )}
          </div>
        </div>

        {/* Feedback Banner */}
        {testFeedback && (
          <div
            className={`rounded-xl border p-3.5 text-xs flex items-start gap-2.5 transition-all ${
              testFeedback.type === 'success'
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-rose-50/80 border-rose-300 text-rose-950'
            }`}
          >
            {testFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 leading-relaxed">
              <span className="font-semibold">
                {testFeedback.type === 'success' ? 'Status: ' : 'Notification Error: '}
              </span>
              {testFeedback.message}
            </div>
            <button
              type="button"
              onClick={() => setTestFeedback(null)}
              className="text-stone-500 hover:text-stone-800 font-bold px-1"
            >
              ×
            </button>
          </div>
        )}

        {/* Denied Instructions */}
        {permissionState === 'denied' && (
          <div className="rounded-xl border border-rose-300/60 bg-rose-50/70 p-3.5 text-xs text-rose-950 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-rose-900">
              <BellOff className="w-4 h-4 text-rose-700" /> How to re-enable notifications in Chrome / Edge:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-rose-900 leading-relaxed">
              <li>Click the <strong>tune / site settings icon (or lock icon)</strong> next to the URL in your browser address bar.</li>
              <li>Change <strong>Notifications</strong> from <em>Block</em> to <strong>Allow</strong>.</li>
              <li>Refresh the page and click <em>Send Test Alert</em> above.</li>
            </ol>
          </div>
        )}

        {/* Windows OS Tips / Troubleshooting */}
        <div className="rounded-xl border border-emerald-900/10 bg-white/50 p-3.5 text-xs text-[#14301f] space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-950">
            <Info className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>Windows & Browser Notification Troubleshooting</span>
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-[11.5px] leading-relaxed text-[#1b3b26]">
            <li>
              <strong>Windows Action Center:</strong> If you don't see a popup banner, open the Windows Notification Tray by pressing <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/80 border border-stone-300 rounded shadow-sm">Win + N</kbd>. The notification may be waiting there.
            </li>
            <li>
              <strong>Windows "Do Not Disturb" / Focus Assist:</strong> If Windows DND is active (the bell or moon icon in the bottom-right taskbar), Windows silences banner popups and sends them directly to the Action Center.
            </li>
            <li>
              <strong>Windows System Settings:</strong> Check <em>Windows Settings → System → Notifications</em> and ensure Google Chrome or Microsoft Edge is allowed to display banners.
            </li>
            <li>
              <strong>Active Tab Lifecycle:</strong> Browser security requires EcoPulse to remain open in a tab (it can be in the background) for reminders to trigger.
            </li>
          </ul>
        </div>
      </Card>
    </motion.div>

    {/* Sample Data for Demos Card */}
    <motion.div variants={cardVariants}>
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
                onClick={handleRemoveSample}
              >
                Remove Sample Data
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Sparkles className="w-3.5 h-3.5 text-amber-700" />}
                onClick={handleLoadSample}
              >
                Load Sample Data
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>

    {/* About EcoPulse Card */}
    <motion.div variants={cardVariants}>
      <Card variant="glass" className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Logo size={42} />
            <div>
              <h3 className="text-sm font-bold text-[#0f2819] flex items-center gap-2">
                EcoPulse
                <Badge variant="emerald" size="sm">v1.0</Badge>
              </h3>
              <p className="text-xs text-[#1e3f2b] font-medium mt-0.5">
                CHE110 Environmental Studies project
              </p>
            </div>
          </div>

          <a
            href="https://github.com/vardansharma2912-dotcom/EcoPulse-energy-saver"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors px-3 py-1.5 rounded-xl border border-emerald-800/20 bg-white/60 hover:bg-white/90 shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </Card>
    </motion.div>

    {/* Data Management & Reset Section */}
    <motion.div variants={cardVariants}>
      <Card variant="glass" className="border-rose-400/50 bg-rose-50/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" /> Reset Application Data
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
            className="w-full sm:w-auto shrink-0 justify-center whitespace-nowrap"
            onClick={() => {
              setResetConfirmInput('')
              setResetDialogOpen(true)
            }}
          >
            Reset All
          </Button>
        </div>
      </Card>
    </motion.div>

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

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-emerald-950/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-center"
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
              className="w-full sm:w-auto justify-center"
              disabled={resetConfirmInput.trim() !== 'RESET'}
              onClick={handleConfirmReset}
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </Dialog>
    </motion.div>
  )
}
