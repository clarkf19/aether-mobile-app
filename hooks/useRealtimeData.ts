'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Real-time hook for Issue Reports
 * Subscribes to all changes (INSERT, UPDATE, DELETE)
 */
export function useRealtimeIssueReports() {
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    const subscribeToChanges = async () => {
      try {
        // Initial fetch
        const { data, error: fetchError } = await supabase
          .from('issue_reports')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        setIssues(data || [])
        setLoading(false)

        // Set up real-time subscription
        channel = supabase
          .channel('issue_reports_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'issue_reports',
            },
            (payload) => {
              console.log('🔄 Issue report change:', payload)
              
              if (payload.eventType === 'INSERT') {
                setIssues((prev) => [payload.new, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                setIssues((prev) =>
                  prev.map((issue) =>
                    issue.id === payload.new.id ? payload.new : issue
                  )
                )
              } else if (payload.eventType === 'DELETE') {
                setIssues((prev) =>
                  prev.filter((issue) => issue.id !== payload.old.id)
                )
              }
            }
          )
          .subscribe()
      } catch (err) {
        console.error('❌ Error subscribing to issues:', err)
        setError(err instanceof Error ? err.message : 'Failed to subscribe')
      }
    }

    subscribeToChanges()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return { issues, loading, error }
}

/**
 * Real-time hook for Certificate Requests
 */
export function useRealtimeCertificateRequests(status?: string) {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    const subscribeToChanges = async () => {
      try {
        // Initial fetch
        let query = supabase.from('certificate_requests').select('*')
        if (status) {
          query = query.eq('status', status)
        }
        const { data, error: fetchError } = await query.order('created_at', {
          ascending: false,
        })

        if (fetchError) throw fetchError
        setRequests(data || [])
        setLoading(false)

        // Set up real-time subscription
        channel = supabase
          .channel('certificate_requests_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'certificate_requests',
            },
            (payload) => {
              console.log('🔄 Certificate request change:', payload)

              if (payload.eventType === 'INSERT') {
                if (!status || payload.new.status === status) {
                  setRequests((prev) => [payload.new, ...prev])
                }
              } else if (payload.eventType === 'UPDATE') {
                if (!status || payload.new.status === status) {
                  setRequests((prev) =>
                    prev
                      .map((req) =>
                        req.id === payload.new.id ? payload.new : req
                      )
                      .filter((req) => !status || req.status === status)
                  )
                } else {
                  setRequests((prev) =>
                    prev.filter((req) => req.id !== payload.new.id)
                  )
                }
              } else if (payload.eventType === 'DELETE') {
                setRequests((prev) =>
                  prev.filter((req) => req.id !== payload.old.id)
                )
              }
            }
          )
          .subscribe()
      } catch (err) {
        console.error('❌ Error subscribing to certificate requests:', err)
        setError(err instanceof Error ? err.message : 'Failed to subscribe')
      }
    }

    subscribeToChanges()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [status])

  return { requests, loading, error }
}

/**
 * Real-time hook for Room Booking Requests
 */
export function useRealtimeRoomBookingRequests(status?: string) {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    const subscribeToChanges = async () => {
      try {
        // Initial fetch
        let query = supabase.from('room_booking_requests').select('*')
        if (status) {
          query = query.eq('status', status)
        }
        const { data, error: fetchError } = await query.order('created_at', {
          ascending: false,
        })

        if (fetchError) throw fetchError
        setRequests(data || [])
        setLoading(false)

        // Set up real-time subscription
        channel = supabase
          .channel('room_bookings_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'room_booking_requests',
            },
            (payload) => {
              console.log('🔄 Room booking change:', payload)

              if (payload.eventType === 'INSERT') {
                if (!status || payload.new.status === status) {
                  setRequests((prev) => [payload.new, ...prev])
                }
              } else if (payload.eventType === 'UPDATE') {
                if (!status || payload.new.status === status) {
                  setRequests((prev) =>
                    prev
                      .map((req) =>
                        req.id === payload.new.id ? payload.new : req
                      )
                      .filter((req) => !status || req.status === status)
                  )
                } else {
                  setRequests((prev) =>
                    prev.filter((req) => req.id !== payload.new.id)
                  )
                }
              } else if (payload.eventType === 'DELETE') {
                setRequests((prev) =>
                  prev.filter((req) => req.id !== payload.old.id)
                )
              }
            }
          )
          .subscribe()
      } catch (err) {
        console.error('❌ Error subscribing to room bookings:', err)
        setError(err instanceof Error ? err.message : 'Failed to subscribe')
      }
    }

    subscribeToChanges()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [status])

  return { requests, loading, error }
}

