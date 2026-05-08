#!/usr/bin/env node

/**
 * Backend Testing & Debugging Utility
 * Usage: node backend-test.js
 */

const baseUrl = process.env.API_URL || 'http://localhost:3000'

async function testEndpoint(method, path, data = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    }
    
    if (data) {
      options.body = JSON.stringify(data)
    }

    console.log(`\n📍 Testing: ${method} ${path}`)
    const response = await fetch(`${baseUrl}${path}`, options)
    const responseData = await response.json()

    if (response.ok) {
      console.log(`✅ Status: ${response.status}`)
      console.log(`✅ Response:`, JSON.stringify(responseData, null, 2))
    } else {
      console.log(`❌ Status: ${response.status}`)
      console.log(`❌ Error:`, JSON.stringify(responseData, null, 2))
    }

    return response.ok
  } catch (error) {
    console.error(`❌ Error:`, error.message)
    return false
  }
}

async function runTests() {
  console.log('🧪 Starting Backend Health Check...\n')

  // Test 1: Report Issue
  console.log('\n=== TEST 1: Report Issue Submission ===')
  await testEndpoint('POST', '/api/report-issue', {
    student_email: 'test@example.com',
    student_name: 'Test Student',
    category: 'Infrastructure',
    description: 'Test issue - please ignore',
    location: 'Lab 101',
    severity: 'medium'
  })

  // Test 2: Get Issues
  console.log('\n=== TEST 2: Get All Issues ===')
  await testEndpoint('GET', '/api/report-issue')

  // Test 3: Certificate Request
  console.log('\n=== TEST 3: Certificate Request Submission ===')
  await testEndpoint('POST', '/api/approvals/certificates', {
    student_email: 'test@example.com',
    student_name: 'Test Student',
    student_id: 'SE2024001',
    certificate_type: 'Bonafide',
    purpose: 'Test Request',
    date_required: new Date().toISOString()
  })

  // Test 4: Get Certificates
  console.log('\n=== TEST 4: Get All Certificate Requests ===')
  await testEndpoint('GET', '/api/approvals/certificates?status=pending')

  // Test 5: Leave Request
  console.log('\n=== TEST 5: Leave Request Submission ===')
  await testEndpoint('POST', '/api/requests/leaves', {
    student_email: 'test@example.com',
    student_name: 'Test Student',
    leave_type: 'Medical',
    reason: 'Test leave request',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 86400000).toISOString()
  })

  // Test 6: Get Leaves
  console.log('\n=== TEST 6: Get All Leave Requests ===')
  await testEndpoint('GET', '/api/requests/leaves')

  console.log('\n✅ Backend tests complete!')
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
