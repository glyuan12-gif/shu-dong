import { create } from 'zustand'
import type { Post } from '@/types'

interface PostState {
  posts: Post[]
  isLoading: boolean
  hasMore: boolean
  currentPage: number
  setPosts: (posts: Post[]) => void
  addPost: (post: Post) => void
  setLoading: (loading: boolean) => void
  setHasMore: (hasMore: boolean) => void
  setPage: (page: number) => void
  reset: () => void
}

export const usePostStore = create<PostState>()((set) => ({
  posts: [],
  isLoading: false,
  hasMore: true,
  currentPage: 0,
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  setLoading: (isLoading) => set({ isLoading }),
  setHasMore: (hasMore) => set({ hasMore }),
  setPage: (currentPage) => set({ currentPage }),
  reset: () => set({ posts: [], isLoading: false, hasMore: true, currentPage: 0 }),
}))
