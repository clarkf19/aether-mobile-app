'use client'

import { useState, useEffect } from 'react'

interface ConfirmationPinProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (pin: string) => void
  isLoading?: boolean
}

export default function ConfirmationPin({ isOpen, onClose, onConfirm, isLoading = false }: ConfirmationPinProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  // Auto-close after processing completes
  useEffect(() => {
    if (isLoading && pin === '') {
      const timer = setTimeout(() => {
        onClose()
      }, 3000) // Close after 3 seconds of processing
      return () => clearTimeout(timer)
    }
  }, [isLoading, pin, onClose])

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value.length <= 4) {
      setPin(value)
      setError('')
    }
  }

  const handleConfirm = () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits')
      return
    }
    onConfirm(pin)
    setPin('')
  }

  if (!isOpen) return null

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-0">
        <div className="bg-white border-3 border-black shadow-2xl max-w-sm w-full p-6 sm:p-8 text-center">
          <div className="mb-4">
            <div className="w-14 h-14 rounded-full border-4 border-green-500 border-t-transparent animate-spin mx-auto mb-4" />
          </div>
          <h3 className="font-black text-black text-xl mb-2">Processing Payment</h3>
          <p className="text-xs text-gray-600 font-bold">Please wait while we complete your transaction...</p>
          <div className="mt-4 flex gap-1 justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="bg-white border-3 border-black shadow-2xl max-w-sm w-full p-4 sm:p-6">
        <h2 className="font-black text-lg sm:text-xl text-black mb-6">Enter Transaction PIN</h2>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-bold">Enter your 4-digit secure PIN</p>

          <div>
            <input
              type="password"
              value={pin}
              onChange={handlePinChange}
              placeholder="****"
              maxLength={4}
              className="w-full border-3 border-black text-center text-4xl font-black p-4 focus:outline-none focus:ring-4 focus:ring-yellow-300"
            />
            {error && <p className="text-red-600 text-xs mt-2 font-bold">{error}</p>}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => setPin(prev => (prev + num).slice(-4))}
                disabled={isLoading}
                className="bg-white border-2 border-black p-3 font-black text-lg hover:shadow-lg active:translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setPin('')}
              disabled={isLoading}
              className="bg-white border-2 border-black col-span-3 p-2 font-bold text-sm hover:shadow-lg active:translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-white border-3 border-black p-2 sm:p-3 font-black text-black hover:shadow-lg active:translate-y-1 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || pin.length !== 4}
              className="flex-1 bg-black border-3 border-black p-2 sm:p-3 font-black text-white hover:shadow-lg active:translate-y-1 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
