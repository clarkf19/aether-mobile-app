import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const division = request.nextUrl.searchParams.get('division') || 'C'

    // Fetch assignments by division, sorted by due date
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('division', division)
      .order('due_date', { ascending: true })

    if (error) throw error

    return NextResponse.json({
      success: true,
      assignments: assignments || [],
    }, { status: 200 })
  } catch (error) {
    console.error('🔍 Error fetching assignments:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch assignments',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const {
      course_code,
      title,
      description,
      due_date,
      priority = 'medium',
      teacher_email,
      division,
    } = body

    // Validate required fields
    if (!course_code || !title || !due_date || !teacher_email || !division) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 })
    }

    // Insert assignment
    const { data, error } = await supabase
      .from('assignments')
      .insert([
        {
          course_code,
          title,
          description,
          due_date,
          priority,
          teacher_email,
          division,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      assignment: data?.[0],
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating assignment:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create assignment',
    }, { status: 500 })
  }
}
