import { describe, it, expect, vi } from 'vitest'
import { getCurrentDateInNY, isOverdue, addCalendarDays, addBusinessDays, categorizeUrgency } from './dates'

describe('Date Utilities', () => {
  it('adds calendar days correctly', () => {
    // Standard addition
    expect(addCalendarDays('2026-09-11', 5)).toBe('2026-09-16')
    // Crossing a month
    expect(addCalendarDays('2026-09-28', 5)).toBe('2026-10-03')
  })

  it('adds business days correctly (skipping weekends)', () => {
    // 2026-09-11 is a Friday
    // +1 business day should be Monday 2026-09-14
    expect(addBusinessDays('2026-09-11', 1)).toBe('2026-09-14')
    // +2 business days should be Tuesday 2026-09-15
    expect(addBusinessDays('2026-09-11', 2)).toBe('2026-09-15')
    
    // 2026-09-07 is a Monday
    // +5 business days should be next Monday 2026-09-14
    expect(addBusinessDays('2026-09-07', 5)).toBe('2026-09-14')
  })

  it('calculates overdue correctly based on NY time', () => {
    // Mock the current date using vi
    const mockDate = new Date('2026-09-11T12:00:00Z') // UTC time
    vi.setSystemTime(mockDate)

    const todayNY = getCurrentDateInNY() // Should be 2026-09-11
    expect(todayNY).toBe('2026-09-11')

    // Overdue tests
    expect(isOverdue('2026-09-10')).toBe(true)
    expect(isOverdue('2026-09-11')).toBe(false)
    expect(isOverdue('2026-09-12')).toBe(false)

    vi.useRealTimers()
  })

  it('categorizes urgency correctly based on NY time', () => {
    const mockDate = new Date('2026-09-11T12:00:00Z')
    vi.setSystemTime(mockDate) // Today is 2026-09-11

    expect(categorizeUrgency('2026-09-10')).toBe('OVERDUE')
    expect(categorizeUrgency('2026-09-11')).toBe('DUE_TODAY')
    expect(categorizeUrgency('2026-09-12')).toBe('NEXT_3_DAYS')
    expect(categorizeUrgency('2026-09-14')).toBe('NEXT_3_DAYS') // diff = 3
    expect(categorizeUrgency('2026-09-15')).toBe('NEXT_7_DAYS') // diff = 4
    expect(categorizeUrgency('2026-09-18')).toBe('NEXT_7_DAYS') // diff = 7
    expect(categorizeUrgency('2026-09-19')).toBe('FUTURE')      // diff = 8

    vi.useRealTimers()
  })
})
