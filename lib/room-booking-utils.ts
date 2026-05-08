import type { SupabaseClient } from '@supabase/supabase-js'

export const ACTIVE_ROOM_BOOKING_STATUSES = ['pending', 'approved'] as const
export const APPROVED_ROOM_BOOKING_STATUS = ['approved'] as const

export interface RoomBookedSlot {
  id?: string
  start: string
  end: string
  startMinutes: number
  endMinutes: number
  studentName: string
  type: 'class' | 'booking'
  status?: string
}

interface GetRoomBookedSlotsOptions {
  excludeBookingId?: string
  bookingStatuses?: readonly string[]
}

export function normalizeTimeValue(value: string | null | undefined): string {
  if (!value) {
    return ''
  }

  const [rawHours = '00', rawMinutes = '00'] = value.split(':')
  const hours = rawHours.padStart(2, '0')
  const minutes = rawMinutes.padStart(2, '0')
  return `${hours}:${minutes}`
}

export function timeToMinutes(time: string): number {
  const normalizedTime = normalizeTimeValue(time)
  const [hours, minutes] = normalizedTime.split(':').map(Number)
  return hours * 60 + minutes
}

export function getDayOfWeek(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  const utcDate = new Date(Date.UTC(year, month - 1, day))
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[utcDate.getUTCDay()]
}

export function getOverlappingSlots(
  startTime: string,
  endTime: string,
  bookedSlots: RoomBookedSlot[],
): RoomBookedSlot[] {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)

  return bookedSlots.filter((slot) => startMinutes < slot.endMinutes && endMinutes > slot.startMinutes)
}

export function buildRoomConflictMessage(roomName: string | undefined, conflicts: RoomBookedSlot[]): string {
  const roomLabel = roomName || 'This room'
  const formattedSlots = conflicts.slice(0, 3).map((slot) => {
    if (slot.type === 'class') {
      return `${slot.start}-${slot.end} (Class: ${slot.studentName})`
    }

    const bookingLabel = slot.status === 'approved' ? 'Approved booking' : 'Pending request'
    return `${slot.start}-${slot.end} (${bookingLabel} by ${slot.studentName})`
  })

  const suffix = conflicts.length > 3 ? ' and other overlapping slots.' : '.'
  return `${roomLabel} is not available for that time. It overlaps with ${formattedSlots.join(', ')}${suffix}`
}

export function mapRoomBookingRequest<T extends Record<string, any>>(booking: T): T {
  return {
    ...booking,
    start_time: normalizeTimeValue(booking.start_time),
    end_time: normalizeTimeValue(booking.end_time),
  }
}

export function mapRoomBookingRequestToLegacy(booking: Record<string, any>) {
  return {
    id: booking.id,
    studentEmail: booking.student_email,
    studentName: booking.student_name,
    roomId: booking.room_id,
    roomName: booking.room_name,
    roomType: booking.room_name || booking.room_id,
    date: booking.booking_date,
    startTime: normalizeTimeValue(booking.start_time),
    endTime: normalizeTimeValue(booking.end_time),
    purpose: booking.purpose,
    expectedAttendees: booking.expected_attendees,
    status: booking.status,
    hodComment: booking.hod_comment,
    timestamp: booking.created_at,
  }
}

export async function getRoomBookedSlots(
  supabase: SupabaseClient,
  roomId: string,
  date: string,
  options: GetRoomBookedSlotsOptions = {},
): Promise<RoomBookedSlot[]> {
  const { excludeBookingId, bookingStatuses = ACTIVE_ROOM_BOOKING_STATUSES } = options
  const dayOfWeek = getDayOfWeek(date)

  let bookingsQuery = supabase
    .from('room_booking_requests')
    .select('id, student_name, status, start_time, end_time')
    .eq('room_id', roomId)
    .eq('booking_date', date)
    .in('status', [...bookingStatuses])
    .order('start_time', { ascending: true })

  if (excludeBookingId) {
    bookingsQuery = bookingsQuery.neq('id', excludeBookingId)
  }

  const [{ data: scheduleRows, error: scheduleError }, { data: bookingRows, error: bookingError }] = await Promise.all([
    supabase
      .from('room_schedule')
      .select('course, start_time, end_time')
      .eq('room_id', roomId)
      .eq('day_of_week', dayOfWeek)
      .order('start_time', { ascending: true }),
    bookingsQuery,
  ])

  if (scheduleError) {
    throw scheduleError
  }

  if (bookingError) {
    throw bookingError
  }

  const classSlots: RoomBookedSlot[] = (scheduleRows || []).map((row: any) => {
    const start = normalizeTimeValue(row.start_time)
    const end = normalizeTimeValue(row.end_time)

    return {
      start,
      end,
      startMinutes: timeToMinutes(start),
      endMinutes: timeToMinutes(end),
      studentName: row.course || 'Scheduled class',
      type: 'class',
    }
  })

  const bookingSlots: RoomBookedSlot[] = (bookingRows || []).map((row: any) => {
    const start = normalizeTimeValue(row.start_time)
    const end = normalizeTimeValue(row.end_time)

    return {
      id: row.id,
      start,
      end,
      startMinutes: timeToMinutes(start),
      endMinutes: timeToMinutes(end),
      studentName: row.student_name || 'Student',
      type: 'booking',
      status: row.status,
    }
  })

  return [...classSlots, ...bookingSlots].sort((left, right) => left.startMinutes - right.startMinutes)
}
