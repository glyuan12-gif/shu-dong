import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { MessageCircle } from 'lucide-react'
import { getItem } from '@/lib/storage'
import { useAuthStore } from '@/stores/authStore'
import { formatRelativeTime } from '@/lib/formatTime'
import type { Conversation, Message, User } from '@/types'

interface ConversationWithLastMessage {
  id: string
  user1_id: string
  user2_id: string
  last_message_at: string
  created_at: string
  user1: User
  user2: User
  messages: Message[]
}

export function MessagesPage() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<ConversationWithLastMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchConversations = () => {
      const allConversations = getItem<Conversation[]>('conversations', [])
      const allMessages = getItem<Message[]>('messages', [])
      const sampleUsers = getItem<User[]>('sample-users', [])

      // Only show conversations involving the current user
      const userConversations = allConversations.filter(
        c => c.user1_id === user.id || c.user2_id === user.id
      )

      const enriched: ConversationWithLastMessage[] = userConversations.map(conv => {
        const convMessages = allMessages.filter(m => m.conversation_id === conv.id)
        const user1 = conv.user1_id === user.id ? user : (sampleUsers.find(u => u.id === conv.user1_id) || user)
        const user2 = conv.user2_id === user.id ? user : (sampleUsers.find(u => u.id === conv.user2_id) || user)
        return {
          ...conv,
          user1,
          user2,
          messages: convMessages,
        }
      })

      // Sort by last_message_at descending
      enriched.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())

      setConversations(enriched)
      setLoading(false)
    }

    fetchConversations()
  }, [user])

  const getOtherUser = (conv: ConversationWithLastMessage) => {
    return conv.user1.id === user?.id ? conv.user2 : conv.user1
  }

  const getLastMessage = (conv: ConversationWithLastMessage) => {
    if (conv.messages && conv.messages.length > 0) {
      return conv.messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    }
    return null
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">私信</h1>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-card animate-pulse">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-48 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">私信</h1>

      {conversations.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">还没有私信</p>
          <p className="text-sm mt-2">去帖子中回复其他用户，开启对话吧</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const otherUser = getOtherUser(conv)
            const lastMsg = getLastMessage(conv)
            return (
              <Link
                key={conv.id}
                to={`/messages/${conv.id}`}
                className="flex items-center gap-3 p-4 rounded-xl bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl shrink-0">
                  {otherUser.avatar_value}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{otherUser.nickname}</span>
                    {lastMsg && (
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {formatRelativeTime(lastMsg.created_at)}
                      </span>
                    )}
                  </div>
                  {lastMsg && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {lastMsg.content}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
