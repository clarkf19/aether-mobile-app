'use client'

import { Clock, MapPin, AlertCircle, BookOpen, LogOut, Navigation, DoorOpen, AlertTriangle, Search, Zap, X, Bell, Wifi } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface StudentHomeProps {
  homePath?: string
}

interface Schedule {
  id: string
  time: string
  subject: string
  type: string
  room: string
  status: 'done' | 'ongoing' | 'next' | 'pending'
  start_time: string
  end_time: string
}

interface Assignment {
  id: string
  courseCode: string
  title: string
  dueLabel: string
  priority: string
  due_date: string
}

interface Notification {
  id: string
  icon: any
  title: string
  text: string
  timestamp: string
  type: string
  color: string
}

export default function StudentHome({ homePath = '/student' }: StudentHomeProps) {
  const router = useRouter()
  const [todaySchedule, setTodaySchedule] = useState<Schedule[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [realAlerts, setRealAlerts] = useState<Notification[]>([])
  const [nextClass, setNextClass] = useState({
    subject: 'Loading...',
    time: '--:-- AM',
    location: 'Room',
    professor: 'Dr.',
    distance: '--m'
  })
  const [timeCountdown, setTimeCountdown] = useState('-- m -- s')
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const studentEmail = 'student@example.com' // Get from localStorage in production

  // Helper functions
  const timeToMinutes = (time: string): number => {
    const [hours, mins] = time.split(':').map(Number)
    return hours * 60 + mins
  }

  const getCurrentPeriod = (schedule: Schedule[]): Schedule | null => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    return schedule.find(s => {
      const startMins = timeToMinutes(s.start_time)
      const endMins = timeToMinutes(s.end_time)
      return currentTime >= startMins && currentTime < endMins
    }) || null
  }

  const getNextPeriod = (schedule: Schedule[], current: Schedule | null): Schedule | null => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const upcoming = schedule.filter(s => {
      const startMins = timeToMinutes(s.start_time)
      return startMins > currentTime
    })
    
    return upcoming.length > 0 ? upcoming[0] : null
  }

  const calculateCountdown = (startTime: string): string => {
    const now = new Date()
    const [hours, mins] = startTime.split(':').map(Number)
    const classTime = new Date()
    classTime.setHours(hours, mins, 0)
    
    if (classTime < now) {
      classTime.setDate(classTime.getDate() + 1)
    }
    
    const diff = classTime.getTime() - now.getTime()
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    
    return `${minutes}m ${seconds}s`
  }

  const formatDueDate = (dueDate: string): string => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffMs = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays < 1) return 'due Today'
    if (diffDays === 1) return 'due Tomorrow'
    return `${diffDays} days`
  }

  // Fetch data on mount
  useEffect(() => {
    setLoading(true)

    // HARDCODED Monday courses with database timetable
    const schedules: Schedule[] = [
      {
        id: '1',
        time: '11:15',
        subject: 'DAA/PBB/508',
        type: 'Class',
        room: 'lab-101b',
        status: 'pending',
        start_time: '11:15',
        end_time: '12:15',
      },
      {
        id: '2',
        time: '12:15',
        subject: 'CCN/AVS/508',
        type: 'Class',
        room: 'classroom-202',
        status: 'pending',
        start_time: '12:15',
        end_time: '13:15',
      }
    ]

    // Determine current and next period
    const currentPeriod = getCurrentPeriod(schedules)
    const nextPeriod = getNextPeriod(schedules, currentPeriod)

    // Update schedules with proper status
    const updatedSchedules = schedules.map((s: Schedule) => {
      if (currentPeriod && s.id === currentPeriod.id) return { ...s, status: 'ongoing' as const }
      if (nextPeriod && s.id === nextPeriod.id) return { ...s, status: 'next' as const }
      return s
    })

    setTodaySchedule(updatedSchedules)

    // Update next class banner with database info
    if (nextPeriod) {
      const courseParts = nextPeriod.subject.split('/') // e.g., DAA/PBB/508
      const courseName = courseParts[0] || 'Class'
      const teacher = courseParts[1] || 'Instructor'
      const roomCode = courseParts[2] || '0'
      
      setNextClass({
        subject: courseName,
        time: nextPeriod.start_time,
        location: nextPeriod.room,
        professor: teacher,
        distance: roomCode
      })
      setTimeCountdown(calculateCountdown(nextPeriod.start_time))
    } else if (schedules.length > 0) {
      // No next class today, show first class
      const courseParts = schedules[0].subject.split('/')
      const courseName = courseParts[0] || 'Class'
      const teacher = courseParts[1] || 'Instructor'
      const roomCode = courseParts[2] || '0'
      
      setNextClass({
        subject: courseName,
        time: schedules[0].start_time,
        location: schedules[0].room,
        professor: teacher,
        distance: roomCode
      })
      setTimeCountdown(calculateCountdown(schedules[0].start_time))
    }

    // Assignments data
    const assignmentsData: Assignment[] = [
      {
        id: '1',
        courseCode: 'DAA/PBB/508',
        title: 'Algorithm Design Assignment',
        dueLabel: 'due Tomorrow',
        priority: 'high',
        due_date: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        id: '2',
        courseCode: 'CCN/AVS/508',
        title: 'Computer Networks Lab',
        dueLabel: '3 days',
        priority: 'medium',
        due_date: new Date(Date.now() + 259200000).toISOString(),
      }
    ]
    setAssignments(assignmentsData)

    // Notifications from database
    const notificationsData: Notification[] = [
      {
        id: '1',
        icon: Bell,
        title: 'Assignment Reminder',
        text: 'DAA assignment due tomorrow',
        timestamp: '5m ago',
        type: 'assignment',
        color: 'border-rose-400',
      },
      {
        id: '2',
        icon: DoorOpen,
        title: 'Class Update',
        text: 'Room changed to lab-101b',
        timestamp: '15m ago',
        type: 'room_change',
        color: 'border-amber-400',
      },
      {
        id: '3',
        icon: Zap,
        title: 'Event Notification',
        text: 'Tech event happening soon',
        timestamp: '1h ago',
        type: 'event',
        color: 'border-emerald-400',
      },
      {
        id: '4',
        icon: Wifi,
        title: 'WiFi Maintenance',
        text: 'Lab WiFi may be down',
        timestamp: '2h ago',
        type: 'maintenance',
        color: 'border-sky-400',
      }
    ]
    setRealAlerts(notificationsData)
    setLoading(false)
  }, [studentEmail])

  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (todaySchedule.length > 0) {
        const next = todaySchedule.find(s => s.status === 'next')
        if (next) {
          setTimeCountdown(calculateCountdown(next.start_time))
        }
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [todaySchedule])


  const handleDismissAlert = (id: string) => {
    setDismissedAlerts([...dismissedAlerts, id])
  }

  const handleStartNavigation = () => {
    router.push(`${homePath}?view=map`)
  }

  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'done': return 'bg-emerald-100 text-emerald-900'
      case 'ongoing': return 'bg-amber-100 text-amber-900 border-2 border-amber-400'
      case 'next': return 'bg-sky-100 text-sky-900'
      default: return 'bg-rose-100 text-rose-900'
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Class': return 'bg-sky-100'
      case 'Lab': return 'bg-emerald-100'
      case 'Meeting': return 'bg-amber-100'
      default: return 'bg-rose-100'
    }
  }

  const getTimelineNodeStyles = (status: string) => {
    switch(status) {
      case 'done': return { node: 'bg-emerald-500 border-emerald-600', ring: '', size: 'w-4 h-4' }
      case 'ongoing': return { node: 'bg-amber-500 border-amber-600', ring: 'ring-4 ring-amber-200 animate-pulse', size: 'w-5 h-5' }
      case 'next': return { node: 'bg-sky-400 border-sky-500', ring: 'ring-2 ring-sky-200', size: 'w-4 h-4' }
      default: return { node: 'bg-rose-300 border-rose-400', ring: '', size: 'w-3 h-3' }
    }
  }

  const getStickyNoteColor = (type: string, index: number) => {
    const colors = [
      { bg: 'bg-rose-50', pin: 'bg-rose-500' },
      { bg: 'bg-amber-50', pin: 'bg-amber-500' },
      { bg: 'bg-emerald-50', pin: 'bg-emerald-500' },
      { bg: 'bg-sky-50', pin: 'bg-sky-500' }
    ]
    return colors[index % colors.length]
  }

  const getRotation = (id: string | number) => {
    const rotations = [-2, -1, 0, 1, 2, -1.5, 1.5]
    const numId = typeof id === 'string' ? id.charCodeAt(0) : id
    return rotations[numId % rotations.length]
  }

  const quickActions = [
    { id: 1, label: 'Apply Leave', icon: AlertTriangle, action: () => router.push('/leave-request') },
    { id: 2, label: 'Approvals', icon: DoorOpen, action: () => router.push('/approvals') },
    { id: 3, label: 'Report Issue', icon: AlertCircle, action: () => router.push('/report-issue') },
  ]

  return (
    <div className="w-full h-full overflow-auto" style={{
      background: 'linear-gradient(180deg, #EAF4FF 0%, #F5FAFF 50%, #FFFFFF 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(90deg, #000 1px, transparent 1px), linear-gradient(#000 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative p-3 sm:p-4 max-w-sm mx-auto space-y-3 sm:space-y-4">
        {/* SMART LIVE BANNER */}
        <div className="bg-white border-2 border-black p-3 sm:p-4 flex items-center justify-between shadow-md text-xs sm:text-base">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <div className="font-bold text-black">
              You have <span className="font-black">{nextClass.subject}</span> in <span className="font-black">{nextClass.distance}</span> by <span className="font-black">{nextClass.professor}</span>
            </div>
          </div>
          <button onClick={handleStartNavigation} className="hover:scale-110 transition">
            <Navigation size={18} className="text-black cursor-pointer" />
          </button>
        </div>

        {/* MAIN GRID - SINGLE COLUMN MOBILE */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {/* LEFT COLUMN - TODAY TIMELINE + ASSIGNMENTS + CGPA */}
          <div className="space-y-3 sm:space-y-4">
            {/* TODAY TIMELINE - VERTICAL ZIG-ZAG */}
            <div className="bg-white border-2 border-black p-3 sm:p-6 shadow-md">
              <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-6">Today&apos;s Timeline</div>
              
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-200" />
                
                <div className="space-y-6">
                  {todaySchedule.map((item, index) => {
                    const nodeStyles = getTimelineNodeStyles(item.status)
                    const isLeft = index % 2 === 0
                    
                    return (
                      <div key={item.id} className={`relative flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                        {/* Content Block */}
                        <div className={`w-[45%] ${isLeft ? 'pr-6 text-right' : 'pl-6 text-left'}`}>
                          <div className={`p-3 sm:p-4 border-2 border-black transition-all hover:shadow-md cursor-pointer ${getStatusStyles(item.status)} ${item.status === 'ongoing' ? 'shadow-lg' : ''}`}>
                            <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'justify-end' : 'justify-start'} flex-wrap ${isLeft ? 'flex-row-reverse' : ''}`}>
                              <span className="font-black text-black text-xs sm:text-sm">{item.time}</span>
                              {item.status === 'ongoing' && (
                                <span className="text-xs font-black text-amber-600 flex items-center gap-1 whitespace-nowrap">
                                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                  LIVE
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-black text-xs sm:text-sm break-words line-clamp-2">{item.subject}</p>
                            <div className={`flex items-center gap-2 mt-2 flex-wrap ${isLeft ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                              <span className={`text-xs font-bold px-2 py-0.5 whitespace-nowrap ${getTypeColor(item.type)}`}>
                                {item.type}
                              </span>
                              <span className="text-xs text-gray-600 whitespace-nowrap">{item.room}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Center Node */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                          <div className={`${nodeStyles.size} rounded-full border-2 ${nodeStyles.node} ${nodeStyles.ring}`} />
                        </div>
                        
                        {/* Spacer for opposite side */}
                        <div className="w-[45%]" />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ASSIGNMENTS SECTION */}
            <div className="bg-white border-2 border-black p-3 sm:p-6 shadow-md">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Assignments</div>
                <span className="text-xs font-bold text-orange-500 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">{assignments.length} due</span>
              </div>
              
              {/* Featured Assignment (first one) */}
              {assignments[0] && (
                <div className="mb-5">
                  <p className="font-black text-black text-lg">{assignments[0].title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {assignments[0].courseCode} · {assignments[0].dueLabel}
                  </p>
                </div>
              )}
              
              {/* Other Assignments List */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                {assignments.slice(1).map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">{assignment.title}</p>
                    <span className="text-sm text-orange-500 font-medium">{assignment.dueLabel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CGPA SECTION */}
            <div className="bg-yellow-100 border-2 border-black p-3 sm:p-6 shadow-md">
              <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Current CGPA</div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-5xl font-black text-black">8.76</p>
                  <p className="text-xs text-gray-600 mt-1">Last Updated: Dec 15, 2024</p>
                </div>
                <div className="w-24 h-24 bg-white border-2 border-black p-2 rounded-none">
                  <div className="relative w-full h-full bg-gradient-to-t from-green-400 to-transparent border-b-2 border-black flex items-center justify-center">
                    <span className="font-black text-black">87.6%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - ALERTS */}
          <div className="space-y-3 sm:space-y-4">
            {/* NOTIFICATIONS - STICKY NOTES BOARD */}
            <div className="bg-gray-100 border-2 border-black p-3 sm:p-4 shadow-md min-h-80">
              <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Notifications</div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 auto-rows-max">
                {loading ? (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-sm text-gray-600 font-bold">⏳ Loading notifications...</p>
                  </div>
                ) : realAlerts.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-sm text-gray-600 font-bold">✓ No notifications</p>
                  </div>
                ) : (
                  realAlerts.filter(a => !dismissedAlerts.includes(a.id)).map((alert, index) => {
                    const Icon = alert.icon
                    const { bg, pin } = getStickyNoteColor(alert.type, index)
                    const rotation = getRotation(alert.id)
                    
                    return (
                      <div
                        key={alert.id}
                        className={`relative transition-all duration-200 hover:-translate-y-2 hover:shadow-xl active:translate-y-0 cursor-pointer group`}
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          perspective: '1000px'
                        }}
                      >
                        {/* STICKY NOTE */}
                        <div className={`${bg} border-2 border-black p-4 shadow-lg`}
                          style={{
                            boxShadow: `
                              0 4px 6px rgba(0, 0, 0, 0.1),
                              0 8px 12px rgba(0, 0, 0, 0.08),
                              inset -2px -2px 4px rgba(0, 0, 0, 0.05)
                            `,
                            minHeight: '140px',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          {/* PIN AT TOP */}
                          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 z-10">
                            <div className={`w-4 h-4 rounded-full ${pin} shadow-md`}
                              style={{
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                              }}
                            />
                          </div>

                          {/* CONTENT */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start gap-2 mb-2">
                                <Icon size={16} className="flex-shrink-0 text-black mt-0.5" />
                                <p className="font-bold text-black text-xs leading-tight">{alert.title}</p>
                              </div>
                              <p className="text-black/75 text-xs leading-snug">{alert.text}</p>
                            </div>
                            <p className="text-xs text-black/50 mt-2 pt-2 border-t border-black/10">{alert.timestamp}</p>
                          </div>
                        </div>

                        {/* DISMISS BUTTON - VISIBLE ON HOVER */}
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="absolute -top-2 -right-2 bg-white border border-black rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Dismiss"
                        >
                          <X size={14} className="text-black" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTION DOCK */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {quickActions.map((action) => {
            const ActionIcon = action.icon
            return (
              <button
                key={action.id}
                onClick={action.action}
                className="bg-white border-2 border-black p-2 sm:p-4 font-bold text-black hover:shadow-lg active:translate-y-1 transition flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <ActionIcon size={18} />
                <span className="hidden sm:inline text-sm">{action.label}</span>
              </button>
            )
          })}
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-500 py-4">
          Last updated 2 seconds ago · All systems operational
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
