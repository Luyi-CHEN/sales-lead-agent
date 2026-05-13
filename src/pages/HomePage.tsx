import { useState } from 'react'
import { ChatTab } from '@/components/chat/ChatTab'
import { AppsTab } from '@/components/apps/AppsTab'
import { Menu, Plus, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabKey = 'chat' | 'content' | 'apps'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'chat', label: '智能体' },
  { key: 'content', label: '内容中心' },
  { key: 'apps', label: '全部应用' },
]

export function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('chat')

  return (
    <div className="flex h-full flex-col hero-bg">
      {/* Top Bar: 汉堡 + 三Tab + 加号 */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/40">
        <div className="flex items-center gap-2 px-3 pt-3 pb-2">
          <button
            data-track="打开侧边菜单"
            data-track-type="导航"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/80 active:bg-black/5"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav className="flex flex-1 items-center justify-center gap-6">
            {TABS.map(tab => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  data-track={`切换到「${tab.label}」`}
                  data-track-type="导航"
                  className="relative py-1 text-[15px] font-medium transition-colors"
                >
                  <span
                    className={cn(
                      isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="absolute left-1/2 -bottom-0.5 h-1 w-5 -translate-x-1/2 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}
          </nav>

          <button
            data-track="新增会话"
            data-track-type="导航"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground/80 active:bg-black/5"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Tab Content — keep ChatTab & AppsTab mounted so their state survives tab switches */}
      <div className="flex-1 overflow-hidden">
        <div className={cn('h-full', activeTab === 'chat' ? '' : 'hidden')}>
          <ChatTab />
        </div>
        <div className={cn('h-full overflow-hidden', activeTab === 'apps' ? '' : 'hidden')}>
          <AppsTab />
        </div>
        {activeTab === 'content' && <ContentCenterPlaceholder />}
      </div>
    </div>
  )
}

function ContentCenterPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl chip-lottery text-white">
        <LayoutGrid className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-foreground">内容中心</h3>
      <p className="text-xs text-muted-foreground">
        这里将汇聚你的知识卡片、产品资料与活动内容，敬请期待。
      </p>
    </div>
  )
}
