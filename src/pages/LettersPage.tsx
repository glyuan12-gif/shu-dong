import { useEffect, useState, useRef, useCallback } from 'react'
import { Plus, Mail, MailOpen, Clock, Lock, Unlock } from 'lucide-react'
import { getItem, setItem, generateId } from '@/lib/storage'
import { useAuthStore } from '@/stores/authStore'
import type { Letter } from '@/types'
import { format, parseISO, differenceInMilliseconds, intervalToDuration } from 'date-fns'
import { zhCN } from 'date-fns/locale'

type TabType = 'waiting' | 'opened'

const QUICK_OPTIONS = [
  { label: '3天后', days: 3 },
  { label: '7天后', days: 7 },
  { label: '30天后', days: 30 },
  { label: '100天后', days: 100 },
  { label: '1年后', days: 365 },
]

function getCountdown(openTimeStr: string): string {
  const now = new Date()
  const openTime = parseISO(openTimeStr)
  const diff = differenceInMilliseconds(openTime, now)
  if (diff <= 0) return '可以开封了'

  const duration = intervalToDuration({ start: now, end: openTime })
  const parts: string[] = []
  if (duration.days && duration.days > 0) parts.push(`${duration.days}天`)
  if (duration.hours && duration.hours > 0) parts.push(`${duration.hours}小时`)
  if (duration.minutes && duration.minutes > 0) parts.push(`${duration.minutes}分`)
  if (duration.seconds !== undefined) parts.push(`${duration.seconds}秒`)
  return parts.join(' ') + ' 后可开封'
}

export function LettersPage() {
  const { user } = useAuthStore()
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('waiting')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [content, setContent] = useState('')
  const [openTime, setOpenTime] = useState('')
  const [selectedQuick, setSelectedQuick] = useState<number | null>(7)
  const [saving, setSaving] = useState(false)
  const [countdowns, setCountdowns] = useState<Record<string, string>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const updateCountdowns = useCallback(() => {
    const updates: Record<string, string> = {}
    letters.forEach((letter) => {
      if (letter.status === 'sealed') {
        updates[letter.id] = getCountdown(letter.open_time)
      }
    })
    setCountdowns(updates)
  }, [letters])

  useEffect(() => {
    if (!user) return

    const allLetters = getItem<Letter[]>('letters', [])
    const userLetters = allLetters
      .filter(l => l.user_id === user.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setLetters(userLetters)
    setLoading(false)
  }, [user])

  useEffect(() => {
    updateCountdowns()
    intervalRef.current = setInterval(updateCountdowns, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [updateCountdowns])

  const waitingLetters = letters.filter((l) => l.status === 'sealed')
  const openedLetters = letters.filter((l) => l.status === 'opened')
  const displayLetters = activeTab === 'waiting' ? waitingLetters : openedLetters

  const handleQuickSelect = (days: number) => {
    setSelectedQuick(days)
    const date = new Date()
    date.setDate(date.getDate() + days)
    date.setHours(0, 0, 0, 0)
    setOpenTime(format(date, "yyyy-MM-dd'T'HH:mm"))
  }

  const openDialog = () => {
    setContent('')
    setOpenTime('')
    setSelectedQuick(7)
    handleQuickSelect(7)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!user || !content.trim() || !openTime) return
    setSaving(true)

    const newLetter: Letter = {
      id: generateId(),
      user_id: user.id,
      content: content.trim(),
      seal_time: new Date().toISOString(),
      open_time: openTime,
      status: 'sealed',
      created_at: new Date().toISOString(),
    }

    const allLetters = getItem<Letter[]>('letters', [])
    allLetters.unshift(newLetter)
    setItem('letters', allLetters)
    setLetters(prev => [newLetter, ...prev])

    setSaving(false)
    setDialogOpen(false)
  }

  const handleOpen = (letter: Letter) => {
    const allLetters = getItem<Letter[]>('letters', [])
    const index = allLetters.findIndex(l => l.id === letter.id)
    if (index >= 0) {
      allLetters[index].status = 'opened'
      setItem('letters', allLetters)
      setLetters(prev => prev.map(l => (l.id === letter.id ? { ...l, status: 'opened' as const } : l)))
    }
  }

  const canOpen = (openTimeStr: string) => new Date() >= parseISO(openTimeStr)

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">时光信箱</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-card rounded-lg" />
          <div className="h-32 bg-card rounded-xl" />
          <div className="h-32 bg-card rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">时光信箱</h1>
        <button
          onClick={openDialog}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          写信
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-card rounded-lg p-1">
        <button
          onClick={() => setActiveTab('waiting')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'waiting' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lock className="w-4 h-4" />
          等待中 ({waitingLetters.length})
        </button>
        <button
          onClick={() => setActiveTab('opened')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'opened' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Unlock className="w-4 h-4" />
          已开封 ({openedLetters.length})
        </button>
      </div>

      {/* Letters */}
      {displayLetters.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          {activeTab === 'waiting' ? (
            <>
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>没有等待中的信件</p>
              <p className="text-sm mt-1">写一封信给未来的自己吧</p>
            </>
          ) : (
            <>
              <MailOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>还没有开封的信件</p>
              <p className="text-sm mt-1">耐心等待，时间到了就能打开</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayLetters.map((letter) => (
            <div key={letter.id} className="bg-card rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>封存于 {format(parseISO(letter.seal_time), 'M月d日 HH:mm', { locale: zhCN })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MailOpen className="w-4 h-4" />
                  <span>开封于 {format(parseISO(letter.open_time), 'M月d日 HH:mm', { locale: zhCN })}</span>
                </div>
              </div>

              {letter.status === 'sealed' && (
                <div className="text-center py-2">
                  <p className="text-primary font-medium">{countdowns[letter.id] || '计算中...'}</p>
                </div>
              )}

              <div className={`relative ${letter.status === 'sealed' && !canOpen(letter.open_time) ? 'blur-md select-none' : ''}`}>
                <p className="text-sm whitespace-pre-wrap">{letter.content}</p>
              </div>

              {letter.status === 'sealed' && canOpen(letter.open_time) && (
                <button
                  onClick={() => handleOpen(letter)}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <MailOpen className="w-4 h-4" />
                  开封信件
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-background rounded-t-2xl md:rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">写给未来的自己</h3>

            {/* Content */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">信件内容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="亲爱的未来的我..."
                rows={6}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Quick options */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">开封时间</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_OPTIONS.map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => handleQuickSelect(opt.days)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      selectedQuick === opt.days
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-accent'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <input
                type="datetime-local"
                value={openTime}
                onChange={(e) => {
                  setOpenTime(e.target.value)
                  setSelectedQuick(null)
                }}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDialogOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-secondary text-sm font-medium hover:bg-accent transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!content.trim() || !openTime || saving}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                {saving ? '封存中...' : '封存信件'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
