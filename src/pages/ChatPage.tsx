import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { ArrowLeft, Send } from 'lucide-react'
import { getItem, setItem, generateId } from '@/lib/storage'
import { useAuthStore } from '@/stores/authStore'
import { formatRelativeTime } from '@/lib/formatTime'
import type { Message, User, Conversation } from '@/types'

interface ConversationWithUsers {
  id: string
  user1_id: string
  user2_id: string
  user1: User
  user2: User
}

export function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<ConversationWithUsers | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!id) return

    const allConversations = getItem<Conversation[]>('conversations', [])
    const conv = allConversations.find(c => c.id === id)
    const sampleUsers = getItem<User[]>('sample-users', [])

    if (conv && user) {
      const user1 = conv.user1_id === user.id ? user : (sampleUsers.find(u => u.id === conv.user1_id) || user)
      const user2 = conv.user2_id === user.id ? user : (sampleUsers.find(u => u.id === conv.user2_id) || user)
      setConversation({ ...conv, user1, user2 })
    }

    const allMessages = getItem<Message[]>('messages', [])
    const convMessages = allMessages
      .filter(m => m.conversation_id === id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    setMessages(convMessages)
    setTimeout(scrollToBottom, 100)
  }, [id, scrollToBottom, user])

  const otherUser = conversation
    ? conversation.user1.id === user?.id ? conversation.user2 : conversation.user1
    : null

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !id || sending) return

    setSending(true)

    const msg: Message = {
      id: generateId(),
      conversation_id: id,
      sender_id: user.id,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
    }

    const allMessages = getItem<Message[]>('messages', [])
    allMessages.push(msg)
    setItem('messages', allMessages)

    // Update conversation last_message_at
    const allConversations = getItem<Conversation[]>('conversations', [])
    const convIndex = allConversations.findIndex(c => c.id === id)
    if (convIndex >= 0) {
      allConversations[convIndex].last_message_at = new Date().toISOString()
      setItem('conversations', allConversations)
    }

    setMessages(prev => [...prev, msg])
    setNewMessage('')
    inputRef.current?.focus()
    setTimeout(scrollToBottom, 100)
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-4rem)] md:h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-card/80 backdrop-blur-sm shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Link to={`/messages`} className="flex items-center gap-3 flex-1 min-w-0">
          {otherUser && (
            <>
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xl shrink-0">
                {otherUser.avatar_value}
              </div>
              <span className="font-medium truncate">{otherUser.nickname}</span>
            </>
          )}
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-20">
            <p>还没有消息</p>
            <p className="text-sm mt-1">发送第一条消息开始对话吧</p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_id === user?.id
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isOwn
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-secondary rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                  {formatRelativeTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t bg-card/80 backdrop-blur-sm shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          className="flex-1 px-4 py-2.5 rounded-full bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
