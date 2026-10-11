import { describe, it, expect } from 'vitest'
import { containerVariants, cardVariants, highlightCardVariants } from '../motionVariants'

describe('Motion System & Variants', () => {
  it('defines containerVariants with staggerChildren and delayChildren', () => {
    expect(containerVariants.hidden).toBeDefined()
    expect(containerVariants.visible).toBeDefined()
    // @ts-expect-error transition inspect
    expect(containerVariants.visible.transition.staggerChildren).toBe(0.06)
    // @ts-expect-error transition inspect
    expect(containerVariants.visible.transition.delayChildren).toBe(0.1)
  })

  it('defines cardVariants with spring physics and proper rest values', () => {
    expect(cardVariants.hidden).toBeDefined()
    expect(cardVariants.visible).toBeDefined()
    // @ts-expect-error transition inspect
    expect(cardVariants.visible.transition.type).toBe('spring')
    // @ts-expect-error transition inspect
    expect(cardVariants.visible.transition.stiffness).toBe(260)
    // @ts-expect-error transition inspect
    expect(cardVariants.visible.transition.damping).toBe(24)
  })

  it('defines highlightCardVariants with enhanced shadow bloom', () => {
    expect(highlightCardVariants.visible).toBeDefined()
    // @ts-expect-error boxShadow inspect
    expect(highlightCardVariants.visible.boxShadow).toContain('rgba(10, 56, 30')
  })
})
