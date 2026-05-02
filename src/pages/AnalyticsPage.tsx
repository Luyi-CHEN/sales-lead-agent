import { useState, useEffect, useMemo } from 'react'
import { useAnalytics, type ChatLogEntry, type ClickPathEntry } from '@/store/analytics-store'
import {
  MessageSquare, MousePointerClick, Download, Trash2,
  BarChart3, Filter,
  TrendingUp, Hash, Zap, Search,
} from 'lucide-react'

type TabKey = 'chat' | 'clicks'
type SortKey = 'time' | 'intent' | 'session'

export function AnalyticsPage() {
  const {
    getChatLogs, getClickPaths,
    clearChatLogs, clearClickPaths,
    exportChatLogsCSV, exportClickPathsCSV,
    fetchServerData,
  } = useAnalytics()

  const [activeTab, setActiveTab] = useState<TabKey>('chat')
  const [chatLogs, setChatLogs] = useState<ChatLogEntry[]>([])
  const [clickPaths, setClickPaths] = useState<ClickPathEntry[]>([])
  const [chatSearch, setChatSearch] = useState('')
  const [clickSearch, setClickSearch] = useState('')
  const [chatSort, setChatSort] = useState<SortKey>('time')
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())

  // Refresh data from server every 5s
  useEffect(() => {
    const refresh = async () => {
      await fetchServerData()
      setChatLogs([...getChatLogs()])
      setClickPaths([...getClickPaths()])
    }
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [getChatLogs, getClickPaths, fetchServerData])

  // === Chat Analytics ===
  const filteredChatLogs = useMemo(() => {
    let logs = [...chatLogs]
    if (chatSearch) {
      const q = chatSearch.toLowerCase()
      logs = logs.filter(l =>
        l.userInput.toLowerCase().includes(q) ||
        l.systemResponse.toLowerCase().includes(q) ||
        l.detectedIntent.toLowerCase().includes(q)
      )
    }
    if (chatSort === 'time') logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    if (chatSort === 'intent') logs.sort((a, b) => a.detectedIntent.localeCompare(b.detectedIntent))
    if (chatSort === 'session') logs.sort((a, b) => a.sessionId.localeCompare(b.sessionId) || new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    return logs
  }, [chatLogs, chatSearch, chatSort])

  const intentStats = useMemo(() => {
    const map: Record<string, number> = {}
    for (const log of chatLogs) {
      map[log.detectedIntent] = (map[log.detectedIntent] || 0) + 1
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([intent, count]) => ({ intent, count, pct: chatLogs.length ? Math.round(count / chatLogs.length * 100) : 0 }))
  }, [chatLogs])

  // === Click Analytics ===
  const filteredClickPaths = useMemo(() => {
    let paths = [...clickPaths]
    if (clickSearch) {
      const q = clickSearch.toLowerCase()
      paths = paths.filter(p =>
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.page.toLowerCase().includes(q)
      )
    }
    return paths.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [clickPaths, clickSearch])

  // Feature usage ranking (by description)
  const featureRanking = useMemo(() => {
    const map: Record<string, { count: number; category: string }> = {}
    for (const p of clickPaths) {
      if (!map[p.description]) map[p.description] = { count: 0, category: p.category }
      map[p.description].count++
    }
    return Object.entries(map)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 12)
      .map(([desc, { count, category }]) => ({ desc, count, category, pct: clickPaths.length ? Math.round(count / clickPaths.length * 100) : 0 }))
  }, [clickPaths])

  // Category distribution
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of clickPaths) {
      map[p.category] = (map[p.category] || 0) + 1
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({ cat, count, pct: clickPaths.length ? Math.round(count / clickPaths.length * 100) : 0 }))
  }, [clickPaths])

  // Page distribution
  const pageStats = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of clickPaths) {
      map[p.page] = (map[p.page] || 0) + 1
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([page, count]) => ({ page, count, pct: clickPaths.length ? Math.round(count / clickPaths.length * 100) : 0 }))
  }, [clickPaths])

  const sessionIds = useMemo(() => {
    const set = new Set<string>()
    for (const l of chatLogs) set.add(l.sessionId)
    for (const p of clickPaths) set.add(p.sessionId)
    return set.size
  }, [chatLogs, clickPaths])

  const handleExport = (type: 'chat' | 'clicks') => {
    const csv = type === 'chat' ? exportChatLogsCSV() : exportClickPathsCSV()
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-analytics-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = (type: 'chat' | 'clicks') => {
    if (!confirm(`确认清空所有${type === 'chat' ? '对话' : '点击'}记录吗？此操作不可恢复。`)) return
    if (type === 'chat') { clearChatLogs(); setChatLogs([]) }
    else { clearClickPaths(); setClickPaths([]) }
  }

  const toggleSession = (sid: string) => {
    setExpandedSessions(prev => {
      const next = new Set(prev)
      next.has(sid) ? next.delete(sid) : next.add(sid)
      return next
    })
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '14px' }}>
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* Header */}
        <header style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: '#fff',
          padding: '24px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                  Analytics Dashboard
                </h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, margin: 0 }}>
                  用户行为分析 · 意图洞察 · 操作路径追踪
                </p>
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                <StatBadge icon={<MessageSquare size={14} />} label="对话记录" value={chatLogs.length} />
                <StatBadge icon={<MousePointerClick size={14} />} label="点击事件" value={clickPaths.length} />
                <StatBadge icon={<Hash size={14} />} label="独立会话" value={sessionIds} />
              </div>
            </div>
          </div>
        </header>

        {/* Tab Bar */}
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e2e8f0', marginTop: 0 }}>
            <TabButton
              active={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
              icon={<MessageSquare size={15} />}
              label="对话意图分析"
              count={chatLogs.length}
            />
            <TabButton
              active={activeTab === 'clicks'}
              onClick={() => setActiveTab('clicks')}
              icon={<MousePointerClick size={15} />}
              label="点击路径分析"
              count={clickPaths.length}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 32px' }}>
          {activeTab === 'chat' ? (
            <ChatAnalyticsPanel
              logs={filteredChatLogs}
              intentStats={intentStats}
              chatSearch={chatSearch}
              setChatSearch={setChatSearch}
              chatSort={chatSort}
              setChatSort={setChatSort}
              expandedSessions={expandedSessions}
              toggleSession={toggleSession}
              formatTime={formatTime}
              onExport={() => handleExport('chat')}
              onClear={() => handleClear('chat')}
            />
          ) : (
            <ClickAnalyticsPanel
              paths={filteredClickPaths}
              featureRanking={featureRanking}
              categoryStats={categoryStats}
              pageStats={pageStats}
              clickSearch={clickSearch}
              setClickSearch={setClickSearch}
              formatTime={formatTime}
              onExport={() => handleExport('clicks')}
              onClear={() => handleClear('clicks')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ===== Sub Components =====

function StatBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px',
    }}>
      <span style={{ opacity: 0.7 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, opacity: 0.6 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{value.toLocaleString()}</div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label, count }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '14px 20px',
        fontSize: 14, fontWeight: active ? 600 : 500,
        color: active ? '#2563eb' : '#64748b',
        background: 'transparent', border: 'none', cursor: 'pointer',
        borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
        marginBottom: -2,
        transition: 'all 0.15s ease',
      }}
    >
      {icon}
      {label}
      <span style={{
        fontSize: 11, fontWeight: 600,
        background: active ? '#dbeafe' : '#f1f5f9',
        color: active ? '#2563eb' : '#94a3b8',
        borderRadius: 10, padding: '2px 8px',
      }}>
        {count}
      </span>
    </button>
  )
}

