'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Users, Bell, LogOut, AlertCircle, Check, X } from 'lucide-react'
import RoleAwareCopilot from '@/components/RoleAwareCopilot'

interface TimeSlot {
  id: string
  subject: string
  time: string
  room: string
}

interface Student {
  uid: string
  name: string
  attendance: 'present' | 'absent' | null
}

interface SelectedStudent {
  uid: string
  name: string
}

interface Notification {
  id: string
  text: string
  timestamp: string
  recipientCount: number
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [activeTab, setActiveTab] = useState<'timetable' | 'attendance' | 'notify'>('timetable')
  const [copilotAction, setCopilotAction] = useState<string>('')

  // Timetable data
  const timetable: TimeSlot[] = [
    { id: '1', subject: 'Data Structures', time: '09:00 AM - 10:30 AM', room: 'A-101' },
    { id: '2', subject: 'Web Development', time: '11:00 AM - 12:30 PM', room: 'Lab B-202' },
    { id: '3', subject: 'Database Design', time: '02:00 PM - 03:30 PM', room: 'A-301' },
  ]

  // Student data
  const allStudents: Student[] = Array.from({ length: 60 }, (_, i) => ({
    uid: `2024300${String(i + 1).padStart(3, '0')}`,
    name: `Student ${i + 1}`,
    attendance: null,
  }))

