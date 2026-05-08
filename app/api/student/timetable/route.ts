import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const studentEmail = request.nextUrl.searchParams.get('email') || 'student@example.com'

    // Fetch student's timetable
    const { data: timetableData, error: timetableError } = await supabase
      .from('student_timetable')
      .select('*')
      .eq('student_email', studentEmail)

    if (timetableError) throw timetableError

    // Get all schedule IDs from timetable
    const scheduleIds = (timetableData || []).map((entry: any) => entry.schedule_id)
    
    let scheduleDetails: any[] = []
    if (scheduleIds.length > 0) {
      // Fetch schedule details for all IDs
      const { data: schedules, error: scheduleError } = await supabase
        .from('room_schedule')
        .select('*')
        .in('id', scheduleIds)
        .order('day_of_week')

      if (scheduleError) throw scheduleError
      scheduleDetails = schedules || []
    }

    // Merge timetable with schedule details
    const merged = (timetableData || []).map((entry: any) => ({
      ...entry,
      schedule: scheduleDetails.find((s: any) => s.id === entry.schedule_id),
    }))

    return NextResponse.json({
      success: true,
      timetable: merged,
    }, { status: 200 })
  } catch (error) {
    console.error('🔍 Error fetching timetable:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch timetable',
    }, { status: 500 })
  }
}
