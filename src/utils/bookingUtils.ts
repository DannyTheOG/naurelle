/**
 * Utilities for appointment durations, schedule calculations, and dynamic time slots.
 */

export type OperatingHoursInfo = {
  isOpen: boolean
  dayName: string
  openMinutes: number
  closeMinutes: number
  displayHours: string
  reason?: string
}

export type TimeSlot = {
  startTime: string
  endTime: string
  startMinutes: number
  endMinutes: number
  displayRange: string
}

/**
 * Format total duration in minutes to human-readable string (e.g. "3 hrs", "45 mins", "3 hrs 45 mins")
 */
export function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 mins'
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  if (hours > 0 && mins > 0) {
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${mins} mins`
  }
  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`
  }
  return `${mins} mins`
}

/**
 * Convert minutes from midnight (e.g. 570) to 12-hour formatted string (e.g. "09:30 AM")
 */
export function formatTime12h(minutesFromMidnight: number): string {
  const normalized = ((minutesFromMidnight % 1440) + 1440) % 1440
  const hours24 = Math.floor(normalized / 60)
  const mins = normalized % 60

  const period = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12

  const paddedHours = hours12 < 10 ? `0${hours12}` : `${hours12}`
  const paddedMins = mins < 10 ? `0${mins}` : `${mins}`

  return `${paddedHours}:${paddedMins} ${period}`
}

/**
 * Determine operating hours for a given calendar date (YYYY-MM-DD)
 */
export function getOperatingHoursForDate(dateStr: string): OperatingHoursInfo {
  if (!dateStr) {
    return {
      isOpen: false,
      dayName: '',
      openMinutes: 0,
      closeMinutes: 0,
      displayHours: '',
      reason: 'Please select a date.'
    }
  }

  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayName = dayNames[dayOfWeek]

  // Sunday: Closed
  if (dayOfWeek === 0) {
    return {
      isOpen: false,
      dayName,
      openMinutes: 0,
      closeMinutes: 0,
      displayHours: 'Closed',
      reason: 'The studio is closed on Sundays.'
    }
  }

  // Saturday: 10:00 to 17:00
  if (dayOfWeek === 6) {
    return {
      isOpen: true,
      dayName,
      openMinutes: 10 * 60, // 600
      closeMinutes: 17 * 60, // 1020
      displayHours: '10:00 — 17:00'
    }
  }

  // Monday - Friday: 09:00 to 18:00
  return {
    isOpen: true,
    dayName,
    openMinutes: 9 * 60, // 540
    closeMinutes: 18 * 60, // 1080
    displayHours: '09:00 — 18:00'
  }
}

/**
 * Generate available time slots based on total appointment duration and studio operating window.
 * Only slots where (startTime + totalDuration <= closeMinutes) are offered.
 */
export function generateAvailableTimeSlots(
  dateStr: string,
  totalDurationMinutes: number,
  intervalMinutes = 30
): { slots: TimeSlot[]; info: OperatingHoursInfo; exceedsOperatingHours: boolean } {
  const info = getOperatingHoursForDate(dateStr)

  if (!info.isOpen || totalDurationMinutes <= 0) {
    return { slots: [], info, exceedsOperatingHours: false }
  }

  const totalOperatingMinutes = info.closeMinutes - info.openMinutes
  if (totalDurationMinutes > totalOperatingMinutes) {
    return { slots: [], info, exceedsOperatingHours: true }
  }

  // Check if date is today to filter out past slots
  const today = new Date()
  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-')

  const isToday = dateStr === todayStr
  const currentMinutesFromMidnight = today.getHours() * 60 + today.getMinutes()

  const slots: TimeSlot[] = []

  for (
    let startMin = info.openMinutes;
    startMin + totalDurationMinutes <= info.closeMinutes;
    startMin += intervalMinutes
  ) {
    // If today, require at least 30 mins advance notice
    if (isToday && startMin <= currentMinutesFromMidnight + 30) {
      continue
    }

    const endMin = startMin + totalDurationMinutes
    const startTime = formatTime12h(startMin)
    const endTime = formatTime12h(endMin)

    slots.push({
      startTime,
      endTime,
      startMinutes: startMin,
      endMinutes: endMin,
      displayRange: `${startTime} – ${endTime}`
    })
  }

  return { slots, info, exceedsOperatingHours: false }
}
