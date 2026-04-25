import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { randomAvatar, generateNickname } from '@/lib/avatar'
import { getItem, setItem, generateId } from '@/lib/storage'
import type { User, Post, Comment, PostLike, PostEmotion } from '@/types'

function createSamplePosts(userId: string): { posts: Post[]; comments: Comment[]; likes: PostLike[]; emotions: PostEmotion[] } {
  const hourAgo = new Date(Date.now() - 3600000).toISOString()
  const threeHoursAgo = new Date(Date.now() - 10800000).toISOString()
  const dayAgo = new Date(Date.now() - 86400000).toISOString()
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString()

  const sampleUser1: User = {
    id: 'sample-user-1',
    avatar_style: 'animal',
    avatar_value: '🐱',
    nickname: '温柔的月光',
    role: 'user',
    mbti_type: 'INFP',
    theme: 'forest',
    created_at: twoDaysAgo,
    updated_at: twoDaysAgo,
  }

  const sampleUser2: User = {
    id: 'sample-user-2',
    avatar_style: 'plant',
    avatar_value: '🌸',
    nickname: '安静的微风',
    role: 'user',
    mbti_type: 'ENFJ',
    theme: 'sakura',
    created_at: twoDaysAgo,
    updated_at: twoDaysAgo,
  }

  const sampleUser3: User = {
    id: 'sample-user-3',
    avatar_style: 'star',
    avatar_value: '✨',
    nickname: '自由的星星',
    role: 'user',
    mbti_type: 'INTP',
    theme: 'starry',
    created_at: twoDaysAgo,
    updated_at: twoDaysAgo,
  }

  const posts: Post[] = [
    {
      id: 'sample-post-1',
      author_id: sampleUser1.id,
      title: null,
      content: '今天下班路上看到一只小猫在路灯下打盹，突然觉得生活其实也没那么糟糕。有时候治愈我们的不是什么大道理，就是这些微小的瞬间。',
      channel: 'general',
      mood: 'calm',
      tags: ['日常', '感悟'],
      images: [],
      created_at: hourAgo,
      author: sampleUser1,
      like_count: 5,
      comment_count: 2,
    },
    {
      id: 'sample-post-2',
      author_id: sampleUser2.id,
      title: '最近总是失眠',
      content: '凌晨三点还睡不着，脑子里全是白天工作的事情。感觉压力好大，但又不知道该跟谁说。来这里倾诉一下，希望明天会好一些。有没有人也经常失眠的？',
      channel: 'confession',
      mood: 'anxious',
      tags: ['深夜', '焦虑', '树洞'],
      images: [],
      created_at: threeHoursAgo,
      author: sampleUser2,
      like_count: 12,
      comment_count: 3,
    },
    {
      id: 'sample-post-3',
      author_id: sampleUser3.id,
      title: '终于鼓起勇气辞职了',
      content: '做了两年的工作，今天终于递了辞职信。虽然未来不确定，但我觉得人生不能一直待在舒适区里。接下来打算先休息一段时间，学点新东西，然后重新出发。加油！',
      channel: 'story',
      mood: 'excited',
      tags: ['成长', '感悟', '分享'],
      images: [],
      created_at: dayAgo,
      author: sampleUser3,
      like_count: 28,
      comment_count: 4,
    },
    {
      id: 'sample-post-4',
      author_id: sampleUser1.id,
      title: null,
      content: '有没有人推荐一些好看的书？最近想看点心理学或者哲学方面的，最好是那种读完会让人思考很久的。谢谢大家！',
      channel: 'question',
      mood: 'happy',
      tags: ['求助', '分享'],
      images: [],
      created_at: dayAgo,
      author: sampleUser1,
      like_count: 8,
      comment_count: 5,
    },
    {
      id: 'sample-post-5',
      author_id: sampleUser2.id,
      title: null,
      content: '今天收到了一个很久没联系的朋友的消息，说想我了。虽然只是简简单单的几个字，但心里暖暖的。原来被人惦记的感觉这么好。',
      channel: 'mood',
      mood: 'grateful',
      tags: ['友情', '快乐'],
      images: [],
      created_at: twoDaysAgo,
      author: sampleUser2,
      like_count: 15,
      comment_count: 2,
    },
  ]

  const comments: Comment[] = [
    {
      id: 'sample-comment-1',
      post_id: 'sample-post-1',
      author_id: sampleUser2.id,
      content: '好温暖的感觉，我也经常被这些小瞬间治愈',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      author: sampleUser2,
    },
    {
      id: 'sample-comment-2',
      post_id: 'sample-post-1',
      author_id: sampleUser3.id,
      content: '小猫真的是治愈系生物！我也好喜欢',
      created_at: new Date(Date.now() - 900000).toISOString(),
      author: sampleUser3,
    },
    {
      id: 'sample-comment-3',
      post_id: 'sample-post-2',
      author_id: sampleUser1.id,
      content: '抱抱你，失眠真的很痛苦。试试睡前听白噪音或者冥想，对我还挺有用的',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      author: sampleUser1,
    },
    {
      id: 'sample-comment-4',
      post_id: 'sample-post-2',
      author_id: sampleUser3.id,
      content: '我也是，最近压力特别大。不过说出来就好多了，这里很安全',
      created_at: new Date(Date.now() - 5400000).toISOString(),
      author: sampleUser3,
    },
    {
      id: 'sample-comment-5',
      post_id: 'sample-post-2',
      author_id: userId,
      content: '加油，一切都会好起来的',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      author: undefined,
    },
    {
      id: 'sample-comment-6',
      post_id: 'sample-post-3',
      author_id: sampleUser1.id,
      content: '太勇敢了！支持你，人生就是要不断尝试',
      created_at: new Date(Date.now() - 79200000).toISOString(),
      author: sampleUser1,
    },
    {
      id: 'sample-comment-7',
      post_id: 'sample-post-3',
      author_id: sampleUser2.id,
      content: '辞职需要很大的勇气，你真的很棒！休息好了再出发',
      created_at: new Date(Date.now() - 78000000).toISOString(),
      author: sampleUser2,
    },
    {
      id: 'sample-comment-8',
      post_id: 'sample-post-3',
      author_id: userId,
      content: '加油！相信你一定能找到更好的方向',
      created_at: new Date(Date.now() - 75000000).toISOString(),
      author: undefined,
    },
    {
      id: 'sample-comment-9',
      post_id: 'sample-post-3',
      author_id: sampleUser3.id,
      content: '谢谢大家的鼓励！',
      created_at: new Date(Date.now() - 72000000).toISOString(),
      author: sampleUser3,
    },
    {
      id: 'sample-comment-10',
      post_id: 'sample-post-4',
      author_id: sampleUser2.id,
      content: '推荐《被讨厌的勇气》，阿德勒心理学入门，很受启发',
      created_at: new Date(Date.now() - 82800000).toISOString(),
      author: sampleUser2,
    },
    {
      id: 'sample-comment-11',
      post_id: 'sample-post-4',
      author_id: sampleUser3.id,
      content: '《思考，快与慢》很不错，关于认知偏差的，读完会改变你看世界的方式',
      created_at: new Date(Date.now() - 81000000).toISOString(),
      author: sampleUser3,
    },
    {
      id: 'sample-comment-12',
      post_id: 'sample-post-5',
      author_id: sampleUser1.id,
      content: '被人惦记真的很幸福，好好珍惜这段友谊',
      created_at: new Date(Date.now() - 169200000).toISOString(),
      author: sampleUser1,
    },
    {
      id: 'sample-comment-13',
      post_id: 'sample-post-5',
      author_id: userId,
      content: '暖暖的，真好',
      created_at: new Date(Date.now() - 168000000).toISOString(),
      author: undefined,
    },
  ]

  const likes: PostLike[] = [
    { user_id: userId, post_id: 'sample-post-1', created_at: hourAgo },
    { user_id: userId, post_id: 'sample-post-2', created_at: threeHoursAgo },
    { user_id: userId, post_id: 'sample-post-3', created_at: dayAgo },
  ]

  const emotions: PostEmotion[] = [
    { user_id: userId, post_id: 'sample-post-2', emotion_type: 'hug', created_at: threeHoursAgo },
    { user_id: userId, post_id: 'sample-post-3', emotion_type: 'love', created_at: dayAgo },
  ]

  return { posts, comments, likes, emotions }
}

export function useAuth() {
  const { user, setUser } = useAuthStore()

  useEffect(() => {
    // Check if user already exists in localStorage
    const existingUser = getItem<User | null>('user', null)

    if (existingUser) {
      setUser(existingUser)
    } else {
      // Create new anonymous user
      const avatar = randomAvatar()
      const newUser: User = {
        id: generateId(),
        avatar_style: avatar.style,
        avatar_value: avatar.value,
        nickname: generateNickname(),
        role: 'user',
        mbti_type: null,
        theme: 'forest',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setItem('user', newUser)
      setUser(newUser)

      // Initialize sample data
      const sampleData = createSamplePosts(newUser.id)
      setItem('posts', sampleData.posts)
      setItem('comments', sampleData.comments)
      setItem('post-likes', sampleData.likes)
      setItem('post-emotions', sampleData.emotions)

      // Store sample users for author resolution
      const sampleUsers = [
        sampleData.posts[0].author!,
        sampleData.posts[1].author!,
        sampleData.posts[2].author!,
      ]
      setItem('sample-users', sampleUsers)
    }
  }, [])

  return { user }
}
