'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, User, Users, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loginType, setLoginType] = useState<'student' | 'faculty'>('student')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    uid: '',
    email: '',
    password: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const getRoleFromEmail = (email: string): string | null => {
    const emailLower = email.toLowerCase()
    if (emailLower.includes('hod@spit.ac.in')) return 'HOD'
    if (emailLower.includes('teacher@spit.ac.in')) return 'TEACHER'
    if (emailLower.includes('dean@spit.ac.in')) return 'DEAN'
    if (emailLower.includes('hr@spit.ac.in')) return 'HR'
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (loginType === 'student') {
      if (!formData.uid || !formData.email || !formData.password) {
        setError('Please fill in all fields')
        return
      }
      localStorage.setItem('userRole', 'STUDENT')
      localStorage.setItem('userEmail', formData.email)
      router.push('/student')
    } else {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields')
        return
      }

      const role = getRoleFromEmail(formData.email)
      if (!role) {
        setError('Invalid faculty email. Use hod@, teacher@, dean@, or hr@spit.ac.in')
        return
      }

      // Store role and email in localStorage
      localStorage.setItem('userRole', role)
      localStorage.setItem('userEmail', formData.email)

      // Navigate to appropriate dashboard
      const roleRoutes: { [key: string]: string } = {
        HOD: '/faculty/hod',
        TEACHER: '/faculty/teacher',
        DEAN: '/faculty/dean',
        HR: '/faculty/hr',
      }

      router.push(roleRoutes[role])
    }
  }

  const isFormValid = () => {
    if (loginType === 'student') {
      return formData.uid && formData.email && formData.password
    } else {
      return formData.email && formData.password
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-black p-6 shadow-md">
          <div className="flex flex-col items-center gap-3 text-center mb-6">
            <div className="rounded-full border-2 border-black bg-black p-4 text-white">
              <Users size={32} />
            </div>
            <h1 className="text-3xl font-black text-black">AETHER Access</h1>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginType('student')
                setError('')
              }}
              className={`flex-1 rounded border-2 border-black px-4 py-3 text-sm font-bold transition ${
                loginType === 'student'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('faculty')
                setError('')
              }}
              className={`flex-1 rounded border-2 border-black px-4 py-3 text-sm font-bold transition ${
                loginType === 'faculty'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-50'
              }`}
            >
              Faculty
            </button>
          </div>

          {error && (
            <div className="mb-4 border-2 border-red-400 bg-red-50 p-3 flex items-center gap-2 text-red-900">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {loginType === 'faculty' && (
            <div className="mb-4 bg-blue-50 border-2 border-blue-300 p-3 text-xs font-medium text-blue-900">
              <strong>Faculty Roles:</strong> hod@spit.ac.in, teacher@spit.ac.in, dean@spit.ac.in, hr@spit.ac.in
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginType === 'student' && (
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase">UID</label>
                <input
                  type="text"
                  name="uid"
                  value={formData.uid}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-black p-3 font-medium text-black placeholder:text-gray-400"
                  placeholder="Enter your UID"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-black mb-2 uppercase">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full border-2 border-black p-3 font-medium text-black placeholder:text-gray-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2 uppercase">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-black p-3 font-medium text-black placeholder:text-gray-400 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid()}
              className="w-full bg-black text-white py-4 font-bold text-lg hover:shadow-lg active:translate-y-1 transition border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0"
            >
              {loginType === 'student' ? 'Student Login' : 'Faculty Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
