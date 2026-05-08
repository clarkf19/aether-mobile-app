'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export default function CertificateRequestPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    certificateType: '',
    purpose: '',
    dateRequired: '',
    deliveryMethod: 'email'
  })
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Save to backend API
    const userEmail = localStorage.getItem('userEmail') || 'student@example.com'
    const newCertificateRequest = {
      studentEmail: userEmail,
      studentName: 'Student',
      certificateType: formData.certificateType,
      purpose: formData.purpose,
      dateRequired: formData.dateRequired,
      deliveryMethod: formData.deliveryMethod,
    }
    
    try {
      const response = await fetch('/api/requests/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCertificateRequest)
      })
      
      if (response.ok) {
        setSubmitted(true)
      } else {
        console.error('Error saving certificate request:', response.statusText)
      }
    } catch (error) {
      console.error('Error saving certificate request:', error)
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
            <h1 className="text-3xl font-bold text-black">Certificate Request</h1>
          </div>

          {!submitted ? (
            <div className="bg-white border-2 border-black p-8 shadow-md space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Certificate Type */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase">Certificate Type</label>
                  <select
                    name="certificateType"
                    value={formData.certificateType}
                    onChange={handleInputChange}
                    required
                    className="w-full border-2 border-black p-3 font-semibold text-black"
                  >
                    <option value="">Select Certificate Type</option>
                    <option value="Character Certificate">Character Certificate</option>
                    <option value="Bonafide Certificate">Bonafide Certificate</option>
                    <option value="Course Completion Certificate">Course Completion Certificate</option>
                    <option value="Degree Certificate">Degree Certificate</option>
                    <option value="Internship Certificate">Internship Certificate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase">Purpose</label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    placeholder="Why do you need this certificate? (e.g., for job application, higher studies, etc.)"
                    required
                    rows={4}
                    className="w-full border-2 border-black p-3 font-medium text-black placeholder:text-gray-400"
                  />
                </div>

                {/* Date Required */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase">Date Required By</label>
                  <input
                    type="date"
                    name="dateRequired"
                    value={formData.dateRequired}
                    onChange={handleInputChange}
                    required
                    className="w-full border-2 border-black p-3 font-semibold text-black"
                  />
                </div>

                {/* Delivery Method */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase">Delivery Method</label>
                  <select
                    name="deliveryMethod"
                    value={formData.deliveryMethod}
                    onChange={handleInputChange}
                    className="w-full border-2 border-black p-3 font-semibold text-black"
                  >
                    <option value="email">Email</option>
                    <option value="physical">Physical Copy</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!formData.certificateType || !formData.purpose || !formData.dateRequired}
                  className="w-full bg-black text-white py-3 px-4 border-2 border-black font-bold text-lg hover:shadow-md active:translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
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
                <h2 className="text-2xl font-bold text-black">Request Submitted!</h2>
                <p className="text-gray-600">Your certificate request has been sent to the HOD for approval.</p>
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
