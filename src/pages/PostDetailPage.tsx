import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Heart, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/formatTime'
import { usePostDetail, addComment, toggleLike, toggleEmotion } from '@/hooks/usePosts'
import { CHANNELS, MOODS, EMOTIONS, type EmotionType, type MoodType } from '@/types'

const EMOTION_KEYS = Object.keys(EMOTIONS) as EmotionType[]

const MOOD_BORDER_MAP: Record<MoodType, string> = {
  happy: 'border-l-mood-happy',
  sad: 'border-l-mood-sad',
  angry: 'border-l-mood-angry',
  anxious: 'border-l-mood-anxious',
  calm: 'border-l-mood-calm',
  excited: 'border-l-mood-excited',
  tired: 'border-l-mood-tired',
  grateful: 'border-l-mood-grateful',
}

function CommentItem({ comment }: { comment: any }) {
  return (
    <div className="flex gap-3 py-3">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm shrink-0">
        {comment.author?.avatar_value || '🌿'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">
            {comment.author?.nickname || '匿名树洞'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.created_at)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  )
}

function CommentInput({
  postId,
  onCommentAdded,
}: {
  postId: string
  onCommentAdded: (comment: any) => void
}) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    const comment = await addComment(postId, content.trim())
    if (comment) {
      onCommentAdded(comment)
      setContent('')
    }
    setIsSubmitting(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-end gap-2 pt-3 border-t border-border">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="写下你的评论..."
        rows={1}
        maxLength={500}
        className="flex-1 px-3 py-2 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !content.trim()}
        className={cn(
          'p-2 rounded-xl transition-colors shrink-0',
          isSubmitting || !content.trim()
            ? 'text-muted-foreground cursor-not-allowed'
            : 'bg-primary text-primary-foreground hover:opacity-90'
        )}
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { post, comments, isLoading, setComments } = usePostDetail(id || '')

  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [activeEmotions, setActiveEmotions] = useState<Set<EmotionType>>(new Set())

  const handleToggleLike = async () => {
    const liked = await toggleLike(post!.id)
    setIsLiked(liked)
    setLikeCount((prev) => (liked ? prev + 1 : prev - 1))
  }

  const handleToggleEmotion = async (emotionType: EmotionType) => {
    const active = await toggleEmotion(post!.id, emotionType)
    setActiveEmotions((prev) => {
      const next = new Set(prev)
      if (active) {
        next.add(emotionType)
      } else {
        next.delete(emotionType)
      }
      return next
    })
  }

  const handleCommentAdded = (comment: any) => {
    setComments((prev) => [...prev, comment])
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🔍</p>
        <p className="text-muted-foreground">帖子不存在或已被删除</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm"
        >
          返回首页
        </button>
      </div>
    )
  }

  const moodInfo = post.mood ? MOODS[post.mood] : null
  const channelInfo = CHANNELS[post.channel]
  const moodBorderClass = post.mood ? MOOD_BORDER_MAP[post.mood] : 'border-l-border'

  return (
    <div className="space-y-4">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">帖子详情</h1>
      </div>

      {/* 帖子内容 */}
      <div
        className={cn(
          'bg-card rounded-2xl border border-border p-5 border-l-4',
          moodBorderClass
        )}
      >
        {/* 作者信息 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl shrink-0">
            {post.author?.avatar_value || '🌿'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {post.author?.nickname || '匿名树洞'}
              </span>
              {moodInfo && (
                <span className="text-sm" title={moodInfo.name}>
                  {moodInfo.emoji}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {channelInfo.icon} {channelInfo.name}
              </span>
              <span>·</span>
              <span>{formatRelativeTime(post.created_at)}</span>
            </div>
          </div>
        </div>

        {/* 标题 */}
        {post.title && (
          <h2 className="text-lg font-semibold mb-3">{post.title}</h2>
        )}

        {/* 内容 */}
        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {post.content}
        </div>

        {/* 标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 情绪反应栏 */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {EMOTION_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleToggleEmotion(key)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors',
                activeEmotions.has(key)
                  ? 'bg-primary/15 text-foreground font-medium'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <span>{EMOTIONS[key].emoji}</span>
              <span>{EMOTIONS[key].label}</span>
            </button>
          ))}
        </div>

        {/* 点赞按钮 */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
          <button
            onClick={handleToggleLike}
            className={cn(
              'flex items-center gap-1.5 text-sm transition-colors',
              isLiked
                ? 'text-red-500'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
            <span>{likeCount}</span>
          </button>
          <span className="text-sm text-muted-foreground">
            {comments.length} 条评论
          </span>
        </div>
      </div>

      {/* 评论区 */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-2">评论</h3>

        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">💬</p>
            <p className="text-sm text-muted-foreground">还没有评论，来说点什么吧</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        {/* 评论输入 */}
        <CommentInput postId={post.id} onCommentAdded={handleCommentAdded} />
      </div>
    </div>
  )
}
