import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import {
  APPROVED_ROOM_BOOKING_STATUS,
  getOverlappingSlots,
  getRoomBookedSlots,
  mapRoomBookingRequest,
} from '@/lib/room-booking-utils'
import { buildRoomConflictDetails } from '@/lib/room-booking-server'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { status, hod_comment } = body
    const { id } = await context.params

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 },
      )
    }

    const { data: existingRequest, error: existingRequestError } = await supabase
      .from('room_booking_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (existingRequestError || !existingRequest) {
      console.error('Error fetching room booking request:', existingRequestError)
      return NextResponse.json(
        { error: 'Room booking request not found' },
        { status: 404 },
      )
    }

    if (status === 'approved') {
      const bookedSlots = await getRoomBookedSlots(
        supabase,
        existingRequest.room_id,
        existingRequest.booking_date,
        {
          excludeBookingId: id,
          bookingStatuses: APPROVED_ROOM_BOOKING_STATUS,
        },
      )
      const conflicts = getOverlappingSlots(existingRequest.start_time, existingRequest.end_time, bookedSlots)

      if (conflicts.length > 0) {
        const conflictDetails = await buildRoomConflictDetails({
          supabase,
          roomId: existingRequest.room_id,
          roomName: existingRequest.room_name,
          bookingDate: existingRequest.booking_date,
          startTime: existingRequest.start_time,
          endTime: existingRequest.end_time,
          expectedAttendees: existingRequest.expected_attendees || 0,
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
    }

    const { data, error } = await supabase
      .from('room_booking_requests')
      .update({
        status,
        hod_comment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating room booking request:', error)
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
    console.error('Error in room booking approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
