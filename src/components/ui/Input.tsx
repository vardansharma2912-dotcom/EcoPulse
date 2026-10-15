import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg bg-[var(--input-bg)] border px-3.5 py-2 text-sm text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-1 transition-colors shadow-xs ${
            error ? 'border-rose-600' : 'border-[var(--input-border)] hover:border-emerald-600/60'
          } ${className}`}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{hint}</p>}
        {error && <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
