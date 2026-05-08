import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const studentEmail = request.nextUrl.searchParams.get('email') || 'student@example.com'

    // Fetch unread notifications for student, sorted by most recent
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('student_email', studentEmail)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
    }, { status: 200 })
  } catch (error) {
    console.error('🔍 Error fetching notifications:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch notifications',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()

    const {
      student_email,
      division,
      title,
      description,
      type,
      priority = 'normal',
      source,
      related_id,
    } = body

    // Validate required fields
    if (!title || !description || !type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 })
    }

    // Insert notification
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          student_email,
          division,
          title,
          description,
          type,
          priority,
          source,
          related_id,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      notification: data?.[0],
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating notification:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create notification',
    }, { status: 500 })
  }
}

// Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { notification_id } = body

    if (!notification_id) {
      return NextResponse.json({
        success: false,
        error: 'notification_id required',
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification_id)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      notification: data?.[0],
    }, { status: 200 })
  } catch (error) {
    console.error('❌ Error updating notification:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update notification',
    }, { status: 500 })
  }
}
