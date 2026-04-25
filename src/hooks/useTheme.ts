import { useEffect } from 'react'
import { useThemeStore } from '@/stores/themeStore'
import type { ThemeName } from '@/types'

export function useTheme() {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const switchTheme = (newTheme: ThemeName) => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return { theme, switchTheme }
}
