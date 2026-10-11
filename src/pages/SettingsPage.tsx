import React, { useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { useAppState } from '../state'
import { Save, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const { state, updateSettings, resetData } = useAppState()
  const [displayName, setDisplayName] = useState(state.settings.displayName)
  const [tariff, setTariff] = useState(state.settings.tariffPerKwh.toString())
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

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
        description="Configure your domestic electricity tariff and manage local data storage."
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
              <span className="text-xs text-slate-600 font-medium">Persisted safely to browser localStorage</span>
            )}

            <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
              Save Settings
            </Button>
          </div>
        </Card>
      </form>

      {/* Data Management & Reset Section */}
      <Card variant="glass" className="border-rose-400/50 bg-rose-50/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700" /> Reset Application Data
            </h3>
            <p className="text-xs text-slate-700 mt-1 max-w-md font-medium leading-relaxed">
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
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
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
