import { useState, useEffect, useCallback } from 'react'
import { getItem, setItem, generateId } from '@/lib/storage'
import { useAuthStore } from '@/stores/authStore'
import type { Post, Comment, PostLike, PostEmotion, Channel, User } from '@/types'

const PAGE_SIZE = 20

function getAllUsers(): User[] {
  const currentUser = useAuthStore.getState().user
  const sampleUsers = getItem<User[]>('sample-users', [])
  const users = [...sampleUsers]
  if (currentUser) users.push(currentUser)
  return users
}

function resolveAuthor(authorId: string): User | undefined {
  const users = getAllUsers()
  return users.find(u => u.id === authorId)
}

function enrichPost(post: Post): Post {
  const author = resolveAuthor(post.author_id)
  const likes = getItem<PostLike[]>('post-likes', [])
  const comments = getItem<Comment[]>('comments', [])
  const userId = useAuthStore.getState().user?.id
  return {
    ...post,
    author: author || {
      id: post.author_id,
      avatar_style: 'plant',
      avatar_value: '🌿',
      nickname: '匿名树洞',
      role: 'user',
      mbti_type: null,
      theme: 'forest',
      created_at: post.created_at,
      updated_at: post.created_at,
    },
    like_count: likes.filter(l => l.post_id === post.id).length,
    comment_count: comments.filter(c => c.post_id === post.id).length,
    is_liked: userId ? likes.some(l => l.user_id === userId && l.post_id === post.id) : false,
  }
}

function enrichComment(comment: Comment): Comment {
  const author = resolveCommentAuthor(comment.author_id)
  return {
    ...comment,
    author: author || {
      id: comment.author_id,
      avatar_style: 'plant',
      avatar_value: '🌿',
      nickname: '匿名树洞',
      role: 'user',
      mbti_type: null,
      theme: 'forest',
      created_at: comment.created_at,
      updated_at: comment.created_at,
    },
  }
}

function resolveCommentAuthor(authorId: string): User | undefined {
  const currentUser = useAuthStore.getState().user
  if (currentUser && currentUser.id === authorId) return currentUser
  const sampleUsers = getItem<User[]>('sample-users', [])
  return sampleUsers.find(u => u.id === authorId)
}

export function usePosts(channel?: Channel) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const fetchPosts = useCallback((pageNum: number = 0, reset: boolean = false) => {
    setIsLoading(true)
    const allPosts = getItem<Post[]>('posts', [])

    let filtered = allPosts
    if (channel && channel !== 'general') {
      filtered = allPosts.filter(p => p.channel === channel)
    }

    // Sort by created_at descending
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const from = pageNum * PAGE_SIZE
    const to = from + PAGE_SIZE
    const paged = filtered.slice(from, to)

    const enriched = paged.map(enrichPost)

    if (reset) {
      setPosts(enriched)
    } else {
      setPosts(prev => [...prev, ...enriched])
    }
    setHasMore(to < filtered.length)
    setPage(pageNum)
    setIsLoading(false)
  }, [channel])

  useEffect(() => {
    fetchPosts(0, true)
  }, [fetchPosts])

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchPosts(page + 1)
    }
  }

  return { posts, isLoading, hasMore, loadMore, refetch: () => fetchPosts(0, true) }
}

export function usePostDetail(postId: string) {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    function fetch() {
      setIsLoading(true)
      const allPosts = getItem<Post[]>('posts', [])
      const postData = allPosts.find(p => p.id === postId)

      if (postData) {
        setPost(enrichPost(postData))
      } else {
        setPost(null)
      }

      const allComments = getItem<Comment[]>('comments', [])
      const postComments = allComments
        .filter(c => c.post_id === postId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(enrichComment)

      setComments(postComments)
      setIsLoading(false)
    }
    fetch()
  }, [postId])

  return { post, comments, isLoading, setComments }
}

export async function createPost(postData: {
  title?: string
  content: string
  channel: Channel
  mood?: string
  tags?: string[]
}) {
  const user = useAuthStore.getState().user
  if (!user) return null

  const newPost: Post = {
    id: generateId(),
    author_id: user.id,
    title: postData.title || null,
    content: postData.content,
    channel: postData.channel,
    mood: (postData.mood as any) || null,
    tags: postData.tags || [],
    images: [],
    created_at: new Date().toISOString(),
    author: user,
    like_count: 0,
    comment_count: 0,
    is_liked: false,
  }

  const posts = getItem<Post[]>('posts', [])
  posts.unshift(newPost)
  setItem('posts', posts)

  return newPost
}

export async function addComment(postId: string, content: string) {
  const user = useAuthStore.getState().user
  if (!user) return null

  const newComment: Comment = {
    id: generateId(),
    post_id: postId,
    author_id: user.id,
    content,
    created_at: new Date().toISOString(),
    author: user,
  }

  const comments = getItem<Comment[]>('comments', [])
  comments.push(newComment)
  setItem('comments', comments)

  return newComment
}

export async function toggleLike(postId: string): Promise<boolean> {
  const user = useAuthStore.getState().user
  if (!user) return false

  const likes = getItem<PostLike[]>('post-likes', [])
  const existingIndex = likes.findIndex(
    l => l.user_id === user.id && l.post_id === postId
  )

  if (existingIndex >= 0) {
    likes.splice(existingIndex, 1)
    setItem('post-likes', likes)
    return false
  } else {
    likes.push({
      user_id: user.id,
      post_id: postId,
      created_at: new Date().toISOString(),
    })
    setItem('post-likes', likes)
    return true
  }
}

export async function toggleEmotion(postId: string, emotionType: string): Promise<boolean> {
  const user = useAuthStore.getState().user
  if (!user) return false

  const emotions = getItem<PostEmotion[]>('post-emotions', [])
  const existingIndex = emotions.findIndex(
    e => e.user_id === user.id && e.post_id === postId && e.emotion_type === emotionType
  )

  if (existingIndex >= 0) {
    emotions.splice(existingIndex, 1)
    setItem('post-emotions', emotions)
    return false
  } else {
    emotions.push({
      user_id: user.id,
      post_id: postId,
      emotion_type: emotionType as any,
      created_at: new Date().toISOString(),
    })
    setItem('post-emotions', emotions)
    return true
  }
}
