import { useNavigate, useLocation } from 'react-router-dom'
import { FileText, BarChart3, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppState } from '@/store/app-store'

const tabs = [
  { path: '/', icon: FileText, label: '标讯', showBadge: true },
  { path: '/stats', icon: BarChart3, label: '统计', showBadge: false },
  { path: '/profile', icon: User, label: '我的', showBadge: false },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { unreadCount } = useAppState()

  // 详情页/操作页不显示底部导航
  if (location.pathname.startsWith('/bid/')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card safe-bottom"
      style={{ boxShadow: 'var(--shadow-bottom-bar)' }}>
      <div className="mx-auto flex max-w-[480px] items-center justify-around px-2 pt-1.5">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-4 rounded-lg touch-target",
                "transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-[22px] w-[22px]", isActive && "stroke-[2.5px]")} />
                {tab.showBadge && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className={cn("text-2xs", isActive ? "font-semibold" : "font-medium")}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}