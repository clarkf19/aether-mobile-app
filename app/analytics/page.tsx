'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { ArrowLeft, BookOpen, Clock, ShieldCheck, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react'

const classroomLocations = {
  'Data Structures': { lat: 12.9718, lng: 77.5946 },
  Mathematics: { lat: 12.9725, lng: 77.5950 },
  'Web Development': { lat: 12.9700, lng: 77.5930 },
  'Database Management': { lat: 12.9730, lng: 77.5960 },
  'Computer Networks': { lat: 12.9710, lng: 77.5970 },
}

const initialSubjects = [
  {
    name: 'Data Structures',
    total_sessions: 20,
    attended_sessions: 14,
    upcoming_sessions: 3,
    location: classroomLocations['Data Structures'],
  },
  {
    name: 'Mathematics',
    total_sessions: 18,
    attended_sessions: 13,
    upcoming_sessions: 4,
    location: classroomLocations.Mathematics,
  },
  {
    name: 'Web Development',
    total_sessions: 16,
    attended_sessions: 12,
    upcoming_sessions: 2,
    location: classroomLocations['Web Development'],
  },
  {
    name: 'Database Management',
    total_sessions: 15,
    attended_sessions: 11,
    upcoming_sessions: 3,
    location: classroomLocations['Database Management'],
  },
  {
    name: 'Computer Networks',
    total_sessions: 17,
    attended_sessions: 15,
    upcoming_sessions: 1,
    location: classroomLocations['Computer Networks'],
  },
]

