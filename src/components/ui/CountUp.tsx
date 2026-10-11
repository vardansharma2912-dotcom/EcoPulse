import React, { useEffect, useRef, useState } from 'react'
import { animate, useReducedMotion } from 'motion/react'

export interface CountUpProps {
  value: number
  decimals?: number
  format?: (n: number) => string
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  decimals = 0,
  format,
  prefix = '',
  suffix = '',
  duration = 0.8,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion()
  const prevValueRef = useRef<number>(0)
  const [displayValue, setDisplayValue] = useState<number>(0)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (shouldReduceMotion) {
      prevValueRef.current = value
      return
    }

    const startVal = isFirstRender.current ? 0 : prevValueRef.current
    isFirstRender.current = false

    const controls = animate(startVal, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // smooth easeOut
      onUpdate: (latest) => {
        setDisplayValue(latest)
      },
      onComplete: () => {
        setDisplayValue(value) // Guarantee exact finish
        prevValueRef.current = value
      },
    })

    return () => controls.stop()
  }, [value, duration, shouldReduceMotion])

  // In reduced motion mode, display final target value instantly
  const effectiveValue = shouldReduceMotion ? value : displayValue

  const formatted = format
    ? format(effectiveValue)
    : decimals > 0
    ? effectiveValue.toFixed(decimals)
    : Math.round(effectiveValue).toString()

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
