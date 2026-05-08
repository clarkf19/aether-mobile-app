'use client'

import { CheckCircle2, Download, Home } from 'lucide-react'

interface PaymentSuccessProps {
  isOpen: boolean
  amount: string
  title: string
  transactionId: string
  timestamp: string
  onClose: () => void
}

const downloadReceipt = (amount: string, title: string, transactionId: string, timestamp: string) => {
  const receiptContent = `PAYMENT RECEIPT\n================================\n\nTransaction ID: ${transactionId}\nDate & Time: ${timestamp}\n\n================================\nPayment Details\n================================\n\nPayment For: ${title}\nAmount Paid: ${amount}\n\n================================\nStatus: ✓ SUCCESSFUL\n================================\n\nThis is an automated receipt. No signature required.\nFor support, contact: finance@campus.edu\n\n================================\n`
  
  const element = document.createElement('a')
  const file = new Blob([receiptContent], { type: 'text/plain' })
  element.href = URL.createObjectURL(file)
  element.download = `receipt_${transactionId}.txt`
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

export default function PaymentSuccess({ isOpen, amount, title, transactionId, timestamp, onClose }: PaymentSuccessProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="bg-white border-4 border-black shadow-2xl max-w-sm w-full p-6 sm:p-8 animate-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-green-500 bg-green-100 mb-6 animate-pulse">
            <CheckCircle2 size={56} className="text-green-600" />
          </div>
          <h2 className="font-black text-2xl sm:text-3xl text-green-700 mb-2">✓ Payment Successful!</h2>
          <p className="text-xs text-gray-600 font-bold">Your payment has been processed</p>
        </div>

        <div className="space-y-3 mb-8 border-4 border-green-500 p-6 bg-green-50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-black text-gray-700">Payment For:</span>
            <span className="text-sm font-black text-black text-right">{title}</span>
          </div>
          <div className="border-t-2 border-green-400 pt-3 flex justify-between items-center">
            <span className="text-sm font-black text-gray-700">Amount Paid:</span>
            <span className="text-xl font-black text-green-700">{amount}</span>
          </div>
          <div className="border-t-2 border-green-400 pt-3 flex justify-between items-center">
            <span className="text-xs font-black text-gray-600">Transaction ID:</span>
            <span className="text-xs font-mono font-black text-gray-800">{transactionId}</span>
          </div>
          <div className="border-t-2 border-green-400 pt-3 flex justify-between items-center">
            <span className="text-xs font-black text-gray-600">Date & Time:</span>
            <span className="text-xs font-black text-gray-800">{timestamp}</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onClose}
            className="w-full bg-green-600 border-3 border-green-700 text-white font-black p-3 hover:shadow-lg active:translate-y-1 transition text-sm flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Back to Payments
          </button>
          <button
            onClick={() => downloadReceipt(amount, title, transactionId, timestamp)}
            className="w-full bg-white border-3 border-black text-black font-black p-3 hover:shadow-lg active:translate-y-1 transition text-sm flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download Receipt
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600 font-bold">✓ Instant confirmation sent to your email</p>
        </div>
      </div>
    </div>
  )
}
