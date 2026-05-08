#!/usr/bin/env node

/**
 * Backend Test Script
 * 
 * Run this to verify your backend is working:
 * node test-backend.js
 * 
 * Or: npm install node-fetch (if not already installed)
 */

const BASE_URL = 'http://localhost:3000'

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(status, message, details = '') {
  const icons = {
    ✓: `${colors.green}✓${colors.reset}`,
    ✗: `${colors.red}✗${colors.reset}`,
    ⏳: `${colors.yellow}⏳${colors.reset}`,
    ℹ: `${colors.blue}ℹ${colors.reset}`,
  }

  console.log(
    `\n${icons[status]} ${colors.cyan}${message}${colors.reset}${details ? ` - ${details}` : ''}`
  )
}

async function testEndpoint(method, endpoint, body = null, expectedStatus = 200) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()

    if (response.status === expectedStatus || (expectedStatus === 200 && response.ok)) {
      log('✓', `${method} ${endpoint}`, `Status: ${response.status}`)
      console.log(`  ${colors.green}Response:${colors.reset}`, JSON.stringify(data, null, 2).slice(0, 200))
      return true
    } else {
      log('✗', `${method} ${endpoint}`, `Status: ${response.status} (expected ${expectedStatus})`)
      console.log(`  ${colors.red}Response:${colors.reset}`, JSON.stringify(data, null, 2))
      return false
    }
  } catch (error) {
    log('✗', `${method} ${endpoint}`, error.message)
    return false
  }
}

async function runTests() {
  console.log(`${colors.cyan}
╔════════════════════════════════════════╗
║     AETHER BACKEND TEST SUITE          ║
║     Testing all API endpoints          ║
╚════════════════════════════════════════╝${colors.reset}`)

  console.log(`\n${colors.yellow}Testing connection to: ${BASE_URL}${colors.reset}`)

  let passed = 0
  let failed = 0

  // Test Issue Reports
  console.log(`\n${colors.cyan}═══ Issue Reports API ═══${colors.reset}`)
  if (await testEndpoint('GET', '/api/report-issue')) passed++
  else failed++

  if (
    await testEndpoint('POST', '/api/report-issue', {
      student_email: 'test@university.edu',
      student_name: 'Test User',
      category: 'infrastructure',
      description: 'Test issue from automation script',
      location: 'Building A, Room 101',
      severity: 'low',
    })
  )
    passed++
  else failed++

  // Test Certificate Requests
  console.log(`\n${colors.cyan}═══ Certificate Requests API ═══${colors.reset}`)
  if (await testEndpoint('GET', '/api/approvals/certificates?status=pending')) passed++
  else failed++

  if (
    await testEndpoint('POST', '/api/approvals/certificates', {
      student_email: 'test@university.edu',
      student_name: 'Test User',
      student_id: 'CSE-2021-001',
      certificate_type: 'Transfer Certificate',
      purpose: 'Higher studies',
      date_required: '2026-05-15',
    })
  )
    passed++
  else failed++

  // Test Room Booking Requests
  console.log(`\n${colors.cyan}═══ Room Booking Requests API ═══${colors.reset}`)
  if (await testEndpoint('GET', '/api/approvals/room-bookings?status=pending')) passed++
  else failed++

  if (
    await testEndpoint('POST', '/api/approvals/room-bookings', {
      student_email: 'test@university.edu',
      student_name: 'Test User',
      room_id: 'LT-101',
      room_name: 'Lecture Hall 101',
      booking_date: '2026-05-20',
      start_time: '14:00',
      end_time: '16:00',
      purpose: 'Seminar',
      expected_attendees: 50,
    })
  )
    passed++
  else failed++

  // Test Leave Requests
  console.log(`\n${colors.cyan}═══ Leave Requests API ═══${colors.reset}`)
  if (await testEndpoint('GET', '/api/requests/leaves')) passed++
  else failed++

  if (
    await testEndpoint('POST', '/api/requests/leaves', {
      student_email: 'test@university.edu',
      student_name: 'Test User',
      leave_type: 'casual',
      reason: 'Medical appointment',
      start_date: '2026-05-15',
      end_date: '2026-05-17',
    })
  )
    passed++
  else failed++

  // Summary
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║            TEST SUMMARY                ║${colors.reset}`)
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`)

  console.log(`\n  ${colors.green}✓ Passed: ${passed}${colors.reset}`)
  console.log(`  ${colors.red}✗ Failed: ${failed}${colors.reset}`)
  console.log(`  Total:  ${passed + failed}`)

  if (failed === 0) {
    console.log(
      `\n${colors.green}✨ All tests passed! Your backend is working correctly! ✨${colors.reset}\n`
    )
    process.exit(0)
  } else {
    console.log(
      `\n${colors.red}❌ Some tests failed. Check the backend connection and try again.${colors.reset}\n`
    )
    process.exit(1)
  }
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error)
  process.exit(1)
})
