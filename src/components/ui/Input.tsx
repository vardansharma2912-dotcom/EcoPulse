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
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg bg-[#090b0e] border px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-1 transition-colors ${
            error ? 'border-rose-500/80' : 'border-[#2d3647] hover:border-slate-600'
          } ${className}`}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
