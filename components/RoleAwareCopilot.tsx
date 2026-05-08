'use client'

import { useState } from 'react'
import { Zap, Send, X } from 'lucide-react'

interface CopilotSuggestion {
  id: string
  text: string
  icon: string
  action: () => void
}

interface RoleAwareCopilotProps {
  role: 'HOD' | 'TEACHER' | 'DEAN' | 'HR'
  onAction?: (actionId: string) => void
}

export default function RoleAwareCopilot({ role, onAction }: RoleAwareCopilotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<CopilotSuggestion[]>([])

  const roleSuggestions: { [key: string]: CopilotSuggestion[] } = {
    HOD: [
      {
        id: 'show-pending',
        text: 'Show pending approvals',
        icon: '📋',
        action: () => handleSuggestion('show-pending'),
      },
      {
        id: 'approve-all-certs',
        text: 'Approve all certificate requests',
        icon: '✓',
        action: () => handleSuggestion('approve-all-certs'),
      },
      {
        id: 'pending-room',
        text: 'Show pending room booking requests',
        icon: '🏢',
        action: () => handleSuggestion('pending-room'),
      },
    ],
    TEACHER: [
      {
        id: 'show-classes',
        text: "Show today's classes",
        icon: '📚',
        action: () => handleSuggestion('show-classes'),
      },
      {
        id: 'mark-attendance',
        text: 'Mark attendance for 3rd year',
        icon: '✓',
        action: () => handleSuggestion('mark-attendance'),
      },
      {
        id: 'send-notice',
        text: 'Send notice to all students',
        icon: '📢',
        action: () => handleSuggestion('send-notice'),
      },
    ],
    DEAN: [
      {
        id: 'show-reimburse',
        text: 'Show pending reimbursements',
        icon: '💰',
        action: () => handleSuggestion('show-reimburse'),
      },
      {
        id: 'budget-status',
        text: 'Show budget status',
        icon: '📊',
        action: () => handleSuggestion('budget-status'),
      },
      {
        id: 'room-approvals',
        text: 'Show room approval requests',
        icon: '🔑',
        action: () => handleSuggestion('room-approvals'),
      },
    ],
    HR: [
      {
        id: 'show-issues',
        text: 'Show unresolved issues',
        icon: '⚠️',
        action: () => handleSuggestion('show-issues'),
      },
      {
        id: 'pending-tickets',
        text: 'Show pending tickets',
        icon: '🎫',
        action: () => handleSuggestion('pending-tickets'),
      },
      {
        id: 'urgent-only',
        text: 'Show urgent issues only',
        icon: '🔴',
        action: () => handleSuggestion('urgent-only'),
      },
    ],
  }

  const handleSuggestion = (actionId: string) => {
    setSuggestions([])
    setInput('')
    onAction?.(actionId)
  }

  const handleInputChange = (text: string) => {
    setInput(text)
    // Filter suggestions based on input
    if (text.length > 0) {
      const filtered = roleSuggestions[role].filter((s) =>
        s.text.toLowerCase().includes(text.toLowerCase())
      )
      setSuggestions(filtered.length > 0 ? filtered : roleSuggestions[role])
    } else {
      setSuggestions([])
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full shadow-lg hover:shadow-xl active:translate-y-1 transition border-2 border-black flex items-center justify-center z-50"
      >
        <Zap size={24} />
      </button>

      {/* Copilot Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-80 bg-white border-2 border-black shadow-lg z-50">
          <div className="bg-black text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={20} />
              <span className="font-bold">AETHER Copilot</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-gray-800 p-1 rounded"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full border-2 border-black p-2 text-sm font-medium placeholder:text-gray-400"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black hover:bg-gray-100 p-1 rounded">
                <Send size={16} />
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <p className="text-xs font-bold text-gray-600 uppercase">Suggestions</p>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => suggestion.action()}
                    className="w-full text-left p-2 bg-amber-50 border-2 border-black hover:bg-amber-100 transition text-sm font-medium"
                  >
                    <span className="mr-2">{suggestion.icon}</span>
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}

            {!suggestions.length && input.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-600 uppercase">Quick Commands</p>
                {roleSuggestions[role].slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => suggestion.action()}
                    className="w-full text-left p-2 bg-amber-50 border border-black hover:bg-amber-100 transition text-sm font-medium"
                  >
                    <span className="mr-2">{suggestion.icon}</span>
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
