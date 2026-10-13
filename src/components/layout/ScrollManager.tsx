import React, { useLayoutEffect, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigationType, NavigationType } from 'react-router-dom'
import {
  globalScrollStore,
  getPageScrollPosition,
  scrollToPosition,
  scrollToAnchor,
  cleanupScrollLocks,
} from '../../lib/scrollPositions'

/**
 * ScrollManager
 * Production-grade scroll restoration and route-transition scroll controller.
 *
 * 1. Resets scroll to (0,0) instantly on PUSH/REPLACE transitions to a new pathname.
 * 2. Restores precise scroll coordinates on browser back/forward (POP) transitions.
 * 3. Scrolls to hash target elements (#section) if present.
 * 4. Preserves scroll position when only query parameters change on the same page.
 * 5. Handles lazy-loaded Suspense page content without flashes or jank.
 * 6. Programmatically shifts accessible focus to the page's <h1> or <main> landmark.
 * 7. Announces route updates via an aria-live region for screen readers.
 */
export const ScrollManager: React.FC = () => {
  const location = useLocation()
  const navigationType = useNavigationType()

  const prevPathnameRef = useRef<string>(location.pathname)
  const prevHashRef = useRef<string>(location.hash)
  const prevKeyRef = useRef<string>(location.key)
  const [announcement, setAnnouncement] = useState('')

  // 1. Configure browser history scroll restoration to manual
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      try {
        window.history.scrollRestoration = 'manual'
      } catch {
        // Ignore in restricted environments
      }
    }
  }, [])

  // 2. Continuously record current scroll position for the current history entry
  useEffect(() => {
    if (typeof window === 'undefined') return

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const handleScroll = () => {
      if (timeoutId) return
      timeoutId = setTimeout(() => {
        timeoutId = null
        const pos = getPageScrollPosition()
        globalScrollStore.save(location.key, pos)
      }, 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutId) clearTimeout(timeoutId)
      // Save last known position on route exit
      const finalPos = getPageScrollPosition()
      globalScrollStore.save(location.key, finalPos)
    }
  }, [location.key])

  // 3. Execute scroll reset or restoration before paint via useLayoutEffect
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return

    const isSamePathname = prevPathnameRef.current === location.pathname
    const isSameHash = prevHashRef.current === location.hash

    // If only query params changed on the same page without a new hash, preserve scroll position
    if (isSamePathname && isSameHash && prevKeyRef.current !== location.key) {
      prevKeyRef.current = location.key
      return
    }

    // Save previous page position before navigating
    if (prevKeyRef.current && prevKeyRef.current !== location.key) {
      globalScrollStore.save(prevKeyRef.current, getPageScrollPosition())
    }

    // Clean up any stray modal body scroll lock on navigation
    cleanupScrollLocks()

    let frameId: number | null = null

    if (navigationType === NavigationType.Pop) {
      // BROWSER BACK / FORWARD: Restore saved entry position
      const savedPos = globalScrollStore.get(location.key)

      if (savedPos) {
        // Attempt immediate instant restoration
        scrollToPosition(savedPos)

        // Retry for up to 8 animation frames to wait for lazy-loaded content to reach target height
        let attempts = 0
        const checkContentHeight = () => {
          attempts++
          const currentHeight = document.documentElement.scrollHeight
          const neededHeight = savedPos.y + window.innerHeight * 0.5

          if (currentHeight >= neededHeight || attempts >= 8) {
            scrollToPosition(savedPos)
          } else {
            frameId = requestAnimationFrame(checkContentHeight)
          }
        }
        frameId = requestAnimationFrame(checkContentHeight)
      } else if (location.hash) {
        // If hash anchor present on POP without stored position
        if (!scrollToAnchor(location.hash)) {
          scrollToPosition({ x: 0, y: 0 })
        }
      } else {
        // Default to top if no position recorded
        scrollToPosition({ x: 0, y: 0 })
      }
    } else {
      // PUSH OR REPLACE: New navigation
      if (location.hash) {
        // Attempt hash scroll immediately
        const scrolled = scrollToAnchor(location.hash)
        if (!scrolled) {
          // Retry for up to 6 frames for lazy-loaded element to mount
          let attempts = 0
          const checkAnchor = () => {
            attempts++
            if (scrollToAnchor(location.hash) || attempts >= 6) {
              // Found or gave up
            } else {
              frameId = requestAnimationFrame(checkAnchor)
            }
          }
          frameId = requestAnimationFrame(checkAnchor)
        }
      } else {
        // Reset instantly to top
        scrollToPosition({ x: 0, y: 0 })
      }
    }

    prevPathnameRef.current = location.pathname
    prevHashRef.current = location.hash
    prevKeyRef.current = location.key

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
    }
  }, [location.pathname, location.search, location.hash, location.key, navigationType])

  // 4. Accessibility: Programmatic focus shift to <h1> or <main> and live region announcement
  useEffect(() => {
    if (typeof document === 'undefined') return

    // Allow the new page component to mount
    const timer = setTimeout(() => {
      const heading =
        document.querySelector<HTMLElement>('main h1') ||
        document.querySelector<HTMLElement>('h1') ||
        document.querySelector<HTMLElement>('main')

      if (heading) {
        if (!heading.hasAttribute('tabindex')) {
          heading.setAttribute('tabindex', '-1')
        }
        heading.focus({ preventScroll: true })
      }

      // Announce the page title to screen readers
      const title = document.title || 'Page loaded'
      setAnnouncement(title)
    }, 60)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only pointer-events-none"
    >
      {announcement}
    </div>
  )
}
