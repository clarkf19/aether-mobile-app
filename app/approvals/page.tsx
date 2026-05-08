'use client'

import dynamic from 'next/dynamic'

// Dynamically import the approvals content with SSR disabled
// This is necessary because jspdf has dependencies that don't work during SSR
const ApprovalsContent = dynamic(
  () => import('@/components/approvals-content'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center min-h-screen" style={{
        background: 'linear-gradient(180deg, #EAF4FF 0%, #F5FAFF 50%, #FFFFFF 100%)',
      }}>
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }
)

export default function ApprovalsPage() {
  return <ApprovalsContent />
}
