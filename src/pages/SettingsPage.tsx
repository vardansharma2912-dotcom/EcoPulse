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
        title="Settings & Preferences"
        description="Configure your domestic electricity tariff and system preferences."
      />

      {/* Main Settings Form */}
      <form onSubmit={handleSave}>
        <Card className="space-y-5">
          <Input
            label="Student / User Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Vardaan"
            hint="Used to personalize dashboard greetings and exported reports."
          />

          <Input
            label="Tariff Rate per kWh (₹ / unit)"
            type="number"
            step="0.1"
            min="0"
            value={tariff}
            onChange={(e) => setTariff(e.target.value)}
            hint="Placeholder default is ₹8/unit. Check your latest electricity bill for your exact slab rate."
          />

          <div className="flex items-center justify-between pt-4 border-t border-[#222936]">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4" /> Preferences saved!
              </span>
            ) : (
              <span className="text-xs text-slate-500">Auto-persisted to local browser storage</span>
            )}

            <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
              Save Settings
            </Button>
          </div>
        </Card>
      </form>

      {/* Data Management & Reset Section */}
      <Card className="border-rose-950/60 bg-rose-950/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Reset Application Data
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Restores the default starter reminders, clears completion logs, and resets settings.
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

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        title="Confirm Data Reset"
        description="Are you sure you want to reset all EcoPulse data?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            This will permanently delete all logged completions and custom reminder modifications, restoring the 6 default starter reminders. This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222936]">
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
