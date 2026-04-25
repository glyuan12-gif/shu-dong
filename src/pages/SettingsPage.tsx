import { useState } from 'react'
import { Link } from 'react-router'
import { Save, RefreshCw, Trash2, Info, Sparkles, Check } from 'lucide-react'
import { setItem } from '@/lib/storage'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/hooks/useTheme'
import { randomAvatar } from '@/lib/avatar'
import { THEMES } from '@/types'
import type { ThemeName } from '@/types'

export function SettingsPage() {
  const { user, updateProfile } = useAuthStore()
  const { theme, switchTheme } = useTheme()
  const [nickname, setNickname] = useState(user?.nickname || '')
  const [savingNickname, setSavingNickname] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [nicknameSaved, setNicknameSaved] = useState(false)

  const handleSaveNickname = () => {
    if (!user || !nickname.trim()) return
    setSavingNickname(true)

    const updatedUser = { ...user, nickname: nickname.trim() }
    setItem('user', updatedUser)
    updateProfile({ nickname: nickname.trim() })
    setNicknameSaved(true)
    setTimeout(() => setNicknameSaved(false), 2000)
    setSavingNickname(false)
  }

  const handleRandomAvatar = () => {
    if (!user) return
    setSavingAvatar(true)
    const avatar = randomAvatar()

    const updatedUser = { ...user, avatar_style: avatar.style, avatar_value: avatar.value }
    setItem('user', updatedUser)
    updateProfile({ avatar_style: avatar.style, avatar_value: avatar.value })
    setSavingAvatar(false)
  }

  const handleClearCache = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      {/* Profile Card */}
      <div className="bg-card rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold">个人资料</h2>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleRandomAvatar}
            disabled={savingAvatar}
            className="relative group"
            title="点击随机更换头像"
          >
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-5xl transition-transform group-hover:scale-105">
              {user?.avatar_value || '🌱'}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <RefreshCw className={`w-6 h-6 text-white ${savingAvatar ? 'animate-spin' : ''}`} />
            </div>
          </button>
          <p className="text-xs text-muted-foreground">点击头像随机更换</p>
        </div>

        {/* Nickname */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">昵称</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              placeholder="输入昵称"
            />
            <button
              onClick={handleSaveNickname}
              disabled={!nickname.trim() || savingNickname}
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              {nicknameSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  已保存
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  保存
                </>
              )}
            </button>
          </div>
        </div>

        {/* MBTI */}
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm text-muted-foreground">MBTI 类型</span>
            {user?.mbti_type ? (
              <div className="text-lg font-bold text-primary mt-0.5">{user.mbti_type}</div>
            ) : (
              <div className="text-sm text-muted-foreground mt-0.5">尚未测试</div>
            )}
          </div>
          <Link
            to="/mbti"
            className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-accent transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            {user?.mbti_type ? '重新测试' : '去测试'}
          </Link>
        </div>
      </div>

      {/* Theme Card */}
      <div className="bg-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">外观设置</h2>
        <p className="text-sm text-muted-foreground">选择你喜欢的主题风格</p>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(THEMES) as [ThemeName, { name: string; icon: string; colors: string[] }][]).map(
            ([key, val]) => (
              <button
                key={key}
                onClick={() => switchTheme(key)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  theme === key
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-secondary hover:bg-accent/50'
                }`}
              >
                {theme === key && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{val.icon}</span>
                  <span className="text-sm font-medium">{val.name}</span>
                </div>
                <div className="flex gap-1">
                  {val.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border border-white/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Other */}
      <div className="bg-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">其他</h2>

        <button
          onClick={handleClearCache}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors text-left"
        >
          <Trash2 className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">清除本地缓存</div>
            <div className="text-xs text-muted-foreground">清除后需要重新登录</div>
          </div>
        </button>

        <div className="flex items-center gap-3 p-3 rounded-xl">
          <Info className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">关于树洞</div>
            <div className="text-xs text-muted-foreground">一个安全的匿名倾诉空间 v1.0.0</div>
          </div>
        </div>
      </div>
    </div>
  )
}