// ===== Chat Analytics Panel =====

function ChatAnalyticsPanel({ logs, intentStats, chatSearch, setChatSearch, chatSort, setChatSort, expandedSessions, toggleSession, formatTime, onExport, onClear }: {
  logs: ChatLogEntry[]
  intentStats: { intent: string; count: number; pct: number }[]
  chatSearch: string; setChatSearch: (v: string) => void
  chatSort: SortKey; setChatSort: (v: SortKey) => void
  expandedSessions: Set<string>; toggleSession: (sid: string) => void
  formatTime: (iso: string) => string
  onExport: () => void; onClear: () => void
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
      {/* Left: Log table */}
      <div>
        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16, gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px',
              background: '#fff', minWidth: 260,
            }}>
              <Search size={14} style={{ color: '#94a3b8' }} />
              <input
                type="text"
                value={chatSearch}
                onChange={e => setChatSearch(e.target.value)}
                placeholder="搜索用户输入、系统回复或意图..."
                style={{
                  border: 'none', outline: 'none', fontSize: 13, flex: 1,
                  background: 'transparent', color: '#1e293b',
                }}
              />
            </div>
            <select
              value={chatSort}
              onChange={e => setChatSort(e.target.value as SortKey)}
              style={{
                border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 10px',
                fontSize: 13, background: '#fff', color: '#475569', cursor: 'pointer',
              }}
            >
              <option value="time">按时间</option>
              <option value="intent">按意图</option>
              <option value="session">按会话</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <ActionButton icon={<Download size={14} />} label="导出 CSV" onClick={onExport} />
            <ActionButton icon={<Trash2 size={14} />} label="清空" onClick={onClear} danger />
          </div>
        </div>

        {/* Table */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '140px 1fr 1fr 120px 90px',
            padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            borderBottom: '1px solid #f1f5f9', background: '#fafbfc',
          }}>
            <span>时间</span>
            <span>用户输入</span>
            <span>系统回复</span>
            <span>识别意图</span>
            <span>回复类型</span>
          </div>

          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {logs.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                暂无对话记录
              </div>
            ) : (
              logs.map(log => (
                <div
                  key={log.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '140px 1fr 1fr 120px 90px',
                    padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f8fafc',
                    alignItems: 'start', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <span style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}>
                    {formatTime(log.timestamp)}
                  </span>
                  <span style={{ color: '#1e293b', fontWeight: 500, paddingRight: 12, lineHeight: 1.5 }}>
                    {log.userInput}
                  </span>
                  <span style={{
                    color: '#475569', paddingRight: 12, lineHeight: 1.5,
                    maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {log.systemResponse.slice(0, 120)}{log.systemResponse.length > 120 ? '...' : ''}
                  </span>
                  <span>
                    <IntentBadge intent={log.detectedIntent} />
                  </span>
                  <span style={{
                    fontSize: 11, color: '#64748b',
                    background: '#f1f5f9', borderRadius: 4,
                    padding: '2px 6px', display: 'inline-block',
                  }}>
                    {log.responseType}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right: Intent stats */}
      <div>
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={16} style={{ color: '#2563eb' }} />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', margin: 0 }}>意图频率分布</h3>
          </div>

          {intentStats.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 24 }}>暂无数据</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {intentStats.map(({ intent, count, pct }) => (
                <div key={intent}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ fontWeight: 500, color: '#334155' }}>{intentNameMap[intent] || intent}</span>
                    <span style={{ color: '#94a3b8' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: intentColorMap[intent] || '#94a3b8',
                      width: `${Math.max(pct, 2)}%`,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick insights */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: 20, marginTop: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Zap size={16} style={{ color: '#f59e0b' }} />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', margin: 0 }}>快速洞察</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#475569' }}>
            <InsightRow
              label="最高频意图"
              value={intentStats[0] ? `${intentNameMap[intentStats[0].intent] || intentStats[0].intent} (${intentStats[0].pct}%)` : '-'}
            />
            <InsightRow
              label="Fallback 占比"
              value={(() => {
                const fb = intentStats.find(i => i.intent === 'fallback')
                return fb ? `${fb.pct}% (${fb.count}次)` : '0%'
              })()}
              warn={(() => {
                const fb = intentStats.find(i => i.intent === 'fallback')
                return fb ? fb.pct > 30 : false
              })()}
            />
            <InsightRow
              label="意图覆盖率"
              value={(() => {
                const total = logs.length || 1
                const covered = logs.filter(l => l.detectedIntent !== 'fallback' && l.detectedIntent !== 'unknown').length
                return `${Math.round(covered / total * 100)}%`
              })()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== Click Analytics Panel (Business-Friendly) =====

const categoryColorMap: Record<string, string> = {
  '导航': '#8b5cf6',
  '标讯浏览': '#2563eb',
  '商机处理': '#10b981',
  '筛选': '#06b6d4',
  '对话交互': '#f59e0b',
  '标讯操作': '#ec4899',
  '搜索': '#6366f1',
  '其他': '#94a3b8',
}

const categoryIconMap: Record<string, string> = {
  '导航': '🧭',
  '标讯浏览': '📋',
  '商机处理': '💼',
  '筛选': '🔍',
  '对话交互': '💬',
  '标讯操作': '⚡',
  '搜索': '🔎',
  '其他': '📌',
}

function CategoryBadge({ category }: { category: string }) {
  const color = categoryColorMap[category] || '#94a3b8'
  const icon = categoryIconMap[category] || '📌'
  return (
    <span style={{
      fontSize: 11, fontWeight: 600,
      background: color + '15',
      color: color,
      borderRadius: 6, padding: '3px 10px',
      display: 'inline-flex', alignItems: 'center', gap: 4,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      {category}
    </span>
  )
}

function ClickAnalyticsPanel({ paths, featureRanking, categoryStats, pageStats, clickSearch, setClickSearch, formatTime, onExport, onClear }: {
  paths: ClickPathEntry[]
  featureRanking: { desc: string; count: number; category: string; pct: number }[]
  categoryStats: { cat: string; count: number; pct: number }[]
  pageStats: { page: string; count: number; pct: number }[]
  clickSearch: string; setClickSearch: (v: string) => void
  formatTime: (iso: string) => string
  onExport: () => void; onClear: () => void
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
      {/* Left: User action timeline */}
      <div>
        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16, gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px',
            background: '#fff', minWidth: 280,
          }}>
            <Search size={14} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              value={clickSearch}
              onChange={e => setClickSearch(e.target.value)}
              placeholder="搜索用户操作、操作类别或页面..."
              style={{
                border: 'none', outline: 'none', fontSize: 13, flex: 1,
                background: 'transparent', color: '#1e293b',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <ActionButton icon={<Download size={14} />} label="导出 CSV" onClick={onExport} />
            <ActionButton icon={<Trash2 size={14} />} label="清空" onClick={onClear} danger />
          </div>
        </div>

        {/* Timeline table */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '130px 1fr 110px 120px',
            padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#94a3b8',
            letterSpacing: '0.05em',
            borderBottom: '1px solid #f1f5f9', background: '#fafbfc',
          }}>
            <span>时间</span>
            <span>用户操作</span>
            <span>操作类别</span>
            <span>所在页面</span>
          </div>

          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {paths.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                暂无操作记录，在手机端操作后数据将自动同步到这里
              </div>
            ) : (
              paths.map(p => (
                <div
                  key={p.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '130px 1fr 110px 120px',
                    padding: '10px 16px', fontSize: 13, borderBottom: '1px solid #f8fafc',
                    alignItems: 'center', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <span style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}>
                    {formatTime(p.timestamp)}
                  </span>
                  <div>
                    <div style={{ color: '#1e293b', fontWeight: 500, lineHeight: 1.4 }}>
                      {p.description}
                    </div>
                    {p.detail && (
                      <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2, lineHeight: 1.3 }}>
                        {p.detail.length > 40 ? p.detail.slice(0, 40) + '...' : p.detail}
                      </div>
                    )}
                  </div>
                  <span>
                    <CategoryBadge category={p.category} />
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {p.page}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right: Stats sidebar */}
      <div>
        {/* Feature usage ranking */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart3 size={16} style={{ color: '#2563eb' }} />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', margin: 0 }}>热门功能排行</h3>
          </div>
          {featureRanking.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 24 }}>暂无数据</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {featureRanking.map(({ desc, count, category }, i) => (
                <div key={desc} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: i < 3 ? '#2563eb' : '#e2e8f0',
                    color: i < 3 ? '#fff' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 13, flexShrink: 0, opacity: 0.7 }}>
                    {categoryIconMap[category] || '📌'}
                  </span>
                  <span style={{ flex: 1, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {desc}
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: 11, flexShrink: 0 }}>{count}次</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category distribution */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: 20, marginTop: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Filter size={16} style={{ color: '#8b5cf6' }} />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', margin: 0 }}>操作类别分布</h3>
          </div>
          {categoryStats.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 24 }}>暂无数据</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {categoryStats.map(({ cat, count, pct }) => {
                const color = categoryColorMap[cat] || '#94a3b8'
                const icon = categoryIconMap[cat] || '📌'
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                      <span style={{ fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{icon}</span> {cat}
                      </span>
                      <span style={{ color: '#94a3b8' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        background: color,
                        width: `${Math.max(pct, 2)}%`,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Page activity */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: 20, marginTop: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={16} style={{ color: '#10b981' }} />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', margin: 0 }}>页面活跃度</h3>
          </div>
          {pageStats.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 24 }}>暂无数据</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pageStats.map(({ page, count, pct }) => (
                <div key={page}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ fontWeight: 500, color: '#334155' }}>{page}</span>
                    <span style={{ color: '#94a3b8' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: '#10b981',
                      width: `${Math.max(pct, 2)}%`,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ===== Utility Components =====

function ActionButton({ icon, label, onClick, danger }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 8,
        fontSize: 13, fontWeight: 500, cursor: 'pointer',
        border: '1px solid ' + (danger ? '#fecaca' : '#e2e8f0'),
        background: danger ? '#fef2f2' : '#fff',
        color: danger ? '#dc2626' : '#475569',
        transition: 'all 0.15s ease',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function IntentBadge({ intent }: { intent: string }) {
  const color = intentColorMap[intent] || '#94a3b8'
  return (
    <span style={{
      fontSize: 11, fontWeight: 600,
      background: color + '18',
      color: color,
      borderRadius: 4, padding: '2px 8px',
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>
      {intentNameMap[intent] || intent}
    </span>
  )
}

function InsightRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: 600, color: warn ? '#ef4444' : '#1e293b' }}>{value}</span>
    </div>
  )
}

// ===== Constants =====

const intentNameMap: Record<string, string> = {
  greeting: '问候',
  thanks: '感谢',
  help: '帮助/能力',
  statistics: '统计概况',
  filter_region: '区域筛选',
  filter_industry: '行业筛选',
  filter_budget: '预算筛选',
  view_all: '查看全部',
  view_pending: '查看待处理',
  view_opportunities: '商机关联',
  keyword_search: '关键词搜索',
  fallback: '未识别',
  unknown: '未知',
}

const intentColorMap: Record<string, string> = {
  greeting: '#10b981',
  thanks: '#6366f1',
  help: '#8b5cf6',
  statistics: '#2563eb',
  filter_region: '#0891b2',
  filter_industry: '#0d9488',
  filter_budget: '#d97706',
  view_all: '#2563eb',
  view_pending: '#ea580c',
  view_opportunities: '#059669',
  keyword_search: '#7c3aed',
  fallback: '#ef4444',
  unknown: '#94a3b8',
}
