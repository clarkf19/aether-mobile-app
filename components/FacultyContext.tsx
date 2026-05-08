'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type UserRole = 'HOD' | 'TEACHER' | 'DEAN' | 'HR'

interface FacultyContextType {
  role: UserRole | null
  email: string | null
  loading: boolean
  logout: () => void
}

const FacultyContext = createContext<FacultyContextType | undefined>(undefined)

export function FacultyProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage on mount
    const storedRole = localStorage.getItem('userRole') as UserRole | null
    const storedEmail = localStorage.getItem('userEmail')
    setRole(storedRole)
    setEmail(storedEmail)
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    setRole(null)
    setEmail(null)
  }

  return (
    <FacultyContext.Provider value={{ role, email, loading, logout }}>
      {children}
    </FacultyContext.Provider>
  )
}

export function useFaculty() {
  const context = useContext(FacultyContext)
  if (context === undefined) {
    throw new Error('useFaculty must be used within FacultyProvider')
  }
  return context
}
