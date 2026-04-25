import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router'
import { ChevronUp, ChevronDown, PenLine, Brain, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePosts } from '@/hooks/usePosts'
import { PostCard } from '@/components/post/PostCard'
import { CHANNELS, type Channel } from '@/types'

const CHANNEL_KEYS = Object.keys(CHANNELS) as Channel[]

export function HomePage() {
  const [activeChannel, setActiveChannel] = useState<Channel | undefined>(undefined)
  const [heroCollapsed, setHeroCollapsed] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { posts, isLoading, hasMore, loadMore } = usePosts(activeChannel)

  // 滚动到底部自动加载更多
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMore()
      }
    },
    [hasMore, isLoading, loadMore]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '200px',
    })
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }
    return () => observer.disconnect()
  }, [handleObserver])

  return (
    <div className="space-y-6">
      {/* Hero 区域 */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 p-6 transition-all duration-300',
          heroCollapsed ? 'max-h-0 p-0 opacity-0' : 'max-h-60 opacity-100'
        )}
      >
        <div className="relative z-10">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            在树洞里，做真实的自己
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            一个安全的匿名空间，分享你的故事、心情和想法
          </p>
          <div className="flex gap-3 mt-4">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <PenLine className="w-4 h-4" />
              开始分享
            </Link>
            <Link
              to="/mbti"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <Brain className="w-4 h-4" />
              MBTI 测试
            </Link>
          </div>
        </div>
        {/* 折叠/展开按钮 */}
        <button
          onClick={() => setHeroCollapsed(!heroCollapsed)}
          className="absolute top-3 right-3 p-1 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
        >
          {heroCollapsed ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* 频道筛选 Tab */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveChannel(undefined)}
          className={cn(
            'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            !activeChannel
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          全部
        </button>
        {CHANNEL_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setActiveChannel(key)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeChannel === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {CHANNELS[key].icon} {CHANNELS[key].name}
          </button>
        ))}
      </div>

      {/* 帖子列表 */}
      {posts.length === 0 && !isLoading ? (
        <div className="text-center text-muted-foreground py-20">
          <p className="text-6xl mb-4">🌳</p>
          <p>这里还没有帖子</p>
          <p className="text-sm mt-2">成为第一个分享心事的人吧</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* 加载指示器 */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* 哨兵元素，用于触发无限滚动 */}
          <div ref={sentinelRef} className="h-1" />

          {/* 没有更多 */}
          {!hasMore && posts.length > 0 && (
            <div className="text-center text-xs text-muted-foreground py-4">
              已经到底了~
            </div>
          )}
        </div>
      )}
    </div>
  )
}
