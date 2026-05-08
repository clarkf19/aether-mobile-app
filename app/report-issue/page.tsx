'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, CheckCircle, Image as ImageIcon, Camera, Droplets, Zap, Wifi, Armchair, HelpCircle, MapPin, AlertTriangle } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

const categories = [
  { id: 'plumbing', label: 'Plumbing', icon: Droplets },
  { id: 'electrical', label: 'Electrical', icon: Zap },
  { id: 'network', label: 'Network', icon: Wifi },
  { id: 'furniture', label: 'Furniture', icon: Armchair },
  { id: 'other', label: 'Other', icon: HelpCircle },
]

const nearbyIssues = [
  { location: 'Block C', issue: 'Water Leak', reports: 4, severity: 'high' },
  { location: 'Library', issue: 'WiFi Issue', reports: 6, severity: 'medium' },
  { location: 'Lab A-203', issue: 'AC Not Working', reports: 3, severity: 'low' },
]

export default function ReportIssuePage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    image: null as File | null
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [nextClass, setNextClass] = useState<any>(null)

  // Load next class on mount
  useEffect(() => {
    const getNextClass = () => {
      const schedules = [
        { subject: 'DAA', room: 'lab-101b', professor: 'PBB', startTime: '11:15', endTime: '12:15' },
        { subject: 'CCN', room: 'classroom-202', professor: 'AVS', startTime: '12:15', endTime: '13:15' }
      ]
      
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      
      const nextSched = schedules.find(s => {
        const [h, m] = s.startTime.split(':').map(Number)
        const startMinutes = h * 60 + m
        return startMinutes > currentMinutes
      })
      
      if (nextSched) {
        setNextClass(nextSched)
      }
    }
    
    getNextClass()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setIsUploading(true)
      setFormData(prev => ({ ...prev, image: file }))
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: { [key: string]: string } = {}
    
    // Validation
    if (!selectedCategory) {
      newErrors.category = 'Please select a category'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe the issue'
    }
    if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Please specify the location'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsUploading(true)
    setErrors({})
    
    try {
      const userEmail = localStorage.getItem('userEmail') || 'student@example.com'
      
      const response = await fetch('/api/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email: userEmail,
          student_name: 'Anjali Shah',
          category: selectedCategory,
          description: formData.description,
          location: formData.location,
          image_base64: preview,
          severity: 'medium'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit issue')
      }

      console.log('✓ Issue report submitted:', result)
      setSubmitted(true)
    } catch (error) {
      console.error('❌ Error submitting issue:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit issue. Please try again.' })
    } finally {
      setIsUploading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-400 text-red-700'
      case 'medium': return 'bg-orange-100 border-orange-400 text-orange-700'
      default: return 'bg-yellow-100 border-yellow-400 text-yellow-700'
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
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 border-2 border-black transition-all active:translate-y-0.5"
            >
              <ArrowLeft size={20} className="text-black" />
            </button>
            <div>
              <p className="text-sm text-gray-600">Hi, Student</p>
              <h1 className="text-2xl font-bold text-black">Report an Issue</h1>
            </div>
          </div>
        </div>

        {!submitted ? (
          <>
            {/* Next Class Banner */}
            {nextClass && (
              <div className="bg-gradient-to-r from-sky-100 to-sky-50 border-2 border-sky-400 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">📚 Next Class</p>
                <p className="font-bold text-lg text-black">
                  {nextClass.subject} in {nextClass.room} by {nextClass.professor}
                </p>
                <p className="text-sm text-gray-600 mt-1">{nextClass.startTime} - {nextClass.endTime}</p>
              </div>
            )}

            {/* Submit Error Message */}
            {errors.submit && (
              <div className="bg-red-100 border-2 border-red-400 text-red-700 p-4 rounded font-bold">
                ⚠️ {errors.submit}
              </div>
            )}

            {/* Category Error */}
            {errors.category && (
              <div className="bg-red-100 border-2 border-red-400 text-red-700 p-3 rounded text-sm font-bold">
                {errors.category}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white border-2 border-black p-6 shadow-md">
              <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Attach Photo</div>
              
              <div className="border-2 border-dashed border-black p-8 text-center cursor-pointer hover:bg-blue-50 transition-all group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-input"
                />
                <label htmlFor="image-input" className="cursor-pointer block">
                  {preview ? (
                    <div className="space-y-4 animate-fade-in">
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="max-w-full h-48 object-cover border-2 border-black mx-auto"
                      />
                      <p className="text-sm text-gray-600">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto bg-gray-100 border-2 border-black flex items-center justify-center group-hover:bg-cyan-100 transition-all">
                        <Camera size={28} className="text-black" />
                      </div>
                      <div>
                        <p className="font-bold text-black">Attach photo</p>
                        <p className="text-sm text-gray-500 mt-1">Helps identify issue faster</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Category Selector */}
            <div className="bg-white border-2 border-black p-6 shadow-md">
              <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Issue Category</div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  const isSelected = selectedCategory === category.id
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 border-2 border-black font-bold text-sm transition-all active:translate-y-0.5 ${
                        isSelected 
                          ? 'bg-cyan-400 text-black shadow-md' 
                          : 'bg-white text-black hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={16} />
                      {category.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border-2 border-black p-6 shadow-md">
              <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Description</div>
              {errors.description && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 p-2 rounded mb-3 text-sm font-bold">
                  {errors.description}
                </div>
              )}
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the issue in detail... What's wrong? When did you notice it? How is it affecting you?"
                required
                rows={5}
                className={`w-full border-2 p-4 font-medium text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                  errors.description ? 'border-red-400 focus:ring-red-400' : 'border-black focus:ring-cyan-400'
                }`}
              />
            </div>

            {/* Location */}
            <div className="bg-white border-2 border-black p-6 shadow-md">
              <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Location</div>
              {errors.location && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 p-2 rounded mb-3 text-sm font-bold">
                  {errors.location}
                </div>
              )}
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Room A-101, Lab 3, Canteen"
                  className={`w-full border-2 p-4 pl-12 font-medium text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                    errors.location ? 'border-red-400 focus:ring-red-400' : 'border-black focus:ring-cyan-400'
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedCategory || !formData.description}
              className="w-full bg-black text-white py-4 font-bold text-lg hover:shadow-lg active:translate-y-1 transition border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0"
            >
              Submit Report
            </button>

            {/* Nearby Issues / Hotspots */}
            <div className="bg-white border-2 border-black p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className="text-orange-500" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Nearby Issues / Hotspots</span>
              </div>
              
              <div className="space-y-3">
                {nearbyIssues.map((item, index) => (
                  <div 
                    key={index}
                    className={`p-3 border-l-4 ${getSeverityColor(item.severity)} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="flex-shrink-0" />
                      <div>
                        <p className="font-bold text-sm">{item.location}</p>
                        <p className="text-xs opacity-80">{item.issue}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-white/50 px-2 py-1 border border-current">
                      {item.reports} reports
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </form>
          </>
        ) : (
          <div className="bg-white border-2 border-black p-8 shadow-md space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 border-2 border-green-500 flex items-center justify-center mb-4">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-black">Report Submitted</h2>
              <p className="text-gray-600 mt-2">Your issue has been logged successfully</p>
            </div>
            
            <div className="bg-gray-50 border-2 border-black p-6 space-y-4">
              <p className="font-bold text-black uppercase text-xs">Report Summary</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 w-20 flex-shrink-0">Category:</span>
                  <span className="font-bold text-black capitalize">{selectedCategory}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 w-20 flex-shrink-0">Description:</span>
                  <span className="font-bold text-black">{formData.description}</span>
                </div>
                {formData.location && (
                  <div className="flex items-start gap-3">
                    <span className="text-gray-500 w-20 flex-shrink-0">Location:</span>
                    <span className="font-bold text-black">{formData.location}</span>
                  </div>
                )}
                {preview && (
                  <div className="pt-2">
                    <span className="text-gray-500 block mb-2">Attached Image:</span>
                    <img src={preview} alt="Attached" className="max-w-full h-32 object-cover border-2 border-black" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-400 p-4 text-center">
              <p className="font-bold text-green-800">✓ Report submitted to HR</p>
              <p className="text-sm text-green-700 mt-1">Your issue has been saved in the system. HR will review and take action within 24 hours</p>
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

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      </div>
    </div>
  )
}
