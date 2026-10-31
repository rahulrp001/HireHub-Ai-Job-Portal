import { useState, useEffect, useRef } from 'react'
import { messageService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import { MessageSquare, Send } from 'lucide-react'

export default function RecruiterMessages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeUser, setActiveUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    messageService.getConversations()
      .then(({ data }) => setConversations(data.conversations || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!activeUser) return
    messageService.getMessages(activeUser.id)
      .then(({ data }) => setMessages(data.messages || []))
      .catch(() => {})
  }, [activeUser])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!text.trim() || !activeUser) return
    setSending(true)
    try {
      const { data } = await messageService.sendMessage(activeUser.id, { message: text })
      setMessages(prev => [...prev, data.message])
      setText('')
    } catch {}
    setSending(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      <div className="card p-0 overflow-hidden flex" style={{ height: '600px' }}>
        <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <p className="font-semibold text-gray-700 text-sm">Conversations</p>
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <div className="text-center p-8">
                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No conversations yet</p>
              </div>
            ) : conversations.map(conv => (
              <button key={conv.user.id} onClick={() => setActiveUser(conv.user)}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${activeUser?.id === conv.user.id ? 'bg-blue-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm">
                    {conv.user.name?.[0]?.toUpperCase()}
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{conv.unread_count}</span>
                  )}
                </div>
                <p className="font-medium text-gray-900 text-sm mt-1">{conv.user.name}</p>
                <p className="text-xs text-gray-400 truncate">{conv.last_message}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {!activeUser ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100 bg-white">
                <p className="font-semibold text-gray-900">{activeUser.name}</p>
                <p className="text-xs text-gray-400">{activeUser.email}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map(msg => {
                  const isMine = msg.sender === user?.id || msg.sender_detail?.id === user?.id
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'}`}>
                        {msg.message}
                        <p className={`text-xs mt-1 ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
              <div className="p-4 border-t border-gray-100 bg-white flex gap-3">
                <input className="input-field flex-1 text-sm" placeholder="Type a message..."
                  value={text} onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
                <button onClick={sendMessage} disabled={sending || !text.trim()} className="btn-primary px-4">
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
