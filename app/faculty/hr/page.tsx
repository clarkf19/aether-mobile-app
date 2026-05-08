'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, LogOut, Clock, MessageCircle, Zap } from 'lucide-react'
import RoleAwareCopilot from '@/components/RoleAwareCopilot'

interface Issue {
  id: string
  type: 'IT' | 'maintenance'
  description: string
  status: 'open' | 'in-progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  reportedBy: string
  reportedDate: string
  responses: string[]
  location?: string
  image?: string
}

export default function HRDashboard() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all')
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [copilotAction, setCopilotAction] = useState<string>('')
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')

  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Fetch issue reports from Supabase via API
    const fetchIssues = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/report-issue')
        if (!response.ok) throw new Error('Failed to fetch issues')
        
        const data = await response.json()
        const convertedReports = (data.issues || []).map((report: any) => ({
          id: report.id,
          type: report.category === 'network' ? 'IT' : 'maintenance',
          description: report.description,
          status: report.status || 'open',
          priority: report.severity || 'medium',
          reportedBy: report.student_name || report.student_email,
          reportedDate: report.created_at,
          responses: [],
          location: report.location,
          image: report.image_base64,
        }))
        
        setIssues(convertedReports)
      } catch (error) {
        console.error('🔍 Error loading issues from Supabase:', error)
        setIssues([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchIssues()
  }, [])

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail')
    if (!storedEmail || !storedEmail.includes('hr@')) {
      router.push('/')
    }
    setEmail(storedEmail || '')
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    router.push('/')
  }

  const handleStatusChange = async (id: string, newStatus: 'open' | 'in-progress' | 'resolved') => {
    try {
      const response = await fetch(`/api/report-issue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setIssues(issues.map(i => i.id === id ? { ...i, status: newStatus } : i))
      } else {
        console.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleAddResponse = (id: string) => {
    if (responseText.trim()) {
      setIssues(
        issues.map(i =>
          i.id === id
            ? { ...i, responses: [...i.responses, responseText] }
            : i
        )
      )
      setResponseText('')
    }
  }

  const handleCopilotAction = (actionId: string) => {
    setCopilotAction(actionId)
    switch (actionId) {
      case 'show-issues':
        setFilterStatus('all')
        setFilterPriority('all')
        break
      case 'pending-tickets':
        setFilterStatus('open')
        break
      case 'urgent-only':
        setFilterPriority('high')
        break
      default:
        break
    }
  }

  const filteredIssues = issues.filter((i) => {
    const statusMatch = filterStatus === 'all' || i.status === filterStatus
    const priorityMatch = filterPriority === 'all' || i.priority === filterPriority
    return statusMatch && priorityMatch
  })

  const currentIssue = issues.find(i => i.id === selectedIssue)

  const stats = {
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    high: issues.filter(i => i.priority === 'high' && i.status !== 'resolved').length,
  }

  const getTypeIcon = (type: string) => {
    return type === 'IT' ? '🖥️' : '🔧'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const day = date.getDate()
    const month = months[date.getMonth()]
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day} ${month}, ${hours}:${minutes}`
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="sticky top-0 z-40 bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-black">Support Center</h1>
            <p className="text-sm text-gray-600 mt-1 font-bold">Issue • Maintenance • Support Tickets</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 uppercase font-bold">Logged in as</p>
            <p className="text-lg font-bold text-black">{email}</p>
            <button
              onClick={handleLogout}
              className="mt-2 text-xs font-bold bg-black text-white px-4 py-2 border-2 border-black hover:shadow-md transition flex items-center gap-2 ml-auto"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-rose-50 border-2 border-rose-200 p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-rose-700 uppercase tracking-wider">Open</p>
                  <p className="text-5xl font-black text-rose-600 mt-2">{stats.open}</p>
                </div>
                <AlertCircle className="w-16 h-16 text-rose-300 opacity-50" />
              </div>
            </div>
            <div className="bg-amber-50 border-2 border-amber-200 p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-amber-700 uppercase tracking-wider">In Progress</p>
                  <p className="text-5xl font-black text-amber-600 mt-2">{stats.inProgress}</p>
                </div>
                <Clock className="w-16 h-16 text-amber-300 opacity-50" />
              </div>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-200 p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-emerald-700 uppercase tracking-wider">Resolved</p>
                  <p className="text-5xl font-black text-emerald-600 mt-2">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-16 h-16 text-emerald-300 opacity-50" />
              </div>
            </div>
            <div className="bg-sky-50 border-2 border-sky-200 p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-sky-700 uppercase tracking-wider">Urgent</p>
                  <p className="text-5xl font-black text-sky-600 mt-2">{stats.high}</p>
                </div>
                <Zap className="w-16 h-16 text-sky-300 opacity-50" />
              </div>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex gap-2 flex-wrap">
              <span className="font-black text-black uppercase text-sm">Status:</span>
              {(['all', 'open', 'in-progress', 'resolved'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 border-2 font-black text-sm transition ${filterStatus === status ? 'bg-black text-white border-black' : 'bg-white text-black border-black hover:shadow-md'}`}
                >
                  {status === 'in-progress' ? 'PROGRESS' : status.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="font-black text-black uppercase text-sm">Priority:</span>
              {(['all', 'low', 'medium', 'high'] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => setFilterPriority(priority)}
                  className={`px-4 py-2 border-2 font-black text-sm transition ${filterPriority === priority ? 'bg-black text-white border-black' : 'bg-white text-black border-black hover:shadow-md'}`}
                >
                  {priority.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-3xl font-black text-black mb-4">Issue Tickets</h2>
              {loading ? (
                <div className="bg-white border-2 border-black p-8 text-center">
                  <p className="text-black font-black text-xl">⏳ LOADING ISSUES...</p>
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="bg-white border-2 border-black p-8 text-center">
                  <p className="text-black font-black text-xl">NO ISSUES FOUND</p>
                </div>
              ) : (
                filteredIssues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue.id)}
                    className={`w-full text-left bg-white border-2 border-slate-200 p-4 transition hover:shadow-lg ${selectedIssue === issue.id ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-amber-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 flex-1">
                        <span className="text-3xl">{getTypeIcon(issue.type)}</span>
                        <div className="flex-1">
                          <p className="font-black text-black">{issue.type} Issue</p>
                          <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                          <p className="text-xs text-gray-600 mt-2">
                            {issue.reportedBy} • {formatDate(issue.reportedDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`inline-block px-3 py-1 text-xs font-black border-2 mb-2 ${issue.priority === 'high' ? 'bg-rose-200 text-rose-800 border-rose-300' : issue.priority === 'medium' ? 'bg-amber-200 text-amber-800 border-amber-300' : 'bg-emerald-200 text-emerald-800 border-emerald-300'}`}>
                          {issue.priority.toUpperCase()}
                        </span>
                        <br />
                        <span className={`inline-block px-3 py-1 text-xs font-black border-2 ${issue.status === 'open' ? 'bg-rose-200 text-rose-800 border-rose-300' : issue.status === 'in-progress' ? 'bg-amber-200 text-amber-800 border-amber-300' : 'bg-emerald-200 text-emerald-800 border-emerald-300'}`}>
                          {issue.status === 'in-progress' ? 'PROGRESS' : issue.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="bg-white border-2 border-slate-200 p-6 shadow-sm">
              {currentIssue ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-black">Details</h2>

                  <div className="space-y-3 border-b-2 border-slate-200 pb-4">
                    <div>
                      <p className="text-xs font-black text-gray-600 uppercase">Type</p>
                      <p className="text-lg font-black text-black">{currentIssue.type}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-600 uppercase">Description</p>
                      <p className="text-sm text-gray-700">{currentIssue.description}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-600 uppercase">Priority</p>
                      <span className={`inline-block px-3 py-1 text-xs font-black border-2 ${currentIssue.priority === 'high' ? 'bg-rose-200 text-rose-800 border-rose-300' : currentIssue.priority === 'medium' ? 'bg-amber-200 text-amber-800 border-amber-300' : 'bg-emerald-200 text-emerald-800 border-emerald-300'}`}>
                        {currentIssue.priority.toUpperCase()}
                      </span>
                    </div>
                    {currentIssue.location && (
                      <div>
                        <p className="text-xs font-black text-gray-600 uppercase">Location</p>
                        <p className="text-sm font-bold text-gray-700">{currentIssue.location}</p>
                      </div>
                    )}
                    {currentIssue.image && (
                      <div>
                        <p className="text-xs font-black text-gray-600 uppercase mb-2">Attached Image</p>
                        <img 
                          src={currentIssue.image} 
                          alt="Issue attachment" 
                          className="w-full h-40 object-cover border-2 border-slate-200 bg-slate-50"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-black text-gray-600 uppercase">Status</p>
                    <button
                      onClick={() => handleStatusChange(currentIssue.id, 'open')}
                      disabled={currentIssue.status === 'open'}
                      className="w-full px-3 py-2 bg-rose-100 text-rose-800 border-2 border-rose-300 font-black text-sm hover:shadow-md active:translate-y-1 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      OPEN
                    </button>
                    <button
                      onClick={() => handleStatusChange(currentIssue.id, 'in-progress')}
                      disabled={currentIssue.status === 'in-progress'}
                      className="w-full px-3 py-2 bg-amber-100 text-amber-800 border-2 border-amber-300 font-black text-sm hover:shadow-md active:translate-y-1 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      PROGRESS
                    </button>
                    <button
                      onClick={() => handleStatusChange(currentIssue.id, 'resolved')}
                      disabled={currentIssue.status === 'resolved'}
                      className="w-full px-3 py-2 bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-black text-sm hover:shadow-md active:translate-y-1 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      RESOLVE
                    </button>
                  </div>

                  <div className="border-t-2 border-slate-200 pt-4">
                    <p className="text-xs font-black text-gray-600 uppercase mb-2">Responses ({currentIssue.responses.length})</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-3 bg-slate-50 p-3 border-2 border-slate-200">
                      {currentIssue.responses.length === 0 ? (
                        <p className="text-xs text-gray-500">No responses yet</p>
                      ) : (
                        currentIssue.responses.map((response, idx) => (
                          <div key={idx} className="bg-white border-2 border-slate-200 p-2">
                            <p className="text-xs text-gray-700">{response}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Add response..."
                      className="w-full border-2 border-slate-200 p-2 text-xs font-bold resize-none h-16 placeholder:text-gray-400 bg-white text-gray-800"
                    />
                    <button
                      onClick={() => handleAddResponse(currentIssue.id)}
                      disabled={!responseText.trim()}
                      className="w-full mt-2 px-3 py-2 bg-sky-100 text-sky-800 border-2 border-sky-300 font-black text-sm hover:shadow-md active:translate-y-1 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <MessageCircle className="w-4 h-4 inline mr-2" />
                      ADD RESPONSE
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <AlertCircle className="w-16 h-16 text-slate-400 mb-4" />
                  <p className="text-gray-600 font-black">Select an issue</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RoleAwareCopilot role="HR" onAction={handleCopilotAction} />
    </div>
  )
}
