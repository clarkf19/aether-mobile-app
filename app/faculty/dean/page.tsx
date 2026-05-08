'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, LogOut, DollarSign, Building2, AlertCircle } from 'lucide-react'
import RoleAwareCopilot from '@/components/RoleAwareCopilot'

interface ApprovalRequest {
  id: string
  title: string
  type: 'reimbursement' | 'budget' | 'room'
  amount?: number
  description: string
  requestedBy: string
  status: 'pending' | 'approved' | 'rejected'
  date: string
}

export default function DeanDashboard() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'reimbursement' | 'budget' | 'room'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [copilotAction, setCopilotAction] = useState<string>('')

  const [requests, setRequests] = useState<ApprovalRequest[]>([
    {
      id: '1',
      title: 'Tech Summit Participation',
      type: 'reimbursement',
      amount: 15000,
      description: 'Travel and accommodation for national tech conference',
      requestedBy: 'Prof. Sharma',
      status: 'pending',
      date: '2024-04-15',
    },
    {
      id: '2',
      title: 'Lab Equipment Purchase',
      type: 'budget',
      amount: 85000,
      description: 'New servers for research lab',
      requestedBy: 'Dr. Patel',
      status: 'pending',
      date: '2024-04-14',
    },
    {
      id: '3',
      title: 'Seminar Room Booking',
      type: 'room',
      description: 'Weekly seminar sessions - Lab A-301',
      requestedBy: 'Prof. Singh',
      status: 'pending',
      date: '2024-04-13',
    },
    {
      id: '4',
      title: 'Research Workshop',
      type: 'reimbursement',
      amount: 28000,
      description: 'Workshop materials and catering',
      requestedBy: 'Dr. Desai',
      status: 'pending',
      date: '2024-04-12',
    },
    {
      id: '5',
      title: 'Library Expansion Budget',
      type: 'budget',
      amount: 150000,
      description: 'New books and digital resources',
      requestedBy: 'Ms. Gupta',
      status: 'pending',
      date: '2024-04-11',
    },
  ])

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail')
    if (!storedEmail || !storedEmail.includes('dean@')) {
      router.push('/')
    }
    setEmail(storedEmail || '')
  }, [router])

  const handleApprove = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' } : r))
  }

  const handleReject = (id: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    router.push('/')
  }

  const handleCopilotAction = (actionId: string) => {
    setCopilotAction(actionId)
    switch (actionId) {
      case 'show-reimburse':
        setFilterType('reimbursement')
        setFilterStatus('pending')
        break
      case 'budget-status':
        setFilterType('budget')
        setFilterStatus('pending')
        break
      case 'room-approvals':
        setFilterType('room')
        setFilterStatus('pending')
        break
      default:
        break
    }
  }

  const filteredRequests = requests.filter((r) => {
    const typeMatch = filterType === 'all' || r.type === filterType
    const statusMatch = filterStatus === 'all' || r.status === filterStatus
    return typeMatch && statusMatch
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reimbursement':
        return <DollarSign className="w-6 h-6" />
      case 'budget':
        return <AlertCircle className="w-6 h-6" />
      case 'room':
        return <Building2 className="w-6 h-6" />
      default:
        return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'reimbursement':
        return 'Reimbursement'
      case 'budget':
        return 'Budget Approval'
      case 'room':
        return 'Room Booking'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reimbursement':
        return 'bg-green-50 border-green-300 text-green-900'
      case 'budget':
        return 'bg-blue-50 border-blue-300 text-blue-900'
      case 'room':
        return 'bg-purple-50 border-purple-300 text-purple-900'
      default:
        return 'bg-gray-50 border-gray-300 text-gray-900'
    }
  }

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    totalAmount: requests
      .filter(r => r.amount && r.status === 'pending')
      .reduce((sum, r) => sum + (r.amount || 0), 0),
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white border-2 border-black p-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-black">Dean Dashboard</h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">Manage approvals and budget requests</p>
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

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border-2 border-black p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Pending</p>
              <p className="text-4xl font-black text-yellow-600">{stats.pending}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-yellow-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white border-2 border-black p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Approved</p>
              <p className="text-4xl font-black text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white border-2 border-black p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Rejected</p>
              <p className="text-4xl font-black text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white border-2 border-black p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase">Pending Amount</p>
              <p className="text-3xl font-black text-blue-600">₹{stats.totalAmount / 1000}K</p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto mb-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <span className="font-bold text-black uppercase text-sm">Type:</span>
          {(['all', 'reimbursement', 'budget', 'room'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 border-2 border-black font-bold text-sm transition ${
                filterType === type
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="font-bold text-black uppercase text-sm">Status:</span>
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

      {/* Requests Grid */}
      <div className="max-w-6xl mx-auto space-y-4">
        <h2 className="text-2xl font-black text-black mb-4">Approval Requests</h2>
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
                <div className="md:col-span-7 flex gap-4">
                  <div className="bg-black text-white p-4 rounded flex items-center justify-center">
                    {getTypeIcon(request.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase mb-1">
                      {getTypeLabel(request.type)}
                    </p>
                    <p className="text-xl font-black text-black">{request.title}</p>
                    <p className="text-xs text-gray-700 mt-2">{request.description}</p>
                    <p className="text-xs text-gray-600 font-bold mt-2">
                      Requested by: <span className="font-black">{request.requestedBy}</span>
                    </p>
                    <p className="text-xs text-gray-600 font-bold">
                      Date: {new Date(request.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Right Section */}
                <div className="md:col-span-5 flex flex-col justify-between">
                  {request.amount && (
                    <div className="mb-3 p-3 bg-black text-white border-2 border-black">
                      <p className="text-xs font-bold uppercase">Amount Requested</p>
                      <p className="text-3xl font-black">₹{request.amount.toLocaleString()}</p>
                    </div>
                  )}

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
      <RoleAwareCopilot role="DEAN" onAction={handleCopilotAction} />
    </div>
  )
}
