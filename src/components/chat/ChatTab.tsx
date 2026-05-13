import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, MapPin, ChevronRight, Clock, Banknote,
  RotateCw, Send, CheckSquare, Tv, Mic, Users, Briefcase,
  FileSearch, TrendingUp, Lightbulb, ArrowRight, Star, Tag, type LucideIcon,
} from 'lucide-react'
import { useAppState } from '@/store/app-store'
import { useAnalytics } from '@/store/analytics-store'
import { type BidInfo, industryColors } from '@/data/mock-data'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Preset prompt pool for the welcome screen (two prompts per group per design)
type PresetPrompt = { text: string; icon: LucideIcon; badgeClass: string }
const PRESET_PROMPTS: PresetPrompt[][] = [
  [
    { text: '推送最新的10条标讯线索信息', icon: Lightbulb, badgeClass: 'bg-gradient-to-br from-[hsl(217_91%_54%)] to-[hsl(226_100%_59%)]' },
    { text: '分析北大口腔医院Q2的采购需求', icon: TrendingUp, badgeClass: 'bg-gradient-to-br from-[hsl(0_80%_62%)] to-[hsl(20_90%_58%)]' },
  ],
  [
    { text: '查看今天待跟进的标讯', icon: FileSearch, badgeClass: 'bg-gradient-to-br from-[hsl(217_91%_54%)] to-[hsl(226_100%_59%)]' },
    { text: '江苏地区有哪些新标讯', icon: MapPin, badgeClass: 'bg-gradient-to-br from-[hsl(160_70%_45%)] to-[hsl(180_70%_40%)]' },
  ],
  [
    { text: '帮我整理本周的商机概况', icon: TrendingUp, badgeClass: 'bg-gradient-to-br from-[hsl(0_80%_62%)] to-[hsl(20_90%_58%)]' },
    { text: '医疗行业最新标讯', icon: Lightbulb, badgeClass: 'bg-gradient-to-br from-[hsl(38_95%_58%)] to-[hsl(20_90%_58%)]' },
  ],
]

// Bottom quick-entry shortcuts (replace the materials/insight chips per new design)
type QuickEntry = { label: string; action: string; icon: LucideIcon }
const QUICK_ENTRIES: QuickEntry[] = [
  { label: '客户拜访', action: '客户拜访', icon: Users },
  { label: '标讯管理', action: '标讯管理', icon: Briefcase },
  { label: '立项查询', action: '立项查询', icon: FileSearch },
]

function getTimeGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜里好'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

interface Message {
  id: number
  role: 'agent' | 'user'
  content: string
  type?: 'text' | 'bid-alert' | 'quick-actions' | 'bid-list' | 'bid-carousel' | 'bid-batch'
  bidId?: string
  actions?: { label: string; action: string }[]
  listFilter?: 'all' | 'pending'
  filteredBidIds?: string[]  // 新增：预过滤的标讯ID列表
  carouselTitle?: string     // bid-carousel 顶部标题
  carouselSubtitle?: string  // bid-carousel 顶部副标题
}

