import React from 'react'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="glass-card flex flex-col items-center justify-center text-center p-8 sm:p-12 border-dashed border-emerald-900/20">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-emerald-800/10 border border-emerald-800/15 flex items-center justify-center text-emerald-800 mb-4 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#14301f] mb-1">{title}</h3>
      <p className="text-sm text-slate-700 max-w-sm mb-5 leading-relaxed font-normal">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
