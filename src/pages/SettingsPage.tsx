import React, { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { Badge } from '../components/ui/Badge'
import { useAppState } from '../state'
import {
  Save,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Bell,
  BellOff,
  BellRing,
  Info,
} from 'lucide-react'

type PermissionState = 'unsupported' | 'not asked yet' | 'granted' | 'denied'

export const SettingsPage: React.FC = () => {
  const { state, updateSettings, resetData } = useAppState()
  const [displayName, setDisplayName] = useState(state.settings.displayName)
  const [tariff, setTariff] = useState(state.settings.tariffPerKwh.toString())
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [testAlertSent, setTestAlertSent] = useState(false)

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
        console.error('[EcoPulse] Error requesting notification permission:', err)
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
    const numericTariff = parseFloat(tariff)
    if (isNaN(numericTariff) || numericTariff < 0) return

    updateSettings({
      displayName,
      tariffPerKwh: numericTariff,
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleConfirmReset = () => {
    resetData()
    setResetDialogOpen(false)
    setDisplayName('College Student')
    setTariff('8')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Settings & System Configuration"
        description="Configure your domestic electricity tariff and manage browser alert preferences."
      />

      {/* Main Settings Form on glass-strong */}
      <form onSubmit={handleSave}>
        <Card variant="glass-strong" className="space-y-5">
          <Input
            label="Student / User Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Vardaan"
            hint="Used to personalize dashboard greetings and exported environmental reports."
          />

          <Input
            label="Tariff Rate per kWh (₹ / unit)"
            type="number"
            step="0.1"
            min="0"
            value={tariff}
            onChange={(e) => setTariff(e.target.value)}
            hint="Default is ₹8/unit (placeholder, set from your electricity bill)."
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
            <p className="text-xs text-[#183624] font-medium leading-relaxed">
              In-app toast alerts are always active. You can also permit native desktop/browser notifications when reminders come due.
            </p>
          </div>
        </div>

        {/* State-specific UI controls */}
        {permissionState === 'unsupported' && (
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-900/15 text-xs text-amber-950 font-medium">
            This browser does not support the Web Notifications API. EcoPulse will rely exclusively on in-app toast alerts.
          </div>
        )}

        {permissionState === 'not asked yet' && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/70 border border-emerald-900/15">
            <div>
              <p className="text-xs font-bold text-[#14301f]">Notification permission not requested</p>
              <p className="text-[11px] text-[#1e3f2b]">Click to request permission from your browser.</p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<BellRing className="w-3.5 h-3.5" />}
              onClick={handleRequestPermission}
            >
              Enable Notifications
            </Button>
          </div>
        )}

        {permissionState === 'granted' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-900/15">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">Permission Granted</p>
                  <p className="text-[11px] text-[#1e3f2b]">Native system alerts will fire alongside in-app toasts.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendTestNotification}
                >
                  Send Test Alert
                </Button>
                <input
                  id="notifications-toggle"
                  type="checkbox"
                  checked={state.settings.notificationsEnabled}
                  onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 border-slate-300 cursor-pointer ml-1"
                />
              </div>
            </div>
            {testAlertSent && (
              <p className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Test alert sent! Check your system notification banner.
              </p>
            )}
          </div>
        )}

        {permissionState === 'denied' && (
          <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-900/15 space-y-2">
            <div className="flex items-center gap-2 text-rose-950 font-bold text-xs">
              <BellOff className="w-4 h-4 text-rose-700 shrink-0" />
              Notifications Blocked in Browser
            </div>
            <p className="text-xs text-rose-900 leading-relaxed font-medium">
              Notifications were blocked in your browser site settings. To re-enable them: click the padlock or site settings icon in your browser's address bar next to the URL, and change Notifications to <strong>Allow</strong>.
            </p>
          </div>
        )}

        {/* Honest Note Requirement */}
        <div className="p-3 rounded-xl bg-white/60 border border-emerald-900/10 flex items-start gap-2.5 text-xs text-[#1e3f2b] leading-relaxed">
          <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          <p>
            <strong>Honest note:</strong> Alerts only fire while EcoPulse is open in a browser tab. Closed tabs and sleeping devices can't be notified. Missed reminders show as Overdue when you return.
          </p>
        </div>
      </Card>

      {/* Data Management & Reset Section */}
      <Card variant="glass" className="border-rose-400/50 bg-rose-50/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700" /> Reset Application Data
            </h3>
            <p className="text-xs text-[#183624] mt-1 max-w-md font-semibold leading-relaxed">
              Restores the default starter reminders, clears completion logs, and resets settings back to default.
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => setResetDialogOpen(true)}
          >
            Reset All
          </Button>
        </div>
      </Card>

      {/* Reset Confirmation Dialog on glass-strong */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        title="Confirm Data Reset"
        description="Are you sure you want to reset all EcoPulse data?"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#183624] leading-relaxed font-medium">
            This will permanently remove all logged completions and custom modifications, restoring the 6 default starter reminders. This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-950/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
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