const getAttendancePercent = (attended: number, total: number) => {
  if (total === 0) return 0
  return Math.round((attended / total) * 100)
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c * 1000
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState(initialSubjects)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [markedSubjects, setMarkedSubjects] = useState<string[]>([])

  const overallAttendance = useMemo(() => {
    const totalAttended = subjects.reduce((sum, item) => sum + item.attended_sessions, 0)
    const totalSessions = subjects.reduce((sum, item) => sum + item.total_sessions, 0)
    return getAttendancePercent(totalAttended, totalSessions)
  }, [subjects])

  const insights = useMemo(() => {
    const shortage = subjects
      .filter(item => getAttendancePercent(item.attended_sessions, item.total_sessions) < 75)
      .map(item => {
        const required = Math.max(0, Math.ceil(0.75 * item.total_sessions - item.attended_sessions))
        return `You are ${required} class${required === 1 ? '' : 'es'} short in ${item.name}`
      })

    const safe = subjects
      .filter(item => getAttendancePercent(item.attended_sessions, item.total_sessions) >= 75)
      .map(item => `You can skip 1 class in ${item.name} safely`)

    const nextRise = subjects
      .map(item => {
        const need = Math.max(0, Math.ceil(0.75 * (item.total_sessions + item.upcoming_sessions) - item.attended_sessions))
        return {
          name: item.name,
          sessions: need,
        }
      })
      .sort((a, b) => a.sessions - b.sessions)
      .filter(item => item.sessions > 0)

    const target = nextRise.length ? nextRise[0] : null

    return [
      ...shortage,
      ...safe.slice(0, 2),
      target ? `Attend next ${target.sessions} sessions to stay above 75% in ${target.name}` : 'Attendance is stable for current subjects',
    ].slice(0, 4)
  }, [subjects])

  const handleMarkAttendance = (subjectName: string) => {
    const subject = subjects.find(item => item.name === subjectName)
    if (!subject) return

    setError(null)
    setStatusMessage(null)

    if (markedSubjects.includes(subjectName)) {
      setError('Attendance already marked for this subject today.')
      return
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setIsProcessing(true)

    navigator.geolocation.getCurrentPosition(
      position => {
        const distance = haversineDistance(
          position.coords.latitude,
          position.coords.longitude,
          subject.location.lat,
          subject.location.lng
        )

        if (distance <= 50) {
          setSubjects(prev =>
            prev.map(item =>
              item.name === subjectName
                ? {
                    ...item,
                    attended_sessions: item.attended_sessions + 1,
                    total_sessions: item.total_sessions + 1,
                    upcoming_sessions: Math.max(0, item.upcoming_sessions - 1),
                  }
                : item
            )
          )
          setMarkedSubjects(prev => [...prev, subjectName])
          setStatusMessage(`Attendance marked successfully for ${subjectName}.`)
        } else {
          setError('You are not within classroom range.')
        }

        setIsProcessing(false)
      },
      () => {
        setError('Unable to access your location. Allow location access and try again.')
        setIsProcessing(false)
      },
      { timeout: 10000 }
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-amber-50">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">Attendance Module</p>
              <h1 className="text-3xl font-black text-black">Attendance Dashboard</h1>
            </div>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 rounded border-2 border-black bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-gray-50"
            >
              <ArrowLeft size={18} /> Back to Home
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
            <div className="space-y-6">
              <div className="bg-white border-2 border-black p-6 shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-600">Overall Attendance</p>
                    <p className="mt-3 text-5xl font-black text-black">{overallAttendance}%</p>
                  </div>
                  <div className="rounded-full bg-black/5 px-4 py-3 text-sm font-bold text-black">
                    {overallAttendance >= 75 ? 'Stable' : 'At Risk'}
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600">Subject-wise attendance summary with live marking support from your current classroom location.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {subjects.map(subject => {
                  const percentage = getAttendancePercent(subject.attended_sessions, subject.total_sessions)
                  const isLow = percentage < 75
                  const remainingTo75 = Math.max(0, Math.ceil(0.75 * subject.total_sessions - subject.attended_sessions))

                  return (
                    <div key={subject.name} className={`bg-white border-2 border-black p-5 shadow-md transition duration-300 ${isLow ? 'animate-pulse/75' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-600">{subject.name}</p>
                          <p className="mt-3 text-4xl font-black text-black">{percentage}%</p>
                        </div>
                        <div className={`rounded-full px-3 py-2 text-xs font-bold ${isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {isLow ? 'Attention' : 'Good'}
                        </div>
                      </div>

                      <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200 border border-black/10">
                        <div
                          className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-cyan-500'}`}
                          style={{ width: `${percentage}%`, transition: 'width 0.5s ease' }}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-gray-700">
                        <div className="rounded border border-black/10 bg-slate-50 p-3">
                          <p className="font-black text-sm text-black">{subject.total_sessions}</p>
                          <p className="mt-1 uppercase tracking-[0.2em]">Done</p>
                        </div>
                        <div className="rounded border border-black/10 bg-slate-50 p-3">
                          <p className="font-black text-sm text-black">{subject.attended_sessions}</p>
                          <p className="mt-1 uppercase tracking-[0.2em]">Attended</p>
                        </div>
                        <div className="rounded border border-black/10 bg-slate-50 p-3">
                          <p className="font-black text-sm text-black">{subject.upcoming_sessions}</p>
                          <p className="mt-1 uppercase tracking-[0.2em]">Upcoming</p>
                        </div>
                      </div>

                      {isLow && (
                        <div className="mt-4 rounded border border-red-400 bg-red-50 p-4 text-sm text-red-700">
                          <div className="flex items-center gap-2 font-bold uppercase tracking-[0.2em] mb-2">
                            <AlertTriangle size={16} /> Attendance Shortage
                          </div>
                          <p>Attend next {remainingTo75} session{remainingTo75 === 1 ? '' : 's'} to reach 75%.</p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleMarkAttendance(subject.name)}
                        disabled={isProcessing}
                        className="mt-5 w-full rounded border-2 border-black bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Mark Attendance
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border-2 border-black p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck size={20} className="text-black" />
                  <h2 className="text-lg font-black text-black uppercase tracking-wide">Attendance Insights</h2>
                </div>
                <div className="space-y-3">
                  {insights.map((line, index) => (
                    <div key={index} className="rounded border border-black/10 bg-slate-50 p-4 text-sm text-gray-800">
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border-2 border-black p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin size={20} className="text-black" />
                  <h2 className="text-lg font-black text-black uppercase tracking-wide">Location-Based Marking</h2>
                </div>
                <p className="text-sm text-gray-600">This feature checks your current location against classroom coordinates before marking attendance.</p>
                <div className="mt-5 rounded border border-black/10 bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-bold text-black">Classroom coordinates</p>
                  <ul className="mt-3 space-y-2 text-xs text-gray-600">
                    {Object.entries(classroomLocations).map(([name, coords]) => (
                      <li key={name}>{name}: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white border-2 border-black p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 size={20} className="text-black" />
                  <h2 className="text-lg font-black text-black uppercase tracking-wide">Live Status</h2>
                </div>
                {statusMessage && (
                  <div className="rounded border border-green-400 bg-green-50 p-4 text-sm text-green-800">{statusMessage}</div>
                )}
                {error && (
                  <div className="rounded border border-red-400 bg-red-50 p-4 text-sm text-red-800">{error}</div>
                )}
                {!statusMessage && !error && (
                  <p className="text-sm text-gray-600">Choose any subject card and tap Mark Attendance to begin.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