export function ChatTab() {
  const navigate = useNavigate()
  const { bids } = useAppState()
  const { logChat, logClick } = useAnalytics()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [promptPoolIndex, setPromptPoolIndex] = useState(0)

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current!.scrollTop = chatRef.current!.scrollHeight
      }, 50)
    }
  }, [])

  const addMessage = useCallback((msg: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now() + Math.random() }])
    scrollToBottom()
  }, [scrollToBottom])

  const simulateAgentReply = useCallback((content: string, delay = 600, extras?: Partial<Message>) => {
    setIsTyping(true)
    scrollToBottom()
    setTimeout(() => {
      setIsTyping(false)
      addMessage({ role: 'agent', content, type: 'text', ...extras })
    }, delay)
  }, [addMessage, scrollToBottom])

  // Welcome screen is shown until the user sends the first message or taps a preset prompt.
  // (Auto-greeting flow intentionally removed in the redesign.)
  useEffect(() => {
    // reserved for future warm-up logic
  }, [bids])

  const handleAction = (action: string) => {
    const pendingBids = bids.filter(b => b.status === 'pending')

    // Log quick action click
    logClick({
      description: `点击快捷操作「${action}」`,
      category: '对话交互',
      page: '首页-助手',
      detail: action,
    })

    switch (action) {
      case 'view_latest':
        addMessage({ role: 'user', content: '查看最新标讯' })
        if (pendingBids[0]) {
          simulateAgentReply(
            `最新一条标讯：\n\n📋 **${pendingBids[0].projectName}**\n🏢 ${pendingBids[0].procurementUnit || '未公示'}\n💰 预算 ${pendingBids[0].budgetAmount}万 · ${pendingBids[0].industry}\n📍 ${pendingBids[0].region} · ${pendingBids[0].city}\n\n点击下方按钮查看完整详情并处理。`,
            700,
            {
              type: 'quick-actions',
              bidId: pendingBids[0].id,
              actions: [
                { label: '查看详情并处理', action: `goto_${pendingBids[0].id}` },
                { label: '跳过，看下一条', action: 'next_bid' },
              ],
            }
          )
        }
        break

      case 'view_all':
        addMessage({ role: 'user', content: '查看全部标讯' })
        simulateAgentReply(
          '以下是全部标讯，你可以切换筛选条件：',
          500,
          { type: 'bid-list', listFilter: 'all' }
        )
        break

      case 'next_bid': {
        addMessage({ role: 'user', content: '看下一条' })
        const unprocessed = pendingBids.slice(1)
        if (unprocessed.length > 0) {
          simulateAgentReply(
            `下一条标讯：\n\n📋 **${unprocessed[0].projectName}**\n🏢 ${unprocessed[0].procurementUnit || '未公示'}\n💰 预算 ${unprocessed[0].budgetAmount}万 · ${unprocessed[0].industry}\n📍 ${unprocessed[0].region} · ${unprocessed[0].city}`,
            600,
            {
              type: 'quick-actions',
              actions: [
                { label: '查看详情并处理', action: `goto_${unprocessed[0].id}` },
                { label: '跳过', action: 'next_bid' },
              ],
            }
          )
        } else {
          simulateAgentReply('所有新标讯已浏览完毕！如有需要随时找我。', 500)
        }
        break
      }

      default:
        if (action.startsWith('goto_')) {
          const bidId = action.replace('goto_', '')
          addMessage({ role: 'user', content: '查看详情' })
          simulateAgentReply('正在打开标讯详情...', 300)
          setTimeout(() => navigate(`/bid/${bidId}`), 500)
        }
    }
  }

  const handleSend = (override?: string) => {
    const displayText = (override ?? inputValue).trim()
    if (!displayText) return

    if (!override) setInputValue('')
    addMessage({ role: 'user', content: displayText, type: 'text' })

    const matchText = displayText.toLowerCase()
    const intent = detectIntent(matchText, bids)
    simulateAgentReply(intent.content, intent.delay ?? 600, intent.extras)

    // Log conversation for analytics
    logChat({
      userInput: displayText,
      systemResponse: intent.content,
      detectedIntent: intent.intentName || 'unknown',
      responseType: intent.extras?.type || 'text',
    })
  }

  const pendingBids = bids.filter(b => b.status === 'pending')
  const currentPrompts = useMemo(
    () => PRESET_PROMPTS[promptPoolIndex % PRESET_PROMPTS.length],
    [promptPoolIndex]
  )

  const handleRefreshPrompts = () => {
    setPromptPoolIndex(i => i + 1)
    logClick({
      description: '刷新预置问题',
      category: '对话交互',
      page: '首页-对话',
      detail: '换一批',
    })
  }

  const handlePromptClick = (prompt: string) => {
    logClick({
      description: `点击预置问题「${prompt}」`,
      category: '对话交互',
      page: '首页-智能体',
      detail: prompt,
    })
    handleSend(prompt)
  }

  const handleQuickEntry = (entry: QuickEntry) => {
    logClick({
      description: `点击快捷入口「${entry.label}」`,
      category: '快捷入口',
      page: '首页-智能体',
      detail: entry.label,
    })
    handleSend(entry.action)
  }

  const handleVoiceTap = () => {
    logClick({
      description: '点击语音输入',
      category: '多模态输入',
      page: '首页-智能体',
      detail: '麦克风按钮',
    })
  }

  const handleDataCardClick = (key: 'visits' | 'bids') => {
    const prompt = key === 'bids' ? '待我处理的标讯' : '待拜访的客户'
    logClick({
      description: `点击数据卡片「${prompt}」`,
      category: '数据入口',
      page: '首页-智能体',
      detail: prompt,
    })
    handleSend(prompt)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable area: welcome screen always mounted on top, messages appended below */}
      <div ref={chatRef} className="relative flex-1 overflow-y-auto scrollbar-hide">
        {/* Welcome screen is always rendered so users can scroll up to revisit the hero + preset prompts */}
        <WelcomeScreen
          prompts={currentPrompts}
          onPromptClick={handlePromptClick}
          onRefresh={handleRefreshPrompts}
          onDataCardClick={handleDataCardClick}
        />

        {(messages.length > 0 || isTyping) && (
          <div className="px-4 pt-2 pb-4">
            <div className="flex flex-col gap-3">
              {messages.map(msg => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  allBids={bids}
                  pendingBids={pendingBids}
                  onAction={handleAction}
                  onBidClick={(id) => navigate(`/bid/${id}`)}
                />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-2.5 animate-fade-in">
                  <AgentAvatar />
                  <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 shadow-sm">
                    <div className="flex gap-1">
                      <span className="dot-pulse" />
                      <span className="dot-pulse" style={{ animationDelay: '0.2s' }} />
                      <span className="dot-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom composer: quick-entry pills + rounded input with voice button */}
      <div className="px-3 pt-2 pb-3 safe-bottom">
        <div className="mb-2 flex items-center justify-start gap-2">
          {QUICK_ENTRIES.map(entry => {
            const Icon = entry.icon
            return (
              <button
                key={entry.label}
                onClick={() => handleQuickEntry(entry)}
                data-track={`点击快捷入口「${entry.label}」`}
                data-track-type="快捷入口"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-[13px] font-medium text-foreground shadow-[0_2px_8px_-2px_rgba(80,60,180,0.12)] ring-1 ring-black/5 backdrop-blur-sm active:scale-[0.98]"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span>{entry.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1.5 shadow-[0_2px_10px_-2px_rgba(80,60,180,0.14)] ring-1 ring-black/5">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
            placeholder="发消息或点击说话…"
            className="flex-1 bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {inputValue.trim() ? (
            <button
              onClick={() => handleSend()}
              data-track="发送对话消息"
              data-track-type="对话交互"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-all duration-200 active:scale-95"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Send className="h-4 w-4 -rotate-12" />
            </button>
          ) : (
            <button
              onClick={handleVoiceTap}
              data-track="点击语音输入"
              data-track-type="多模态输入"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-md transition-all duration-200 active:scale-95"
              style={{ background: 'var(--gradient-primary)' }}
              aria-label="语音输入"
            >
              <Mic className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function AgentAvatar() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
      style={{ background: 'var(--gradient-primary)' }}
    >
      <Sparkles className="h-4 w-4" />
    </div>
  )
}

// ==========================================
// Welcome Screen — greeting + data cards + preset prompts
// ==========================================
function WelcomeScreen({
  prompts,
  onPromptClick,
  onRefresh,
  onDataCardClick,
}: {
  prompts: PresetPrompt[]
  onPromptClick: (prompt: string) => void
  onRefresh: () => void
  onDataCardClick: (key: 'visits' | 'bids') => void
}) {
  // Static mock data mirroring the reference design
  const greeting = getTimeGreeting()
  const visitStats = { undeveloped: 80, contacted: 16 }
  const bidStats = { newAssigned: 20 }

  return (
    <div className="flex flex-col px-4 pt-4 pb-6">
      {/* Hero: greeting + subtitle + mascot */}
      <div className="relative pr-28">
        <h1 className="text-[26px] font-bold leading-tight text-foreground">
          Hi~ {greeting}！
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          我是销售智能体，7*24小时为你服务
        </p>

        {/* Mascot */}
        <div className="pointer-events-none absolute -top-2 right-0 animate-float">
          <div className="relative">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full text-white shadow-[0_10px_24px_-6px_rgba(120,80,220,0.35)]"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Sparkles className="h-10 w-10" />
            </div>
            <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(0_80%_60%)] text-[10px] font-bold text-white ring-2 ring-white">
              S
            </span>
          </div>
        </div>
      </div>

      {/* Data cards: visits + bids */}
      <div className="mt-10 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onDataCardClick('visits')}
          data-track="点击待拜访客户卡片"
          data-track-type="数据入口"
          className="glass-card rounded-2xl p-3 text-left shadow-[0_6px_18px_-8px_rgba(100,80,200,0.2)] active:scale-[0.98] transition-transform"
        >
          <div className="mb-2 flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[hsl(152_69%_41%)] text-white">
              <CheckSquare className="h-3 w-3" />
            </span>
            <span className="text-[13px] font-semibold text-foreground">待拜访客户</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between text-[12px] text-muted-foreground">
              <span>未开发客户</span>
              <span><span className="text-[16px] font-bold text-foreground">{visitStats.undeveloped}</span>家</span>
            </div>
            <div className="flex items-baseline justify-between text-[12px] text-muted-foreground">
              <span>已沟通客户</span>
              <span><span className="text-[16px] font-bold text-foreground">{visitStats.contacted}</span>家</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => onDataCardClick('bids')}
          data-track="点击待处理标讯卡片"
          data-track-type="数据入口"
          className="glass-card rounded-2xl p-3 text-left shadow-[0_6px_18px_-8px_rgba(100,80,200,0.2)] active:scale-[0.98] transition-transform"
        >
          <div className="mb-2 flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[hsl(268_80%_60%)] text-white">
              <Tv className="h-3 w-3" />
            </span>
            <span className="text-[13px] font-semibold text-foreground">待处理标讯</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between text-[12px] text-muted-foreground">
              <span>新分配的标讯</span>
              <span><span className="text-[16px] font-bold text-foreground">{bidStats.newAssigned}</span>条</span>
            </div>
          </div>
        </button>
      </div>

      {/* Preset prompts with colored icons */}
      <div className="mt-6 flex flex-col gap-2">
        {prompts.map(p => {
          const Icon = p.icon
          return (
            <button
              key={p.text}
              onClick={() => onPromptClick(p.text)}
              data-track={`点击预置问题「${p.text}」`}
              data-track-type="对话交互"
              className="card-press flex items-center gap-3 rounded-full border border-black/5 bg-white/90 px-3 py-2.5 text-left text-[13px] text-foreground shadow-[0_2px_10px_-4px_rgba(80,60,180,0.15)]"
            >
              <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white', p.badgeClass)}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="line-clamp-1 flex-1">{p.text}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          )
        })}
      </div>

      {/* Refresh row */}
      <div className="mt-3 flex items-center">
        <button
          onClick={onRefresh}
          data-track="换一批预置问题"
          data-track-type="对话交互"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground active:text-foreground"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>换一批</span>
        </button>
      </div>
    </div>
  )
}

// ==========================================
// Inline bid list component for chat
// ==========================================
const statusConfig: Record<string, { label: string; variant: 'new' | 'done' | 'destructive' }> = {
  pending: { label: '已分配（待跟进）', variant: 'new' },
  linked: { label: '已反馈（关联已有商机）', variant: 'done' },
  no_opportunity: { label: '已反馈（无商机）', variant: 'destructive' },
  new_opportunity: { label: '已反馈（新商机）', variant: 'done' },
}

type ListFilter = 'all' | 'pending' | 'feedback'

const VISIBLE_LIMIT = 3

function ChatBidList({ allBids, initialFilter, filteredBidIds, onBidClick }: {
  allBids: BidInfo[]
  initialFilter: 'all' | 'pending'
  filteredBidIds?: string[]
  onBidClick: (id: string) => void
}) {
  const mapInitial = (f: string): ListFilter => {
    if (f === 'pending') return 'pending'
    return 'all'
  }
  const [activeFilter, setActiveFilter] = useState<ListFilter>(mapInitial(initialFilter))
  const [expanded, setExpanded] = useState(false)

  const filters: { key: ListFilter; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: allBids.length },
    { key: 'pending', label: '待跟进', count: allBids.filter(b => b.status === 'pending').length },
    { key: 'feedback', label: '已反馈', count: allBids.filter(b => ['linked', 'no_opportunity', 'new_opportunity'].includes(b.status)).length },
  ]

  const filtered = filteredBidIds && filteredBidIds.length > 0
    ? allBids.filter(b => filteredBidIds.includes(b.id))
    : allBids.filter(b => {
        if (activeFilter === 'pending') return b.status === 'pending'
        if (activeFilter === 'feedback') return ['linked', 'no_opportunity', 'new_opportunity'].includes(b.status)
        return true
      })

  const visibleBids = expanded ? filtered : filtered.slice(0, VISIBLE_LIMIT)
  const hasMore = filtered.length > VISIBLE_LIMIT

  return (
    <div className="w-full rounded-xl border bg-card overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Filter chips */}
      {(!filteredBidIds || filteredBidIds.length === 0) && (
        <div className="flex gap-1.5 px-3 pt-3 pb-2 overflow-x-auto scrollbar-hide">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => { setActiveFilter(f.key); setExpanded(false) }}
              data-track={`对话中筛选「${f.label}」`}
              data-track-type="筛选"
              className={cn(
                'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200',
                activeFilter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground active:bg-muted'
              )}
            >
              {f.label} {f.count}
            </button>
          ))}
        </div>
      )}

      {/* Bid rows */}
      <div className="max-h-[320px] overflow-y-auto scrollbar-hide divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            暂无标讯
          </div>
        ) : (
          visibleBids.map(bid => {
            const status = statusConfig[bid.status]
            const industryClass = industryColors[bid.industry] || 'bg-secondary text-muted-foreground'
            return (
              <button
                key={bid.id}
                onClick={() => onBidClick(bid.id)}
                data-track="从对话列表查看标讯"
                data-track-type="标讯浏览"
                data-track-detail={`${bid.projectName}|${bid.bidType}|高价值=${bid.highValueCustomer ? '是' : '否'}`}
                className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left active:bg-accent transition-colors duration-150 relative"
              >

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Row 1: status + bidType + industry + 高价值 */}
                  <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                    <Badge variant={status.variant} className="text-[9px] px-1 py-0 h-4 leading-none">
                      {status.label}
                    </Badge>
                    <span className="rounded px-1 py-0 text-[9px] font-medium h-4 leading-4 inline-flex items-center bg-primary/10 text-primary">
                      {bid.bidType}
                    </span>
                    <span className={cn('rounded px-1 py-0 text-[9px] font-medium h-4 leading-4 inline-flex items-center', industryClass)}>
                      {bid.industry}
                    </span>
                    {bid.highValueCustomer && (
                      <span className="rounded px-1 py-0 text-[9px] font-medium h-4 leading-4 inline-flex items-center gap-0.5 bg-[hsl(38_95%_94%)] text-[hsl(28_85%_45%)]">
                        <Star className="h-2 w-2 fill-current" />高价值客户
                      </span>
                    )}
                  </div>
                  {/* Row 2: project name */}
                  <p className="text-xs font-semibold text-foreground leading-snug line-clamp-1 mb-0.5">
                    {bid.projectName}
                  </p>
                  {/* Row 3: meta */}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5 shrink-0">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      {bid.region}
                    </span>
                    <span className="flex items-center gap-0.5 truncate">
                      <Clock className="h-2.5 w-2.5 shrink-0" />
                      {bid.startDate}至{bid.deadline}
                    </span>
                    <span className="flex items-center gap-0.5 ml-auto font-semibold text-foreground shrink-0">
                      <Banknote className="h-2.5 w-2.5 shrink-0" />
                      {bid.budgetAmount}万
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2.5" />
              </button>
            )
          })
        )}
      </div>

      {/* View more button */}
      {hasMore && !expanded && (
        <div className="border-t border-border">
          <button
            onClick={() => setExpanded(true)}
            data-track="对话中查看全部标讯"
            data-track-type="对话交互"
            className="w-full py-2.5 text-center text-sm text-primary font-medium active:bg-accent transition-colors duration-150"
          >
            查看全部 {filtered.length} 条 ›
          </button>
        </div>
      )}
    </div>
  )
}

