import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  ACTIVE_ROOM_BOOKING_STATUSES,
  buildRoomConflictMessage,
  getOverlappingSlots,
  getRoomBookedSlots,
  normalizeTimeValue,
  type RoomBookedSlot,
} from '@/lib/room-booking-utils'
import { readRoomsData, type RoomCatalogItem } from '@/lib/rooms-data'

export interface RoomSuggestion extends RoomCatalogItem {
  reason: string
}

interface BuildRoomConflictOptions {
  supabase: SupabaseClient
  roomId: string
  roomName?: string
  bookingDate: string
  startTime: string
  endTime: string
  expectedAttendees?: number
  conflicts?: RoomBookedSlot[]
}

function getSimilarityRank(room: RoomCatalogItem, selectedRoom: RoomCatalogItem | undefined, expectedAttendees: number): number {
  const sameTypeScore = room.type === selectedRoom?.type ? 0 : 1000
  const capacityGapScore = expectedAttendees > 0 ? Math.max(room.capacity - expectedAttendees, 0) : room.capacity
  return sameTypeScore + capacityGapScore
}

export async function getAvailableRoomSuggestions(
  supabase: SupabaseClient,
  options: {
    selectedRoomId: string
    bookingDate: string
    startTime: string
    endTime: string
    expectedAttendees?: number
    limit?: number
  },
): Promise<RoomSuggestion[]> {
  const { selectedRoomId, bookingDate, startTime, endTime, limit = 3 } = options
  const expectedAttendees = Number.isFinite(options.expectedAttendees) ? Math.max(options.expectedAttendees || 0, 0) : 0
  const { rooms } = await readRoomsData()
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId)

  const candidateRooms = rooms
    .filter((room) => room.id !== selectedRoomId)
    .filter((room) => expectedAttendees === 0 || room.capacity >= expectedAttendees)
    .sort((left, right) => {
      const rankDifference = getSimilarityRank(left, selectedRoom, expectedAttendees) - getSimilarityRank(right, selectedRoom, expectedAttendees)
      if (rankDifference !== 0) {
        return rankDifference
      }

      return left.name.localeCompare(right.name)
    })

  const availabilityChecks = await Promise.all(
    candidateRooms.map(async (room) => {
      const bookedSlots = await getRoomBookedSlots(supabase, room.id, bookingDate, {
        bookingStatuses: ACTIVE_ROOM_BOOKING_STATUSES,
      })
      const conflicts = getOverlappingSlots(startTime, endTime, bookedSlots)

      if (conflicts.length > 0) {
        return null
      }

      const sameType = room.type === selectedRoom?.type
      const reasonParts = [sameType ? `Same ${room.type}` : `${room.type} alternative`]

      if (expectedAttendees > 0) {
        reasonParts.push(`fits ${expectedAttendees} people`)
      }

      return {
        ...room,
        reason: reasonParts.join(' - '),
      }
    }),
  )

  return availabilityChecks.filter((room): room is RoomSuggestion => room !== null).slice(0, limit)
}

export async function buildRoomConflictDetails(options: BuildRoomConflictOptions) {
  const normalizedStartTime = normalizeTimeValue(options.startTime)
  const normalizedEndTime = normalizeTimeValue(options.endTime)
  let conflicts = options.conflicts

  if (!conflicts) {
    const bookedSlots = await getRoomBookedSlots(options.supabase, options.roomId, options.bookingDate, {
      bookingStatuses: ACTIVE_ROOM_BOOKING_STATUSES,
    })
    conflicts = getOverlappingSlots(normalizedStartTime, normalizedEndTime, bookedSlots)
  }

  const suggestedRooms = await getAvailableRoomSuggestions(options.supabase, {
    selectedRoomId: options.roomId,
    bookingDate: options.bookingDate,
    startTime: normalizedStartTime,
    endTime: normalizedEndTime,
    expectedAttendees: options.expectedAttendees,
  })

  return {
    conflicts,
    suggestedRooms,
    message: buildRoomConflictMessage(options.roomName, conflicts),
  }
}

export function isRoomOverlapConstraintError(error: { code?: string | null; message?: string | null } | null | undefined) {
  return error?.code === '23P01' || error?.message?.includes('room_booking_requests_no_overlap')
}