  const [students, setStudents] = useState<Student[]>(allStudents)
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [searchUID, setSearchUID] = useState('')
  const [notificationText, setNotificationText] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [markAllPresent, setMarkAllPresent] = useState(false)

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail')
    if (!storedEmail || !storedEmail.includes('teacher@')) {
      router.push('/')
    }
    setEmail(storedEmail || '')
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    router.push('/')
  }

  const handleStudentToggle = (uid: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(uid)) {
      newSelected.delete(uid)
    } else {
      newSelected.add(uid)
    }
    setSelectedStudents(newSelected)
  }

  const handleAttendanceToggle = (uid: string) => {
    setStudents(
      students.map((s) =>
        s.uid === uid
          ? {
              ...s,
              attendance: s.attendance === 'present' ? 'absent' : 'present',
            }
          : s
      )
    )
  }

  const handleMarkAllAttendance = () => {
    const status = markAllPresent ? 'absent' : 'present'
    setStudents(students.map((s) => ({ ...s, attendance: status })))
    setMarkAllPresent(!markAllPresent)
  }

  const handleSendNotification = () => {
    if (notificationText.trim() && selectedStudents.size > 0) {
      const newNotification: Notification = {
        id: Date.now().toString(),
        text: notificationText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recipientCount: selectedStudents.size,
      }
      setNotifications([newNotification, ...notifications])
      setNotificationText('')
      setSelectedStudents(new Set())
    }
  }

  const handleCopilotAction = (actionId: string) => {
    setCopilotAction(actionId)
    switch (actionId) {
      case 'show-classes':
        setActiveTab('timetable')
        break
      case 'mark-attendance':
        setActiveTab('attendance')
        setMarkAllPresent(true)
        setStudents(students.map((s) => ({ ...s, attendance: 'present' })))
        break
      case 'send-notice':
        setActiveTab('notify')
        break
      default:
        break
    }
  }

  const filteredStudents = searchUID
    ? students.filter((s) => s.uid.includes(searchUID))
    : students

  const presentCount = students.filter((s) => s.attendance === 'present').length
  const absentCount = students.filter((s) => s.attendance === 'absent').length
  const markedCount = presentCount + absentCount

  return (
    <div className="min-h-screen bg-amber-50 p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white border-2 border-black p-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-black">Teacher Dashboard</h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">Manage classes, attendance & notifications</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 uppercase font-bold">Logged in as</p>
            <p className="text-lg font-bold text-black">{email}</p>
            <button
              onClick={handleLogout}
              className="mt-3 text-sm font-bold bg-black text-white px-4 py-2 border-2 border-black hover:shadow-md transition flex items-center gap-2 ml-auto"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex gap-2 border-b-2 border-black">
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-6 py-3 font-bold text-lg border-b-4 transition ${
              activeTab === 'timetable'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Clock className="w-5 h-5 inline mr-2" />
            Timetable
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-6 py-3 font-bold text-lg border-b-4 transition ${
              activeTab === 'attendance'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Attendance
          </button>
          <button
            onClick={() => setActiveTab('notify')}
            className={`px-6 py-3 font-bold text-lg border-b-4 transition ${
              activeTab === 'notify'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Bell className="w-5 h-5 inline mr-2" />
            Notify Students
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {/* Timetable Tab */}
        {activeTab === 'timetable' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-black mb-4">Today's Classes</h2>
            {timetable.map((slot) => (
              <div key={slot.id} className="bg-white border-2 border-black p-6 hover:shadow-lg transition">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <p className="text-xs text-gray-600 font-bold uppercase">Subject</p>
                    <p className="text-xl font-black text-black">{slot.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold uppercase">Time</p>
                    <p className="text-lg font-bold text-black">{slot.time}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold uppercase">Room</p>
                    <p className="text-lg font-bold text-black">{slot.room}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-2xl font-black text-black mb-4">Mark Attendance</h2>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border-2 border-green-300 p-4">
                  <p className="text-xs text-gray-600 font-bold uppercase">Present</p>
                  <p className="text-3xl font-black text-green-600">{presentCount}</p>
                </div>
                <div className="bg-red-50 border-2 border-red-300 p-4">
                  <p className="text-xs text-gray-600 font-bold uppercase">Absent</p>
                  <p className="text-3xl font-black text-red-600">{absentCount}</p>
                </div>
                <div className="bg-yellow-50 border-2 border-yellow-300 p-4">
                  <p className="text-xs text-gray-600 font-bold uppercase">Marked</p>
                  <p className="text-3xl font-black text-yellow-600">{markedCount} / {students.length}</p>
                </div>
              </div>

              {/* Mark All Button */}
              <button
                onClick={handleMarkAllAttendance}
                className={`mb-6 w-full py-3 px-4 border-2 border-black font-bold text-lg transition ${
                  markAllPresent
                    ? 'bg-red-600 text-white'
                    : 'bg-green-600 text-white'
                }`}
              >
                {markAllPresent ? 'Mark All Absent' : 'Mark All Present'}
              </button>

              {/* Search */}
              <input
                type="text"
                value={searchUID}
                onChange={(e) => setSearchUID(e.target.value)}
                placeholder="Search UID (e.g., 2024300001)"
                className="w-full border-2 border-black p-3 font-medium mb-4 placeholder:text-gray-400"
              />

              {/* Student List */}
              <div className="space-y-2 max-h-96 overflow-y-auto border-2 border-black p-2 bg-white">
                {filteredStudents.map((student) => (
                  <div key={student.uid} className="flex items-center gap-3 p-3 border-2 border-black bg-amber-50 hover:bg-yellow-100 transition">
                    <input
                      type="checkbox"
                      checked={student.attendance === 'present' || student.attendance === 'absent'}
                      onChange={() => handleAttendanceToggle(student.uid)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-black">{student.uid}</p>
                      <p className="text-xs text-gray-600">{student.name}</p>
                    </div>
                    <button
                      onClick={() => handleAttendanceToggle(student.uid)}
                      className={`px-4 py-2 border-2 border-black font-bold text-sm transition ${
                        student.attendance === 'present'
                          ? 'bg-green-600 text-white'
                          : student.attendance === 'absent'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-black'
                      }`}
                    >
                      {student.attendance === 'present'
                        ? '✓ Present'
                        : student.attendance === 'absent'
                        ? '✗ Absent'
                        : 'Mark'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notify' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Send Notification */}
            <div className="lg:col-span-2">
              <div className="bg-white border-2 border-black p-6">
                <h2 className="text-2xl font-black text-black mb-4">Send Notification</h2>

                {/* Message Input */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-black mb-2 uppercase">Message</label>
                  <textarea
                    value={notificationText}
                    onChange={(e) => setNotificationText(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full border-2 border-black p-3 font-medium h-24 resize-none placeholder:text-gray-400"
                  />
                </div>

                {/* Student Search & Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-black mb-2 uppercase">
                    Select Students ({selectedStudents.size} selected)
                  </label>
                  <input
                    type="text"
                    value={searchUID}
                    onChange={(e) => setSearchUID(e.target.value)}
                    placeholder="Search UID..."
                    className="w-full border-2 border-black p-3 font-medium mb-3 placeholder:text-gray-400"
                  />

                  {/* Quick Select All */}
                  <button
                    onClick={() =>
                      setSelectedStudents(
                        selectedStudents.size === filteredStudents.length
                          ? new Set()
                          : new Set(filteredStudents.map((s) => s.uid))
                      )
                    }
                    className="mb-3 px-3 py-1 bg-blue-600 text-white border-2 border-black font-bold text-sm hover:shadow-md transition"
                  >
                    {selectedStudents.size === filteredStudents.length ? 'Deselect All' : 'Select All Visible'}
                  </button>

                  {/* Student List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto border-2 border-black p-3 bg-amber-50">
                    {filteredStudents.length === 0 ? (
                      <p className="text-gray-600 font-medium text-center py-4">No students found</p>
                    ) : (
                      filteredStudents.map((student) => (
                        <label
                          key={student.uid}
                          className="flex items-center gap-3 p-2 hover:bg-yellow-100 transition cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(student.uid)}
                            onChange={() => handleStudentToggle(student.uid)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span className="font-medium text-black">{student.uid}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendNotification}
                  disabled={!notificationText.trim() || selectedStudents.size === 0}
                  className="w-full bg-black text-white py-3 px-4 border-2 border-black font-bold text-lg hover:shadow-md active:translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Bell className="w-5 h-5 inline mr-2" />
                  Send to {selectedStudents.size} Student{selectedStudents.size !== 1 ? 's' : ''}
                </button>
              </div>
            </div>

            {/* Notification History */}
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-xl font-black text-black mb-4">Sent Notifications</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-600 font-medium text-center py-8">No notifications sent yet</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="border-2 border-black p-3 bg-blue-50">
                      <p className="text-xs text-gray-600 font-bold">{notif.timestamp}</p>
                      <p className="text-sm font-bold text-black mt-1">{notif.text}</p>
                      <p className="text-xs text-blue-900 mt-2">
                        Sent to {notif.recipientCount} student{notif.recipientCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Copilot */}
      <RoleAwareCopilot role="TEACHER" onAction={handleCopilotAction} />
    </div>
  )
}
