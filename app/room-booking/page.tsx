'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

interface Room {
  id: string
  name: string
  type: string
  capacity: number
}

interface SuggestedRoom extends Room {
  reason?: string
}

interface BookedSlot {
  start: string
  end: string
  startMinutes: number
  endMinutes: number
  studentName: string
  type: 'class' | 'booking'
}

export default function RoomBookingPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [formData, setFormData] = useState({
    roomId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [conflict, setConflict] = useState<{ message: string; suggestedRooms: SuggestedRoom[] } | null>(null)
  const [error, setError] = useState('')
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadRooms()
  }, [])

  useEffect(() => {
    if (formData.roomId && formData.date) {
      fetchBookedSlots(formData.roomId, formData.date)
    } else {
      setBookedSlots([])
    }
  }, [formData.roomId, formData.date])

  const loadRooms = async () => {
    try {
      const response = await fetch('/api/requests/rooms/data')
      if (!response.ok) {
        throw new Error('Failed to load rooms')
      }

      const data = await response.json()
      setRooms(data.rooms || [])
    } catch (err) {
      console.error('Error loading rooms:', err)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const fetchBookedSlots = async (roomId: string, date: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/requests/rooms/availability?roomId=${roomId}&date=${date}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch availability')
      }

      setBookedSlots(data.bookedSlots || [])
    } catch (err) {
      console.error('Error fetching booked slots:', err)
      setBookedSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target

    setFormData((current) => ({ ...current, [name]: value }))
    setConflict(null)
    setError('')

    if (validationErrors[name]) {
      setValidationErrors((current) => ({ ...current, [name]: '' }))
    }
  }

  const handleSelectAlternative = (roomId: string) => {
    setFormData((current) => ({ ...current, roomId }))
    setConflict(null)
    setError('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setConflict(null)
    setError('')

    const nextValidationErrors: Record<string, string> = {}

    if (!formData.roomId) {
      nextValidationErrors.roomId = 'Please select a room'
    }
    if (!formData.date) {
      nextValidationErrors.date = 'Please select a date'
    }
    if (!formData.startTime) {
      nextValidationErrors.startTime = 'Please select start time'
    }
    if (!formData.endTime) {
      nextValidationErrors.endTime = 'Please select end time'
    }
    if (!formData.purpose.trim()) {
      nextValidationErrors.purpose = 'Please describe the purpose'
    } else if (formData.purpose.trim().length < 5) {
      nextValidationErrors.purpose = 'Purpose must be at least 5 characters'
    }
    if (!formData.expectedAttendees) {
      nextValidationErrors.expectedAttendees = 'Please enter expected attendees'
    }

    if (Object.keys(nextValidationErrors).length > 0) {
      setValidationErrors(nextValidationErrors)
      return
    }

    setValidationErrors({})

    const startMinutes = parseInt(formData.startTime.split(':')[0], 10) * 60 + parseInt(formData.startTime.split(':')[1], 10)
    const endMinutes = parseInt(formData.endTime.split(':')[0], 10) * 60 + parseInt(formData.endTime.split(':')[1], 10)

    if (endMinutes <= startMinutes) {
      setError('End time must be after start time')
      return
    }

    const selectedRoom = rooms.find((room) => room.id === formData.roomId)
    const availabilityResponse = await fetch('/api/requests/rooms/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: formData.roomId,
        roomName: selectedRoom?.name || '',
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        expectedAttendees: formData.expectedAttendees,
      }),
    })
    const availabilityData = await availabilityResponse.json()

    if (!availabilityResponse.ok) {
      setError(availabilityData.error || 'Error checking room availability')
      return
    }

    if (!availabilityData.available) {
      setConflict({
        message: availabilityData.message || 'This room is not available for the selected time.',
        suggestedRooms: availabilityData.suggestedRooms || [],
      })
      return
    }

    const userEmail = localStorage.getItem('userEmail') || 'student@example.com'
    const newBooking = {
      studentEmail: userEmail,
      studentName: 'Student',
      roomId: formData.roomId,
      roomName: selectedRoom?.name || '',
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      purpose: formData.purpose,
      expectedAttendees: formData.expectedAttendees,
    }

    try {
      const response = await fetch('/api/requests/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      })

      if (response.ok) {
        setSubmitted(true)
        return
      }

      const data = await response.json().catch(() => null)

      if (response.status === 409) {
        setConflict({
          message: data?.message || 'This room is not available for the selected time.',
          suggestedRooms: data?.suggestedRooms || [],
        })
        return
      }

      setError(data?.error || 'Error saving room booking')
    } catch (err) {
      console.error('Error saving room booking:', err)
      setError('Error saving room booking')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-amber-50">
      <Sidebar />
      <div
        className="flex-1 overflow-auto"
        style={{
          background: 'linear-gradient(180deg, #EAF4FF 0%, #F5FAFF 50%, #FFFFFF 100%)',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 border-2 border-black"
            >
              <ArrowLeft size={20} className="text-black" />
            </button>
            <h1 className="text-3xl font-bold text-black">Room Booking</h1>
          </div>

          {!submitted ? (
            <div className="bg-white border-2 border-black p-8 shadow-md space-y-6">
              {conflict && (
                <div className="bg-red-50 border-2 border-red-400 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-red-800">Room Not Available</h3>
                  <p className="text-red-700 font-medium">{conflict.message}</p>

                  {conflict.suggestedRooms.length > 0 ? (
                    <div className="space-y-3">
                      <p className="font-bold text-red-900">Available alternatives:</p>
                      {conflict.suggestedRooms.map((room) => (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => handleSelectAlternative(room.id)}
                          className="w-full bg-green-100 border-2 border-green-400 p-3 text-left hover:bg-green-200 transition"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-bold text-green-900">{room.name}</p>
                              <p className="text-xs text-green-800 uppercase">{room.type} • Capacity {room.capacity}</p>
                              {room.reason && (
                                <p className="text-xs text-green-700 mt-1">{room.reason}</p>
                              )}
                            </div>
                            <span className="text-xs font-bold text-green-900 uppercase">Check This Out</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-red-800">No similar rooms are free for this exact time right now.</p>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-100 border-4 border-red-600 p-6 rounded-lg">
                  <p className="text-red-900 font-bold text-lg">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase">Select Room</label>
                  {validationErrors.roomId && (
                    <div className="bg-red-100 border-2 border-red-400 text-red-700 p-2 rounded mb-2 text-sm font-bold">
                      {validationErrors.roomId}
                    </div>
                  )}
                  {loading ? (
                    <div className="p-4 text-center text-gray-600">Loading rooms...</div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto border-2 border-black p-3 bg-white">
                      {rooms.map((room) => (
                        <label key={room.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer border border-gray-200">
                          <input
                            type="radio"
                            name="roomId"
                            value={room.id}
                            checked={formData.roomId === room.id}
                            onChange={handleInputChange}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="font-bold text-black">{room.name}</div>
                            <div className="text-xs text-gray-600">
                              {room.type.charAt(0).toUpperCase() + room.type.slice(1)} • Capacity: {room.capacity}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase flex items-center gap-2">
                    <Calendar size={16} />
                    Date
                  </label>
                  {validationErrors.date && (
                    <div className="bg-red-100 border-2 border-red-400 text-red-700 p-2 rounded mb-2 text-sm font-bold">
                      {validationErrors.date}
                    </div>
                  )}
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className={`w-full border-2 p-3 font-semibold text-black ${validationErrors.date ? 'border-red-400' : 'border-black'}`}
                  />
                </div>

                {formData.roomId && formData.date && bookedSlots.length > 0 && (
                  <div className="bg-amber-50 border-2 border-amber-400 p-4 space-y-2">
                    <p className="font-bold text-amber-900 flex items-center gap-2">
                      <AlertCircle size={16} />
                      Class Schedule and Existing Bookings:
                    </p>
                    {bookedSlots.map((slot, idx) => (
                      <div key={idx} className="text-sm text-amber-900 font-medium">
                        {slot.start} - {slot.end} {slot.type === 'class' ? `(Class: ${slot.studentName})` : `(Booked by ${slot.studentName})`}
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase flex items-center gap-2">
                      <Clock size={16} />
                      Start Time
                    </label>
                    {validationErrors.startTime && (
                      <div className="bg-red-100 border-2 border-red-400 text-red-700 p-2 rounded mb-2 text-sm font-bold">
                        {validationErrors.startTime}
                      </div>
                    )}
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                      className={`w-full border-2 p-3 font-semibold text-black ${validationErrors.startTime ? 'border-red-400' : 'border-black'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-2 uppercase">End Time</label>
                    {validationErrors.endTime && (
                      <div className="bg-red-100 border-2 border-red-400 text-red-700 p-2 rounded mb-2 text-sm font-bold">
                        {validationErrors.endTime}
                      </div>
                    )}
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      className={`w-full border-2 p-3 font-semibold text-black ${validationErrors.endTime ? 'border-red-400' : 'border-black'}`}
                    />
                  </div>
                </div>

                {formData.startTime && formData.endTime && (
                  <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded">
                    {(() => {
                      const start = parseInt(formData.startTime.split(':')[0], 10) * 60 + parseInt(formData.startTime.split(':')[1], 10)
                      const end = parseInt(formData.endTime.split(':')[0], 10) * 60 + parseInt(formData.endTime.split(':')[1], 10)
                      const durationMinutes = end - start

                      if (durationMinutes <= 0) {
                        return <p className="text-red-700 font-bold">End time must be after start time</p>
                      }

                      const hours = Math.floor(durationMinutes / 60)
                      const minutes = durationMinutes % 60
                      const durationText = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`

                      return (
                        <p className="text-blue-900 font-bold">
                          Duration: <span className="text-lg">{durationText}</span>
                        </p>
                      )
                    })()}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase">Purpose</label>
                  {validationErrors.purpose && (
                    <div className="bg-red-100 border-2 border-red-400 text-red-700 p-2 rounded mb-2 text-sm font-bold">
                      {validationErrors.purpose}
                    </div>
                  )}
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    placeholder="What is the room needed for?"
                    required
                    rows={3}
                    className={`w-full border-2 p-3 font-medium text-black placeholder:text-gray-400 ${validationErrors.purpose ? 'border-red-400' : 'border-black'}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase">Expected Number of Attendees</label>
                  {validationErrors.expectedAttendees && (
                    <div className="bg-red-100 border-2 border-red-400 text-red-700 p-2 rounded mb-2 text-sm font-bold">
                      {validationErrors.expectedAttendees}
                    </div>
                  )}
                  <input
                    type="number"
                    name="expectedAttendees"
                    value={formData.expectedAttendees}
                    onChange={handleInputChange}
                    placeholder="e.g., 20"
                    required
                    min="1"
                    className="w-full border-2 border-black p-3 font-semibold text-black placeholder:text-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!formData.roomId || !formData.date || !formData.startTime || !formData.endTime || !formData.purpose || !formData.expectedAttendees}
                  className="w-full bg-black text-white py-3 px-4 border-2 border-black font-bold text-lg hover:shadow-md active:translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Room
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white border-2 border-black p-8 shadow-md text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
                  <CheckCircle size={32} className="text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-black">Booking Requested!</h2>
                <p className="text-gray-600">Your room booking request has been sent to the HOD for approval.</p>
                <p className="text-sm text-gray-500">You will receive updates via email.</p>
              </div>
              <button
                onClick={() => router.push('/student')}
                className="inline-block bg-black text-white py-2 px-6 border-2 border-black font-bold hover:shadow-md active:translate-y-1 transition"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
