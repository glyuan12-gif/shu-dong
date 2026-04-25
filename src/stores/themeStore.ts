import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeName } from '@/types'

interface ThemeState {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'forest' as ThemeName,
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'shu-dong-theme' }
  )
)
