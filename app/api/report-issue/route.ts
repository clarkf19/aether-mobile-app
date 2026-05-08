import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient()

export async function GET() {
  try {
    console.log('🔍 Fetching all issue reports...')
    
    const { data, error } = await supabase
      .from('issue_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching issues:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✓ Fetched ${data?.length || 0} issue reports`)
    return NextResponse.json({ issues: data || [] }, { status: 200 })
  } catch (error) {
    console.error('❌ Server error:', error)
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      student_email,
      student_name,
      category,
      description,
      location,
      image_base64,
      severity = 'medium'
    } = body

    console.log('🔍 Attempting to submit issue report...')

    // Validate required fields
    if (!student_email || !category || !description || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('issue_reports')
      .insert({
        student_email,
        student_name: student_name || 'Anonymous',
        category,
        description,
        location,
        image_base64: image_base64 || null,
        severity,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✓ Issue report submitted successfully')
    return NextResponse.json({ 
      success: true, 
      message: 'Issue report submitted to HR',
      issue: data?.[0] 
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Server error:', error)
    return NextResponse.json(
      { error: 'Failed to submit issue report' },
      { status: 500 }
    )
  }
}
