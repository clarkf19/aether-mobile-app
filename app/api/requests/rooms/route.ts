import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import {
  ACTIVE_ROOM_BOOKING_STATUSES,
  getOverlappingSlots,
  getRoomBookedSlots,
  mapRoomBookingRequestToLegacy,
  normalizeTimeValue,
  timeToMinutes,
} from '@/lib/room-booking-utils'
import { buildRoomConflictDetails, isRoomOverlapConstraintError } from '@/lib/room-booking-server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('room_booking_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching rooms:', error)
      return NextResponse.json([], { status: 500 })
    }

    return NextResponse.json((data || []).map(mapRoomBookingRequestToLegacy))
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const newRequest = await request.json()

    const {
      studentEmail,
      studentName,
      roomId,
      roomName,
      date,
      startTime,
      endTime,
      purpose,
      expectedAttendees,
    } = newRequest

    if (!studentEmail || !studentName || !roomId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedStartTime = normalizeTimeValue(startTime)
    const normalizedEndTime = normalizeTimeValue(endTime)
    const parsedAttendees = Number.parseInt(String(expectedAttendees), 10) || 0

    if (timeToMinutes(normalizedEndTime) <= timeToMinutes(normalizedStartTime)) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
    }

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
        expectedAttendees: parsedAttendees,
        conflicts,
      })

      return NextResponse.json(
        {
          error: 'Room not available',
          conflictingBookings: conflictDetails.conflicts,
          suggestedRooms: conflictDetails.suggestedRooms,
          message: conflictDetails.message,
        },
        { status: 409 },
      )
    }

    const { data, error } = await supabase
      .from('room_booking_requests')
      .insert([
        {
          student_email: studentEmail,
          student_name: studentName,
          room_id: roomId,
          room_name: roomName,
          booking_date: date,
          start_time: normalizedStartTime,
          end_time: normalizedEndTime,
          purpose,
          expected_attendees: parsedAttendees,
          status: 'pending',
        },
      ])
      .select()
      .single()

    if (error) {
      if (isRoomOverlapConstraintError(error)) {
        const conflictDetails = await buildRoomConflictDetails({
          supabase,
          roomId,
          roomName,
          bookingDate: date,
          startTime: normalizedStartTime,
          endTime: normalizedEndTime,
          expectedAttendees: parsedAttendees,
        })

        return NextResponse.json(
          {
            error: 'Room not available',
            conflictingBookings: conflictDetails.conflicts,
            suggestedRooms: conflictDetails.suggestedRooms,
            message: conflictDetails.message,
          },
          { status: 409 },
        )
      }

      console.error('Error saving room booking:', error)
      return NextResponse.json({ error: 'Failed to save room booking', details: error.message }, { status: 500 })
    }

    return NextResponse.json(mapRoomBookingRequestToLegacy(data), { status: 201 })
  } catch (error) {
    console.error('Error saving room booking:', error)
    return NextResponse.json({ error: 'Failed to save room booking', details: String(error) }, { status: 500 })
  }
}
