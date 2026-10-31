import { useState, useRef, useEffect } from 'react'
import { aiService } from '../../services'
import { Bot, Send, User, Sparkles } from 'lucide-react'

const QUICK_QUESTIONS = [
  "How to improve my resume?",
  "What salary should I expect as a Python developer?",
  "How to prepare for a technical interview?",
  "Which skills are most in demand in 2024?",
  "How to optimize my LinkedIn profile?",
  "How to switch to data science?",
]

function MessageBubble({ msg }) {
  const isBot = msg.role === 'bot'
  return (
    <div className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
        isBot ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm' : 'bg-blue-600 text-white rounded-tr-sm'
      }`}>
        {msg.text}
        <p className={`text-xs mt-1.5 ${isBot ? 'text-gray-400' : 'text-blue-200'}`}>
          {msg.time}
        </p>
      </div>
      {!isBot && (
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <User className="h-4 w-4 text-gray-600" />
        </div>
      )}
    </div>
  )
}

export default function AICoach() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Hi! I'm your AI Career Coach 🤖\n\nI can help you with:\n• Resume tips & improvement\n• Salary information\n• Interview preparation\n• Skills to learn\n• LinkedIn optimization\n• Career path advice\n\nWhat would you like to know?`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')

    const userMsg = { role: 'user', text: msg, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const { data } = await aiService.chat(msg)
      setMessages(prev => [...prev, {
        role: 'bot',
        text: data.response,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Career Coach</h1>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-yellow-500" /> Powered by HireHub AI
          </p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden flex flex-col" style={{ height: '580px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        <div className="px-4 py-2 border-t border-gray-100 bg-white">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)} disabled={loading}
                className="flex-shrink-0 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors whitespace-nowrap">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-white flex gap-3">
          <input className="input-field flex-1 text-sm" placeholder="Ask me anything about your career..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} disabled={loading} />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="btn-primary px-4">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
