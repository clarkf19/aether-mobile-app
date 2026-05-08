'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Users, MapPin, Zap, ChevronRight, X, Download, Send, Edit2 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { timeToMinutes, type RoomBookedSlot } from '@/lib/room-booking-utils'

interface Room {
  id: string
  name: string
  type: string
  capacity: number
}

interface SuggestedRoom extends Room {
  reason?: string
}

export default function ApprovalsContent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'certificate' | 'room'>('certificate')
  const [showDocumentPreview, setShowDocumentPreview] = useState(false)
  const [previewType, setPreviewType] = useState<'certificate' | 'room' | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookedTimes, setBookedTimes] = useState<RoomBookedSlot[]>([])
  const [loading, setLoading] = useState(false)
  
  const [certificateForm, setCertificateForm] = useState({
    type: '',
    purpose: '',
    date: ''
  })
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [showRoomDetail, setShowRoomDetail] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: ''
  })
  const [bookingConflict, setBookingConflict] = useState<{ conflict: boolean; message: string; suggestedRooms: SuggestedRoom[] }>({ conflict: false, message: '', suggestedRooms: [] })
  const [submitted, setSubmitted] = useState(false)
  const [submittedType, setSubmittedType] = useState<'certificate' | 'room' | null>(null)

  // HOD Approvals state
  const [isHOD, setIsHOD] = useState(false)
  const [pendingCertificates, setPendingCertificates] = useState<any[]>([])
  const [pendingRoomBookings, setPendingRoomBookings] = useState<any[]>([])
  const [hodComment, setHodComment] = useState('')
  const [selectedApproval, setSelectedApproval] = useState<any>(null)
  const [approvalsLoading, setApprovalsLoading] = useState(false)

  // Load rooms from Supabase
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await fetch('/api/requests/rooms/data')
        const data = await response.json()
        setRooms(data.rooms || [])
      } catch (error) {
        console.error('Error loading rooms:', error)
      }
    }
    loadRooms()
  }, [])

  // Load booked times when room or date changes
  useEffect(() => {
    const loadBookedTimes = async () => {
      if (!selectedRoom || !bookingForm.date) {
        setBookedTimes([])
        return
      }
      setLoading(true)
      try {
        const response = await fetch(`/api/requests/rooms/availability?roomId=${selectedRoom}&date=${bookingForm.date}`)
        if (!response.ok) {
          throw new Error('Failed to load room availability')
        }
        const data = await response.json()
        setBookedTimes(data.bookedSlots || [])
      } catch (error) {
        console.error('Error loading booked times:', error)
        setBookedTimes([])
      } finally {
        setLoading(false)
      }
    }
    loadBookedTimes()
  }, [selectedRoom, bookingForm.date])

  useEffect(() => {
    setBookingConflict({ conflict: false, message: '', suggestedRooms: [] })
  }, [selectedRoom, bookingForm.date, bookingForm.startTime, bookingForm.endTime])

  // Load pending approvals for HOD
  useEffect(() => {
    if (!isHOD) return

    const loadApprovals = async () => {
      setApprovalsLoading(true)
      try {
        const [certRes, bookingRes] = await Promise.all([
          fetch('/api/approvals/certificates?status=pending'),
          fetch('/api/approvals/room-bookings?status=pending')
        ])

        const certData = await certRes.json()
        const bookingData = await bookingRes.json()

        console.log('📋 Certificate Requests:', certData)
        console.log('📋 Room Booking Requests:', bookingData)

        setPendingCertificates(certData.requests || [])
        setPendingRoomBookings(bookingData.requests || [])
      } catch (error) {
        console.error('❌ Error loading approvals:', error)
        alert('Error loading pending requests. Make sure SQL schema is executed in Supabase.')
      } finally {
        setApprovalsLoading(false)
      }
    }

    loadApprovals()
    const interval = setInterval(loadApprovals, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [isHOD])

  const handleCertificateChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setCertificateForm(prev => ({ ...prev, [name]: value }))
  }

  const handleBookingChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setBookingForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSuggestedRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId)
    setBookingConflict({ conflict: false, message: '', suggestedRooms: [] })
  }

  const handleHODApproval = async (id: string, type: 'certificate' | 'room', status: 'approved' | 'rejected') => {
    try {
      const endpoint = type === 'certificate' ? `/api/approvals/certificates/${id}` : `/api/approvals/room-bookings/${id}`
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          hod_comment: hodComment
        })
      })

      const responseData = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(responseData?.message || responseData?.error || 'Failed to update approval status')
      }

      // Refresh the list
      if (type === 'certificate') {
        setPendingCertificates(prev => prev.filter(c => c.id !== id))
      } else {
        setPendingRoomBookings(prev => prev.filter(r => r.id !== id))
      }

      setSelectedApproval(null)
      setHodComment('')
      alert(`Request ${status}!`)
    } catch (error) {
      console.error('Error updating approval:', error)
      alert('Error updating approval status')
    }
  }

  const getRoomBackgroundColor = (roomId: string) => {
    const colorMap: { [key: string]: string } = {
      'lab-101a': 'bg-gradient-to-br from-rose-100 to-rose-200',
      'lab-101b': 'bg-gradient-to-br from-amber-100 to-amber-200',
      'classroom-201': 'bg-gradient-to-br from-emerald-100 to-emerald-200',
      'classroom-202': 'bg-gradient-to-br from-sky-100 to-sky-200',
      'classroom-203': 'bg-gradient-to-br from-purple-100 to-purple-200'
    }
    return colorMap[roomId] || 'bg-gradient-to-br from-gray-100 to-gray-200'
  }

  const handleCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!certificateForm.type || !certificateForm.purpose || !certificateForm.date) {
      alert('Please fill in all certificate details')
      return
    }

    try {
      // Save to Supabase for HOD approval
      const payload = {
        student_email: 'student@example.com',
        student_name: 'Anjali Shah',
        student_id: 'BCA-2024-001',
        certificate_type: certificateForm.type,
        purpose: certificateForm.purpose,
        date_required: certificateForm.date
      }
      
      console.log('📤 Submitting certificate:', payload)
      
      const response = await fetch('/api/approvals/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const responseData = await response.json()
      console.log('📬 Certificate response:', responseData, 'Status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed: ${responseData.error || 'Unknown error'}`)
      }

      setShowDocumentPreview(true)
      setPreviewType('certificate')
    } catch (error) {
      console.error('❌ Error submitting certificate:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to submit'}`)
    }
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingConflict({ conflict: false, message: '', suggestedRooms: [] })
    
    if (!selectedRoom || !bookingForm.date || !bookingForm.startTime || !bookingForm.endTime) {
      alert('Please fill in all booking details')
      return
    }

    try {
      const roomName = rooms.find(r => r.id === selectedRoom)?.name || 'Unknown Room'
      const startMinutes = timeToMinutes(bookingForm.startTime)
      const endMinutes = timeToMinutes(bookingForm.endTime)
      const expectedAttendees = parseInt(bookingForm.attendees) || 0

      if (endMinutes <= startMinutes) {
        alert('End time must be after start time')
        return
      }

      const availabilityResponse = await fetch('/api/requests/rooms/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom,
          roomName,
          date: bookingForm.date,
          startTime: bookingForm.startTime,
          endTime: bookingForm.endTime,
          expectedAttendees,
        }),
      })
      const availabilityData = await availabilityResponse.json()

      if (!availabilityResponse.ok) {
        throw new Error(availabilityData.error || 'Failed to check room availability')
      }

      if (!availabilityData.available) {
        setBookingConflict({
          conflict: true,
          message: availabilityData.message || `${roomName} is not available for that time.`,
          suggestedRooms: availabilityData.suggestedRooms || [],
        })
        return
      }
      
      const payload = {
        student_email: 'student@example.com',
        student_name: 'Anjali Shah',
        room_id: selectedRoom,
        room_name: roomName,
        booking_date: bookingForm.date,
        start_time: bookingForm.startTime,
        end_time: bookingForm.endTime,
        purpose: bookingForm.purpose,
        expected_attendees: expectedAttendees
      }
      
      console.log('📤 Submitting room booking:', payload)
      
      // Save to Supabase for HOD approval
      const response = await fetch('/api/approvals/room-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const responseData = await response.json()
      console.log('📬 Room booking response:', responseData, 'Status:', response.status)

      if (!response.ok) {
        if (response.status === 409) {
          setBookingConflict({
            conflict: true,
            message: responseData.message || 'This room is already booked for the selected time.',
            suggestedRooms: responseData.suggestedRooms || [],
          })
          return
        }

        throw new Error(`Failed: ${responseData.error || 'Unknown error'}`)
      }

      setShowDocumentPreview(true)
      setPreviewType('room')
    } catch (error) {
      console.error('❌ Error submitting booking:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to submit'}`)
    }
  }

  const handleDownloadPDF = async (type: 'certificate' | 'room') => {
    try {
      const { generatePDF } = await import('@/lib/pdf-generator')
      await generatePDF(
        type,
        type === 'certificate' ? certificateForm : undefined,
        type === 'room' ? bookingForm : undefined,
        type === 'room' ? rooms.find(r => r.id === selectedRoom) : null
      )
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF')
    }
  }

  const handleFinalSubmit = () => {
    setSubmitted(true)
    setSubmittedType(previewType)
    setShowDocumentPreview(false)
    setIsEditing(false)
  }

  const ContentWrapper = ({ children, maxWidth = 'max-w-4xl' }: { children: React.ReactNode, maxWidth?: string }) => (
    <div className="flex h-screen overflow-hidden bg-amber-50">
      <Sidebar />
      <div className="flex-1 overflow-auto" style={{
        background: 'linear-gradient(180deg, #EAF4FF 0%, #F5FAFF 50%, #FFFFFF 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <div className={`${maxWidth} mx-auto p-6 space-y-6`}>
          {children}
        </div>
      </div>
    </div>
  )

  // DOCUMENT PREVIEW MODAL
  if (showDocumentPreview && previewType) {
    const isRoomBooking = previewType === 'room'
    const selectedRoomData = rooms.find(r => r.id === selectedRoom)

    return (
      <ContentWrapper maxWidth="max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black">Document Preview</h2>
            <button
              onClick={() => {
                setShowDocumentPreview(false)
                setIsEditing(false)
              }}
              className="p-2 hover:bg-gray-100 border-2 border-black"
            >
              <X size={20} />
            </button>
          </div>

          {/* Document Preview */}
          <div className="bg-white border-2 border-black p-12 shadow-md min-h-96 space-y-6">
            <div className="text-center space-y-2 border-b-2 border-black pb-6">
              <h3 className="text-2xl font-black text-black">BHAVAN'S CAMPUS</h3>
              <p className="text-sm text-gray-600">Andheri West, Mumbai</p>
            </div>

            <h4 className="text-xl font-bold text-center text-black">
              {isRoomBooking ? 'ROOM BOOKING REQUEST' : 'CERTIFICATE REQUEST'}
            </h4>

            <div className="space-y-3 text-sm">
              {isRoomBooking ? (
                <>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Room Name:</span>
                    <span className="font-bold text-black">{selectedRoomData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Capacity:</span>
                    <span className="font-bold text-black">{selectedRoomData?.capacity} persons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Booking Date:</span>
                    <span className="font-bold text-black">{bookingForm.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Time:</span>
                    <span className="font-bold text-black">{bookingForm.startTime} - {bookingForm.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Purpose:</span>
                    <span className="font-bold text-black">{bookingForm.purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Expected Attendees:</span>
                    <span className="font-bold text-black">{bookingForm.attendees}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Certificate Type:</span>
                    <span className="font-bold text-black">{certificateForm.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Purpose:</span>
                    <span className="font-bold text-black">{certificateForm.purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Date Required:</span>
                    <span className="font-bold text-black">{certificateForm.date}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-t-2 border-black pt-3 mt-3">
                <span className="font-semibold text-gray-700">Request Date:</span>
                <span className="font-bold text-black">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Student ID:</span>
                <span className="font-bold text-black">BCA-2024-001</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Student Name:</span>
                <span className="font-bold text-black">Anjali Shah</span>
              </div>
            </div>

            <div className="text-center pt-6 border-t-2 border-black">
              <p className="text-xs text-gray-500">This is an automatically generated document from AETHER Campus OS</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                setShowDocumentPreview(false)
                setIsEditing(false)
              }}
              className="border-2 border-black bg-white text-black p-4 font-bold hover:shadow-md active:translate-y-1 transition flex items-center justify-center gap-2"
            >
              <Edit2 size={18} />
              <span className="hidden sm:inline">Edit</span>
            </button>
            
            <button
              onClick={() => handleDownloadPDF(previewType)}
              className="border-2 border-black bg-white text-black p-4 font-bold hover:shadow-md active:translate-y-1 transition flex items-center justify-center gap-2"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={handleFinalSubmit}
              className="border-2 border-black bg-black text-white p-4 font-bold hover:shadow-md active:translate-y-1 transition flex items-center justify-center gap-2"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Submit</span>
            </button>
          </div>
      </ContentWrapper>
    )
  }

  if (submitted && submittedType === 'certificate') {
    return (
      <ContentWrapper maxWidth="max-w-2xl">
        <div className="bg-white border-2 border-black p-8 shadow-md space-y-6 text-center">
            <CheckCircle size={64} className="text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-black">Certificate Request Submitted</h2>
            
            <div className="bg-blue-50 border-2 border-black p-6 space-y-3 text-left">
              <p className="font-bold text-black uppercase text-xs">Request Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Certificate Type:</span>
                  <span className="font-bold text-black">{certificateForm.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Purpose:</span>
                  <span className="font-bold text-black">{certificateForm.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-bold text-black">{certificateForm.date}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-400 p-4">
              <p className="font-bold text-black">Request sent to HOD</p>
              <p className="text-sm text-gray-600 mt-1">You will receive your certificate within 5-7 working days</p>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full bg-black text-white py-3 font-bold hover:shadow-lg"
            >
              Back to Home
            </button>
          </div>
      </ContentWrapper>
    )
  }

  if (submitted && submittedType === 'room') {
    return (
      <ContentWrapper maxWidth="max-w-2xl">
        <div className="bg-white border-2 border-black p-8 shadow-md space-y-6 text-center">
            <CheckCircle size={64} className="text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-black">Booking Confirmed</h2>
            
            <div className="bg-blue-50 border-2 border-black p-6 space-y-3 text-left">
              <p className="font-bold text-black uppercase text-xs">Booking Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-bold text-black">{rooms.find(r => r.id === selectedRoom)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-bold text-black">{bookingForm.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-bold text-black">{bookingForm.startTime} - {bookingForm.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Purpose:</span>
                  <span className="font-bold text-black">{bookingForm.purpose}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-400 p-4">
              <p className="font-bold text-black">Booking request sent to HOD</p>
              <p className="text-sm text-gray-600 mt-1">Confirmation will be sent to your email within 2 hours</p>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full bg-black text-white py-3 font-bold hover:shadow-lg"
            >
              Back to Home
            </button>
          </div>
      </ContentWrapper>
    )
  }

  return (
    <ContentWrapper maxWidth="max-w-6xl">
<div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 border-2 border-black"
          >
            <ArrowLeft size={20} className="text-black" />
          </button>
          <h1 className="text-3xl font-bold text-black">Approvals {isHOD ? '(HOD View)' : ''}</h1>
          <button
            onClick={() => setIsHOD(!isHOD)}
            className={`px-4 py-2 font-bold border-2 border-black whitespace-nowrap ${
              isHOD
                ? 'bg-emerald-100 text-black'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            {isHOD ? 'Student View' : 'HOD View'}
          </button>
        </div>

        {isHOD ? (
          // HOD APPROVAL VIEW
          <div className="space-y-6">
            {/* Debug Info Panel */}
            <div className="bg-yellow-50 border-4 border-yellow-400 p-4 rounded">
              <p className="font-bold text-black mb-2">🔍 DEBUG INFO:</p>
              <div className="text-sm font-mono bg-black text-yellow-300 p-3 rounded overflow-auto max-h-40 whitespace-pre-wrap">
                <p>• Pending Certificates: {pendingCertificates.length}</p>
                <p>• Pending Room Bookings: {pendingRoomBookings.length}</p>
                <p>• Loading: {approvalsLoading ? 'Yes' : 'No'}</p>
                <p>• Certificates Data: {JSON.stringify(pendingCertificates.slice(0, 1), null, 2)}</p>
                <p>• Room Bookings Data: {JSON.stringify(pendingRoomBookings.slice(0, 1), null, 2)}</p>
              </div>
            </div>

            <button
              onClick={async () => {
                console.log('🔄 Manual refresh clicked')
                setApprovalsLoading(true)
                try {
                  const [certRes, bookingRes] = await Promise.all([
                    fetch('/api/approvals/certificates?status=pending'),
                    fetch('/api/approvals/room-bookings?status=pending')
                  ])

                  const certData = await certRes.json()
                  const bookingData = await bookingRes.json()

                  console.log('✅ Refreshed - Certs:', certData, 'Bookings:', bookingData)

                  setPendingCertificates(certData.requests || [])
                  setPendingRoomBookings(bookingData.requests || [])
                  alert(`Loaded: ${certData.requests?.length || 0} certificates, ${bookingData.requests?.length || 0} room bookings`)
                } catch (error) {
                  console.error('❌ Refresh failed:', error)
                  alert('Refresh failed: ' + (error instanceof Error ? error.message : String(error)))
                } finally {
                  setApprovalsLoading(false)
                }
              }}
              className="px-4 py-2 bg-sky-100 text-black font-bold border-2 border-black hover:shadow-md"
            >
              🔄 Manual Refresh
            </button>

            {approvalsLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600 font-semibold">Loading requests...</p>
              </div>
            ) : (
              <>
                {/* Certificate Requests */}
                <div className="bg-white border-2 border-black p-6 shadow-md">
                  <h2 className="text-2xl font-bold text-black mb-4">Certificate Requests ({pendingCertificates.length})</h2>
                  {pendingCertificates.length === 0 ? (
                    <p className="text-gray-600">No pending certificate requests</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingCertificates.map((cert) => (
                        <div key={cert.id} className="border-2 border-black p-4 bg-rose-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-black">{cert.student_name}</p>
                              <p className="text-sm text-gray-600">{cert.student_email}</p>
                            </div>
                            <p className="text-sm font-bold text-black bg-rose-100 px-2 py-1">{cert.certificate_type}</p>
                          </div>
                          <p className="text-sm mb-2"><span className="font-semibold">Purpose:</span> {cert.purpose}</p>
                          <p className="text-sm mb-3"><span className="font-semibold">Date Required:</span> {cert.date_required}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleHODApproval(cert.id, 'certificate', 'approved')}
                              className="flex-1 bg-green-500 text-white py-2 font-bold border-2 border-green-600 hover:shadow-md"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleHODApproval(cert.id, 'certificate', 'rejected')}
                              className="flex-1 bg-red-500 text-white py-2 font-bold border-2 border-red-600 hover:shadow-md"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Room Booking Requests */}
                <div className="bg-white border-2 border-black p-6 shadow-md">
                  <h2 className="text-2xl font-bold text-black mb-4">Room Booking Requests ({pendingRoomBookings.length})</h2>
                  {pendingRoomBookings.length === 0 ? (
                    <p className="text-gray-600">No pending room booking requests</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingRoomBookings.map((booking) => (
                        <div key={booking.id} className="border-2 border-black p-4 bg-sky-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-black">{booking.student_name}</p>
                              <p className="text-sm text-gray-600">{booking.student_email}</p>
                            </div>
                            <p className="text-sm font-bold text-black bg-sky-100 px-2 py-1">{booking.room_name}</p>
                          </div>
                          <p className="text-sm mb-1"><span className="font-semibold">Date:</span> {booking.booking_date}</p>
                          <p className="text-sm mb-1"><span className="font-semibold">Time:</span> {booking.start_time} - {booking.end_time}</p>
                          <p className="text-sm mb-3"><span className="font-semibold">Purpose:</span> {booking.purpose} ({booking.expected_attendees} attendees)</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleHODApproval(booking.id, 'room', 'approved')}
                              className="flex-1 bg-green-500 text-white py-2 font-bold border-2 border-green-600 hover:shadow-md"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleHODApproval(booking.id, 'room', 'rejected')}
                              className="flex-1 bg-red-500 text-white py-2 font-bold border-2 border-red-600 hover:shadow-md"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          // STUDENT VIEW
          <>
        <div className="flex gap-3 border-b-2 border-black">
          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-6 py-3 font-bold border-2 border-black ${
              activeTab === 'certificate'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            Certificate Request
          </button>
          <button
            onClick={() => setActiveTab('room')}
            className={`px-6 py-3 font-bold border-2 border-black ${
              activeTab === 'room'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            Room Booking
          </button>
        </div>

        {activeTab === 'certificate' && (
          <div className="bg-white border-2 border-black p-8 shadow-md">
            <form onSubmit={handleCertificateSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase">Certificate Type</label>
                <select
                  name="type"
                  value={certificateForm.type}
                  onChange={handleCertificateChange}
                  required
                  className="w-full border-2 border-black p-3 font-semibold text-black"
                >
                  <option value="">Select Certificate Type</option>
                  <option value="Character Certificate">Character Certificate</option>
                  <option value="Bonafide Certificate">Bonafide Certificate</option>
                  <option value="Completion Certificate">Completion Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase">Purpose</label>
                <input
                  type="text"
                  name="purpose"
                  value={certificateForm.purpose}
                  onChange={handleCertificateChange}
                  placeholder="e.g., Higher Education, Job Application"
                  required
                  className="w-full border-2 border-black p-3 font-semibold text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase">Date Required</label>
                <input
                  type="date"
                  name="date"
                  value={certificateForm.date}
                  onChange={handleCertificateChange}
                  required
                  className="w-full border-2 border-black p-3 font-semibold text-black"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4 font-bold text-lg hover:shadow-lg active:translate-y-1 transition"
              >
                Review & Submit
              </button>
            </form>
          </div>
        )}

        {activeTab === 'room' && (
          <div className="space-y-6">
            {!showRoomDetail ? (
              <>
                {/* Room List */}
                <div className="bg-white border-2 border-black p-8 shadow-md">
                  <h3 className="text-lg font-black text-black mb-6">Select a Room</h3>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 font-semibold">Loading rooms...</p>
                    </div>
                  ) : rooms.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 font-semibold">No rooms available</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rooms.map(room => (
                        <button
                          key={room.id}
                          onClick={() => {
                            setSelectedRoom(room.id)
                            setShowRoomDetail(true)
                            setBookingForm({ date: '', startTime: '', endTime: '', purpose: '', attendees: '' })
                          }}
                          className="text-left border-2 border-black shadow-md hover:shadow-lg hover:scale-105 transition-transform overflow-hidden"
                        >
                          {/* Room Image/Color Section */}
                          <div className={`${getRoomBackgroundColor(room.id)} h-32 p-4 flex items-center justify-center relative`}>
                            <div className="text-center">
                              <p className="text-3xl font-black text-gray-700 opacity-30">{room.type.toUpperCase().charAt(0)}</p>
                            </div>
                          </div>

                          {/* Room Info Section */}
                          <div className="bg-white p-4 space-y-2">
                            <div>
                              <h4 className="font-black text-black text-base">{room.name}</h4>
                              <p className="text-xs text-gray-600 mt-1 uppercase font-semibold">{room.type}</p>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-bold text-black pt-2 border-t border-gray-200">
                              <Users size={16} />
                              <span>Capacity: {room.capacity} people</span>
                            </div>

                            <div className="flex items-center gap-2 font-bold text-black text-sm pt-2">
                              <span>Book Now</span>
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Room Booking Form */}
                <button
                  onClick={() => setShowRoomDetail(false)}
                  className="p-2 hover:bg-gray-100 border-2 border-black w-fit flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Back to Rooms
                </button>

                <div className="border-2 border-black p-8 shadow-md bg-white">
                  <h2 className="text-2xl font-black text-black mb-2">{rooms.find(r => r.id === selectedRoom)?.name}</h2>
                  <p className="text-sm font-semibold text-gray-700 mb-6">
                    Capacity: {rooms.find(r => r.id === selectedRoom)?.capacity} • Type: {rooms.find(r => r.id === selectedRoom)?.type}
                  </p>

                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    {/* Date */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2 uppercase">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={bookingForm.date}
                        onChange={handleBookingChange}
                        required
                        className="w-full border-2 border-black p-3 font-semibold text-black"
                      />
                    </div>

                    {/* Booked Times Display */}
                    {bookingForm.date && bookedTimes.length > 0 && (
                      <div className="bg-amber-50 border-2 border-amber-400 p-4">
                        <p className="text-sm font-bold text-amber-900 mb-2">Booked Times:</p>
                        <div className="space-y-1">
                          {bookedTimes.map((slot, idx) => (
                            <p key={idx} className="text-xs text-amber-800">
                              🔴 {slot.start} - {slot.end} {slot.type === 'class' ? `(Class: ${slot.studentName})` : `(Booked by ${slot.studentName})`}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {bookingConflict.conflict && (
                      <div className="bg-red-50 border-2 border-red-400 p-4">
                        <p className="text-sm font-bold text-red-900 mb-1">Time Conflict</p>
                        <p className="text-sm text-red-800">{bookingConflict.message}</p>
                        {bookingConflict.suggestedRooms.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <p className="text-sm font-bold text-red-900">Try one of these similar available rooms:</p>
                            {bookingConflict.suggestedRooms.map((room) => (
                              <button
                                key={room.id}
                                type="button"
                                onClick={() => handleSuggestedRoomSelect(room.id)}
                                className="w-full border-2 border-emerald-500 bg-emerald-50 p-3 text-left hover:bg-emerald-100 transition"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-bold text-black">{room.name}</p>
                                    <p className="text-xs text-gray-700 uppercase">{room.type} • Capacity {room.capacity}</p>
                                    {room.reason && (
                                      <p className="text-xs text-emerald-800 mt-1">{room.reason}</p>
                                    )}
                                  </div>
                                  <span className="text-xs font-bold text-emerald-900">Check This Room</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        {bookingConflict.suggestedRooms.length === 0 && (
                          <p className="text-xs text-red-700 mt-3">No similar rooms are free for this exact time right now.</p>
                        )}
                      </div>
                    )}

                    {/* Start Time */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2 uppercase">Start Time</label>
                      <input
                        type="time"
                        name="startTime"
                        value={bookingForm.startTime}
                        onChange={handleBookingChange}
                        required
                        className="w-full border-2 border-black p-3 font-semibold text-black"
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2 uppercase">End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={bookingForm.endTime}
                        onChange={handleBookingChange}
                        required
                        className="w-full border-2 border-black p-3 font-semibold text-black"
                      />
                    </div>

                    {/* Purpose */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2 uppercase">Purpose</label>
                      <input
                        type="text"
                        name="purpose"
                        value={bookingForm.purpose}
                        onChange={handleBookingChange}
                        placeholder="e.g., Project Work, Seminar"
                        required
                        className="w-full border-2 border-black p-3 font-semibold text-black"
                      />
                    </div>

                    {/* Attendees */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2 uppercase">Expected Attendees</label>
                      <input
                        type="number"
                        name="attendees"
                        value={bookingForm.attendees}
                        onChange={handleBookingChange}
                        placeholder="Number of people"
                        required
                        min="1"
                        className="w-full border-2 border-black p-3 font-semibold text-black"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!bookingForm.date || !bookingForm.startTime || !bookingForm.endTime || !bookingForm.purpose || !bookingForm.attendees || bookingConflict.conflict}
                      className="w-full bg-black text-white py-3 font-bold text-lg hover:shadow-md active:translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Request Room
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}
        </>
        )}
    </ContentWrapper>
  )
}
