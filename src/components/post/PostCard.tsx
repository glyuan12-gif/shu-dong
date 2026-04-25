import { Link } from 'react-router'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/formatTime'
import { MOODS, CHANNELS, type Post, type MoodType } from '@/types'

interface PostCardProps {
  post: Post
}

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

export function PostCard({ post }: PostCardProps) {
  const moodInfo = post.mood ? MOODS[post.mood] : null
  const channelInfo = CHANNELS[post.channel]
  const moodBorderClass = post.mood ? MOOD_BORDER_MAP[post.mood] : 'border-l-border'

  return (
    <Link
      to={`/post/${post.id}`}
      className={cn(
        'block bg-card rounded-2xl border border-border p-4',
        'border-l-4',
        moodBorderClass,
        'hover:shadow-md transition-shadow duration-200'
      )}
    >
      {/* 头部：头像 + 昵称 + 时间 */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-lg shrink-0">
          {post.author?.avatar_value || '🌿'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">
              {post.author?.nickname || '匿名树洞'}
            </span>
            {moodInfo && (
              <span className="text-sm" title={moodInfo.name}>
                {moodInfo.emoji}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{channelInfo.icon} {channelInfo.name}</span>
            <span>·</span>
            <span>{formatRelativeTime(post.created_at)}</span>
          </div>
        </div>
      </div>

      {/* 标题 */}
      {post.title && (
        <h3 className="font-semibold text-base mb-1.5 line-clamp-1">
          {post.title}
        </h3>
      )}

      {/* 内容 */}
      <p className="text-sm text-muted-foreground line-clamp-3 mb-3 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* 标签 */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
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

      {/* 底部操作栏 */}
      <div className="flex items-center gap-4 text-muted-foreground">
        <button
          className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="w-4 h-4" />
          <span>{post.like_count || 0}</span>
        </button>
        <button
          className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comment_count || 0}</span>
        </button>
        <button
          className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </Link>
  )
}
