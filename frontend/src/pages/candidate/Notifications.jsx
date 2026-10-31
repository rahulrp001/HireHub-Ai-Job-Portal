import { useState, useEffect } from 'react'
import { notificationService } from '../../services'
import { Bell, CheckCheck, Briefcase, MessageSquare, Star, Info } from 'lucide-react'

const TYPE_ICONS = {
  APPLICATION: Briefcase,
  STATUS_CHANGE: Briefcase,
  MESSAGE: MessageSquare,
  JOB_RECOMMENDATION: Star,
  GENERAL: Info,
}

const TYPE_COLORS = {
  APPLICATION: 'bg-blue-100 text-blue-600',
  STATUS_CHANGE: 'bg-purple-100 text-purple-600',
  MESSAGE: 'bg-green-100 text-green-600',
  JOB_RECOMMENDATION: 'bg-yellow-100 text-yellow-600',
  GENERAL: 'bg-gray-100 text-gray-600',
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationService.getNotifications()
      .then(({ data }) => {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const markRead = async (id) => {
    try {
      await notificationService.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && <p className="text-gray-500 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-2">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No notifications yet</h3>
          <p className="text-gray-400 text-sm mt-1">You'll be notified about application updates and messages here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const Icon = TYPE_ICONS[notif.notification_type] || Info
            const colorClass = TYPE_COLORS[notif.notification_type] || TYPE_COLORS.GENERAL
            return (
              <div key={notif.id} onClick={() => !notif.is_read && markRead(notif.id)}
                className={`card p-4 flex items-start gap-4 cursor-pointer transition-all hover:shadow-md ${!notif.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-medium text-sm ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                    {!notif.is_read && <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
