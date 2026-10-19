/**
 * Utilities for appointment durations, schedule calculations, dynamic time slots,
 * and double-booking conflict prevention with buffer times.
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
  isBooked?: boolean
}

export type BookedInterval = {
  id?: string | number
  startMinutes: number
  endMinutes: number
  status?: string
}

export const APPOINTMENT_BUFFER_MINUTES = 20

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
 * Convert 12-hour formatted string (e.g. "09:30 AM", "10:00 AM", "2:30 PM") to minutes from midnight
 */
export function parseTime12hToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) return 0

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3]?.toUpperCase()

  if (period === 'PM' && hours < 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  return hours * 60 + minutes
}

/**
 * Determine if two appointment time windows collide, considering an operational buffer.
 * A 20-minute buffer ensures the technician has reset the station before and after clients.
 */
export function checkIntervalOverlap(
  newStart: number,
  newEnd: number,
  bookedStart: number,
  bookedEnd: number,
  bufferMinutes: number = APPOINTMENT_BUFFER_MINUTES
): boolean {
  return newStart < (bookedEnd + bufferMinutes) && (newEnd + bufferMinutes) > bookedStart
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
 * Generate available time slots based on total appointment duration, operating window,
 * and already booked intervals. Booked / conflicting slots are marked with isBooked = true
 * for transparent rendering with a subtle "Reserved" badge.
 */
export function generateAvailableTimeSlots(
  dateStr: string,
  totalDurationMinutes: number,
  intervalMinutes = 30,
  bookedIntervals: BookedInterval[] = [],
  bufferMinutes: number = APPOINTMENT_BUFFER_MINUTES
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

    // Check if slot collides with any existing booked interval on that date
    const isBooked = bookedIntervals.some((b) => {
      // Exclude cancelled or no-show bookings from collision checks
      if (b.status === 'cancelled' || b.status === 'no_show') {
        return false
      }
      return checkIntervalOverlap(startMin, endMin, b.startMinutes, b.endMinutes, bufferMinutes)
    })

    slots.push({
      startTime,
      endTime,
      startMinutes: startMin,
      endMinutes: endMin,
      displayRange: `${startTime} – ${endTime}`,
      isBooked
    })
  }

  return { slots, info, exceedsOperatingHours: false }
}
