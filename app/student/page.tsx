'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Sidebar from '@/components/Sidebar'
import StudentHome from '@/components/StudentHome'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-amber-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-gray-600">Loading Map...</p>
      </div>
    </div>
  ),
})

function StudentPageContent() {
  const searchParams = useSearchParams()
  const viewParam = searchParams.get('view') === 'map' ? 'map' : 'home'
  const [currentView, setCurrentView] = useState<'home' | 'map'>(viewParam)

  return (
    <div className="w-screen h-screen overflow-hidden bg-amber-50 relative flex flex-col">
      <div className="flex-1 overflow-auto pb-20">
        {currentView === 'home' ? (
          <StudentHome homePath="/student" />
        ) : (
          <MapView />
        )}
      </div>

      <Sidebar currentView={currentView} setCurrentView={setCurrentView} homeHref="/student" mapHref="/student?view=map" />
    </div>
  )
}

export default function StudentPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-amber-50" />}>
      <StudentPageContent />
    </Suspense>
  )
}
