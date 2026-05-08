'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function TeacherPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        <div className="bg-white border-2 border-black p-6 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full border-2 border-black bg-black p-3 text-white">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-600">Teacher Home</p>
                <h1 className="text-3xl font-black text-black">Welcome, Teacher</h1>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="rounded border-2 border-black bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-gray-50"
            >
              Logout
            </button>
          </div>

          <div className="mt-8 rounded border-2 border-black bg-amber-50 p-6 text-center">
            <p className="text-sm text-gray-700">This is a simple teacher home page.</p>
            <p className="mt-4 font-bold text-black">No additional features are loaded yet.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
