'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { Zap, Send, Sparkles, BookOpen, Calendar, HelpCircle } from 'lucide-react'

export default function AICopilotPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI Campus Assistant. I can help you with class schedules, assignments, campus navigation, and more. What would you like to know?' }
  ])

  const quickActions = [
    { icon: Calendar, label: 'Today\'s Schedule', prompt: 'What classes do I have today?' },
    { icon: BookOpen, label: 'Pending Assignments', prompt: 'Show my pending assignments' },
    { icon: HelpCircle, label: 'Find a Room', prompt: 'Where is room A-203?' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    setMessages(prev => [...prev, { role: 'user', content: input }])
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I understand you're asking about "${input}". As a demo, I can help with schedules, assignments, room locations, and campus services. In a full implementation, I'd provide real-time answers from the campus database.`
      }])
    }, 1000)
    
    setInput('')
  }

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-amber-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b-4 border-black p-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-300 p-2 border-2 border-black">
              <Zap size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-black">AI Campus Copilot</h1>
              <p className="text-sm text-gray-600">Your intelligent campus assistant</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-b-2 border-black/10 p-4">
          <div className="flex gap-3 overflow-x-auto">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-2 border-black/20 hover:border-black hover:bg-yellow-100 transition-all whitespace-nowrap"
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-4 ${
                  message.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-white border-2 border-black'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-yellow-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase">AI Assistant</span>
                  </div>
                )}
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white border-t-4 border-black p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about campus..."
              className="flex-1 px-4 py-3 border-2 border-black bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-yellow-300 border-2 border-black font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
