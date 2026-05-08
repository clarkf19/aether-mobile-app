'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PaymentCard from '@/components/PaymentCard'
import PaymentModal from '@/components/PaymentModal'
import ConfirmationPin from '@/components/ConfirmationPin'
import PaymentSuccess from '@/components/PaymentSuccess'
import Sidebar from '@/components/Sidebar'

interface Transaction {
  id: string
  amount: string
  method: string
  timestamp: string
}

export default function PaymentsPage() {
  const router = useRouter()
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [paidDues, setPaidDues] = useState<string[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showUpiRedirect, setShowUpiRedirect] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string>('')

  const dues = [
    { id: 'library', title: 'Library Fine', amount: '₹500', dueDate: 'Dec 20, 2024', status: paidDues.includes('library') ? 'paid' : 'pending' },
    { id: 'canteen', title: 'Canteen Bill', amount: '₹250', dueDate: 'Dec 25, 2024', status: paidDues.includes('canteen') ? 'paid' : 'pending' },
    { id: 'lab', title: 'Lab Fee', amount: '₹1,500', dueDate: 'Jan 05, 2025', status: paidDues.includes('lab') ? 'paid' : 'pending' },
  ]

  const handlePayClick = (due: any) => {
    if (due.status !== 'paid') {
      setSelectedPayment(due)
      setShowModal(true)
    }
  }

  const handleModalConfirm = (method: string) => {
    setSelectedMethod(method)
    setShowModal(false)
    
    if (method === 'upi') {
      setShowUpiRedirect(true)
      
      setTimeout(() => {
        setShowUpiRedirect(false)
        setIsProcessing(true)
        setShowPin(true)
        
        setTimeout(() => {
          setIsProcessing(false)
          setPaidDues(prev => [...prev, selectedPayment.id])
          
          const newTransaction: Transaction = {
            id: `TXN${Date.now()}`,
            amount: selectedPayment.amount,
            method: 'UPI',
            timestamp: new Date().toLocaleString('en-IN')
          }
          setTransactions(prev => [newTransaction, ...prev])
          setShowPin(false)
          setShowSuccess(true)
        }, 1500)
      }, 2000)
    } else if (method === 'card') {
      setShowPin(true)
    }
  }

  const handlePinConfirm = (pin: string) => {
    setIsProcessing(true)
    setShowPin(false)

    setTimeout(() => {
      setIsProcessing(false)
      setPaidDues(prev => [...prev, selectedPayment.id])
      
      const newTransaction: Transaction = {
        id: `TXN${Date.now()}`,
        amount: selectedPayment.amount,
        method: selectedMethod === 'upi' ? 'UPI' : 'Debit Card',
        timestamp: new Date().toLocaleString('en-IN')
      }
      setTransactions(prev => [newTransaction, ...prev])
      
      setShowSuccess(true)
    }, 2000)
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    setSelectedPayment(null)
    setSelectedMethod('')
  }

  const totalPending = dues
    .filter(d => d.status === 'pending')
    .reduce((sum, d) => {
      const amount = parseInt(d.amount.replace(/₹|,/g, ''))
      return sum + amount
    }, 0)

  const totalPaid = dues
    .filter(d => d.status === 'paid')
    .reduce((sum, d) => {
      const amount = parseInt(d.amount.replace(/₹|,/g, ''))
      return sum + amount
    }, 0)

  return (
    <div className="w-full h-screen overflow-auto bg-amber-50 flex flex-col pb-20">
      <div className="flex-1 overflow-y-auto">
        <div className="relative p-3 sm:p-4 max-w-sm mx-auto space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded border-2 border-black bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-gray-50"
            >
              Back
            </button>
            <div className="text-center flex-1">
              <h1 className="text-2xl sm:text-3xl font-black text-black">Financial Gateway</h1>
              <p className="text-xs sm:text-sm text-gray-600">Manage your outstanding dues</p>
            </div>
            <div className="w-24" />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="bg-red-100 border-2 border-black p-3 sm:p-4 shadow-md">
              <p className="text-xs text-gray-600 font-bold mb-1">Pending</p>
              <p className="text-xl sm:text-2xl font-black text-black">₹{totalPending.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 border-2 border-black p-3 sm:p-4 shadow-md">
              <p className="text-xs text-gray-600 font-bold mb-1">Paid</p>
              <p className="text-xl sm:text-2xl font-black text-black">₹{totalPaid.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            <h2 className="font-bold text-black text-sm px-1 uppercase tracking-wider">Outstanding Dues</h2>
            {dues.map((due) => (
              <PaymentCard
                key={due.id}
                title={due.title}
                amount={due.amount}
                dueDate={due.dueDate}
                status={due.status as 'pending' | 'due' | 'paid'}
                onPayClick={() => handlePayClick(due)}
              />
            ))}
          </div>

          <div className="bg-white border-2 border-black p-3 sm:p-4 shadow-md">
            <h2 className="font-bold text-black text-sm mb-3 uppercase tracking-wider">Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-4">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-2 border-l-4 border-green-500 bg-green-50">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-black">{txn.amount}</p>
                      <p className="text-xs text-gray-600">{txn.method} • {txn.timestamp}</p>
                    </div>
                    <p className="text-xs font-black text-green-700">{txn.id}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Sidebar />

      {showUpiRedirect && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-3 border-black shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-4" />
            </div>
            <h3 className="font-black text-black text-xl mb-2">🔄 Redirecting to UPI</h3>
            <p className="text-sm font-bold text-gray-700 mb-2">{selectedPayment?.amount}</p>
            <p className="text-xs text-gray-600">Opening UPI app (Google Pay, PhonePe, Paytm)</p>
            <div className="mt-6 flex gap-2 justify-center text-xl">
              <span>💳</span>
              <span className="animate-pulse">🔗</span>
              <span>📱</span>
            </div>
          </div>
        </div>
      )}

      {selectedPayment && (
        <>
          <PaymentModal
            isOpen={showModal}
            amount={selectedPayment.amount}
            title={selectedPayment.title}
            onClose={() => setShowModal(false)}
            onConfirm={handleModalConfirm}
          />
          <ConfirmationPin
            isOpen={showPin}
            onClose={() => {
              setShowPin(false)
              if (selectedMethod === 'card') {
                setShowModal(true)
              }
            }}
            onConfirm={handlePinConfirm}
            isLoading={isProcessing}
          />
          <PaymentSuccess
            isOpen={showSuccess}
            amount={selectedPayment.amount}
            title={selectedPayment.title}
            transactionId={transactions[0]?.id || `TXN${Date.now()}`}
            timestamp={new Date().toLocaleString()}
            onClose={handleSuccessClose}
          />
        </>
      )}
    </div>
  )
}
