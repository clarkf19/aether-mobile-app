import { NextResponse } from 'next/server'
import { readRoomsData } from '@/lib/rooms-data'

export async function GET() {
  try {
    const data = await readRoomsData()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error loading rooms data:', error)
    return NextResponse.json({ 
      rooms: [],
      availableTimeSlots: []
    }, { status: 500 })
  }
}
