import { useState, useRef, useEffect } from 'react'
import { aiService } from '../../services'
import { Bot, Send, User, Sparkles, Zap, Brain, Target, TrendingUp, FileText, BarChart3 } from 'lucide-react'

const QUICK_QUESTIONS = [
  "How to answer 'Tell me about yourself'?",
  "What salary should I expect as a Python/React developer?",
  "How to negotiate salary without sounding rude?",
  "What is the difference between SQL and NoSQL?",
  "How to prepare for an offline in-person interview?",
  "How to explain a career gap to HR?",
  "Which skills are most in demand in 2025?",
  "How to optimize my LinkedIn profile for recruiters?",
]

function parseInlineMarkdown(text) {
  if (!text) return ''
  const parts = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={match.index} className="font-bold text-slate-900">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(<code key={match.index} className="bg-slate-100 text-blue-600 px-1 py-0.5 rounded font-mono text-xs">{token.slice(1, -1)}</code>)
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={match.index} className="italic">{token.slice(1, -1)}</em>)
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

function FormattedMessage({ text }) {
  if (!text) return null
  const lines = text.split('\n')
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={idx} className="h-1" />
        }
        if (trimmed === '---') {
          return <hr key={idx} className="my-2 border-slate-200" />
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-bold text-slate-900 text-sm mt-2.5 mb-0.5 flex items-center gap-1.5">
              {parseInlineMarkdown(trimmed.replace('### ', ''))}
            </h4>
          )
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-black text-slate-900 text-base mt-3 mb-1">
              {parseInlineMarkdown(trimmed.replace('## ', ''))}
            </h3>
          )
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="font-black text-slate-900 text-lg mt-3.5 mb-1.5">
              {parseInlineMarkdown(trimmed.replace('# ', ''))}
            </h2>
          )
        }
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-4 border-blue-500 bg-blue-50/70 pl-3 py-1.5 my-2 rounded-r-lg text-slate-700 italic text-xs font-medium">
              {parseInlineMarkdown(trimmed.replace('> ', ''))}
            </blockquote>
          )
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          const content = trimmed.replace(/^[-•*]\s+/, '')
          return (
            <div key={idx} className="flex items-start gap-2 text-slate-700 pl-1">
              <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
              <span className="flex-1">{parseInlineMarkdown(content)}</span>
            </div>
          )
        }
        return (
          <p key={idx} className="text-slate-800">
            {parseInlineMarkdown(line)}
          </p>
        )
      })}
    </div>
  )
}

function MessageBubble({ msg }) {
  const isBot = msg.role === 'bot'
  return (
    <div className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-8 h-8 bg-[#275df5] rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isBot
          ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
          : 'bg-[#275df5] text-white rounded-tr-sm shadow-sm'
      }`}>
        {isBot ? <FormattedMessage text={msg.text} /> : <div className="whitespace-pre-line">{msg.text}</div>}
        <p className={`text-[10px] mt-1.5 ${isBot ? 'text-slate-400' : 'text-blue-200'}`}>{msg.time}</p>
      </div>
      {!isBot && (
        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <User className="h-4 w-4 text-slate-600" />
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 bg-[#275df5] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-[#275df5] animate-pulse" />
        <span className="text-xs text-slate-500 font-medium">Analyzing</span>
        <div className="flex gap-1 items-center">
          <div className="w-1.5 h-1.5 bg-[#275df5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-[#275df5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-[#275df5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

export default function AICoach() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Hi! I'm your AI Career Coach 🤖\n\nI can help you with:\n• Resume tips & improvement\n• Salary benchmarks & negotiation\n• Interview preparation\n• Skills to learn in 2025\n• LinkedIn optimization\n• Career path & switching advice\n\nWhat would you like to explore today?`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    inputRef.current?.focus()

    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [...prev, { role: 'user', text: msg, time }])
    setLoading(true)

    // 1 second "analyzing" delay for natural feel
    await new Promise(r => setTimeout(r, 1000))

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
        text: getVariedFallback(),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }])
    }
    setLoading(false)
  }

  const aiTools = [
    { icon: Brain, label: 'Skill Gap', color: 'text-purple-600 bg-purple-50', href: '/candidate/skill-gap' },
    { icon: FileText, label: 'Resume', color: 'text-blue-600 bg-blue-50', href: '/candidate/resume' },
    { icon: Target, label: 'Interview', color: 'text-emerald-600 bg-emerald-50', href: '/candidate/interview-prep' },
    { icon: TrendingUp, label: 'Salary', color: 'text-amber-600 bg-amber-50', href: '/candidate/salary-insights' },
    { icon: BarChart3, label: 'Roadmap', color: 'text-rose-600 bg-rose-50', href: '/candidate/career-roadmap' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header — matches Dashboard style */}
      <div className="bg-gradient-to-r from-[#0a1f44] via-[#0f2851] to-[#002a7b] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#275df5] rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-md shrink-0">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-0.5 rounded-full text-xs font-semibold text-blue-200 border border-white/15 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Powered by HireHub AI
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">AI Career Coach</h1>
              <p className="text-blue-100/80 text-xs md:text-sm mt-0.5">
                Personalized guidance for your career journey
              </p>
            </div>
          </div>
          {/* Quick AI tools row */}
          <div className="flex items-center gap-2 flex-wrap">
            {aiTools.map(({ icon: Icon, label, color, href }) => (
              <a key={label} href={href}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-colors">
                <Icon className="h-3.5 w-3.5" /> {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col" style={{ height: '560px' }}>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f8f9fa]">
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-white">
          <p className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Quick Ask</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)} disabled={loading}
                className="flex-shrink-0 text-xs bg-[#f0f4ff] text-[#275df5] border border-blue-200 px-3 py-1.5 rounded-full hover:bg-[#275df5] hover:text-white transition-colors whitespace-nowrap disabled:opacity-50">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 bg-white flex gap-3 items-center">
          <input
            ref={inputRef}
            className="flex-1 bg-[#f8f9fa] border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#275df5]/30 focus:border-[#275df5] transition-all"
            placeholder="Ask me anything about your career..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-[#275df5] hover:bg-[#1a4fd8] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shadow-sm shrink-0">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  )
}
