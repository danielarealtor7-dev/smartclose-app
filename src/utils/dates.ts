import { addDays, isWeekend, format, parseISO, differenceInCalendarDays } from 'date-fns'

/**
 * Returns the current date (YYYY-MM-DD) in America/New_York timezone.
 */
export function getCurrentDateInNY(): string {
  // Using Intl.DateTimeFormat to force timezone
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
  const formatter = new Intl.DateTimeFormat('en-CA', options) // en-CA gives YYYY-MM-DD
  return formatter.format(new Date())
}

/**
 * Checks if a given date string (YYYY-MM-DD) is in the past compared to today in NY.
 */
export function isOverdue(dateString: string): boolean {
  const todayStr = getCurrentDateInNY()
  return dateString < todayStr
}

/**
 * Adds a specific number of Calendar Days to a date string (YYYY-MM-DD).
 */
export function addCalendarDays(dateString: string, daysToAdd: number): string {
  // Parse assuming UTC midnight to avoid local timezone shifts
  const date = parseISO(dateString)
  const newDate = addDays(date, daysToAdd)
  return format(newDate, 'yyyy-MM-dd')
}

/**
 * Adds a specific number of Business Days to a date string (YYYY-MM-DD).
 * Skips Saturdays and Sundays.
 */
export function addBusinessDays(dateString: string, daysToAdd: number): string {
  let date = parseISO(dateString)
  let added = 0
  
  // if daysToAdd is 0, just return the date (or advance if it's weekend? Let's just return)
  if (daysToAdd === 0) return dateString

  const step = daysToAdd > 0 ? 1 : -1
  const target = Math.abs(daysToAdd)

  while (added < target) {
    date = addDays(date, step)
    if (!isWeekend(date)) {
      added++
    }
  }

  return format(date, 'yyyy-MM-dd')
}

export type UrgencyCategory = 'OVERDUE' | 'DUE_TODAY' | 'NEXT_3_DAYS' | 'NEXT_7_DAYS' | 'FUTURE'

/**
 * Categorizes a date string based on its proximity to today in NY timezone.
 */
export function categorizeUrgency(dateString: string): UrgencyCategory {
  const todayStr = getCurrentDateInNY()
  
  if (dateString < todayStr) return 'OVERDUE'
  if (dateString === todayStr) return 'DUE_TODAY'
  
  // Parse as UTC midnight to compare whole days
  const targetDate = parseISO(dateString)
  const todayDate = parseISO(todayStr)
  
  const diff = differenceInCalendarDays(targetDate, todayDate)
  
  if (diff <= 3) return 'NEXT_3_DAYS'
  if (diff <= 7) return 'NEXT_7_DAYS'
  
  return 'FUTURE'
}

