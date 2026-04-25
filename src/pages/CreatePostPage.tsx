import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createPost } from '@/hooks/usePosts'
import { CHANNELS, MOODS, type Channel, type MoodType } from '@/types'

const CHANNEL_KEYS = Object.keys(CHANNELS) as Channel[]
const MOOD_KEYS = Object.keys(MOODS) as MoodType[]

const PREDEFINED_TAGS = [
  '日常',
  '工作',
  '学习',
  '恋爱',
  '友情',
  '家庭',
  '成长',
  '焦虑',
  '快乐',
  '感悟',
  '吐槽',
  '求助',
  '分享',
  '深夜',
  '树洞',
]

export function CreatePostPage() {
  const navigate = useNavigate()
  const [channel, setChannel] = useState<Channel>('general')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<MoodType | undefined>(undefined)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('请输入内容')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const post = await createPost({
        title: title.trim() || undefined,
        content: content.trim(),
        channel,
        mood,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      })

      if (post) {
        navigate('/')
      } else {
        setError('发布失败，请重试')
      }
    } catch {
      setError('发布失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">发布新帖</h1>
      </div>

      {/* 频道选择 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">选择频道</label>
        <div className="flex flex-wrap gap-2">
          {CHANNEL_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setChannel(key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                channel === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {CHANNELS[key].icon} {CHANNELS[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* 标题输入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          标题 <span className="text-xs">(可选)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="给帖子起个标题..."
          maxLength={100}
          className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
        />
      </div>

      {/* 内容输入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          内容 <span className="text-xs text-destructive">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="说出你的心里话..."
          rows={6}
          maxLength={2000}
          className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
        />
        <div className="text-right text-xs text-muted-foreground">
          {content.length}/2000
        </div>
      </div>

      {/* 心情选择 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          此刻心情 <span className="text-xs">(可选)</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {MOOD_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setMood(mood === key ? undefined : key)}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-xl transition-colors',
                mood === key
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-card border border-border hover:border-primary/50'
              )}
            >
              <span className="text-2xl">{MOODS[key].emoji}</span>
              <span className="text-xs text-muted-foreground">{MOODS[key].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 标签选择 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          标签 <span className="text-xs">(可多选)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                selectedTags.includes(tag)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* 发布按钮 */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !content.trim()}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors',
          isSubmitting || !content.trim()
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:opacity-90'
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            发布中...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            发布
          </>
        )}
      </button>
    </div>
  )
}
