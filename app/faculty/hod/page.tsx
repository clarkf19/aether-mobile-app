'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, LogOut, Zap, AlertCircle, BookOpen, DoorOpen } from 'lucide-react'
import RoleAwareCopilot from '@/components/RoleAwareCopilot'

interface Request {
  id: string
  studentName: string
  uid: string
  type: 'certificate' | 'room-booking' | 'attendance'
  status: 'pending' | 'approved' | 'rejected'
  description: string
}

export default function HODDashboard() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [requests, setRequests] = useState<Request[]>([])

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [copilotAction, setCopilotAction] = useState<string>('')

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail')
    if (!storedEmail || !storedEmail.includes('hod@')) {
      router.push('/')
    }
    setEmail(storedEmail || '')
    loadRequests()

    // Auto-refresh requests every 2 seconds
    const interval = setInterval(() => {
      loadRequests()
    }, 2000)

    return () => clearInterval(interval)
  }, [router])

  const handleApprove = async (id: string) => {
    const request = requests.find(r => r.id === id)
    if (!request) return

    try {
      let endpoint = ''
      if (request.type === 'certificate') {
        endpoint = `/api/approvals/certificates/${id}`
      } else if (request.type === 'leave') {
        endpoint = `/api/requests/leaves/${id}`
      } else if (request.type === 'room-booking') {
        endpoint = `/api/approvals/room-bookings/${id}`
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' })
        })
        
        if (response.ok) {
          setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' } : r))
        } else {
          console.error('Failed to approve request')
        }
      }
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleReject = async (id: string) => {
    const request = requests.find(r => r.id === id)
    if (!request) return

    try {
      let endpoint = ''
      if (request.type === 'certificate') {
        endpoint = `/api/approvals/certificates/${id}`
      } else if (request.type === 'leave') {
        endpoint = `/api/requests/leaves/${id}`
      } else if (request.type === 'room-booking') {
        endpoint = `/api/approvals/room-bookings/${id}`
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' })
        })
        
        if (response.ok) {
          setRequests(requests.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
        } else {
          console.error('Failed to reject request')
        }
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    router.push('/')
  }

  const loadRequests = async () => {
    try {
      const [certRes, leaveRes, roomRes] = await Promise.all([
        fetch('/api/requests/certificates'),
        fetch('/api/requests/leaves'),
        fetch('/api/requests/rooms')
      ])

      const certificateRequests = certRes.ok ? await certRes.json() : []
      const leaveRequests = leaveRes.ok ? await leaveRes.json() : []
      const roomBookings = roomRes.ok ? await roomRes.json() : []

      const convertedCertRequests = certificateRequests.map((request: any) => ({
        id: request.id,
        studentName: request.studentName,
        uid: 'STUDENT',
        type: 'certificate' as const,
        status: request.status === 'pending' ? 'pending' : (request.status === 'approved' ? 'approved' : 'rejected') as 'pending' | 'approved' | 'rejected',
        description: `${request.certificateType} - ${request.purpose}`,
      }))

      const convertedLeaveRequests = leaveRequests.map((request: any) => ({
        id: request.id,
        studentName: request.studentName,
        uid: 'STUDENT',
        type: 'leave' as const,
        status: request.status === 'pending' ? 'pending' : (request.status === 'approved' ? 'approved' : 'rejected') as 'pending' | 'approved' | 'rejected',
        description: `${request.leaveType} on ${request.date}`,
      }))

      const convertedRoomBookings = roomBookings.map((booking: any) => ({
        id: booking.id,
        studentName: booking.studentName,
        uid: 'STUDENT',
        type: 'room-booking' as const,
        status: booking.status === 'pending' ? 'pending' : (booking.status === 'approved' ? 'approved' : 'rejected') as 'pending' | 'approved' | 'rejected',
        description: `${booking.roomType} - ${booking.date} (${booking.startTime} to ${booking.endTime})`,
      }))

      const allRequests = [...convertedCertRequests, ...convertedLeaveRequests, ...convertedRoomBookings]
      setRequests(allRequests.length > 0 ? allRequests : [
        {
          id: 'mock-1',
          studentName: 'Aditya Kumar',
          uid: '2023300101',
          type: 'certificate',
          status: 'pending',
          description: 'Request for character certificate',
        },
      ])
    } catch (error) {
      console.error('Error loading requests:', error)
    }
  }

  const handleCopilotAction = (actionId: string) => {
    setCopilotAction(actionId)
    switch (actionId) {
      case 'show-pending':
        setFilterStatus('pending')
        break
      case 'approve-all-certs':
        setRequests(requests.map(r => 
          r.type === 'certificate' ? { ...r, status: 'approved' } : r
        ))
        break
      case 'pending-room':
        setFilterStatus('pending')
        break
      default:
        break
    }
  }

  const filteredRequests = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus)
  const pendingCount = requests.filter(r => r.status === 'pending').length
  const approvedCount = requests.filter(r => r.status === 'approved').length
  const rejectedCount = requests.filter(r => r.status === 'rejected').length

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'certificate':
        return <BookOpen className="w-5 h-5" />
      case 'leave':
        return <Zap className="w-5 h-5" />
      case 'room-booking':
        return <DoorOpen className="w-5 h-5" />
      case 'attendance':
        return <AlertCircle className="w-5 h-5" />
      default:
        return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'certificate':
        return 'Certificate Request'
      case 'leave':
        return 'Leave Request'
      case 'room-booking':
        return 'Room Booking'
      case 'attendance':
        return 'Attendance Issue'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'certificate':
        return 'bg-blue-50 border-blue-300'
      case 'leave':
        return 'bg-purple-50 border-purple-300'
      case 'room-booking':
        return 'bg-green-50 border-green-300'
      case 'attendance':
        return 'bg-orange-50 border-orange-300'
      default:
        return 'bg-gray-50 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white border-2 border-black p-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-black">HOD Dashboard</h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">Manage student requests and approvals</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 uppercase font-bold">Logged in as</p>
            <p className="text-lg font-bold text-black">{email}</p>
            <div className="mt-3 flex gap-2 flex-col">
              <button
                onClick={loadRequests}
                className="text-sm font-bold bg-black text-white px-4 py-2 border-2 border-black hover:shadow-md transition"
              >
                🔄 Refresh Requests
              </button>
              <button
                onClick={handleLogout}
                className="text-sm font-bold bg-black text-white px-4 py-2 border-2 border-black hover:shadow-md transition flex items-center gap-2 ml-auto"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border-2 border-black p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Pending</p>
              <p className="text-4xl font-black text-yellow-600">{pendingCount}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-yellow-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white border-2 border-black p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Approved</p>
              <p className="text-4xl font-black text-green-600">{approvedCount}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white border-2 border-black p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Rejected</p>
              <p className="text-4xl font-black text-red-600">{rejectedCount}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 border-2 border-black font-bold text-sm transition ${
                filterStatus === status
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="max-w-6xl mx-auto space-y-4">
        <h2 className="text-2xl font-black text-black mb-4">Pending Requests</h2>
        {filteredRequests.length === 0 ? (
          <div className="bg-white border-2 border-black p-8 text-center">
            <p className="text-gray-600 font-medium">No requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`bg-white border-2 border-black p-6 transition hover:shadow-lg ${getTypeColor(
                request.type
              )}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left Section */}
                <div className="md:col-span-6 flex gap-4">
                  <div className="bg-black text-white p-3 rounded flex items-center justify-center">
                    {getTypeIcon(request.type)}
                  </div>
                  <div>
                    <p className="text-lg font-black text-black">{request.studentName}</p>
                    <p className="text-xs text-gray-600 font-bold uppercase mb-1">UID: {request.uid}</p>
                    <p className="text-sm font-bold text-black">{getTypeLabel(request.type)}</p>
                    <p className="text-xs text-gray-700 mt-2">{request.description}</p>
                  </div>
                </div>

                {/* Right Section - Status & Actions */}
                <div className="md:col-span-6 flex flex-col justify-between">
                  <div className="mb-3">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-bold border-2 ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 border-yellow-400 text-yellow-900'
                          : request.status === 'approved'
                          ? 'bg-green-100 border-green-400 text-green-900'
                          : 'bg-red-100 border-red-400 text-red-900'
                      }`}
                    >
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={request.status !== 'pending'}
                      className="flex-1 bg-green-600 text-white py-2 px-3 border-2 border-black font-bold text-sm hover:shadow-md active:translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={request.status !== 'pending'}
                      className="flex-1 bg-red-600 text-white py-2 px-3 border-2 border-black font-bold text-sm hover:shadow-md active:translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4 inline mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Copilot */}
      <RoleAwareCopilot role="HOD" onAction={handleCopilotAction} />
    </div>
  )
}
