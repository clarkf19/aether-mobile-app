/**
 * MIGRATION GUIDE: From Polling to Real-Time
 * 
 * This shows how to update your existing components to use real-time data
 * instead of polling every 5 seconds.
 */

// ❌ OLD WAY (Polling - Still Works)
/*
export function OldApprovalComponent() {
  const [certificates, setCertificates] = useState([])

  useEffect(() => {
    const fetchCerts = async () => {
      const res = await fetch('/api/approvals/certificates?status=pending')
      const data = await res.json()
      setCertificates(data)
    }

    fetchCerts()
    const interval = setInterval(fetchCerts, 5000) // Polls every 5 seconds
    return () => clearInterval(interval)
  }, [])

  return <div>{certificates.map(cert => <div>{cert.certificate_type}</div>)}</div>
}
*/

// ✅ NEW WAY (Real-Time - Much Better!)
import { useRealtimeCertificateRequests } from '@/hooks/useRealtimeData'

export function NewApprovalComponent() {
  const { requests, loading, error } = useRealtimeCertificateRequests('pending')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {requests.map((cert) => (
        <div key={cert.id}>{cert.certificate_type}</div>
      ))}
    </div>
  )
}

// ============================================
// MIGRATION STEPS
// ============================================

/**
 * 1. Replace polling with real-time hooks:
 * 
 *    OLD: useEffect with setInterval and fetch
 *    NEW: useRealtimeCertificateRequests('pending')
 * 
 * 2. Benefits:
 *    - ✅ Instant updates (instead of 5 second delay)
 *    - ✅ Less network traffic
 *    - ✅ Lower server load
 *    - ✅ Better user experience
 * 
 * 3. Examples of hook replacements:
 * 
 *    Issue Reports:
 *    const { issues, loading, error } = useRealtimeIssueReports()
 *    
 *    Certificate Requests (with status filter):
 *    const { requests, loading, error } = useRealtimeCertificateRequests('pending')
 *    
 *    Room Bookings (with status filter):
 *    const { requests, loading, error } = useRealtimeRoomBookingRequests('pending')
 *    
 *    Leave Requests (with status filter):
 *    const { requests, loading, error } = useRealtimeLeaveRequests('pending')
 */

// ============================================
// COMPONENT MIGRATION EXAMPLE
// ============================================

'use client'

import { useState } from 'react'
import {
  useRealtimeCertificateRequests,
  useRealtimeRoomBookingRequests,
} from '@/hooks/useRealtimeData'

export default function ApprovalsComponent() {
  const [activeTab, setActiveTab] = useState('certificates')

  // Real-time data for certificates
  const { requests: certificates, loading: certLoading, error: certError } =
    useRealtimeCertificateRequests('pending')

  // Real-time data for room bookings
  const { requests: roomBookings, loading: roomLoading, error: roomError } =
    useRealtimeRoomBookingRequests('pending')

  if (certLoading || roomLoading) return <div>Loading...</div>
  if (certError || roomError) return <div>Error: {certError || roomError}</div>

  return (
    <div>
      <div className="tabs">
        <button onClick={() => setActiveTab('certificates')}>Certificates ({certificates.length})</button>
        <button onClick={() => setActiveTab('rooms')}>Room Bookings ({roomBookings.length})</button>
      </div>

      {activeTab === 'certificates' && (
        <div>
          {certificates.map((cert) => (
            <div key={cert.id} className="request-card">
              <h3>{cert.certificate_type}</h3>
              <p>Student: {cert.student_name}</p>
              <p>Purpose: {cert.purpose}</p>
              <p>Status: {cert.status}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'rooms' && (
        <div>
          {roomBookings.map((booking) => (
            <div key={booking.id} className="request-card">
              <h3>{booking.room_name}</h3>
              <p>Booking Date: {booking.booking_date}</p>
              <p>Time: {booking.start_time} - {booking.end_time}</p>
              <p>Status: {booking.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// IN MOBILE APP (React Native)
// ============================================

/**
 * For mobile, you'll need to use the fetch API directly since hooks
 * are for React web. Here's an example:
 */

/*
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export function MobileApprovalScreen() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Fetch initial data
    const fetchRequests = async () => {
      const res = await fetch(`${API_BASE_URL}/api/approvals/certificates?status=pending`);
      const data = await res.json();
      setRequests(data);
    };

    fetchRequests();

    // Optional: Poll every 5 seconds (will be replaced with real-time soon)
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View>
      {requests.map(req => (
        <View key={req.id}>
          <Text>{req.certificate_type}</Text>
          <Text>{req.student_name}</Text>
        </View>
      ))}
    </View>
  );
}
*/
