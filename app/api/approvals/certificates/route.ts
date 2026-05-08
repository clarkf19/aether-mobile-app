import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const { student_email, student_name, certificate_type, purpose, date_required, student_id } = body

    if (!student_email || !student_name || !certificate_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('certificate_requests')
      .insert([
        {
          student_email,
          student_name,
          student_id,
          certificate_type,
          purpose,
          date_required,
          status: 'pending'
        }
      ])
      .select()

    if (error) {
      console.error('🔍 Error submitting certificate request:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      request: data[0]
    })
  } catch (error) {
    console.error('🔍 Error in certificate request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const status = request.nextUrl.searchParams.get('status') || 'pending'

    const { data, error } = await supabase
      .from('certificate_requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('🔍 Error fetching certificate requests:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      requests: data || []
    })
  } catch (error) {
    console.error('🔍 Error in certificate request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
