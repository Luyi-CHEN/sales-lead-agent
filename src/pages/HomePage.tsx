import { useState } from 'react'
import { useAppState } from '@/store/app-store'
import { ChatTab } from '@/components/chat/ChatTab'
import { BidListTab } from '@/components/bid/BidListTab'
import { MessageCircle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabKey = 'chat' | 'bids'

export function HomePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('chat')
  const { unreadCount } = useAppState()

  const tabs: { key: TabKey; label: string; icon: typeof MessageCircle }[] = [
    { key: 'chat', label: '助手', icon: MessageCircle },
    { key: 'bids', label: '标讯', icon: FileText },
  ]

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Top Tab Bar */}
      <header className="sticky top-0 z-20 border-b bg-card">
        <div className="flex items-center px-4 pt-3 pb-0">
          <div className="flex flex-1 gap-1 rounded-lg bg-secondary p-0.5">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  data-track={`切换到「${tab.label}」`}
                  data-track-type="导航"
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.key === 'bids' && unreadCount > 0 && (
                    <span className="absolute -top-0.5 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        {/* Sub-header per tab */}
        <div className="px-4 py-2">
          {activeTab === 'chat' ? (
            <p className="text-xs text-muted-foreground">智能引导处理标讯 · 在线</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} 条新标讯待处理` : '暂无新标讯'}
            </p>
          )}
        </div>
      </header>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? <ChatTab /> : <BidListTab />}
      </div>
    </div>
  )
}