'use client'

import { X } from 'lucide-react'
import { useState } from 'react'

interface PaymentModalProps {
  isOpen: boolean
  amount: string
  title: string
  onClose: () => void
  onConfirm: (method: string) => void
}

export default function PaymentModal({ isOpen, amount, title, onClose, onConfirm }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState('upi')
  const [showCardForm, setShowCardForm] = useState(false)
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateCardForm = () => {
    const errors: Record<string, string> = {}
    
    if (!cardData.cardNumber.replace(/\s/g, '')) {
      errors.cardNumber = 'Card number required'
    } else if (cardData.cardNumber.replace(/\s/g, '').length < 13) {
      errors.cardNumber = 'Invalid card number'
    }
    
    if (!cardData.expiry) {
      errors.expiry = 'Expiry required'
    } else if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      errors.expiry = 'Format: MM/YY'
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      errors.cvv = 'Valid CVV required'
    }
    
    if (!cardData.name.trim()) {
      errors.name = 'Name required'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2)
      }
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3)
    }

    setCardData({ ...cardData, [name]: formattedValue })
  }

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
    if (method === 'card') {
      setShowCardForm(true)
    }
  }

  const handleConfirmPayment = () => {
    if (selectedMethod === 'card') {
      if (!validateCardForm()) return
    }
    onConfirm(selectedMethod)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="bg-white border-2 border-black shadow-xl max-w-sm w-full p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg sm:text-xl text-black">Confirm Payment</h2>
          <button onClick={onClose} className="hover:scale-110 transition">
            <X size={20} className="text-black" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="border-b-2 border-black pb-4">
            <p className="text-xs text-gray-600 mb-1">Payment For</p>
            <p className="font-bold text-black text-sm sm:text-base">{title}</p>
          </div>

          <div className="border-b-2 border-black pb-4">
            <p className="text-xs text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl sm:text-3xl font-black text-black">{amount}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-3 font-bold uppercase tracking-wider">Payment Method</p>
            <div className="space-y-2">
              <label 
                className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition ${
                  selectedMethod === 'upi' ? 'border-black bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleMethodSelect('upi')}
              >
                <input 
                  type="radio" 
                  name="method" 
                  value="upi" 
                  checked={selectedMethod === 'upi'}
                  onChange={() => handleMethodSelect('upi')}
                  className="w-4 h-4 cursor-pointer"
                />
                <div>
                  <p className="font-bold text-sm text-black">UPI Payment</p>
                  <p className="text-xs text-gray-600">Google Pay, PhonePe, Paytm</p>
                </div>
              </label>

              <label 
                className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition ${
                  selectedMethod === 'card' ? 'border-black bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleMethodSelect('card')}
              >
                <input 
                  type="radio" 
                  name="method" 
                  value="card"
                  checked={selectedMethod === 'card'}
                  onChange={() => handleMethodSelect('card')}
                  className="w-4 h-4 cursor-pointer"
                />
                <div>
                  <p className="font-bold text-sm text-black">Debit/Credit Card</p>
                  <p className="text-xs text-gray-600">Visa, Mastercard, RuPay</p>
                </div>
              </label>
            </div>
          </div>

          {/* CARD FORM - Shows when card is selected */}
          {showCardForm && selectedMethod === 'card' && (
            <div className="border-2 border-orange-300 bg-orange-50 p-3 space-y-3 mt-4">
              <p className="text-xs font-bold text-orange-900">Enter Card Details</p>
              
              <div>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Card Number"
                  value={cardData.cardNumber}
                  onChange={handleCardInputChange}
                  maxLength={19}
                  className={`w-full p-2 border-2 text-sm font-mono ${validationErrors.cardNumber ? 'border-red-500' : 'border-black'}`}
                />
                {validationErrors.cardNumber && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.cardNumber}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={handleCardInputChange}
                    className={`w-full p-2 border-2 text-sm font-mono ${validationErrors.expiry ? 'border-red-500' : 'border-black'}`}
                  />
                  {validationErrors.expiry && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.expiry}</p>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    name="cvv"
                    placeholder="CVV"
                    value={cardData.cvv}
                    onChange={handleCardInputChange}
                    className={`w-full p-2 border-2 text-sm font-mono ${validationErrors.cvv ? 'border-red-500' : 'border-black'}`}
                  />
                  {validationErrors.cvv && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.cvv}</p>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Cardholder Name"
                  value={cardData.name}
                  onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                  className={`w-full p-2 border-2 text-sm ${validationErrors.name ? 'border-red-500' : 'border-black'}`}
                />
                {validationErrors.name && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.name}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-white border-2 border-black p-2 sm:p-3 font-bold text-black hover:shadow-lg active:translate-y-1 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmPayment}
            className="flex-1 bg-black border-2 border-black p-2 sm:p-3 font-bold text-white hover:shadow-lg active:translate-y-1 transition text-sm"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  )
}