// ==========================================
// Horizontal swipe carousel for bids
// ==========================================
function BidCarousel({ bids, title, subtitle, onBidClick }: {
  bids: BidInfo[]
  title: string
  subtitle?: string
  onBidClick: (id: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const cardW = el.clientWidth
    if (cardW > 0) {
      const idx = Math.round(el.scrollLeft / cardW)
      if (idx !== activeIdx) setActiveIdx(idx)
    }
  }

  if (bids.length === 0) {
    return (
      <div className="rounded-2xl bg-white px-4 py-8 text-center text-xs text-muted-foreground shadow-sm">
        暂无标讯
      </div>
    )
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-[0_8px_24px_-8px_rgba(100,80,200,0.2)]"
      style={{ background: 'var(--gradient-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 text-white">
        <div>
          <h4 className="text-[15px] font-semibold leading-tight">{title}</h4>
          {subtitle && <p className="mt-0.5 text-[11px] text-white/80">{subtitle}</p>}
        </div>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm">
          {bids.length} 条
        </span>
      </div>

      {/* Swipe cards */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-hide px-3 pb-3 pt-1"
      >
        {bids.map(bid => {
          const status = statusConfig[bid.status]
          const industryClass = industryColors[bid.industry] || 'bg-secondary text-muted-foreground'
          return (
            <div
              key={bid.id}
              className="w-full shrink-0 snap-center px-1"
            >
              <div className="flex h-full flex-col rounded-2xl bg-white p-3 shadow-sm">
                <div className="mb-1.5 flex items-center gap-1 flex-wrap">
                  <Badge variant={status.variant} className="text-[10px] px-1.5 py-0 h-4 leading-none">
                    {status.label}
                  </Badge>
                  <span className="rounded px-1 py-0 text-[10px] font-medium h-4 leading-4 inline-flex items-center bg-primary/10 text-primary">
                    {bid.bidType}
                  </span>
                  <span className={cn('rounded px-1 py-0 text-[10px] font-medium h-4 leading-4 inline-flex items-center', industryClass)}>
                    {bid.industry}
                  </span>
                  {bid.highValueCustomer && (
                    <span className="rounded px-1 py-0 text-[10px] font-medium h-4 leading-4 inline-flex items-center gap-0.5 bg-[hsl(38_95%_94%)] text-[hsl(28_85%_45%)]">
                      <Star className="h-2.5 w-2.5 fill-current" />高价值客户
                    </span>
                  )}
                  {bid.keywords && (
                    <span className="rounded px-1 py-0 text-[10px] font-medium h-4 leading-4 inline-flex items-center gap-0.5 bg-secondary text-muted-foreground">
                      <Tag className="h-2.5 w-2.5" />{bid.keywords}
                    </span>
                  )}
                </div>
                <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2 mb-1">
                  {bid.projectName}
                </p>
                {bid.summary && (
                  <p className="text-[11px] text-muted-foreground/90 leading-relaxed break-words line-clamp-2 mb-2">
                    {bid.summary}
                  </p>
                )}
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Banknote className="h-3 w-3 shrink-0" />
                    <span>项目金额</span>
                    <span className="ml-auto font-semibold text-foreground">¥{bid.budgetAmount}万</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>时间周期</span>
                    <span className="ml-auto text-foreground/80 truncate">{bid.startDate}至{bid.deadline}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>所属区域</span>
                    <span className="ml-auto text-foreground/80">{bid.region}</span>
                  </div>
                </div>
                <button
                  onClick={() => onBidClick(bid.id)}
                  data-track="从轮播卡片查看标讯详情"
                  data-track-type="标讯浏览"
                  data-track-detail={`${bid.projectName}|${bid.bidType}|高价值=${bid.highValueCustomer ? '是' : '否'}`}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[hsl(250_100%_97%)] py-2 text-[13px] font-semibold text-primary active:scale-[0.98]"
                >
                  <span>去处理</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination dots */}
      {bids.length > 1 && (
        <div className="flex items-center justify-center gap-1 pb-3">
          {bids.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1 rounded-full transition-all duration-200',
                i === activeIdx ? 'w-4 bg-white' : 'w-1 bg-white/50'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// Vertical batched bid cards (5 per batch, tap 「下一批」 to cycle)
// ==========================================
const BATCH_SIZE = 5
function BidBatch({ bids, onBidClick }: {
  bids: BidInfo[]
  onBidClick: (id: string) => void
}) {
  const [batchIdx, setBatchIdx] = useState(0)
  const totalBatches = Math.max(1, Math.ceil(bids.length / BATCH_SIZE))
  const start = batchIdx * BATCH_SIZE
  const visible = bids.slice(start, start + BATCH_SIZE)
  const hasMore = bids.length > BATCH_SIZE

  if (bids.length === 0) {
    return (
      <div className="rounded-2xl bg-white px-4 py-8 text-center text-xs text-muted-foreground shadow-sm">
        暂无标讯
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {visible.map(bid => {
        const status = statusConfig[bid.status]
        const industryClass = industryColors[bid.industry] || 'bg-secondary text-muted-foreground'
        return (
          <button
            key={bid.id}
            onClick={() => onBidClick(bid.id)}
            data-track="从批次卡片查看标讯详情"
            data-track-type="标讯浏览"
            data-track-detail={`${bid.projectName}|${bid.bidType}|高价值=${bid.highValueCustomer ? '是' : '否'}`}
            className="rounded-2xl bg-white p-3.5 text-left shadow-[0_4px_14px_-6px_rgba(100,80,200,0.2)] active:scale-[0.99] transition-transform"
          >
            {/* Top badge row: status + bidType + industry + 高价值 */}
            <div className="mb-1.5 flex items-center gap-1.5 flex-wrap">
              <Badge
                variant={status.variant}
                className="text-[10px] px-1.5 py-0 h-4 leading-none"
              >
                {status.label}
              </Badge>
              <span className="rounded px-1 py-0 text-[10px] font-medium inline-flex items-center h-4 leading-4 bg-primary/10 text-primary">
                {bid.bidType}
              </span>
              <span className={cn('rounded px-1 py-0 text-[10px] font-medium inline-flex items-center h-4 leading-4', industryClass)}>
                {bid.industry}
              </span>
              {bid.highValueCustomer && (
                <span className="rounded px-1 py-0 text-[10px] font-medium inline-flex items-center gap-0.5 h-4 leading-4 bg-[hsl(38_95%_94%)] text-[hsl(28_85%_45%)]">
                  <Star className="h-2.5 w-2.5 fill-current" />高价值客户
                </span>
              )}
              {bid.keywords && (
                <span className="rounded px-1 py-0 text-[10px] font-medium inline-flex items-center gap-0.5 h-4 leading-4 bg-secondary text-muted-foreground">
                  <Tag className="h-2.5 w-2.5" />{bid.keywords}
                </span>
              )}
            </div>
            <p className="text-[14px] font-semibold text-foreground leading-snug line-clamp-2">
              {bid.projectName}
            </p>
            {bid.summary && (
              <p className="mt-1 text-[11px] text-muted-foreground/90 leading-relaxed break-words line-clamp-2">
                {bid.summary}
              </p>
            )}
            <div className="mt-2.5 space-y-1 text-[12px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="shrink-0">项目金额</span>
                <span className="ml-2 font-semibold text-foreground">¥{bid.budgetAmount}万</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="shrink-0">时间周期</span>
                <span className="ml-2 text-foreground/80 truncate">{bid.startDate}至{bid.deadline}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="shrink-0">所属区域</span>
                <span className="ml-2 text-foreground/80">{bid.region}</span>
              </div>
            </div>
          </button>
        )
      })}

      {/* Pagination footer */}
      {hasMore && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground">
            第 {batchIdx + 1} / {totalBatches} 批 · 共 {bids.length} 条
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setBatchIdx(i => (i + 1) % totalBatches)
            }}
            data-track="点击下一批标讯"
            data-track-type="分页切换"
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-primary shadow-sm active:scale-[0.97]"
          >
            <span>下一批</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

// ==========================================
// Chat message renderer
// ==========================================
function ChatMessage({ message, allBids, pendingBids, onAction, onBidClick }: {
  message: Message
  allBids: BidInfo[]
  pendingBids: BidInfo[]
  onAction: (action: string) => void
  onBidClick: (id: string) => void
}) {
  const isAgent = message.role === 'agent'

  // Inline bid list
  if (message.type === 'bid-list') {
    return (
      <div className="flex items-start gap-2.5 animate-fade-in">
        <AgentAvatar />
        <div className="flex-1 max-w-[92%]">
          {message.content && (
            <div className="mb-2 rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2.5">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                <FormattedText text={message.content} />
              </p>
            </div>
          )}
          <ChatBidList
            allBids={allBids}
            initialFilter={message.listFilter || 'all'}
            filteredBidIds={message.filteredBidIds}
            onBidClick={onBidClick}
          />
        </div>
      </div>
    )
  }

  // Horizontal swipeable bid carousel (推送最新标讯 / 标讯管理)
  if (message.type === 'bid-carousel') {
    const ids = message.filteredBidIds || []
    const carouselBids = ids.length > 0
      ? ids.map(id => allBids.find(b => b.id === id)).filter(Boolean) as BidInfo[]
      : allBids
    return (
      <div className="flex items-start gap-2.5 animate-fade-in">
        <AgentAvatar />
        <div className="flex-1 max-w-[95%]">
          {message.content && (
            <div className="mb-2 rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2.5">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                <FormattedText text={message.content} />
              </p>
            </div>
          )}
          <BidCarousel
            bids={carouselBids}
            title={message.carouselTitle || '智能标讯'}
            subtitle={message.carouselSubtitle}
            onBidClick={onBidClick}
          />
        </div>
      </div>
    )
  }

  // Vertical batched bid cards (待我处理的标讯) — 5 per batch with 「下一批」
  if (message.type === 'bid-batch') {
    const ids = message.filteredBidIds || []
    const batchBids = ids.length > 0
      ? ids.map(id => allBids.find(b => b.id === id)).filter(Boolean) as BidInfo[]
      : allBids
    return (
      <div className="flex items-start gap-2.5 animate-fade-in">
        <AgentAvatar />
        <div className="flex-1 max-w-[95%]">
          {message.content && (
            <div className="mb-2 rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2.5">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                <FormattedText text={message.content} />
              </p>
            </div>
          )}
          <BidBatch bids={batchBids} onBidClick={onBidClick} />
        </div>
      </div>
    )
  }

  // Bid alert cards (unified with ChatBidList card UI)
  if (message.type === 'bid-alert') {
    const visibleAlertBids = pendingBids.slice(0, VISIBLE_LIMIT)

    return (
      <div className="flex items-start gap-2.5 animate-fade-in">
        <AgentAvatar />
        <div className="flex-1 flex flex-col gap-2 max-w-[85%]">
          {visibleAlertBids.map(bid => {
            const status = statusConfig[bid.status]
            const industryClass = industryColors[bid.industry] || 'bg-secondary text-muted-foreground'
            return (
              <button
                key={bid.id}
                onClick={() => onBidClick(bid.id)}
                data-track="从对话中查看标讯提醒"
                data-track-type="标讯浏览"
                data-track-detail={`${bid.projectName}|${bid.bidType}|高价值=${bid.highValueCustomer ? '是' : '否'}`}
                className="card-press w-full rounded-xl border bg-card text-left relative"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex items-start gap-2.5 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    {/* Row 1: status + bidType + industry + 高价值 */}
                    <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                      <Badge variant={status.variant} className="text-[9px] px-1 py-0 h-4 leading-none">
                        {status.label}
                      </Badge>
                      <span className="rounded px-1 py-0 text-[9px] font-medium h-4 leading-4 inline-flex items-center bg-primary/10 text-primary">
                        {bid.bidType}
                      </span>
                      <span className={cn('rounded px-1 py-0 text-[9px] font-medium h-4 leading-4 inline-flex items-center', industryClass)}>
                        {bid.industry}
                      </span>
                      {bid.highValueCustomer && (
                        <span className="rounded px-1 py-0 text-[9px] font-medium h-4 leading-4 inline-flex items-center gap-0.5 bg-[hsl(38_95%_94%)] text-[hsl(28_85%_45%)]">
                          <Star className="h-2 w-2 fill-current" />高价值客户
                        </span>
                      )}
                    </div>
                    {/* Row 2: project name */}
                    <p className="text-xs font-semibold text-foreground leading-snug line-clamp-1 mb-0.5">
                      {bid.projectName}
                    </p>
                    {/* Row 3: meta */}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5 shrink-0">
                        <MapPin className="h-2.5 w-2.5 shrink-0" />
                        {bid.region}
                      </span>
                      <span className="flex items-center gap-0.5 truncate">
                        <Clock className="h-2.5 w-2.5 shrink-0" />
                        {bid.startDate}至{bid.deadline}
                      </span>
                      <span className="flex items-center gap-0.5 ml-auto font-semibold text-foreground shrink-0">
                        <Banknote className="h-2.5 w-2.5 shrink-0" />
                        {bid.budgetAmount}万
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2.5" />
                </div>
              </button>
            )
          })}

        </div>
      </div>
    )
  }

  // Quick action buttons
  if (message.type === 'quick-actions' && message.actions) {
    return (
      <div className="flex items-start gap-2.5 animate-fade-in">
        <AgentAvatar />
        <div className="flex-1 max-w-[85%]">
          {message.content && (
            <div className="mb-2 rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2.5">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                <FormattedText text={message.content} />
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {message.actions.map(act => (
              <button
                key={act.action}
                onClick={() => onAction(act.action)}
                data-track={`点击快捷操作「${act.label}」`}
                data-track-type="对话交互"
                className="card-press rounded-full border border-primary/30 bg-accent px-3 py-1.5 text-xs font-medium text-primary transition-all active:bg-primary active:text-primary-foreground"
              >
                {act.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Regular messages
  if (isAgent) {
    return (
      <div className="flex items-start gap-2.5 animate-fade-in">
        <AgentAvatar />
        <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-secondary px-3.5 py-2.5">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
            <FormattedText text={message.content} />
          </p>
        </div>
      </div>
    )
  }

  // User message
  return (
    <div className="flex items-start justify-end gap-2.5 animate-fade-in">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5">
        <p className="text-sm text-primary-foreground leading-relaxed">
          {message.content}
        </p>
      </div>
    </div>
  )
}

// Simple bold markdown formatter
function FormattedText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
      )}
    </>
  )
}

// ==========================================
// Intent detection engine
// ==========================================
type IntentResult = {
  content: string
  delay?: number
  extras?: Partial<Message>
  intentName?: string
}

const REGIONS = ['江苏', '安徽', '天津', '川藏', '四川', '北京'] as const
const INDUSTRIES = ['教育', '医疗卫生', '医疗', '政府'] as const

function matchAny(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k))
}

function detectIntent(text: string, bids: BidInfo[]): IntentResult {
  const pendingBids = bids.filter(b => b.status === 'pending')

  // --- 0a. 推送最新N条标讯线索（预置问题触发）---
  if (matchAny(text, ['推送最新', '最新的标讯线索', '标讯线索信息']) || /最新的\s*\d+\s*条/.test(text)) {
    const m = text.match(/(\d+)\s*条/)
    const N = m ? Math.min(parseInt(m[1]), bids.length) : Math.min(10, bids.length)
    // 按 id 倒序近似作为“最新”，并优先待跟进的
    const sorted = [...bids].sort((a, b) => {
      const pa = a.status === 'pending' ? 0 : 1
      const pb = b.status === 'pending' ? 0 : 1
      if (pa !== pb) return pa - pb
      return b.id.localeCompare(a.id)
    })
    const latest = sorted.slice(0, N)
    return {
      intentName: 'push_latest_bids',
      content: `📣 已为你推送最新的 **${latest.length} 条**标讯线索，可左右滑动查看：`,
      delay: 600,
      extras: {
        type: 'bid-carousel',
        carouselTitle: '最新标讯线索',
        carouselSubtitle: `共 ${latest.length} 条，左右滑动查看`,
        filteredBidIds: latest.map(b => b.id),
      },
    }
  }

  // --- 0b. 标讯管理（快捷入口）— 卡片轮播全部标讯 ---
  if (matchAny(text, ['标讯管理'])) {
    return {
      intentName: 'bid_management',
      content: `🗂️ 已汇总你的全部标讯（${bids.length} 条），以卡片形式展示，左右滑动浏览：`,
      delay: 500,
      extras: {
        type: 'bid-carousel',
        carouselTitle: '智能标讯',
        carouselSubtitle: `共 ${bids.length} 条，左右滑动查看`,
        filteredBidIds: bids.map(b => b.id),
      },
    }
  }

  // --- 0c. 待我处理的标讯（数据卡片触发）— 卡片垂直平铺分批展开 ---
  if (matchAny(text, ['待我处理的标讯', '待处理的标讯', '待处理标讯', '我的标讯'])) {
    const myBids = pendingBids.length > 0 ? pendingBids : bids
    return {
      intentName: 'my_pending_bids',
      content: `您有 **${myBids.length} 条**待您处理的标讯：`,
      delay: 500,
      extras: {
        type: 'bid-batch',
        filteredBidIds: myBids.map(b => b.id),
      },
    }
  }

  // --- 0. 标讯洞察（快捷入口）---
  if (matchAny(text, ['标讯洞察', '洞察'])) {
    const regionMap: Record<string, number> = {}
    const industryMap: Record<string, number> = {}
    let totalBudget = 0
    for (const b of pendingBids) {
      regionMap[b.region] = (regionMap[b.region] || 0) + 1
      industryMap[b.industry] = (industryMap[b.industry] || 0) + 1
      totalBudget += parseFloat(b.budgetAmount) || 0
    }
    const regionSummary = Object.entries(regionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([r, c]) => `${r}(${c}条)`)
      .join('、') || '暂无'
    const industrySummary = Object.entries(industryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([i, c]) => `${i}(${c}条)`)
      .join('、') || '暂无'

    return {
      intentName: 'bid_insight',
      content: `🔍 **标讯洞察**\n\n📋 待跟进：**${pendingBids.length} 条**\n💰 总预算：**${totalBudget.toFixed(0)} 万元**\n🗺️ Top 区域：${regionSummary}\n🏢 Top 行业：${industrySummary}\n\n以下是全部标讯，点击条目可查看详情：`,
      delay: 600,
      extras: { type: 'bid-list', listFilter: 'all' },
    }
  }

  // --- 1. 问候 ---
  if (matchAny(text, ['你好', '您好', 'hello', 'hi', '嗨', '早上好', '下午好', '晚上好', '早'])) {
    return {
      intentName: 'greeting',
      content: `你好！👋 当前有 **${pendingBids.length} 条标讯**待跟进。需要我帮你快速查看吗？`,
      delay: 500,
      extras: {
        type: 'quick-actions',
        actions: [
          { label: '开始处理', action: 'view_latest' },
          { label: '查看全部', action: 'view_all' },
        ],
      },
    }
  }

  // --- 2. 感谢 ---
  if (matchAny(text, ['谢谢', '感谢', '辛苦', '太好了', '不错', '棒', 'thanks', 'thx'])) {
    return {
      intentName: 'thanks',
      content: '不客气！有任何需要随时告诉我 😊',
      delay: 400,
    }
  }

  // --- 3. 帮助/能力 ---
  if (matchAny(text, ['帮助', '能做什么', '功能', '怎么用', '你能', '你会', '你可以', '有什么功能'])) {
    return {
      intentName: 'help',
      content: '我可以帮你：\n\n📋 **查看标讯** — 浏览全部或筛选待跟进标讯\n📊 **统计概况** — 了解当前标讯的区域、行业、预算分布\n🔍 **按条件筛选** — 按区域、行业或预算范围查找\n\n试试输入"江苏的标讯"或"预算超过500万"',
      delay: 600,
      extras: {
        type: 'quick-actions',
        actions: [
          { label: '查看全部标讯', action: 'view_all' },
        ],
      },
    }
  }

  // --- 4. 统计/概况 ---
  if (matchAny(text, ['多少', '几条', '数量', '统计', '概况', '汇总', '总共', '一共'])) {
    const regionMap: Record<string, number> = {}
    const industryMap: Record<string, number> = {}
    let totalBudget = 0
    for (const b of pendingBids) {
      regionMap[b.region] = (regionMap[b.region] || 0) + 1
      industryMap[b.industry] = (industryMap[b.industry] || 0) + 1
      totalBudget += parseFloat(b.budgetAmount) || 0
    }
    const regionSummary = Object.entries(regionMap).map(([r, c]) => `${r}(${c}条)`).join('、')
    const industrySummary = Object.entries(industryMap).map(([i, c]) => `${i}(${c}条)`).join('、')

    return {
      intentName: 'statistics',
      content: `📊 当前标讯概况：\n\n📋 待跟进标讯：**${pendingBids.length} 条**\n💰 总预算规模：**${totalBudget.toFixed(0)}万元**\n\n🗺️ 区域分布：${regionSummary}\n🏢 行业分布：${industrySummary}`,
      delay: 700,
      extras: {
        type: 'quick-actions',
        actions: [
          { label: '查看全部', action: 'view_all' },
        ],
      },
    }
  }

  // --- 5. 按区域筛选 ---
  const matchedRegion = REGIONS.find(r => text.includes(r))
  if (matchedRegion) {
    const regionKey = matchedRegion === '四川' ? '川藏' : matchedRegion
    const regionBids = pendingBids.filter(b => b.region === regionKey || b.province.includes(matchedRegion))
    if (regionBids.length > 0) {
      return {
        intentName: 'filter_region',
        content: `📍 ${matchedRegion}区域共有 **${regionBids.length} 条**待跟进标讯：`,
        delay: 600,
        extras: { type: 'bid-list', listFilter: 'all', filteredBidIds: regionBids.map(b => b.id) },
      }
    }
    return {
      intentName: 'filter_region',
      content: `📍 ${matchedRegion}区域暂无待跟进标讯。要看看其他区域吗？`,
      delay: 500,
      extras: {
        type: 'quick-actions',
        actions: [
          { label: '查看全部', action: 'view_all' },
        ],
      },
    }
  }

  // --- 6. 按行业筛选 ---
  const matchedIndustry = INDUSTRIES.find(i => text.includes(i))
  if (matchedIndustry) {
    const industryKey = matchedIndustry === '医疗' ? '医疗卫生' : matchedIndustry
    const industryBids = pendingBids.filter(b => b.industry === industryKey)
    if (industryBids.length > 0) {
      return {
        intentName: 'filter_industry',
        content: `🏢 ${industryKey}行业共有 **${industryBids.length} 条**待跟进标讯：`,
        delay: 600,
        extras: { type: 'bid-list', listFilter: 'all', filteredBidIds: industryBids.map(b => b.id) },
      }
    }
    return {
      intentName: 'filter_industry',
      content: `🏢 ${industryKey}行业暂无待跟进标讯。`,
      delay: 500,
    }
  }

  // --- 7. 预算相关 ---
  if (matchAny(text, ['预算', '金额', '大项目', '高预算', '多少钱'])) {
    const budgetMatch = text.match(/(\d+)\s*万/)
    const threshold = budgetMatch ? parseInt(budgetMatch[1]) : 500
    const highBudget = pendingBids
      .filter(b => (parseFloat(b.budgetAmount) || 0) >= threshold)
      .sort((a, b) => (parseFloat(b.budgetAmount) || 0) - (parseFloat(a.budgetAmount) || 0))

    if (highBudget.length > 0) {
      const topItems = highBudget.slice(0, 5).map(b =>
        `• **${b.projectName}** — ¥${b.budgetAmount}万（${b.region}·${b.industry}）`
      ).join('\n')
      return {
        intentName: 'filter_budget',
        content: `💰 预算 ≥ ${threshold}万的标讯共 **${highBudget.length} 条**，Top项目：\n\n${topItems}`,
        delay: 700,
        extras: {
          type: 'quick-actions',
          actions: [
            { label: '查看全部标讯', action: 'view_all' },
            { label: '查看最新标讯', action: 'view_latest' },
          ],
        },
      }
    }
    return {
      intentName: 'filter_budget',
      content: `💰 没有找到预算 ≥ ${threshold}万的标讯。当前标讯预算范围较广，建议查看全部列表。`,
      delay: 500,
      extras: {
        type: 'quick-actions',
        actions: [{ label: '查看全部', action: 'view_all' }],
      },
    }
  }

  // --- 8. 查看全部/列表 ---
  if (matchAny(text, ['全部', '列表', '所有', '看看', '都有啥', '有哪些', '都有什么'])) {
    return {
      intentName: 'view_all',
      content: '以下是全部标讯，你可以切换筛选条件：',
      delay: 600,
      extras: { type: 'bid-list', listFilter: 'all' },
    }
  }

  // --- 9. 查看待处理/新标讯 ---
  if (matchAny(text, ['标讯', '新的', '待处理', '待办', '未处理', '没处理', '处理'])) {
    return {
      intentName: 'view_pending',
      content: `当前有 **${pendingBids.length} 条**标讯待跟进，需要我帮你逐条处理吗？`,
      delay: 700,
      extras: {
        type: 'quick-actions',
        actions: [
          { label: '开始处理', action: 'view_latest' },
          { label: '查看全部', action: 'view_all' },
        ],
      },
    }
  }

  // --- 10. 商机/关联 ---
  if (matchAny(text, ['商机', '关联', '匹配'])) {
    return {
      intentName: 'view_opportunities',
      content: '你可以通过标讯详情页中的「关联商机」按钮来关联已有商机。',
      delay: 700,
    }
  }

  // --- 11. 关键词搜索（服务器/AI/GPU等） ---
  const techKeywords = ['服务器', 'ai', 'gpu', '交换机', '存储', '网络', '信息化', '人工智能', '一体机']
  const matchedKeyword = techKeywords.find(k => text.includes(k))
  if (matchedKeyword) {
    const kw = matchedKeyword.toUpperCase() === 'AI' ? 'AI' : matchedKeyword
    const matched = pendingBids.filter(b =>
      b.keywords.toLowerCase().includes(matchedKeyword) ||
      b.projectName.toLowerCase().includes(matchedKeyword) ||
      b.procurementSummary.toLowerCase().includes(matchedKeyword)
    )
    if (matched.length > 0) {
      return {
        intentName: 'keyword_search',
        content: `🔍 包含「${kw}」关键词的标讯共 **${matched.length} 条**：`,
        delay: 600,
        extras: { type: 'bid-list', listFilter: 'all' },
      }
    }
    return {
      intentName: 'keyword_search',
      content: `🔍 暂未找到与「${kw}」相关的待跟进标讯。`,
      delay: 500,
    }
  }

  // --- fallback ---
  return {
    intentName: 'fallback',
    content: '收到！我目前可以帮你：\n\n• 查看/处理标讯（如"看看待处理的标讯"）\n• 按区域筛选（如"北京的标讯"）\n• 按预算筛选（如"预算超过500万"）\n• 查看统计概况（如"一共多少条"）\n\n请告诉我你需要什么帮助？',
    delay: 600,
    extras: {
      type: 'quick-actions',
      actions: [
        { label: '查看新标讯', action: 'view_latest' },
        { label: '查看全部', action: 'view_all' },
      ],
    },
  }
}
