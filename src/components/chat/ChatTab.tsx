import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Sparkles, Link2, MapPin, ChevronRight, Clock, Banknote } from 'lucide-react'
import { useAppState } from '@/store/app-store'
import { type BidInfo, industryColors } from '@/data/mock-data'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Message {
  id: number
  role: 'agent' | 'user'
  content: string
  type?: 'text' | 'bid-alert' | 'quick-actions' | 'bid-list'
  bidId?: string
  actions?: { label: string; action: string }[]
  listFilter?: 'all' | 'pending' | 'with_opps'
}

export function ChatTab() {
  const navigate = useNavigate()
  const { bids, unreadCount } = useAppState()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)

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

  // Initial greeting with bid alerts
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const pendingBids = bids.filter(b => b.status === 'pending')
    const withOpps = pendingBids.filter(b => b.relatedOpportunityCount > 0)

    setTimeout(() => {
      addMessage({
        role: 'agent',
        content: '你好！我是标讯助手 👋',
        type: 'text',
      })
    }, 300)

    setTimeout(() => {
      if (pendingBids.length > 0) {
        const oppHint = withOpps.length > 0
          ? `，其中 ${withOpps.length} 条可能关联已有商机`
          : ''
        addMessage({
          role: 'agent',
          content: `你有 **${pendingBids.length} 条新标讯**待处理${oppHint}。我来帮你快速处理？`,
          type: 'text',
        })
      } else {
        addMessage({
          role: 'agent',
          content: '当前没有新标讯需要处理，如果有新的标讯到达我会第一时间通知你。',
          type: 'text',
        })
      }
    }, 900)

    // Show new bid alerts
    if (pendingBids.length > 0) {
      setTimeout(() => {
        addMessage({
          role: 'agent',
          content: '',
          type: 'bid-alert',
        })
      }, 1500)

      setTimeout(() => {
        addMessage({
          role: 'agent',
          content: '你可以点击查看详情，或者告诉我你想如何处理。',
          type: 'quick-actions',
          actions: [
            { label: '查看最新标讯', action: 'view_latest' },
            { label: '可能关联商机的标讯', action: 'view_with_opps' },
            { label: '查看全部标讯', action: 'view_all' },
          ],
        })
      }, 2100)
    }
  }, [bids, addMessage])

  const handleAction = (action: string) => {
    const pendingBids = bids.filter(b => b.status === 'pending')

    switch (action) {
      case 'view_latest':
        addMessage({ role: 'user', content: '查看最新标讯' })
        if (pendingBids[0]) {
          const oppHint = pendingBids[0].relatedOpportunityCount > 0
            ? `\n🔗 可能关联 ${pendingBids[0].relatedOpportunityCount} 条商机`
            : ''
          simulateAgentReply(
            `最新一条标讯：\n\n📋 **${pendingBids[0].projectName}**\n🏢 ${pendingBids[0].procurementUnit || '未公示'}\n💰 预算 ${pendingBids[0].budgetAmount}万 · ${pendingBids[0].industry}\n📍 ${pendingBids[0].region} · ${pendingBids[0].city}${oppHint}\n\n点击下方按钮查看完整详情并处理。`,
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

      case 'view_with_opps':
        addMessage({ role: 'user', content: '查看可能关联商机的标讯' })
        simulateAgentReply(
          '已为你筛选可能关联商机的标讯：',
          500,
          { type: 'bid-list', listFilter: 'with_opps' }
        )
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
          const oppHint = unprocessed[0].relatedOpportunityCount > 0
            ? `\n🔗 可能关联 ${unprocessed[0].relatedOpportunityCount} 条商机`
            : ''
          simulateAgentReply(
            `下一条标讯：\n\n📋 **${unprocessed[0].projectName}**\n🏢 ${unprocessed[0].procurementUnit || '未公示'}\n💰 预算 ${unprocessed[0].budgetAmount}万 · ${unprocessed[0].industry}\n📍 ${unprocessed[0].region} · ${unprocessed[0].city}${oppHint}`,
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

  const handleSend = () => {
    const text = inputValue.trim()
    if (!text) return
    setInputValue('')
    addMessage({ role: 'user', content: text, type: 'text' })

    const t = text.toLowerCase()
    const intent = detectIntent(t, bids, unreadCount)
    simulateAgentReply(intent.content, intent.delay ?? 600, intent.extras)
  }

  const pendingBids = bids.filter(b => b.status === 'pending')

  return (
    <div className="flex h-full flex-col">
      {/* Chat Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4">
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
              <div className="rounded-2xl rounded-bl-sm bg-secondary px-4 py-2.5">
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

      {/* Input Bar */}
      <div className="border-t bg-card px-3 py-2.5 safe-bottom">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
            placeholder="输入消息，或直接点击快捷操作..."
            className="flex-1 rounded-full border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200",
              inputValue.trim()
                ? "bg-primary text-primary-foreground active:scale-95"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function AgentAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
      <Sparkles className="h-4 w-4 text-primary-foreground" />
    </div>
  )
}

// ==========================================
// Inline bid list component for chat
// ==========================================
const statusConfig: Record<string, { label: string; variant: 'new' | 'done' | 'destructive' }> = {
  pending: { label: '待处理', variant: 'new' },
  linked: { label: '已关联商机', variant: 'done' },
  no_opportunity: { label: '无商机反馈', variant: 'destructive' },
  new_opportunity: { label: '已新建商机', variant: 'done' },
}

type ListFilter = 'all' | 'pending' | 'feedback' | 'with_opps'

function ChatBidList({ allBids, initialFilter, onBidClick }: {
  allBids: BidInfo[]
  initialFilter: 'all' | 'pending' | 'with_opps'
  onBidClick: (id: string) => void
}) {
  const mapInitial = (f: string): ListFilter => {
    if (f === 'with_opps') return 'with_opps'
    if (f === 'pending') return 'pending'
    return 'all'
  }
  const [activeFilter, setActiveFilter] = useState<ListFilter>(mapInitial(initialFilter))

  const filters: { key: ListFilter; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: allBids.length },
    { key: 'pending', label: '待处理', count: allBids.filter(b => b.status === 'pending').length },
    { key: 'feedback', label: '已反馈', count: allBids.filter(b => ['linked', 'no_opportunity', 'new_opportunity'].includes(b.status)).length },
    { key: 'with_opps', label: '有关联', count: allBids.filter(b => b.status === 'pending' && b.relatedOpportunityCount > 0).length },
  ]

  const filtered = allBids.filter(b => {
    if (activeFilter === 'pending') return b.status === 'pending'
    if (activeFilter === 'feedback') return ['linked', 'no_opportunity', 'new_opportunity'].includes(b.status)
    if (activeFilter === 'with_opps') return b.status === 'pending' && b.relatedOpportunityCount > 0
    return true
  })

  return (
    <div className="w-full rounded-xl border bg-card overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Filter chips */}
      <div className="flex gap-1.5 px-3 pt-3 pb-2 overflow-x-auto scrollbar-hide">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
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

      {/* Bid rows */}
      <div className="max-h-[320px] overflow-y-auto scrollbar-hide divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            暂无标讯
          </div>
        ) : (
          filtered.map(bid => {
            const status = statusConfig[bid.status]
            const industryClass = industryColors[bid.industry] || 'bg-secondary text-muted-foreground'
            return (
              <button
                key={bid.id}
                onClick={() => onBidClick(bid.id)}
                className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left active:bg-accent transition-colors duration-150 relative"
              >
                {/* Unread dot */}
                {!bid.isRead && (
                  <span className="absolute top-3 left-1 h-1.5 w-1.5 rounded-full bg-primary" />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Row 1: status + industry + related opp */}
                  <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                    <Badge variant={status.variant} className="text-[9px] px-1 py-0 h-4 leading-none">
                      {status.label}
                    </Badge>
                    <span className={cn('rounded px-1 py-0 text-[9px] font-medium h-4 leading-4 inline-flex items-center', industryClass)}>
                      {bid.industry}
                    </span>
                    {bid.status === 'pending' && bid.relatedOpportunityCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-primary ml-auto">
                        <Link2 className="h-2.5 w-2.5" />
                        关联{bid.relatedOpportunityCount}条
                      </span>
                    )}
                  </div>
                  {/* Row 2: project name */}
                  <p className="text-xs font-semibold text-foreground leading-snug line-clamp-1 mb-0.5">
                    {bid.projectName}
                  </p>
                  {/* Row 3: meta */}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      {bid.region}·{bid.city}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5 shrink-0" />
                      {bid.deadline}
                    </span>
                    <span className="flex items-center gap-0.5 ml-auto font-semibold text-foreground">
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
            onBidClick={onBidClick}
          />
        </div>
      </div>
    )
  }

  // Bid alert cards (compact, for pending bids only)
  if (message.type === 'bid-alert') {
    return (
      <div className="flex items-start gap-2.5 animate-fade-in">
        <AgentAvatar />
        <div className="flex-1 flex flex-col gap-2 max-w-[85%]">
          {pendingBids.slice(0, 3).map(bid => (
            <button
              key={bid.id}
              onClick={() => onBidClick(bid.id)}
              className="card-press w-full rounded-xl border bg-card p-3 text-left"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="rounded bg-info-muted px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
                  新标讯
                </span>
                {bid.relatedOpportunityCount > 0 && (
                  <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    可能关联 {bid.relatedOpportunityCount} 条商机
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-foreground leading-snug line-clamp-1">
                {bid.projectName}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                {bid.procurementUnit || bid.industry} · ¥{bid.budgetAmount}万
              </p>
            </button>
          ))}
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
}

const REGIONS = ['江苏', '安徽', '天津', '川藏', '四川', '北京'] as const
const INDUSTRIES = ['教育', '医疗卫生', '医疗', '政府'] as const

function matchAny(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k))
}

function detectIntent(text: string, bids: BidInfo[], unreadCount: number): IntentResult {
  const pendingBids = bids.filter(b => b.status === 'pending')
  const withOpps = pendingBids.filter(b => b.relatedOpportunityCount > 0)

  // --- 1. 问候 ---
  if (matchAny(text, ['你好', '您好', 'hello', 'hi', '嗨', '早上好', '下午好', '晚上好', '早'])) {
    return {
      content: `你好！👋 当前有 **${pendingBids.length} 条标讯**待处理，其中 ${withOpps.length} 条可能关联商机。需要我帮你快速查看吗？`,
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
      content: '不客气！有任何需要随时告诉我 😊',
      delay: 400,
    }
  }

  // --- 3. 帮助/能力 ---
  if (matchAny(text, ['帮助', '能做什么', '功能', '怎么用', '你能', '你会', '你可以', '有什么功能'])) {
    return {
      content: '我可以帮你：\n\n📋 **查看标讯** — 浏览全部或筛选待处理标讯\n🔗 **关联商机** — 查看可能关联商机的标讯\n📊 **统计概况** — 了解当前标讯的区域、行业、预算分布\n🔍 **按条件筛选** — 按区域、行业或预算范围查找\n\n试试输入"江苏的标讯"或"预算超过500万"',
      delay: 600,
      extras: {
        type: 'quick-actions',
        actions: [
          { label: '查看全部标讯', action: 'view_all' },
          { label: '可能关联商机的标讯', action: 'view_with_opps' },
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
      content: `📊 当前标讯概况：\n\n📋 待处理标讯：**${pendingBids.length} 条**\n🔗 可能关联商机：**${withOpps.length} 条**\n💰 总预算规模：**${totalBudget.toFixed(0)}万元**\n\n🗺️ 区域分布：${regionSummary}\n🏢 行业分布：${industrySummary}`,
      delay: 700,
      extras: {
        type: 'quick-actions',
        actions: [
          { label: '查看全部', action: 'view_all' },
          { label: '可能关联商机的', action: 'view_with_opps' },
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
      const oppCount = regionBids.filter(b => b.relatedOpportunityCount > 0).length
      const oppHint = oppCount > 0 ? `，其中 ${oppCount} 条可能关联商机` : ''
      return {
        content: `📍 ${matchedRegion}区域共有 **${regionBids.length} 条**待处理标讯${oppHint}：`,
        delay: 600,
        extras: { type: 'bid-list', listFilter: 'all' },
      }
    }
    return {
      content: `📍 ${matchedRegion}区域暂无待处理标讯。要看看其他区域吗？`,
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
        content: `🏢 ${industryKey}行业共有 **${industryBids.length} 条**待处理标讯：`,
        delay: 600,
        extras: { type: 'bid-list', listFilter: 'all' },
      }
    }
    return {
      content: `🏢 ${industryKey}行业暂无待处理标讯。`,
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
      content: '以下是全部标讯，你可以切换筛选条件：',
      delay: 600,
      extras: { type: 'bid-list', listFilter: 'all' },
    }
  }

  // --- 9. 查看待处理/新标讯 ---
  if (matchAny(text, ['标讯', '新的', '待处理', '待办', '未处理', '没处理', '处理'])) {
    return {
      content: `当前有 **${unreadCount} 条**标讯待处理，需要我帮你逐条处理吗？`,
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
      content: `已为你筛选可能关联商机的标讯（共 ${withOpps.length} 条）：`,
      delay: 700,
      extras: { type: 'bid-list', listFilter: 'with_opps' },
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
        content: `🔍 包含「${kw}」关键词的标讯共 **${matched.length} 条**：`,
        delay: 600,
        extras: { type: 'bid-list', listFilter: 'all' },
      }
    }
    return {
      content: `🔍 暂未找到与「${kw}」相关的待处理标讯。`,
      delay: 500,
    }
  }

  // --- fallback ---
  return {
    content: '收到！我目前可以帮你：\n\n• 查看/处理标讯（如"看看待处理的标讯"）\n• 按区域筛选（如"北京的标讯"）\n• 按预算筛选（如"预算超过500万"）\n• 查看统计概况（如"一共多少条"）\n• 查看关联商机（如"有商机的标讯"）\n\n请告诉我你需要什么帮助？',
    delay: 600,
    extras: {
      type: 'quick-actions',
      actions: [
        { label: '查看新标讯', action: 'view_latest' },
        { label: '查看全部', action: 'view_all' },
        { label: '可能关联商机的', action: 'view_with_opps' },
      ],
    },
  }
}
