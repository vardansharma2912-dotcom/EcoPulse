import React from 'react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Trash2 } from 'lucide-react'

export interface DeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  reminderTitle: string
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  reminderTitle,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete Energy Reminder"
      description="Are you sure you want to delete this reminder?"
    >
      <div className="space-y-4 pt-1">
        <p className="text-sm text-[#14301f] leading-relaxed">
          You are about to delete <strong className="text-emerald-950 font-bold">"{reminderTitle}"</strong>.
        </p>
        <p className="text-xs text-[#1e3f2b] bg-white/70 p-3 rounded-xl border border-emerald-900/10 leading-relaxed font-medium">
          <strong>Note:</strong> Past completed logs and kWh statistics for this reminder will be preserved in your history records with a snapshot title.
        </p>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-950/10">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Delete Reminder
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
