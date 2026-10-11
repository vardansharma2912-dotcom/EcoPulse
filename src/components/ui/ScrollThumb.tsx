import React, { useEffect, useState, useRef } from 'react'

/**
 * ScrollThumb
 * Custom touch overlay scrollbar indicator for @media (pointer: coarse).
 * A 3px emerald pill at the right edge that appears while scrolling and fades after ~800ms.
 * Scrolling itself remains 100% native and untouched.
 */
export const ScrollThumb: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [thumbTop, setThumbTop] = useState(0)
  const [thumbHeight, setThumbHeight] = useState(40)
  const [isCoarse, setIsCoarse] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(pointer: coarse)').matches
    }
    return false
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia('(pointer: coarse)')

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsCoarse(e.matches)
    }

    if (media.addEventListener) {
      media.addEventListener('change', handleMediaChange)
    } else {
      media.addListener(handleMediaChange)
    }

    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      const maxScroll = scrollHeight - clientHeight
      if (maxScroll <= 0) {
        setVisible(false)
        return
      }

      const calculatedHeight = Math.max(36, (clientHeight / scrollHeight) * clientHeight)
      const ratio = Math.min(1, Math.max(0, scrollY / maxScroll))
      const calculatedTop = ratio * (clientHeight - calculatedHeight)

      setThumbHeight(calculatedHeight)
      setThumbTop(calculatedTop)
      setVisible(true)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        setVisible(false)
      }, 800)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (media.removeEventListener) {
        media.removeEventListener('change', handleMediaChange)
      } else {
        media.removeListener(handleMediaChange)
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  if (!isCoarse) return null

  return (
    <div
      aria-hidden="true"
      className="fixed right-1 z-50 pointer-events-none transition-opacity duration-300"
      style={{
        opacity: visible ? 1 : 0,
        top: `${thumbTop}px`,
        height: `${thumbHeight}px`,
        width: '3.5px',
      }}
    >
      <div className="w-full h-full bg-emerald-600/85 rounded-full shadow-xs shadow-emerald-950/20" />
    </div>
  )
}
