/**
 * Backend Verification & Health Check
 * Run this to verify all backend connections are working
 */

import { createClient } from '@/lib/supabase'

export async function verifyBackendConnections() {
  const results = {
    supabase: { connected: false, tables: [] as string[], error: null as string | null },
    env: { hasRequiredVars: true, missing: [] as string[] }
  }

  // 1. Check Environment Variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'GEMINI_API_KEY'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  if (missingVars.length > 0) {
    results.env.hasRequiredVars = false
    results.env.missing = missingVars
  }

  // 2. Test Supabase Connection
  try {
    const supabase = createClient()
    
    // Try to fetch from each table
    const tables = [
      'issue_reports',
      'certificate_requests',
      'room_booking_requests',
      'leave_requests'
    ]

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (!error) {
          results.supabase.tables.push(`✓ ${table}`)
        } else {
          results.supabase.tables.push(`✗ ${table}: ${error.message}`)
        }
      } catch (err) {
        results.supabase.tables.push(`✗ ${table}: ${err}`)
      }
    }

    results.supabase.connected = true
  } catch (error) {
    results.supabase.connected = false
    results.supabase.error = error instanceof Error ? error.message : String(error)
  }

  return results
}

/**
 * Test Individual Endpoints
 */
export async function testApiEndpoints() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  
  const endpoints = [
    { method: 'GET', path: '/api/report-issue', name: 'Get Issues' },
    { method: 'GET', path: '/api/approvals/certificates', name: 'Get Certificates' },
    { method: 'GET', path: '/api/approvals/room-bookings', name: 'Get Room Bookings' },
    { method: 'GET', path: '/api/requests/leaves', name: 'Get Leaves' },
  ]

  const results = []

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      })

      results.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        status: response.status,
        ok: response.ok,
        error: response.ok ? null : await response.text()
      })
    } catch (error) {
      results.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        status: 0,
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  return results
}

/**
 * Test Form Submissions
 */
export async function testFormSubmissions() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  
  const testCases = [
    {
      name: 'Report Issue',
      path: '/api/report-issue',
      method: 'POST',
      payload: {
        student_email: 'test@example.com',
        student_name: 'Test Student',
        category: 'Infrastructure',
        description: 'Test issue description',
        location: 'Lab 101',
        severity: 'medium'
      }
    },
    {
      name: 'Certificate Request',
      path: '/api/approvals/certificates',
      method: 'POST',
      payload: {
        student_email: 'test@example.com',
        student_name: 'Test Student',
        student_id: 'SE2024001',
        certificate_type: 'Bonafide',
        purpose: 'Visa Application',
        date_required: new Date().toISOString()
      }
    }
  ]

  const results = []

  for (const testCase of testCases) {
    try {
      const response = await fetch(`${baseUrl}${testCase.path}`, {
        method: testCase.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.payload)
      })

      const responseText = await response.text()
      results.push({
        testCase: testCase.name,
        status: response.status,
        ok: response.ok,
        response: responseText ? JSON.parse(responseText) : null,
        error: response.ok ? null : responseText
      })
    } catch (error) {
      results.push({
        testCase: testCase.name,
        status: 0,
        ok: false,
        response: null,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  return results
}
