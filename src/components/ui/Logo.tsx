import React from 'react'
import logoSrc from '../../assets/ecopulse-logo.webp'

export interface LogoProps {
  size?: number | string
  withWordmark?: boolean
  showTagline?: boolean
  className?: string
  imageClassName?: string
}

export const Logo: React.FC<LogoProps> = ({
  size = 40,
  withWordmark = false,
  showTagline = false,
  className = '',
  imageClassName = '',
}) => {
  const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 40

  const imgElement = (
    <div className="dark-logo-chip inline-flex items-center justify-center transition-all">
      <img
        src={logoSrc}
        height={numericSize}
        alt="EcoPulse logo"
        style={{ height: `${numericSize}px`, width: 'auto' }}
        className={`shrink-0 object-contain translate-y-[1px] ${imageClassName}`}
        loading="eager"
        decoding="async"
      />
    </div>
  )

  if (withWordmark) {
    const textSizeClass =
      numericSize >= 44
        ? 'text-2xl'
        : numericSize >= 36
          ? 'text-xl'
          : 'text-lg'

    return (
      <div className={`flex items-center gap-2.5 lg:gap-3 ${className}`}>
        {imgElement}
        <div className="min-w-0">
          <span
            className={`font-semibold tracking-[-0.02em] leading-none text-[var(--text-primary)] whitespace-nowrap block font-sans ${textSizeClass}`}
          >
            EcoPulse
          </span>
          {showTagline && (
            <p className="text-[var(--text-secondary)] font-medium leading-none text-xs mt-1 truncate">
              Smart Energy Reminder
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {imgElement}
    </div>
  )
}
