import React from 'react'
import logoSrc from '../../assets/ecopulse-logo.webp'

export interface LogoProps {
  size?: number | string
  withWordmark?: boolean
  className?: string
  imageClassName?: string
}

export const Logo: React.FC<LogoProps> = ({
  size = 40,
  withWordmark = false,
  className = '',
  imageClassName = '',
}) => {
  const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 40

  const imgElement = (
    <img
      src={logoSrc}
      width={numericSize}
      height={numericSize}
      alt={withWordmark ? '' : 'EcoPulse logo'}
      style={{ width: numericSize, height: numericSize }}
      className={`shrink-0 object-contain ${imageClassName}`}
      loading="eager"
      decoding="async"
    />
  )

  if (withWordmark) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {imgElement}
        <div className="min-w-0">
          <span className="font-bold text-base text-[#14301f] tracking-tight block leading-tight truncate">
            EcoPulse
          </span>
          <p className="text-[11px] text-[#1e3f2b] font-semibold leading-tight truncate">
            Smart Energy Reminder
          </p>
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
