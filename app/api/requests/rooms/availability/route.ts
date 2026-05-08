import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import {
  ACTIVE_ROOM_BOOKING_STATUSES,
  getOverlappingSlots,
  getRoomBookedSlots,
  normalizeTimeValue,
  timeToMinutes,
} from '@/lib/room-booking-utils'
import { buildRoomConflictDetails } from '@/lib/room-booking-server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const roomId = searchParams.get('roomId')
    const date = searchParams.get('date')

    if (!roomId || !date) {
      return NextResponse.json({ error: 'Missing roomId or date' }, { status: 400 })
    }

    const supabase = createClient()
    const bookedSlots = await getRoomBookedSlots(supabase, roomId, date, {
      bookingStatuses: ACTIVE_ROOM_BOOKING_STATUSES,
    })

    return NextResponse.json({ bookedSlots })
  } catch (error) {
    console.error('Error fetching booked slots:', error)
    return NextResponse.json({ error: 'Failed to fetch booked slots' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { roomId, roomName, date, startTime, endTime, expectedAttendees } = await request.json()

    if (!roomId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedStartTime = normalizeTimeValue(startTime)
    const normalizedEndTime = normalizeTimeValue(endTime)

    if (timeToMinutes(normalizedEndTime) <= timeToMinutes(normalizedStartTime)) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
    }

    const supabase = createClient()
    const bookedSlots = await getRoomBookedSlots(supabase, roomId, date, {
      bookingStatuses: ACTIVE_ROOM_BOOKING_STATUSES,
    })
    const conflicts = getOverlappingSlots(normalizedStartTime, normalizedEndTime, bookedSlots)

    if (conflicts.length > 0) {
      const conflictDetails = await buildRoomConflictDetails({
        supabase,
        roomId,
        roomName,
        bookingDate: date,
        startTime: normalizedStartTime,
        endTime: normalizedEndTime,
        expectedAttendees: Number.parseInt(String(expectedAttendees), 10) || 0,
        conflicts,
      })

      return NextResponse.json({
        available: false,
        bookedSlots,
        ...conflictDetails,
      })
    }

    return NextResponse.json({
      available: true,
      bookedSlots,
      conflicts: [],
      suggestedRooms: [],
      message: 'Slot available',
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
}
