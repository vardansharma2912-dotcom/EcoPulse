/**
 * Browser desktop notification utilities with Windows Action Center compatibility,
 * raster PNG icon support, error boundaries, and tab focusing.
 */

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported'
  return window.Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported'
  try {
    return await window.Notification.requestPermission()
  } catch (err) {
    console.warn('[EcoPulse] Failed to request notification permission:', err)
    return window.Notification.permission
  }
}

export interface NotificationResult {
  success: boolean
  error?: string
}

/**
 * Fires a native desktop notification.
 * Uses absolute PNG icon (Windows Action Center rejects SVG icons) and provides
 * a graceful fallback without an icon if the operating system rejects image loading.
 */
export function sendBrowserNotification(
  title: string,
  options?: {
    body?: string
    tag?: string
    icon?: string
    badge?: string
    onClick?: () => void
  }
): NotificationResult {
  if (!isNotificationSupported()) {
    return { success: false, error: 'Browser notifications are not supported in this browser' }
  }

  if (window.Notification.permission !== 'granted') {
    return {
      success: false,
      error: `Notification permission is currently "${window.Notification.permission}". Please grant permission in browser site settings.`,
    }
  }

  const icon = options?.icon ?? '/icon-192.png'
  const badge = options?.badge ?? '/favicon-32.png'
  const tag = options?.tag || `ecopulse-${Date.now()}`

  try {
    // Primary attempt: using raster PNG icon for Windows / macOS notification centers
    const notif = new window.Notification(title, {
      body: options?.body,
      icon,
      badge,
      tag,
      silent: false,
    })

    notif.onclick = () => {
      try {
        window.focus()
      } catch {
        // Ignore focus error
      }
      options?.onClick?.()
      notif.close()
    }

    notif.onerror = (e) => {
      console.warn('[EcoPulse] Native notification encountered an error event:', e)
    }

    return { success: true }
  } catch (err) {
    console.warn('[EcoPulse] Primary notification construction failed, attempting fallback without icon:', err)

    // Fallback attempt: without icon in case OS security policy or icon decoder rejected it
    try {
      const fallbackNotif = new window.Notification(title, {
        body: options?.body,
        tag,
      })

      fallbackNotif.onclick = () => {
        try {
          window.focus()
        } catch {
          // Ignore focus error
        }
        options?.onClick?.()
        fallbackNotif.close()
      }

      return { success: true }
    } catch (fallbackErr: unknown) {
      const message = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)
      console.error('[EcoPulse] Both notification attempts failed:', fallbackErr)
      return { success: false, error: message }
    }
  }
}
