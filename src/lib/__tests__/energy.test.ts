import { describe, it, expect } from 'vitest'
import { calculateKwh, calculateCost } from '../energy'

describe('energy.ts - calculateKwh', () => {
  it('correctly calculates kWh from watts and hours', () => {
    // 100W for 10 hours = 1000 Wh = 1 kWh
    expect(calculateKwh(100, 10)).toBe(1)
    
    // 75W fan for 4 hours = 300 Wh = 0.3 kWh
    expect(calculateKwh(75, 4)).toBe(0.3)
    
    // 40W light bulb for 3 hours = 120 Wh = 0.12 kWh
    expect(calculateKwh(40, 3)).toBe(0.12)
  })

  it('rejects negative watts and hours by returning 0', () => {
    expect(calculateKwh(-100, 2)).toBe(0)
    expect(calculateKwh(100, -2)).toBe(0)
    expect(calculateKwh(-50, -5)).toBe(0)
  })

  it('rejects NaN, Infinity, and non-numeric inputs by returning 0', () => {
    expect(calculateKwh(NaN, 5)).toBe(0)
    expect(calculateKwh(50, NaN)).toBe(0)
    expect(calculateKwh(Infinity, 2)).toBe(0)
    expect(calculateKwh(50, Infinity)).toBe(0)
    // @ts-expect-error Testing invalid runtime types
    expect(calculateKwh('100', 5)).toBe(0)
  })

  it('handles zero gracefully', () => {
    expect(calculateKwh(0, 5)).toBe(0)
    expect(calculateKwh(100, 0)).toBe(0)
  })
})

describe('energy.ts - calculateCost', () => {
  it('correctly calculates monetary cost from kWh and tariff', () => {
    // 1 kWh at ₹8/kWh = ₹8
    expect(calculateCost(1, 8)).toBe(8)
    
    // 0.3 kWh at ₹8/kWh = ₹2.4
    expect(calculateCost(0.3, 8)).toBe(2.4)
    
    // 0.12 kWh at ₹7.5/kWh = ₹0.9
    expect(calculateCost(0.12, 7.5)).toBe(0.9)
  })

  it('rejects negative numbers, NaN, and Infinity', () => {
    expect(calculateCost(-1, 8)).toBe(0)
    expect(calculateCost(1, -8)).toBe(0)
    expect(calculateCost(NaN, 8)).toBe(0)
    expect(calculateCost(1, Infinity)).toBe(0)
  })
})
