'use client'

import { CreditCard, CheckCircle2 } from 'lucide-react'

interface PaymentCardProps {
  title: string
  amount: string
  dueDate?: string
  status: 'pending' | 'due' | 'paid'
  onPayClick: () => void
}

export default function PaymentCard({ title, amount, dueDate, status, onPayClick }: PaymentCardProps) {
  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'paid':
        return { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-900' }
      case 'due':
        return { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-900' }
      default:
        return { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-900' }
    }
  }

  const styles = getStatusStyles(status)

  return (
    <div className={`border-2 border-black p-4 shadow-md ${styles.bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <CreditCard size={24} className="text-black mt-1" />
          <div>
            <h3 className="font-bold text-black text-sm sm:text-base">{title}</h3>
            {dueDate && <p className="text-xs text-gray-600 mt-1">Due: {dueDate}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 mb-1">Amount Due</p>
          <p className="text-2xl sm:text-3xl font-black text-black">{amount}</p>
        </div>
        {status === 'paid' ? (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 size={28} />
            <span className="font-bold text-xs sm:text-sm">Paid</span>
          </div>
        ) : (
          <button
            onClick={onPayClick}
            className="btn-neo primary px-3 sm:px-4 py-2 text-xs sm:text-sm"
          >
            Pay Now
          </button>
        )}
      </div>
    </div>
  )
}
