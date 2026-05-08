"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, CheckCircle2, ChevronRight, ChevronLeft, Download, AlertCircle, Building, BookOpen, CreditCard, Loader2, Calendar, LayoutDashboard, Mail, Bell, Sparkles, Mic, MicOff, Volume2, VolumeX, Clock, AlertTriangle } from "lucide-react";
import { generateCompleteDocumentPackage, AcademicDocument } from "@/lib/pdfGenerator";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { calculateMissedWork, TIMETABLE } from "@/lib/timetable";

const CalendarWidget = ({ selectedDates, onToggleDate }: { selectedDates: string[], onToggleDate: (d: string) => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [missedWork, setMissedWork] = useState<{ lectures: string; labs: string } | null>(null);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Automatically update missed work when dates change
  useEffect(() => {
    if (selectedDates.length > 0) {
      const result = calculateMissedWork(selectedDates);
      setMissedWork(result);
    } else {
      setMissedWork(null);
    }
  }, [selectedDates]);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = new Date(year, month, i).toDateString();
    const isSelected = selectedDates.includes(dateStr);
    const dateObj = new Date(year, month, i);
    const dayOfWeek = dateObj.getDay();
    const daySchedule = TIMETABLE[dayOfWeek];
    const hasClasses = daySchedule && (daySchedule.lectures.length > 0 || daySchedule.labs.length > 0);
    
    days.push(
      <motion.button 
        key={i}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => { e.preventDefault(); onToggleDate(dateStr); }}
        className={`w-10 h-10 flex items-center justify-center rounded-lg text-xs font-bold transition-all relative group ${
          isSelected 
            ? 'bg-gradient-to-br from-[#c9a059] to-[#8b6d3b] text-white shadow-lg shadow-[#c9a059]/50' 
            : hasClasses 
            ? 'bg-white/5 text-white hover:bg-white/10 border border-white/20' 
            : 'bg-white/5 text-gray-500 hover:bg-white/10'
        }`}
        title={hasClasses ? `Classes scheduled` : 'No classes'}
      >
        {i}
        {hasClasses && !isSelected && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#c9a059] rounded-full"></span>}
      </motion.button>
    );
  }
  
  const prevMonth = (e: React.MouseEvent) => { e.preventDefault(); setCurrentDate(new Date(year, month - 1, 1)); };
  const nextMonth = (e: React.MouseEvent) => { e.preventDefault(); setCurrentDate(new Date(year, month + 1, 1)); };

  return (
    <motion.div className="w-full space-y-4 bg-gradient-to-br from-black/40 to-black/20 p-4 rounded-xl border border-white/10 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
      {/* Calendar Header */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <motion.button onClick={prevMonth} whileHover={{ scale: 1.1 }} className="text-gray-400 hover:text-[#c9a059] p-2 rounded-lg hover:bg-white/5 transition-all"><ChevronLeft className="w-5 h-5" /></motion.button>
          <div className="text-white text-sm font-bold uppercase tracking-widest">{monthNames[month]} {year}</div>
          <motion.button onClick={nextMonth} whileHover={{ scale: 1.1 }} className="text-gray-400 hover:text-[#c9a059] p-2 rounded-lg hover:bg-white/5 transition-all"><ChevronRight className="w-5 h-5" /></motion.button>
        </div>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{d}</div>)}
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 place-items-center bg-black/20 p-4 rounded-lg">
        {days}
      </div>
      
      {/* Selected Dates Info */}
      {selectedDates.length > 0 && (
        <motion.div className="space-y-3 bg-black/30 p-3 rounded-lg border border-[#c9a059]/30" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Selected Dates: {selectedDates.length}</div>
          <div className="space-y-2">
            {selectedDates.map(date => {
              const dateObj = new Date(date);
              return (
                <div key={date} className="text-xs text-gray-300 flex items-center justify-between p-2 bg-white/5 rounded">
                  <span>{dateObj.toLocaleDateString('en-IN')}</span>
                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => onToggleDate(date)} className="text-gray-500 hover:text-red-400">✕</motion.button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
      
      {/* Automatic Missed Work Detection */}
      {missedWork && (selectedDates.length > 0) && (
        <motion.div className="space-y-3 bg-gradient-to-br from-[#c9a059]/10 to-transparent p-3 rounded-lg border border-[#c9a059]/40" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-sm font-bold text-[#c9a059] uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            Missed Coursework Detection
          </div>
          
          {/* Missed Lectures */}
          {missedWork.lectures && (
            <div className="space-y-1">
              <div className="text-xs text-gray-400 font-semibold">📚 Missed Lectures:</div>
              <div className="text-xs text-gray-300 bg-black/30 p-2 rounded border-l-2 border-[#c9a059]">
                {missedWork.lectures}
              </div>
            </div>
          )}
          
          {/* Missed Labs */}
          {missedWork.labs && (
            <div className="space-y-1">
              <div className="text-xs text-gray-400 font-semibold">🔬 Missed Practicals:</div>
              <div className="text-xs text-gray-300 bg-black/30 p-2 rounded border-l-2 border-[#c9a059]">
                {missedWork.labs}
              </div>
            </div>
          )}
          
          <div className="text-[10px] text-gray-500 italic pt-1 border-t border-white/10">
            Auto-detected based on SE Comp A timetable
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

type MessageRole = "user" | "copilot";

interface Message {
  id: string;
  role: MessageRole;
  text?: string;
  structured?: {
    intent: string;
    category: string;
    authority: string;
    recipient?: string;
    workflow_steps?: string[];
    current_step?: number;
    status?: "pending" | "in_progress" | "completed";
    requires_missed_work_form?: boolean;
    calculated_missed_work?: {
      lectures?: string;
      labs?: string;
    };
    assignment_data?: any;
    generate_documents?: boolean;
    enable_voice_assistant?: boolean;
  };
}

interface CopilotUIProps {
  role?: string;
  className?: string;
}

export default function CopilotUI({ role = "Student", className = "" }: CopilotUIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "copilot",
      text: `Aether Copilot initialized. Role detected as [${role.toUpperCase()}]. How can I assist you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submittedForms, setSubmittedForms] = useState<Record<string, boolean>>({});
  const [selectedDatesMap, setSelectedDatesMap] = useState<Record<string, string[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    isListening,
    isSpeaking,
    transcript,
    startListening, 
    stopListening, 
    speak, 
    stopSpeaking,
    clearTranscript,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported
  } = useVoiceAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // When user stops speaking, add transcript to input
  useEffect(() => {
    if (!isListening && transcript) {
      setInput(prev => prev + " " + transcript);
      clearTranscript();
    }
  }, [isListening, transcript, clearTranscript]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text, role }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "copilot",
            text: `System Error: ${data.error}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "copilot",
            structured: {
              ...data,
              current_step: -1,
              status: "pending",
            },
          },
        ]);

        // Speak the response if voice is enabled
        if (isSpeechSynthesisSupported && data.workflow_steps && data.workflow_steps[0]) {
          const textToSpeak = data.workflow_steps[0].substring(0, 500); // Limit to first 500 chars
          speak(textToSpeak);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "copilot",
          text: "Communication failure with Aether mainframe.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateWorkflow = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.structured) {
          const steps = msg.structured.workflow_steps || [];
          const current = msg.structured.current_step ?? -1;
          
          if (current < steps.length - 1) {
            return {
              ...msg,
              structured: {
                ...msg.structured,
                status: "in_progress",
                current_step: current + 1,
              },
            };
          } else {
            return {
              ...msg,
              structured: {
                ...msg.structured,
                status: "completed",
              },
            };
          }
        }
        return msg;
      })
    );
  };

  // Auto-progress the workflow if it's in progress
  useEffect(() => {
    messages.forEach((msg) => {
      if (
        msg.structured?.status === "in_progress" &&
        msg.structured.workflow_steps &&
        (msg.structured.current_step ?? -1) < msg.structured.workflow_steps.length - 1
      ) {
        const timer = setTimeout(() => {
          simulateWorkflow(msg.id);
        }, 1500); // 1.5s delay per step for dramatic effect
        return () => clearTimeout(timer);
      } else if (
        msg.structured?.status === "in_progress" &&
        msg.structured.workflow_steps &&
        (msg.structured.current_step ?? -1) === msg.structured.workflow_steps.length - 1
      ) {
         const timer = setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id && m.structured
                ? { ...m, structured: { ...m.structured, status: "completed" } }
                : m
            )
          );
        }, 1000);
        return () => clearTimeout(timer);
      }
    });
  }, [messages]);

  const getCategoryIcon = (category: string) => {
    if (!category) return <CheckCircle2 className="w-4 h-4 text-gray-400" />;
    const cat = category.toLowerCase();
    if (cat.includes("academic")) return <BookOpen className="w-4 h-4 text-blue-400" />;
    if (cat.includes("infrastructure")) return <Building className="w-4 h-4 text-orange-400" />;
    if (cat.includes("administrative")) return <AlertCircle className="w-4 h-4 text-purple-400" />;
    if (cat.includes("financial")) return <CreditCard className="w-4 h-4 text-emerald-400" />;
    if (cat.includes("event")) return <Calendar className="w-4 h-4 text-pink-400" />;
    if (cat.includes("dashboard")) return <LayoutDashboard className="w-4 h-4 text-cyan-400" />;
    if (cat.includes("critical")) return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Sparkles className="w-4 h-4 text-[#c9a059]" />;
  };

  const getStepIcon = (step: string) => {
    const lowerStep = step.toLowerCase();
    if (lowerStep.includes("email") || lowerStep.includes("mail")) return <Mail className="w-3 h-3 text-white" />;
    if (lowerStep.includes("notification")) return <Bell className="w-3 h-3 text-white" />;
    if (lowerStep.includes("approval") || lowerStep.includes("approve")) return <CheckCircle2 className="w-3 h-3 text-white" />;
    return <CheckCircle2 className="w-3 h-3 text-white" />;
  };

  return (
    <div className={`w-full max-w-4xl h-[80vh] min-h-[600px] bg-[#1c140d]/80 backdrop-blur-3xl border border-[#c9a059]/30 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative ${className}`}>
      {/* Dynamic Background Noise */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.15] mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#c9a059]/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Header */}
      <div className="p-6 border-b border-[#c9a059]/20 flex justify-between items-center bg-gradient-to-r from-[#1c140d]/90 to-[#2a1b10]/90 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[#c9a059] blur-md opacity-40 rounded-2xl"></div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c9a059] to-[#8b6d3b] flex items-center justify-center relative z-10 border border-[#e8c886]/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-wide flex items-center">
              AETHER COPILOT 
              <span className="bg-[#c9a059]/20 text-[#c9a059] border border-[#c9a059]/30 text-[10px] px-2 py-0.5 rounded-full ml-3 tracking-widest font-mono">
                ACTIVE
              </span>
            </h1>
            <p className="text-[#c9a059]/80 text-sm font-medium">Intelligent Campus Controller • Role: {role.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 scroll-smooth">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              {msg.role === "user" ? (
                <div className="flex items-end space-x-3 flex-row-reverse space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="bg-white/10 border border-white/5 text-white p-4 rounded-3xl rounded-br-sm max-w-[400px] text-[15px] shadow-lg backdrop-blur-md">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3 w-full">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a059]/30 to-[#8b6d3b]/10 flex items-center justify-center flex-shrink-0 mt-1 border border-[#c9a059]/30">
                    <Sparkles className="w-4 h-4 text-[#c9a059]" />
                  </div>
                  
                  {msg.text ? (
                    <div className="bg-[#1c140d]/80 border border-[#c9a059]/20 text-gray-200 p-4 rounded-3xl rounded-bl-sm max-w-[400px] text-[15px] shadow-lg backdrop-blur-md">
                      {msg.text}
                    </div>
                  ) : msg.structured ? (
                    <div className="bg-[#1c140d]/90 border border-[#c9a059]/30 rounded-3xl p-6 w-full max-w-[500px] shadow-2xl backdrop-blur-md relative overflow-hidden">
                      {/* Decorative internal glow */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a059]/5 blur-3xl rounded-full"></div>

                      <div className="text-[11px] text-[#c9a059] flex justify-between items-center border-b border-[#c9a059]/20 pb-3 uppercase tracking-widest font-semibold mb-4">
                        <span className="flex items-center"><Bot className="w-3 h-3 mr-2"/> Intent Recognized</span>
                        <span className="text-white bg-white/5 px-2 py-1 rounded-md">{msg.structured.intent}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="flex items-center space-x-3 text-sm bg-black/40 p-3 rounded-2xl border border-white/5">
                          <div className="p-2 bg-[#c9a059]/10 rounded-xl border border-[#c9a059]/20">
                            {getCategoryIcon(msg.structured.category)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 truncate font-medium">Category</div>
                            <div className="text-gray-200 font-medium text-xs truncate" title={msg.structured.category}>{msg.structured.category}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-sm bg-black/40 p-3 rounded-2xl border border-white/5">
                          <div className="p-2 bg-[#c9a059]/10 rounded-xl border border-[#c9a059]/20">
                            <Building className="w-4 h-4 text-[#c9a059]" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 truncate font-medium">Authority</div>
                            <div className="text-gray-200 font-medium text-xs truncate" title={msg.structured.authority}>{msg.structured.authority}</div>
                          </div>
                        </div>
                      </div>
                      
                      {msg.structured.recipient && (
                        <div className="flex items-center space-x-3 text-sm bg-black/40 p-3 rounded-2xl border border-white/5 w-full mb-5">
                           <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                              <User className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 font-medium">Notification Routing</div>
                              <div className="text-white font-semibold text-sm">{msg.structured.recipient}</div>
                            </div>
                        </div>
                      )}

                      {msg.structured.workflow_steps && msg.structured.workflow_steps.length > 0 && (
                         <div className="bg-black/40 border border-[#c9a059]/20 rounded-2xl p-5 relative overflow-hidden">
                           <div className="text-[10px] text-[#c9a059] uppercase tracking-widest mb-5 font-bold flex items-center">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#c9a059] mr-2 animate-pulse"></div>
                             Automated Workflow
                           </div>
                           <div className="space-y-5 pl-2">
                             {msg.structured.workflow_steps.map((step, index) => {
                               const isCompleted = msg.structured!.current_step !== undefined && index <= msg.structured!.current_step;
                               const isCurrent = msg.structured!.current_step !== undefined && index === msg.structured!.current_step;
                               return (
                                 <div key={index} className="flex space-x-4 relative">
                                    {/* Line connector */}
                                    {index < (msg.structured!.workflow_steps?.length || 0) - 1 && (
                                      <div className={`absolute top-7 left-[11px] w-[2px] h-[calc(100%+8px)] transition-colors duration-700 ${isCompleted ? 'bg-[#c9a059]/50' : 'bg-gray-800/50'}`}></div>
                                    )}
                                    
                                    {/* Node */}
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 bg-[#1c140d] transition-all duration-500 ${isCompleted ? 'border-[#c9a059] bg-[#c9a059] shadow-[0_0_10px_rgba(201,160,89,0.5)] scale-110' : 'border-gray-700 text-gray-700 scale-100'}`}>
                                      {isCompleted ? getStepIcon(step) : <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>}
                                    </div>
                                    
                                    <div className={`pt-0.5 pb-2 transition-all duration-500 ${isCompleted ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-1'}`}>
                                      <div className={`text-[14px] leading-snug ${isCompleted ? 'text-gray-100 font-medium' : 'text-gray-500'}`}>{step}</div>
                                      {isCurrent && msg.structured!.status === "in_progress" && (
                                        <div className="flex items-center space-x-2 mt-2 text-[#c9a059] text-[11px] uppercase tracking-wider font-semibold">
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                          <span>Executing...</span>
                                        </div>
                                      )}
                                    </div>
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                      )}

                      <div className="mt-5">
                        {msg.structured.status === "pending" ? (
                          <button
                            onClick={() => simulateWorkflow(msg.id)}
                            className="w-full py-4 bg-gradient-to-r from-[#c9a059]/10 to-transparent hover:from-[#c9a059]/20 border border-[#c9a059]/30 rounded-2xl text-[#c9a059] text-[13px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition-all group overflow-hidden relative"
                          >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                            <span>Initialize Protocol</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                          </button>
                        ) : msg.structured.status === "in_progress" ? (
                           <div className="w-full py-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-[13px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>System Processing</span>
                          </div>
                        ) : (
                          <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-[13px] font-bold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Protocol Concluded</span>
                          </motion.div>
                        )}
                      </div>

                      {msg.structured.assignment_data && (
                        <div className="mt-5 pt-5 border-t border-[#c9a059]/20">
                          <div className="text-[12px] text-[#c9a059] uppercase tracking-widest font-bold mb-4 flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Assignment Status Dashboard
                          </div>
                          
                          {/* Overdue Assignments */}
                          {msg.structured.assignment_data.overdue && msg.structured.assignment_data.overdue.length > 0 && (
                            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                              <div className="flex items-center mb-3">
                                <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                                <span className="text-red-400 text-[11px] uppercase tracking-wider font-bold">
                                  Overdue Assignments ({msg.structured.assignment_data.overdue.length})
                                </span>
                              </div>
                              <div className="space-y-2">
                                {msg.structured.assignment_data.overdue.map((assignment: any, idx: number) => (
                                  <div key={idx} className="bg-black/40 p-3 rounded-lg border border-red-500/20">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="text-red-200 text-sm font-semibold">{assignment.subject}: {assignment.title}</div>
                                        <div className="text-red-300/60 text-xs mt-1">{assignment.description}</div>
                                      </div>
                                    </div>
                                    <div className="text-red-400 text-xs mt-2 flex items-center">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      Due: {assignment.dueDate}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Upcoming Assignments */}
                          {msg.structured.assignment_data.upcoming && msg.structured.assignment_data.upcoming.length > 0 && (
                            <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                              <div className="flex items-center mb-3">
                                <Clock className="w-4 h-4 text-yellow-400 mr-2" />
                                <span className="text-yellow-400 text-[11px] uppercase tracking-wider font-bold">
                                  Upcoming This Week ({msg.structured.assignment_data.upcoming.length})
                                </span>
                              </div>
                              <div className="space-y-2">
                                {msg.structured.assignment_data.upcoming.map((assignment: any, idx: number) => (
                                  <div key={idx} className="bg-black/40 p-3 rounded-lg border border-yellow-500/20">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="text-yellow-200 text-sm font-semibold">{assignment.subject}: {assignment.title}</div>
                                        <div className="text-yellow-300/60 text-xs mt-1">{assignment.description}</div>
                                      </div>
                                    </div>
                                    <div className="text-yellow-400 text-xs mt-2 flex items-center justify-between">
                                      <span>Prof: {assignment.professor}</span>
                                      <span>Due: {assignment.dueDate}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {msg.structured.assignment_data.pending && msg.structured.assignment_data.pending.length === 0 && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-400 text-sm flex items-center"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              All assignments are completed! Great work!
                            </motion.div>
                          )}
                        </div>
                      )}

                      {msg.structured.requires_missed_work_form && msg.structured.status === "completed" && (
                        <div className="mt-5 pt-5 border-t border-[#c9a059]/20">
                          <div className="text-[12px] text-[#c9a059] uppercase tracking-widest font-bold mb-4 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Missed Work Declaration Form
                          </div>
                          {submittedForms[msg.id] ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-400 text-sm flex items-center"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Documents saved for post-event submission to Attendance Updater.
                            </motion.div>
                          ) : (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                setSubmittedForms(prev => ({ ...prev, [msg.id]: true }));
                              }}
                              className="space-y-4"
                            >
                              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-3">Select Absence Dates</div>
                                <CalendarWidget 
                                  selectedDates={selectedDatesMap[msg.id] || []} 
                                  onToggleDate={(dateStr: string) => {
                                    setSelectedDatesMap(prev => {
                                      const current = prev[msg.id] || [];
                                      return {
                                        ...prev,
                                        [msg.id]: current.includes(dateStr) 
                                          ? current.filter(d => d !== dateStr)
                                          : [...current, dateStr]
                                      };
                                    });
                                  }} 
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">Missed Lectures</label>
                                <input required type="text" value={calculateMissedWork(selectedDatesMap[msg.id] || []).lectures} readOnly placeholder="Select dates above..." className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#c9a059]/50 transition-colors opacity-80" />
                              </div>
                              <div>
                                <label className="block text-[11px] text-gray-400 uppercase tracking-wider mb-1">Missed Labs</label>
                                <input required type="text" value={calculateMissedWork(selectedDatesMap[msg.id] || []).labs} readOnly placeholder="Select dates above..." className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#c9a059]/50 transition-colors opacity-80" />
                              </div>
                              <div className="flex space-x-3 pt-2">
                                <button type="button" onClick={() => {
                                  const dates = selectedDatesMap[msg.id] || [];
                                  const missed = calculateMissedWork(dates);

                                  // Create academic document data
                                  const academicData: AcademicDocument = {
                                    studentName: "John Doe", // This should come from user profile
                                    studentId: "SE2024001", // This should come from user profile
                                    department: "Computer Engineering",
                                    year: "SE",
                                    semester: "IV",
                                    dates: dates,
                                    missedLectures: missed.lectures.split(", ").filter(l => l),
                                    missedLabs: missed.labs.split(", ").filter(l => l),
                                    reason: "Event Participation",
                                    contactInfo: {
                                      email: "john.doe@spit.ac.in",
                                      phone: "+91-9876543210"
                                    }
                                  };

                                  // Generate complete document package (3 professional documents)
                                  const generatedDocuments = generateCompleteDocumentPackage(academicData);

                                  // Download all three documents
                                  generatedDocuments.forEach(({ doc, fileName }) => {
                                    doc.save(fileName);
                                  });

                                  // Show success message
                                  setMessages(prev => [...prev, {
                                    id: Date.now().toString(),
                                    role: "copilot",
                                    text: `✅ **Professional Document Package Generated & Downloaded!**\n\n📄 **3 Professional PDFs Generated:**\n1. 📋 Pre-Event Permission Letter (Class Coordinator)\n2. 📋 Post-Event Permission Letter (Dean)\n3. 📊 Academic Progress Report\n\n📋 **Each Document Includes:**\n• Professional SPIT Header & Branding\n• Your Complete Student Information\n• Absence Details Table\n• Missed Coursework (Auto-detected)\n• Compensation Plan\n• Signature Blocks for Authorities\n\n📝 **Next Steps:**\n1. Review all downloaded PDFs\n2. Print and sign them\n3. Obtain signatures from:\n   • Class Coordinator (Pre-Event)\n   • Dean (Post-Event)\n   • Other required authorities\n4. Submit all documents to Attendance Updater\n\n💡 **Important:** Submit within 3 working days of returning to college.`
                                  }]);
                                }} className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-white/10 transition-colors flex justify-center items-center">
                                  <Download className="w-4 h-4 mr-2" /> Generate Professional Documents (3 PDFs)
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-[#c9a059] text-[#1c140d] rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-[#e8c886] transition-colors">
                                  Save for Post-Event Submission
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}

                      {msg.structured.generate_documents && (
                        <div className="mt-5 pt-5 border-t border-[#c9a059]/20">
                          <div className="text-[12px] text-[#c9a059] uppercase tracking-widest font-bold mb-4 flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            Professional Document Generation
                          </div>
                          <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                            <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-3">Generate Official Documents</div>
                            <p className="text-sm text-gray-300 mb-4">
                              Generate professional tabular documents for multiple authorities including Dean, HOD, and Class Coordinator.
                            </p>
                            <button
                              onClick={() => {
                                // Create sample academic document data (in real app, this would come from user profile)
                                const academicData: AcademicDocument = {
                                  studentName: "John Doe",
                                  studentId: "SE2024001",
                                  department: "Computer Engineering",
                                  year: "SE",
                                  semester: "IV",
                                  dates: ["2024-04-20", "2024-04-21"], // Sample dates
                                  missedLectures: ["Data Structures", "Operating Systems"],
                                  missedLabs: ["DS Lab", "OS Lab"],
                                  reason: "Technical Event Participation",
                                  contactInfo: {
                                    email: "john.doe@spit.ac.in",
                                    phone: "+91-9876543210"
                                  }
                                };

                                // Generate complete document package (3 professional PDFs)
                                const generatedDocuments = generateCompleteDocumentPackage(academicData);

                                // Download all three documents
                                generatedDocuments.forEach(({ doc, fileName }) => {
                                  doc.save(fileName);
                                });

                                // Add success message
                                setMessages(prev => [...prev, {
                                  id: Date.now().toString(),
                                  role: "copilot",
                                  text: `✅ **Professional Document Package Generated & Downloaded!**\n\n📄 **3 Professional PDFs Generated:**\n1. 📋 Pre-Event Permission Letter (Class Coordinator)\n2. 📋 Post-Event Permission Letter (Dean)\n3. 📊 Academic Progress Report\n\n✨ **Professional Features:**\n• SPIT Gold & Brown Branding\n• Automatic Missed Lecture/Lab Detection\n• Reference Numbers & Dates\n• Attendance Tables\n• Authority Signature Blocks\n• Official Footer\n\n📋 **Document Workflow:**\n1. Submit Pre-Event Letter to Class Coordinator for approval\n2. Before Event: Get HOD's permission\n3. After Event: Submit Post-Event Letter to Dean\n4. Include Event Certificates\n5. Finally: Submit Academic Progress Report to Attendance Updater\n\n💼 **All documents ready for printing and submission!**`
                                }]);
                              }}
                              className="w-full py-3 bg-[#c9a059] text-[#1c140d] rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-[#e8c886] transition-colors flex justify-center items-center"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Generate Complete Document Package (3 PDFs)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c9a059]/30 to-[#8b6d3b]/10 flex items-center justify-center flex-shrink-0 mt-1 border border-[#c9a059]/30">
              <Sparkles className="w-4 h-4 text-[#c9a059] animate-pulse" />
            </div>
            <div className="bg-[#1c140d]/80 border border-[#c9a059]/20 p-4 rounded-3xl rounded-bl-sm flex items-center space-x-3 text-[#c9a059] backdrop-blur-md">
              <Loader2 className="w-4 h-4 animate-spin" />
              <div className="flex space-x-1">
                <span className="text-[13px] font-medium tracking-wide">Synthesizing</span>
                <span className="animate-[bounce_1s_infinite_0ms] text-[13px]">.</span>
                <span className="animate-[bounce_1s_infinite_200ms] text-[13px]">.</span>
                <span className="animate-[bounce_1s_infinite_400ms] text-[13px]">.</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-[#c9a059]/20 bg-[#1c140d]/90 backdrop-blur-xl relative z-10">
        <div className="flex space-x-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Enter command directive or speak..."
            className="flex-1 bg-black/40 border border-[#c9a059]/30 rounded-2xl px-6 py-4 text-[15px] text-white placeholder-gray-600 focus:outline-none focus:border-[#c9a059] focus:ring-1 focus:ring-[#c9a059]/50 transition-all shadow-inner"
            disabled={isLoading}
          />
          
          {/* Voice Input Button */}
          {isSpeechRecognitionSupported && (
            <motion.button
              onClick={isListening ? stopListening : startListening}
              className={`px-4 py-4 rounded-2xl flex items-center justify-center transition-all ${
                isListening 
                  ? "bg-red-500/20 border border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
                  : "bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50"
              }`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? (
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                  <Mic className="w-5 h-5" />
                </motion.div>
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </motion.button>
          )}

          {/* Voice Output Button */}
          {isSpeechSynthesisSupported && (
            <motion.button
              onClick={isSpeaking ? stopSpeaking : undefined}
              disabled={!isSpeaking}
              className={`px-4 py-4 rounded-2xl flex items-center justify-center transition-all ${
                isSpeaking 
                  ? "bg-green-500/20 border border-green-500/50 text-green-400" 
                  : "bg-gray-500/10 border border-gray-500/30 text-gray-400 opacity-50 cursor-not-allowed"
              }`}
              title={isSpeaking ? "Stop speaking" : "Voice output off"}
            >
              {isSpeaking ? (
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                  <Volume2 className="w-5 h-5" />
                </motion.div>
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </motion.button>
          )}
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-br from-[#c9a059] to-[#8b6d3b] text-white px-6 py-4 rounded-2xl hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_20px_rgba(201,160,89,0.3)] disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
