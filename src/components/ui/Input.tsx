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
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#14301f]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg bg-white/95 border px-3.5 py-2 text-sm text-[#14301f] placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-emerald-800 focus-visible:outline-offset-1 transition-colors shadow-xs ${
            error ? 'border-rose-600' : 'border-emerald-950/20 hover:border-emerald-800/40'
          } ${className}`}
          {...props}
        />
        {hint && !error && <p className="text-xs text-slate-600 leading-relaxed">{hint}</p>}
        {error && <p className="text-xs text-rose-700 font-medium">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
