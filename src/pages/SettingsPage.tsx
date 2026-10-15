import React, { useState, useRef } from 'react'
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
import { ALERTED_KEYS_STORAGE_KEY, clearState, createExportPayload, parseAndValidateImport } from '../lib/storage'
import { hasDemoCompletions } from '../lib/sampleData'
import { sendBrowserNotification } from '../lib/notifications'
import { containerVariants, cardVariants } from '../lib/motionVariants'
import type { AppState, CurrencySymbol } from '../types'
import { SUPPORTED_CURRENCIES } from '../lib/energy'
import { getCreditsTeam } from '../lib/credits'
import { type ThemeMode, setStoredTheme } from '../lib/theme'
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
  Download,
  Upload,
  Database,
  Users,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { Logo } from '../components/ui/Logo'

type PermissionState = 'unsupported' | 'not asked yet' | 'granted' | 'denied'

export const SettingsPage: React.FC = () => {
  const { state, updateSettings, resetData, loadSampleData, removeSampleData, replaceState } = useAppState()
  const { showToast } = useToast()
  const { openTour } = useTour()
  const [creditsTeam] = useState(() => getCreditsTeam())
  const [displayName, setDisplayName] = useState(state.settings.displayName)
  const [tariff, setTariff] = useState(state.settings.tariffPerKwh.toString())
  const [currency, setCurrency] = useState<CurrencySymbol>(state.settings.currency || '₹')
  const [theme, setTheme] = useState<ThemeMode>(state.settings.theme || 'light')
  const [tariffError, setTariffError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetConfirmInput, setResetConfirmInput] = useState('')
  const [testAlertSent, setTestAlertSent] = useState(false)
  const [testFeedback, setTestFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [importConfirmOpen, setImportConfirmOpen] = useState(false)
  const [pendingImportData, setPendingImportData] = useState<AppState | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme)
    updateSettings({ theme: newTheme })
    setStoredTheme(newTheme)
  }

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
      currency,
      theme,
    })
    setStoredTheme(theme)
    setSavedSuccess(true)
    showToast('Settings saved!')
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleConfirmReset = () => {
    if (resetConfirmInput.trim() !== 'RESET') return

    clearState()
    setStoredTheme('light')
    resetData()
    setResetDialogOpen(false)
    setResetConfirmInput('')
    setDisplayName('')
    setTariff('8')
    setCurrency('₹')
    setTheme('light')
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

  const handleExport = () => {
    try {
      const payloadString = createExportPayload(state)
      const blob = new Blob([payloadString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const dateStr = new Date().toISOString().split('T')[0]
      const a = document.createElement('a')
      a.href = url
      a.download = `ecopulse-backup-${dateStr}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('Data exported successfully! Check your downloads folder.')
    } catch (err) {
      console.error('[EcoPulse] Export error:', err)
      showToast('Failed to export data. Please try again.')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text !== 'string') {
        showToast('Could not read the selected backup file.')
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      const result = parseAndValidateImport(text)
      if (!result.success || !result.data) {
        showToast(result.error || 'Failed to validate backup file.')
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      setPendingImportData(result.data)
      setImportConfirmOpen(true)
    }

    reader.onerror = () => {
      showToast('Error reading the selected file. Please try again.')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }

    reader.readAsText(file)
  }

  const handleConfirmImport = () => {
    if (!pendingImportData) return
    replaceState(pendingImportData)
    setDisplayName(pendingImportData.settings.displayName)
    setTariff(pendingImportData.settings.tariffPerKwh.toString())
    setCurrency(pendingImportData.settings.currency || '₹')
    if (pendingImportData.settings.theme) {
      setTheme(pendingImportData.settings.theme)
      setStoredTheme(pendingImportData.settings.theme)
    }
    setImportConfirmOpen(false)
    setPendingImportData(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    showToast('Data imported successfully! Your reminders and history are restored.')
  }

  const handleCancelImport = () => {
    setImportConfirmOpen(false)
    setPendingImportData(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 lg:space-y-6 w-full flex-1 flex flex-col"
    >
      <PageHeader
        title="EcoPulse Settings & Energy Tariff Preferences"
        description="Configure your domestic electricity tariff, manage browser alerts, and handle application data."
      />

      {/* Main Settings Form on glass-strong */}
      <motion.div variants={cardVariants}>
        <form onSubmit={handleSave}>
          <Card variant="glass-strong" className="space-y-5">
            {/* 2-column layout on md+ screens for Profile Name & Tariff Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                label={`Tariff Rate per kWh (${currency} / unit)`}
                type="number"
                step="0.1"
                min="0.1"
                value={tariff}
                onChange={(e) => {
                  setTariff(e.target.value)
                  if (tariffError) setTariffError(null)
                }}
                error={tariffError || undefined}
                hint={`Default is ${currency}8/unit (standard domestic benchmark, set from your electricity bill. Must be > 0).`}
              />
            </div>

            {/* Appearance / Theme Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-[var(--text-primary)] tracking-wide">
                Appearance &amp; Theme
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl" role="radiogroup" aria-label="Theme mode selection">
                {[
                  { id: 'light' as const, label: 'Light', desc: 'Fresh mint glass (Default)', icon: Sun },
                  { id: 'dark' as const, label: 'Dark', desc: 'Subdued deep forest', icon: Moon },
                  { id: 'system' as const, label: 'System', desc: 'Sync with OS setting', icon: Monitor },
                ].map((item) => {
                  const isSelected = theme === item.id
                  const IconComp = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleThemeChange(item.id)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center gap-3 cursor-pointer text-left ${
                        isSelected
                          ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 dark:border-emerald-600 shadow-sm'
                          : 'bg-white/60 dark:bg-white/[0.06] text-[var(--text-primary)] border-emerald-950/15 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-800/10 dark:bg-emerald-400/20 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="leading-tight flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {item.id === 'light' && (
                            <span
                              className={`text-[9px] px-1 py-0.5 rounded font-normal leading-none ${
                                isSelected
                                  ? 'bg-emerald-900/60 text-emerald-100'
                                  : 'bg-emerald-800/10 dark:bg-emerald-400/15 text-emerald-900 dark:text-emerald-300'
                              }`}
                            >
                              Default
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[10px] font-normal truncate mt-0.5 ${
                            isSelected ? 'text-emerald-100' : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Light stays the default for all new and existing visitors. Changes are persisted and applied instantly with zero page flash.
              </p>
            </div>

            {/* Currency Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-[var(--text-primary)] tracking-wide">
                Currency Symbol
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl">
                {SUPPORTED_CURRENCIES.map((sym) => {
                  const labels: Record<CurrencySymbol, string> = {
                    '₹': 'INR',
                    $: 'USD',
                    '€': 'EUR',
                    '£': 'GBP',
                  }
                  const isSelected = currency === sym
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setCurrency(sym)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-800 dark:border-emerald-600 shadow-sm'
                          : 'bg-white/60 dark:bg-white/[0.06] text-[var(--text-primary)] border-emerald-950/15 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10'
                      }`}
                    >
                      <span className="text-base leading-none">{sym}</span>
                      <span className={`text-[10px] font-semibold ${isSelected ? 'text-emerald-100' : 'text-emerald-900/70 dark:text-emerald-300/80'}`}>
                        {labels[sym]}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Applied everywhere costs and savings are displayed across the dashboard, calculator, and analytics.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-emerald-950/10 dark:border-white/10">
              {savedSuccess ? (
                <span className="text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> Preferences saved!
                </span>
              ) : (
                <span className="text-xs text-[var(--text-secondary)] font-medium">Persisted safely to browser localStorage</span>
              )}

              <div className="flex items-center gap-2 self-end sm:self-auto">
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
            <Calculator className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Units &amp; Calculation Formulas</h3>
          </div>

          <div className="space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
            <p>
              EcoPulse estimates electrical energy and financial savings using standard thermodynamic equations:
            </p>

            <div className="rounded-xl bg-white/60 dark:bg-white/[0.06] p-3.5 border border-white/80 dark:border-white/10 font-mono text-xs text-[var(--text-primary)] grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-900 dark:text-emerald-300 shrink-0">Energy (kWh):</span>
                <span>Watts (W) × Hours avoided (h) ÷ 1000</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-900 dark:text-emerald-300 shrink-0">Cost Saved ({currency}):</span>
                <span>Energy (kWh) × Tariff ({currency}/kWh)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-[11px]">
              <div>
                <span className="font-bold text-[var(--text-primary)]">1 Kilowatt-hour (kWh):</span> One commercial unit of electricity (1000 Watt-hours), equal to running a 1000 W appliance for 1 hour.
              </div>
              <div>
                <span className="font-bold text-[var(--text-primary)]">Tariff Benchmark:</span> Domestic rates vary by utility slab. Default rate is {currency}8/kWh.
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
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-800 dark:text-emerald-400" /> Desktop Notifications
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
              <p className="text-xs text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                When permitted, native desktop popups alert you when reminders are due while EcoPulse is running in your browser (active or background tab). Reminders fire only while the app or browser is running, since there is no push backend.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {permissionState === 'granted' ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<BellRing className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />}
                    onClick={handleSendTestNotification}
                  >
                    {testAlertSent ? 'Alert Sent!' : 'Send Test Alert'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={<RotateCcw className="w-3.5 h-3.5 text-[var(--text-secondary)]" />}
                    onClick={handleClearAlertedKeys}
                    title="Resets alert memory for today so scheduled reminders can fire again immediately"
                  >
                    Reset Today's Alert Locks
                  </Button>
                </>
              ) : permissionState === 'denied' ? (
                <span className="text-xs text-rose-800 dark:text-rose-300 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-700/40">
                  <BellOff className="w-4 h-4 text-rose-700 dark:text-rose-400" /> Blocked in Browser
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
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/40 text-emerald-950 dark:text-emerald-200'
                  : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-600/40 text-rose-950 dark:text-rose-200'
              }`}
            >
              {testFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
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
                className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 font-bold px-1"
              >
                ×
              </button>
            </div>
          )}

          {/* Denied Instructions */}
          {permissionState === 'denied' && (
            <div className="rounded-xl border border-rose-300/60 dark:border-rose-600/40 bg-rose-50/70 dark:bg-rose-950/30 p-3.5 text-xs text-rose-950 dark:text-rose-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-rose-900 dark:text-rose-300">
                <BellOff className="w-4 h-4 text-rose-700 dark:text-rose-400" /> How to re-enable notifications in Chrome / Edge:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-xs text-rose-900 dark:text-rose-300 leading-relaxed">
                <li>Click the <strong>tune / site settings icon (or lock icon)</strong> next to the URL in your browser address bar.</li>
                <li>Change <strong>Notifications</strong> from <em>Block</em> to <strong>Allow</strong>.</li>
                <li>Refresh the page and click <em>Send Test Alert</em> above.</li>
              </ol>
            </div>
          )}

          {/* 2-column informational grid for Lifecycle Notice and Windows OS Troubleshooting */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Honest Delivery Lifecycle Notice */}
            <div className="rounded-xl border border-emerald-900/15 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 text-xs text-[var(--text-primary)] space-y-1.5 flex flex-col justify-start">
              <p className="font-bold flex items-center gap-1.5 text-emerald-950 dark:text-emerald-200">
                <Info className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0" /> Local Reminder Lifecycle
              </p>
              <p className="text-[11.5px] leading-relaxed text-[var(--text-secondary)]">
                EcoPulse operates entirely client-side without a remote server or push backend. Reminders evaluate once every minute <strong>while the app or browser is running</strong> (it can be in a minimized or background tab). Reminders cannot fire when your browser is completely shut down.
              </p>
            </div>

            {/* Windows OS Tips / Troubleshooting */}
            <div className="rounded-xl border border-emerald-900/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.05] p-4 text-xs text-[var(--text-primary)] space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-200">
                <Info className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0" />
                <span>Windows &amp; Browser Notification Troubleshooting</span>
              </div>
              <ul className="space-y-1.5 pl-5 list-disc text-[11.5px] leading-relaxed text-[var(--text-secondary)]">
                <li>
                  <strong>Windows Action Center:</strong> Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/80 dark:bg-white/10 border border-stone-300 dark:border-white/20 rounded shadow-sm text-[var(--text-primary)]">Win + N</kbd> to inspect queued popups.
                </li>
                <li>
                  <strong>Windows &quot;Do Not Disturb&quot; (Focus Assist):</strong> Silences banners directly to the Action Center.
                </li>
                <li>
                  <strong>Windows Settings:</strong> Ensure your browser is allowed to display notification banners.
                </li>
                <li>
                  <strong>Keep Tab Open:</strong> App evaluates timers locally in active or minimized browser tabs.
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Paired 2-column grid for Demonstration Sample Data & Data Backup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sample Data for Demos Card */}
        <motion.div variants={cardVariants} className="h-full">
          <Card variant="glass" className="p-5 h-full flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Demonstration Sample Data</h3>
                {isDemoActive ? (
                  <Badge variant="amber" size="sm">Demo Active</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">No Demo Data</Badge>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                Load about 14 days of sample activity to preview charts, streaks and badges. Your real entries are never touched.
              </p>
            </div>

            <div className="pt-2">
              {isDemoActive ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<Trash2 className="w-3.5 h-3.5 text-amber-900 dark:text-amber-300" />}
                  onClick={handleRemoveSample}
                >
                  Remove Sample Data
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />}
                  onClick={handleLoadSample}
                >
                  Load Sample Data
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Data Backup & Portability Section */}
        <motion.div variants={cardVariants} className="h-full">
          <Card variant="glass" className="p-5 h-full flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Data Backup &amp; Portability</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                Export your reminders, completion history, and tariff settings to a dated JSON backup, or import an existing file.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Select backup file to import"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Download className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />}
                onClick={handleExport}
              >
                Export data
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Upload className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Import data
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Paired 2-column grid for About Project & Danger Zone Reset */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* About EcoPulse Card */}
        <motion.div variants={cardVariants} className="h-full">
          <Card variant="glass" className="p-5 h-full flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3.5">
              <Logo size={42} />
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  EcoPulse
                  <Badge variant="emerald" size="sm">v1.29</Badge>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                  CHE110 Environmental Studies project
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://github.com/vardansharma2912-dotcom/EcoPulse-energy-saver"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-100 transition-colors px-3 py-1.5 rounded-xl border border-emerald-800/20 dark:border-emerald-500/30 bg-white/60 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/10 shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>GitHub Repository</span>
              </a>
            </div>
          </Card>
        </motion.div>

        {/* Data Management & Reset Section */}
        <motion.div variants={cardVariants} className="h-full">
          <Card variant="glass" className="border-rose-400/50 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-950/20 p-5 h-full flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0" /> Reset Application Data
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2 font-semibold leading-relaxed">
                Restores default starter reminders, clears completion logs, and clears notification alert history.
              </p>
            </div>
            <div className="pt-2">
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                className="justify-center whitespace-nowrap"
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
      </div>

      {/* Credits Card */}
      <motion.div variants={cardVariants} id="credits">
        <Card variant="glass" className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 text-[var(--text-primary)] pb-2 border-b border-emerald-950/10 dark:border-white/10">
            <Users className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Built by</h2>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                CHE110 Environmental Studies Project Team
              </p>
            </div>
          </div>

          <div role="list" aria-label="Project Team Members" className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            {creditsTeam.map((member, idx) => (
              <div
                key={member.name}
                role="listitem"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-white/[0.06] border border-emerald-950/10 dark:border-white/10 shadow-xs transition-all hover:bg-white/80 dark:hover:bg-white/10"
              >
                <div
                  className="w-9 h-9 rounded-full bg-emerald-700/15 dark:bg-emerald-500/20 border border-emerald-700/25 dark:border-emerald-400/30 text-emerald-900 dark:text-emerald-200 font-bold flex items-center justify-center text-sm shrink-0 select-none shadow-xs"
                  aria-hidden="true"
                >
                  {member.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{member.name}</p>
                    {idx === 0 && (
                      <span className="text-[10px] font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-700/15 dark:bg-emerald-500/20 border border-emerald-700/20 dark:border-emerald-400/30 px-1.5 py-0.5 rounded-md leading-none">
                        Lead
                      </span>
                    )}
                  </div>
                  {member.role && (
                    <p className="text-[11px] text-[var(--text-secondary)] truncate font-medium">{member.role}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[var(--text-secondary)] text-center pt-1 font-medium">
            Developed with a focus on campus energy conservation, privacy-first offline architecture, and measurable sustainability habits.
          </p>
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
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
            This will permanently remove all logged completions, custom reminders, and alerted notifications history, restoring the 6 default starter reminders.
          </p>

          <div className="rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/40 dark:border-amber-500/30 p-3 text-xs text-amber-950 dark:text-amber-200">
            To prevent accidental data loss, please type <span className="font-mono font-bold text-rose-900 dark:text-rose-300">RESET</span> below to confirm.
          </div>

          <Input
            label='Type "RESET" to confirm'
            value={resetConfirmInput}
            onChange={(e) => setResetConfirmInput(e.target.value)}
            placeholder="RESET"
          />

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-emerald-950/10 dark:border-white/10">
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

      {/* Import Confirmation Dialog */}
      <Dialog
        open={importConfirmOpen}
        onClose={handleCancelImport}
        title="Confirm Data Import"
        description="Replace current EcoPulse data with imported backup?"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
            Are you sure you want to replace your current data? This will overwrite your active reminders, logged completions, and settings with the contents of the imported file.
          </p>

          {pendingImportData && (
            <div className="rounded-xl bg-white/70 dark:bg-white/[0.06] border border-emerald-950/10 dark:border-white/10 p-3.5 space-y-2 text-xs text-[var(--text-primary)]">
              <div className="font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> Backup Summary:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[var(--text-secondary)] font-medium">Reminders: </span>
                  <span className="font-bold">{pendingImportData.reminders.length}</span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)] font-medium">Completions: </span>
                  <span className="font-bold">{pendingImportData.completions.length}</span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)] font-medium">Tariff: </span>
                  <span className="font-bold">{pendingImportData.settings.currency || '₹'}{pendingImportData.settings.tariffPerKwh}/unit</span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)] font-medium">Profile: </span>
                  <span className="font-bold">{pendingImportData.settings.displayName || 'Guest'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/40 dark:border-amber-500/30 p-3 text-xs text-amber-950 dark:text-amber-200 font-medium">
            Make sure to export a backup of your current data first if you want to keep a copy.
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-emerald-950/10 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-center"
              onClick={handleCancelImport}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Upload className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto justify-center"
              onClick={handleConfirmImport}
            >
              Confirm Import
            </Button>
          </div>
        </div>
      </Dialog>
    </motion.div>
  )
}
