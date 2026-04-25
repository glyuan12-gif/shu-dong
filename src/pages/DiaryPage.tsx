import { useEffect, useState, useMemo } from 'react'
import { Plus, ChevronLeft, ChevronRight, Edit3, Eye, EyeOff, CalendarDays } from 'lucide-react'
import { getItem, setItem, generateId } from '@/lib/storage'
import { useAuthStore } from '@/stores/authStore'
import { MOODS } from '@/types'
import type { Diary, MoodType } from '@/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parseISO, isToday } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function DiaryPage() {
  const { user } = useAuthStore()
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDiary, setEditingDiary] = useState<Diary | null>(null)
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [mood, setMood] = useState<MoodType | ''>('')
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    const allDiaries = getItem<Diary[]>('diaries', [])
    const userDiaries = allDiaries
      .filter(d => d.user_id === user.id)
      .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
    setDiaries(userDiaries)
    setLoading(false)
  }, [user])

  const diaryDates = useMemo(() => new Set(diaries.map((d) => d.entry_date)), [diaries])

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    const startDay = getDay(start)
    const paddedDays: (Date | null)[] = Array(startDay).fill(null).concat(days)
    return paddedDays
  }, [currentMonth])

  const openNewDiary = () => {
    setEditingDiary(null)
    setEntryDate(format(new Date(), 'yyyy-MM-dd'))
    setMood('')
    setContent('')
    setIsPublic(false)
    setDialogOpen(true)
  }

  const openEditDiary = (diary: Diary) => {
    setEditingDiary(diary)
    setEntryDate(diary.entry_date)
    setMood(diary.mood || '')
    setContent(diary.content)
    setIsPublic(diary.is_public)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!user || !content.trim()) return
    setSaving(true)

    const allDiaries = getItem<Diary[]>('diaries', [])

    if (editingDiary) {
      const index = allDiaries.findIndex(d => d.id === editingDiary.id)
      if (index >= 0) {
        allDiaries[index] = {
          ...allDiaries[index],
          entry_date: entryDate,
          mood: mood || null,
          content: content.trim(),
          is_public: isPublic,
        }
        setItem('diaries', allDiaries)
        setDiaries(prev =>
          prev.map(d =>
            d.id === editingDiary.id
              ? { ...d, entry_date: entryDate, mood: mood || null, content: content.trim(), is_public: isPublic }
              : d
          )
        )
      }
    } else {
      const newDiary: Diary = {
        id: generateId(),
        user_id: user.id,
        entry_date: entryDate,
        mood: mood || null,
        content: content.trim(),
        is_public: isPublic,
        created_at: new Date().toISOString(),
      }
      allDiaries.unshift(newDiary)
      setItem('diaries', allDiaries)
      setDiaries(prev => [newDiary, ...prev])
    }
    setSaving(false)
    setDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">树洞日记</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-card rounded-xl" />
          <div className="h-24 bg-card rounded-xl" />
          <div className="h-24 bg-card rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">树洞日记</h1>
        <button
          onClick={openNewDiary}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          写日记
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))} className="p-1 rounded-lg hover:bg-accent transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium">
            {format(currentMonth, 'yyyy年M月', { locale: zhCN })}
          </span>
          <button onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))} className="p-1 rounded-lg hover:bg-accent transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
            <div key={d} className="text-xs text-muted-foreground py-1 font-medium">{d}</div>
          ))}
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />
            const dateStr = format(day, 'yyyy-MM-dd')
            const hasDiary = diaryDates.has(dateStr)
            const diary = diaries.find((d) => d.entry_date === dateStr)
            return (
              <button
                key={dateStr}
                onClick={() => diary && openEditDiary(diary)}
                className={`relative w-full aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                  isToday(day) ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-accent/50'
                } ${hasDiary ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span>{format(day, 'd')}</span>
                {hasDiary && diary?.mood && (
                  <span className="text-[10px] leading-none">{MOODS[diary.mood as MoodType]?.emoji}</span>
                )}
                {hasDiary && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Diary List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          日记列表
        </h2>
        {diaries.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-4xl mb-3">📝</p>
            <p>还没有日记</p>
            <p className="text-sm mt-1">点击上方按钮开始记录</p>
          </div>
        ) : (
          diaries.map((diary) => (
            <div
              key={diary.id}
              onClick={() => openEditDiary(diary)}
              className="bg-card rounded-xl p-4 hover:bg-accent/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {diary.mood && <span className="text-xl">{MOODS[diary.mood as MoodType]?.emoji}</span>}
                  <span className="text-sm text-muted-foreground">{format(parseISO(diary.entry_date), 'M月d日 EEEE', { locale: zhCN })}</span>
                </div>
                <div className="flex items-center gap-2">
                  {diary.is_public ? (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Edit3 className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap line-clamp-3">{diary.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-background rounded-t-2xl md:rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">{editingDiary ? '编辑日记' : '写日记'}</h3>

            {/* Date */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">日期</label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Mood */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">心情</label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.entries(MOODS) as [MoodType, { name: string; emoji: string }][]).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMood(mood === key ? '' : key)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                      mood === key ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-accent/50'
                    }`}
                  >
                    <span className="text-2xl">{val.emoji}</span>
                    <span className="text-xs">{val.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">内容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="今天发生了什么..."
                rows={5}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">公开日记</span>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative w-11 h-6 rounded-full transition-colors ${isPublic ? 'bg-primary' : 'bg-muted'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-5' : ''
                  }`}
                />
              </button>
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
                disabled={!content.trim() || saving}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