/**
 * Real-time hook for Leave Requests
 */
export function useRealtimeLeaveRequests(status?: string) {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    const subscribeToChanges = async () => {
      try {
        // Initial fetch
        let query = supabase.from('leave_requests').select('*')
        if (status) {
          query = query.eq('status', status)
        }
        const { data, error: fetchError } = await query.order('created_at', {
          ascending: false,
        })

        if (fetchError) throw fetchError
        setRequests(data || [])
        setLoading(false)

        // Set up real-time subscription
        channel = supabase
          .channel('leave_requests_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'leave_requests',
            },
            (payload) => {
              console.log('🔄 Leave request change:', payload)

              if (payload.eventType === 'INSERT') {
                if (!status || payload.new.status === status) {
                  setRequests((prev) => [payload.new, ...prev])
                }
              } else if (payload.eventType === 'UPDATE') {
                if (!status || payload.new.status === status) {
                  setRequests((prev) =>
                    prev
                      .map((req) =>
                        req.id === payload.new.id ? payload.new : req
                      )
                      .filter((req) => !status || req.status === status)
                  )
                } else {
                  setRequests((prev) =>
                    prev.filter((req) => req.id !== payload.new.id)
                  )
                }
              } else if (payload.eventType === 'DELETE') {
                setRequests((prev) =>
                  prev.filter((req) => req.id !== payload.old.id)
                )
              }
            }
          )
          .subscribe()
      } catch (err) {
        console.error('❌ Error subscribing to leave requests:', err)
        setError(err instanceof Error ? err.message : 'Failed to subscribe')
      }
    }

    subscribeToChanges()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [status])

  return { requests, loading, error }
}

/**
 * Generic real-time hook for any table
 * Usage: useRealtimeTable('issue_reports', { status: 'open' })
 */
export function useRealtimeTable(
  tableName: string,
  filters?: Record<string, any>
) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel | null = null

    const subscribeToChanges = async () => {
      try {
        // Initial fetch
        let query = supabase.from(tableName).select('*')
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value)
          })
        }
        const { data: fetchedData, error: fetchError } = await query.order(
          'created_at',
          { ascending: false }
        )

        if (fetchError) throw fetchError
        setData(fetchedData || [])
        setLoading(false)

        // Set up real-time subscription
        channel = supabase
          .channel(`${tableName}_changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: tableName,
            },
            (payload) => {
              console.log(`🔄 ${tableName} change:`, payload)

              if (payload.eventType === 'INSERT') {
                setData((prev) => [payload.new, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                setData((prev) =>
                  prev.map((item) =>
                    item.id === payload.new.id ? payload.new : item
                  )
                )
              } else if (payload.eventType === 'DELETE') {
                setData((prev) =>
                  prev.filter((item) => item.id !== payload.old.id)
                )
              }
            }
          )
          .subscribe()
      } catch (err) {
        console.error(`❌ Error subscribing to ${tableName}:`, err)
        setError(err instanceof Error ? err.message : 'Failed to subscribe')
      }
    }

    subscribeToChanges()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [tableName, JSON.stringify(filters)])

  return { data, loading, error }
}
