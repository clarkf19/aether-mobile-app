'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export default function LeaveRequestPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: 'Anjali Shah',
    subject: '',
    date: '',
    reason: '',
    file: null as File | null
  })
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Save to backend API
    const userEmail = localStorage.getItem('userEmail') || 'student@example.com'
    const newLeaveRequest = {
      studentEmail: userEmail,
      studentName: formData.name,
      leaveType: formData.subject,
      date: formData.date,
      reason: formData.reason,
    }
    
    try {
      const response = await fetch('/api/requests/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeaveRequest)
      })
      
      if (response.ok) {
        setSubmitted(true)
      } else {
        console.error('Error saving leave request:', response.statusText)
      }
    } catch (error) {
      console.error('Error saving leave request:', error)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-amber-50">
      <Sidebar />
      <div className="flex-1 overflow-auto" style={{
        background: 'linear-gradient(180deg, #EAF4FF 0%, #F5FAFF 50%, #FFFFFF 100%)',
        backgroundAttachment: 'fixed'
      }}>
        <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 border-2 border-black"
          >
            <ArrowLeft size={20} className="text-black" />
          </button>
          <h1 className="text-3xl font-bold text-black">Leave Request</h1>
        </div>

        {!submitted ? (
          <div className="bg-white border-2 border-black p-8 shadow-md space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  disabled
                  className="w-full border-2 border-black p-3 font-semibold text-black/60 bg-gray-50"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase">Leave Type</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-black p-3 font-semibold text-black"
                >
                  <option value="">Select Leave Type</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Family Emergency">Family Emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-black p-3 font-semibold text-black"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase">Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  placeholder="Explain the reason for your leave request..."
                  className="w-full border-2 border-black p-3 font-semibold text-black placeholder:text-gray-400"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase">Upload Proof (Optional)</label>
                <div className="border-2 border-dashed border-black p-6 text-center cursor-pointer hover:bg-blue-50 transition">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer block">
                    <Upload size={24} className="mx-auto text-black mb-2" />
                    <p className="font-bold text-black">{formData.file?.name || 'Click to upload or drag and drop'}</p>
                    <p className="text-sm text-gray-600 mt-1">PDF, DOC, or image files</p>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-black text-white py-4 font-bold text-lg hover:shadow-lg active:translate-y-1 transition border-2 border-black"
              >
                Submit Leave Request
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white border-2 border-black p-8 shadow-md space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-black">Request Submitted Successfully</h2>
            
            <div className="bg-blue-50 border-2 border-black p-6 space-y-3 text-left">
              <p className="font-bold text-black uppercase text-xs">Request Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-bold text-black">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Leave Type:</span>
                  <span className="font-bold text-black">{formData.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-bold text-black">{formData.date}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-400 p-4">
              <p className="font-bold text-black">Request sent to HOD</p>
              <p className="text-sm text-gray-600 mt-1">You will receive an approval notification within 24 hours</p>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full bg-black text-white py-3 font-bold hover:shadow-lg active:translate-y-1 transition"
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
