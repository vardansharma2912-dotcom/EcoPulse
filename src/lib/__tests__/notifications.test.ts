import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isNotificationSupported,
  getNotificationPermission,
  sendBrowserNotification,
} from '../notifications'

describe('Browser Notification Utilities', () => {
  const originalWindow = globalThis.window

  beforeEach(() => {
    // Setup global window mock
    globalThis.window = {
      location: { origin: 'http://localhost:5173' } as unknown as Location,
      focus: vi.fn(),
    } as unknown as Window & typeof globalThis
  })

  afterEach(() => {
    globalThis.window = originalWindow
  })

  it('detects notification support properly', () => {
    // When Notification is not on window
    expect(isNotificationSupported()).toBe(false)

    // When Notification is on window
    // @ts-expect-error mock
    globalThis.window.Notification = function () {}
    expect(isNotificationSupported()).toBe(true)
  })

  it('returns denied or error if permission is not granted', () => {
    function MockNotification() {}
    MockNotification.permission = 'denied'
    // @ts-expect-error assignment
    globalThis.window.Notification = MockNotification

    expect(getNotificationPermission()).toBe('denied')

    const res = sendBrowserNotification('Test Alert', { body: 'Test Body' })
    expect(res.success).toBe(false)
    expect(res.error).toContain('Notification permission is currently "denied"')
  })

  it('dispatches notification with fallback when permission is granted', () => {
    const mockClose = vi.fn()
    const instances: unknown[] = []

    function MockNotification(this: { close: () => void; onclick: null; onerror: null }, _title: string, opts?: unknown) {
      this.close = mockClose
      this.onclick = null
      this.onerror = null
      instances.push({ title: _title, opts })
    }
    MockNotification.permission = 'granted'
    // @ts-expect-error assignment
    globalThis.window.Notification = MockNotification

    const onClickMock = vi.fn()
    const res = sendBrowserNotification('Turn off AC', {
      body: 'AC was scheduled at 10:00',
      tag: 'test-tag',
      onClick: onClickMock,
    })

    expect(res.success).toBe(true)
    expect(instances.length).toBe(1)
    expect(instances[0]).toEqual({
      title: 'Turn off AC',
      opts: expect.objectContaining({
        body: 'AC was scheduled at 10:00',
        tag: 'test-tag',
      }),
    })
  })

  it('falls back to no-icon notification if constructor fails with icon', () => {
    const mockClose = vi.fn()
    let callCount = 0

    function MockNotification(this: { close: () => void; onclick: null; onerror: null }, _title: string, opts?: { icon?: string }) {
      callCount++
      if (opts?.icon) {
        throw new Error('Image decoding failed on OS Toast')
      }
      this.close = mockClose
      this.onclick = null
      this.onerror = null
    }
    MockNotification.permission = 'granted'
    // @ts-expect-error assignment
    globalThis.window.Notification = MockNotification

    const res = sendBrowserNotification('Switch off fan', { body: 'Save power' })
    expect(res.success).toBe(true)
    expect(callCount).toBe(2) // 1 failed with icon, 1 succeeded without icon
  })
})
