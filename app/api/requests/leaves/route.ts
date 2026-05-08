import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leaves:', error)
      return NextResponse.json([], { status: 500 })
    }

    const mappedData = (data || []).map(leave => ({
      id: leave.id,
      studentEmail: leave.student_email,
      studentName: leave.student_name,
      leaveType: leave.leave_type,
      reason: leave.reason,
      date: leave.start_date, // Map back to frontend expected key
      status: leave.status,
      imageUrl: leave.image_url,
      createdAt: leave.created_at,
    }))

    return NextResponse.json(mappedData)
  } catch (error) {
    console.error('Error fetching leaves:', error)
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
      leaveType,
      date,
      reason,
      imageUrl
    } = newRequest

    if (!studentEmail || !studentName || !leaveType || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert([
        {
          student_email: studentEmail,
          student_name: studentName,
          leave_type: leaveType,
          reason: reason,
          start_date: date || null,
          end_date: date || null,
          image_url: imageUrl || null,
          status: 'pending'
        }
      ])
      .select()

    if (error) {
      console.error('❌ Error saving leave request:', error)
      return NextResponse.json({ error: 'Failed to save leave request', details: error.message }, { status: 500 })
    }

    console.log('✅ Leave request saved to Supabase:', data[0].id)
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('❌ Error saving leave request:', error)
    return NextResponse.json({ error: 'Failed to save leave request', details: String(error) }, { status: 500 })
  }
}
