import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import {
  ACTIVE_ROOM_BOOKING_STATUSES,
  getOverlappingSlots,
  getRoomBookedSlots,
  mapRoomBookingRequest,
  normalizeTimeValue,
  timeToMinutes,
} from '@/lib/room-booking-utils'
import { buildRoomConflictDetails, isRoomOverlapConstraintError } from '@/lib/room-booking-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const {
      student_email,
      student_name,
      room_id,
      room_name,
      booking_date,
      start_time,
      end_time,
      purpose,
      expected_attendees,
    } = body

    if (!student_email || !student_name || !room_id || !booking_date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    const normalizedStartTime = normalizeTimeValue(start_time)
    const normalizedEndTime = normalizeTimeValue(end_time)
    const parsedAttendees = Number.parseInt(String(expected_attendees), 10) || 0

    if (timeToMinutes(normalizedEndTime) <= timeToMinutes(normalizedStartTime)) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 },
      )
    }

    const bookedSlots = await getRoomBookedSlots(supabase, room_id, booking_date, {
      bookingStatuses: ACTIVE_ROOM_BOOKING_STATUSES,
    })
    const conflicts = getOverlappingSlots(normalizedStartTime, normalizedEndTime, bookedSlots)

    if (conflicts.length > 0) {
      const conflictDetails = await buildRoomConflictDetails({
        supabase,
        roomId: room_id,
        roomName: room_name,
        bookingDate: booking_date,
        startTime: normalizedStartTime,
        endTime: normalizedEndTime,
        expectedAttendees: parsedAttendees,
        conflicts,
      })

      return NextResponse.json(
        {
          error: 'Time slot conflict',
          ...conflictDetails,
        },
        { status: 409 },
      )
    }

    const { data, error } = await supabase
      .from('room_booking_requests')
      .insert([
        {
          student_email,
          student_name,
          room_id,
          room_name,
          booking_date,
          start_time: normalizedStartTime,
          end_time: normalizedEndTime,
          purpose,
          expected_attendees: parsedAttendees,
          status: 'pending',
        },
      ])
      .select()

    if (error) {
      if (isRoomOverlapConstraintError(error)) {
        const conflictDetails = await buildRoomConflictDetails({
          supabase,
          roomId: room_id,
          roomName: room_name,
          bookingDate: booking_date,
          startTime: normalizedStartTime,
          endTime: normalizedEndTime,
          expectedAttendees: parsedAttendees,
        })

        return NextResponse.json(
          {
            error: 'Time slot conflict',
            ...conflictDetails,
          },
          { status: 409 },
        )
      }

      console.error('Error submitting room booking request:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      request: mapRoomBookingRequest(data[0]),
    })
  } catch (error) {
    console.error('Error in room booking request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const status = request.nextUrl.searchParams.get('status') || 'pending'

    const { data, error } = await supabase
      .from('room_booking_requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching room booking requests:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      requests: (data || []).map(mapRoomBookingRequest),
    })
  } catch (error) {
    console.error('Error in room booking request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
