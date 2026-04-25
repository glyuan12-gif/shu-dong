import { Search, Settings } from 'lucide-react'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-background/80 backdrop-blur border-b border-border/50">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg
            className="w-7 h-7 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.8 0 3.5-.5 5-1.3" />
            <path d="M12 2c2 3 3 6.5 3 10s-1 7-3 10" />
            <path d="M2 12h20" />
            <path d="M4 7h16" />
            <path d="M4 17h16" />
          </svg>
          <span className="text-lg font-bold text-primary">树洞</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="搜索"
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="设置"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* 底部渐变光线 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-accent" />
    </header>
  )
}
