import { useState, useEffect, useRef, useCallback } from 'react'
import { messageService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import { MessageSquare, Send, Search, X, Plus, UserCircle } from 'lucide-react'
import api from '../../services/api'

export default function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeUser, setActiveUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userResults, setUserResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const bottomRef = useRef()
  const pollRef = useRef()
  const msgPollRef = useRef()

  const loadConversations = useCallback(() => {
    messageService.getConversations()
      .then(({ data }) => setConversations(data.conversations || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const loadMessages = useCallback((userId) => {
    messageService.getMessages(userId)
      .then(({ data }) => setMessages(data.messages || []))
      .catch(() => {})
  }, [])

  // Poll conversations every 5s
  useEffect(() => {
    loadConversations()
    pollRef.current = setInterval(loadConversations, 5000)
    return () => clearInterval(pollRef.current)
  }, [loadConversations])

  // Poll messages every 3s when chat is open
  useEffect(() => {
    clearInterval(msgPollRef.current)
    if (!activeUser) return
    loadMessages(activeUser.id)
    msgPollRef.current = setInterval(() => loadMessages(activeUser.id), 3000)
    return () => clearInterval(msgPollRef.current)
  }, [activeUser, loadMessages])

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Search users to start new conversation
  useEffect(() => {
    if (!searchQuery.trim()) { setUserResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const { data } = await api.get('/auth/users/search/', { params: { q: searchQuery } })
        setUserResults(data.users || [])
      } catch {
        // fallback: search from existing conversations
        setUserResults([])
      }
      setSearching(false)
    }, 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  const sendMessage = async () => {
    if (!text.trim() || !activeUser) return
    setSending(true)
    const optimistic = {
      id: Date.now(),
      sender: user?.id,
      sender_detail: { id: user?.id },
      message: text.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
    }
    setMessages(prev => [...prev, optimistic])
    setText('')
    try {
      const { data } = await messageService.sendMessage(activeUser.id, { message: optimistic.message })
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data.message : m))
      loadConversations()
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setText(optimistic.message)
    }
    setSending(false)
  }

  const openConversation = (convUser) => {
    setActiveUser(convUser)
    setShowSearch(false)
    setSearchQuery('')
    setUserResults([])
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex" style={{ height: '620px' }}>

        {/* ── Sidebar ── */}
        <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between gap-2">
            <p className="font-semibold text-gray-700 text-sm">Conversations</p>
            <button
              onClick={() => setShowSearch(s => !s)}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
              title="New conversation"
            >
              {showSearch ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>

          {/* New conversation search */}
          {showSearch && (
            <div className="p-3 border-b border-gray-100 bg-blue-50/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  autoFocus
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Search recruiters..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              {searching && <p className="text-xs text-gray-400 mt-2 text-center">Searching...</p>}
              {userResults.map(u => (
                <button key={u.id} onClick={() => openConversation(u)}
                  className="w-full text-left flex items-center gap-2 p-2 mt-1 rounded-lg hover:bg-white transition-colors">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                    {(u.full_name || u.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.full_name || u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Conversation list */}
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <div className="text-center p-8">
                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No conversations yet</p>
                <p className="text-xs text-gray-300 mt-1">Click + to start one</p>
              </div>
            ) : conversations.map(conv => (
              <button key={conv.user.id} onClick={() => openConversation(conv.user)}
                className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${activeUser?.id === conv.user.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                    {(conv.user.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 text-sm truncate">{conv.user.name}</p>
                      {conv.unread_count > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0 ml-1">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{conv.last_message}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat window ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeUser ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageSquare className="h-14 w-14 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">Select a conversation</p>
                <p className="text-gray-300 text-sm mt-1">or click + to start a new one</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-100 bg-white flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                  {(activeUser.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{activeUser.name}</p>
                  <p className="text-xs text-gray-400">{activeUser.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-gray-400">Live</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <UserCircle className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No messages yet. Say hello! 👋</p>
                    </div>
                  </div>
                ) : messages.map(msg => {
                  const isMine = msg.sender === user?.id || msg.sender_detail?.id === user?.id
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                      }`}>
                        <p className="leading-relaxed">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
                <input
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !text.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
