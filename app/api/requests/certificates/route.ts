import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('certificate_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching certificates:', error)
      return NextResponse.json([], { status: 500 })
    }

    // Map database snake_case columns back to camelCase for the frontend if needed.
    // The previous fs-based implementation returned the object exactly as posted.
    // Since frontend sends camelCase, we should probably return camelCase to avoid breaking frontend GETs.
    const mappedData = (data || []).map(cert => ({
      id: cert.id,
      studentEmail: cert.student_email,
      studentName: cert.student_name,
      studentId: cert.student_id,
      certificateType: cert.certificate_type,
      purpose: cert.purpose,
      status: cert.status,
      dateRequired: cert.date_required,
      createdAt: cert.created_at,
    }))

    return NextResponse.json(mappedData)
  } catch (error) {
    console.error('Error fetching certificates:', error)
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
      studentId,
      certificateType,
      purpose,
      dateRequired
    } = newRequest

    if (!studentEmail || !studentName || !certificateType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('certificate_requests')
      .insert([
        {
          student_email: studentEmail,
          student_name: studentName,
          student_id: studentId || null,
          certificate_type: certificateType,
          purpose: purpose,
          date_required: dateRequired,
          status: 'pending'
        }
      ])
      .select()

    if (error) {
      console.error('❌ Error saving certificate:', error)
      return NextResponse.json({ error: 'Failed to save certificate', details: error.message }, { status: 500 })
    }

    console.log('✅ Certificate saved to Supabase:', data[0].id)
    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('❌ Error saving certificate:', error)
    return NextResponse.json({ error: 'Failed to save certificate', details: String(error) }, { status: 500 })
  }
}
