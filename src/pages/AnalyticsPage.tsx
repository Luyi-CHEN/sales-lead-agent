import { useState, useEffect, useMemo } from 'react'
import { useAnalytics, type ChatLogEntry, type ClickPathEntry } from '@/store/analytics-store'
import {
  MessageSquare, MousePointerClick, Download, Trash2,
  BarChart3, Filter,
  TrendingUp, Hash, Zap, Search, Users, GitBranch,
} from 'lucide-react'

type TabKey = 'users' | 'chat' | 'clicks'
type SortKey = 'time' | 'intent' | 'session'

export function AnalyticsPage() {
  const {
    getChatLogs, getClickPaths,
    clearChatLogs, clearClickPaths,
    exportChatLogsCSV, exportClickPathsCSV,
    fetchServerData,
  } = useAnalytics()

  const [activeTab, setActiveTab] = useState<TabKey>('users')
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

  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of clickPaths) {
      map[p.category] = (map[p.category] || 0) + 1
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({ cat, count, pct: clickPaths.length ? Math.round(count / clickPaths.length * 100) : 0 }))
  }, [clickPaths])

  const pageStats = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of clickPaths) {
      map[p.page] = (map[p.page] || 0) + 1
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([page, count]) => ({ page, count, pct: clickPaths.length ? Math.round(count / clickPaths.length * 100) : 0 }))
  }, [clickPaths])

  // Unique users / sessions counts
  const uniqueUsers = useMemo(() => {
    const set = new Set<string>()
    for (const l of chatLogs) if (l.userId) set.add(l.userId)
    for (const p of clickPaths) if (p.userId) set.add(p.userId)
    return set.size
  }, [chatLogs, clickPaths])

  const sessionCount = useMemo(() => {
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
                <StatBadge icon={<Users size={14} />} label="独立用户" value={uniqueUsers} />
                <StatBadge icon={<Hash size={14} />} label="独立会话" value={sessionCount} />
                <StatBadge icon={<MessageSquare size={14} />} label="对话记录" value={chatLogs.length} />
                <StatBadge icon={<MousePointerClick size={14} />} label="点击事件" value={clickPaths.length} />
              </div>
            </div>
          </div>
        </header>

        {/* Tab Bar */}
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e2e8f0', marginTop: 0 }}>
            <TabButton
              active={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              icon={<GitBranch size={15} />}
              label="用户行为链路"
              count={uniqueUsers}
            />
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
          {activeTab === 'users' ? (
            <UserBehaviorPanel
              chatLogs={chatLogs}
              clickPaths={clickPaths}
              formatTime={formatTime}
              expandedSessions={expandedSessions}
              toggleSession={toggleSession}
            />
          ) : activeTab === 'chat' ? (
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

// ===== User Behavior Chain Panel =====

interface UserSessionData {
  userId: string
  sessions: {
    sessionId: string
    startTime: string
    endTime: string
    chatCount: number
    clickCount: number
    detailEntries: { source: string; bidName: string; timestamp: string }[]
    events: { type: 'chat' | 'click'; timestamp: string; description: string; detail?: string; intent?: string }[]
  }[]
}

function buildUserSessions(chatLogs: ChatLogEntry[], clickPaths: ClickPathEntry[]): UserSessionData[] {
  // Collect all userIds
  const userMap = new Map<string, Map<string, { chats: ChatLogEntry[]; clicks: ClickPathEntry[] }>>()

  for (const c of chatLogs) {
    const uid = c.userId || 'unknown'
    if (!userMap.has(uid)) userMap.set(uid, new Map())
    const sessions = userMap.get(uid)!
    if (!sessions.has(c.sessionId)) sessions.set(c.sessionId, { chats: [], clicks: [] })
    sessions.get(c.sessionId)!.chats.push(c)
  }

  for (const p of clickPaths) {
    const uid = p.userId || 'unknown'
    if (!userMap.has(uid)) userMap.set(uid, new Map())
    const sessions = userMap.get(uid)!
    if (!sessions.has(p.sessionId)) sessions.set(p.sessionId, { chats: [], clicks: [] })
    sessions.get(p.sessionId)!.clicks.push(p)
  }

  const result: UserSessionData[] = []

  for (const [userId, sessions] of userMap) {
    const userSessions: UserSessionData['sessions'] = []

    for (const [sessionId, data] of sessions) {
      // Build unified event timeline
      const events: UserSessionData['sessions'][0]['events'] = []

      for (const c of data.chats) {
        events.push({
          type: 'chat',
          timestamp: c.timestamp,
          description: c.userInput,
          detail: c.systemResponse.slice(0, 80),
          intent: c.detectedIntent,
        })
      }

      for (const p of data.clicks) {
        events.push({
          type: 'click',
          timestamp: p.timestamp,
          description: p.description,
          detail: p.detail,
        })
      }

      events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      // Extract detail page entries with their source
      const detailEntries: UserSessionData['sessions'][0]['detailEntries'] = []
      for (const p of data.clicks) {
        if (p.description === '从对话列表查看标讯' || p.description === '从对话中查看标讯提醒') {
          detailEntries.push({ source: '对话列表', bidName: p.detail || '', timestamp: p.timestamp })
        } else if (p.description === '查看标讯详情') {
          detailEntries.push({ source: '标讯列表', bidName: p.detail || '', timestamp: p.timestamp })
        }
      }

      const allTimes = events.map(e => new Date(e.timestamp).getTime())
      const startTime = allTimes.length ? new Date(Math.min(...allTimes)).toISOString() : ''
      const endTime = allTimes.length ? new Date(Math.max(...allTimes)).toISOString() : ''

      userSessions.push({
        sessionId,
        startTime,
        endTime,
        chatCount: data.chats.length,
        clickCount: data.clicks.length,
        detailEntries,
        events,
      })
    }

    // Sort sessions by start time descending
    userSessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

    result.push({ userId, sessions: userSessions })
  }

  // Sort users by latest activity
  result.sort((a, b) => {
    const aTime = a.sessions[0]?.startTime || ''
    const bTime = b.sessions[0]?.startTime || ''
    return bTime.localeCompare(aTime)
  })

  return result
}

function UserBehaviorPanel({ chatLogs, clickPaths, formatTime, expandedSessions, toggleSession }: {
  chatLogs: ChatLogEntry[]
  clickPaths: ClickPathEntry[]
  formatTime: (iso: string) => string
  expandedSessions: Set<string>
  toggleSession: (sid: string) => void
}) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const userSessions = useMemo(() => buildUserSessions(chatLogs, clickPaths), [chatLogs, clickPaths])

  // Auto-select first user
  useEffect(() => {
    if (!selectedUser && userSessions.length > 0) {
      setSelectedUser(userSessions[0].userId)
    }
  }, [userSessions, selectedUser])

  const activeUser = userSessions.find(u => u.userId === selectedUser)

  // Summary stats for selected user
  const userSummary = useMemo(() => {
    if (!activeUser) return null
    const totalChats = activeUser.sessions.reduce((s, sess) => s + sess.chatCount, 0)
    const totalClicks = activeUser.sessions.reduce((s, sess) => s + sess.clickCount, 0)
    const totalDetailEntries = activeUser.sessions.reduce((s, sess) => s + sess.detailEntries.length, 0)
    const fromChat = activeUser.sessions.reduce((s, sess) => s + sess.detailEntries.filter(d => d.source === '对话列表').length, 0)
    const fromList = activeUser.sessions.reduce((s, sess) => s + sess.detailEntries.filter(d => d.source === '标讯列表').length, 0)
    return { totalChats, totalClicks, totalDetailEntries, fromChat, fromList, sessionCount: activeUser.sessions.length }
  }, [activeUser])

  // Entry source ranking across all users
  const entrySourceStats = useMemo(() => {
    let fromChat = 0
    let fromList = 0
    for (const u of userSessions) {
      for (const s of u.sessions) {
        for (const d of s.detailEntries) {
          if (d.source === '对话列表') fromChat++
          else fromList++
        }
      }
    }
    const total = fromChat + fromList
    return { fromChat, fromList, total }
  }, [userSessions])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
      {/* Left: User list */}
      <div>
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#1e293b',
            borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Users size={15} style={{ color: '#6366f1' }} />
            用户列表 ({userSessions.length})
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {userSessions.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                暂无用户数据
              </div>
            ) : (
              userSessions.map((u, i) => {
                const isActive = selectedUser === u.userId
                const totalEvents = u.sessions.reduce((s, sess) => s + sess.chatCount + sess.clickCount, 0)
                const totalDetails = u.sessions.reduce((s, sess) => s + sess.detailEntries.length, 0)
                return (
                  <div
                    key={u.userId}
                    onClick={() => setSelectedUser(u.userId)}
                    style={{
                      padding: '12px 16px', cursor: 'pointer',
                      background: isActive ? '#eff6ff' : 'transparent',
                      borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                      borderBottom: '1px solid #f8fafc',
                      transition: 'all 0.1s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: USER_COLORS[i % USER_COLORS.length],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 11, fontWeight: 700,
                        }}>
                          {`U${i + 1}`}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                            用户 {i + 1}
                          </div>
                          <div style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
                            {u.userId.slice(0, 16)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 11, color: '#64748b' }}>
                      <span>{u.sessions.length} 会话</span>
                      <span>·</span>
                      <span>{totalEvents} 事件</span>
                      <span>·</span>
                      <span>{totalDetails} 次进详情</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Entry source overview */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: 16, marginTop: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={14} style={{ color: '#10b981' }} />
            进入详情页来源（全局）
          </div>
          {entrySourceStats.total === 0 ? (
            <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: 12 }}>暂无数据</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SourceBar label="💬 对话列表" count={entrySourceStats.fromChat} total={entrySourceStats.total} color="#6366f1" />
              <SourceBar label="📋 标讯列表" count={entrySourceStats.fromList} total={entrySourceStats.total} color="#2563eb" />
            </div>
          )}
        </div>
      </div>

      {/* Right: Session detail */}
      <div>
        {!activeUser ? (
          <div style={{
            background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
            padding: 64, textAlign: 'center', color: '#94a3b8', fontSize: 14,
          }}>
            请在左侧选择一个用户查看行为链路
          </div>
        ) : (
          <>
            {/* User summary cards */}
            {userSummary && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
                <SummaryCard label="会话数" value={userSummary.sessionCount} icon="📊" />
                <SummaryCard label="对话次数" value={userSummary.totalChats} icon="💬" />
                <SummaryCard label="点击次数" value={userSummary.totalClicks} icon="👆" />
                <SummaryCard label="从对话进详情" value={userSummary.fromChat} icon="🔗" color="#6366f1" />
                <SummaryCard label="从列表进详情" value={userSummary.fromList} icon="📋" color="#2563eb" />
              </div>
            )}

            {/* Sessions */}
            {activeUser.sessions.map((sess, si) => {
              const isExpanded = expandedSessions.has(sess.sessionId)
              return (
                <div key={sess.sessionId} style={{
                  background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                  marginBottom: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  {/* Session header */}
                  <div
                    onClick={() => toggleSession(sess.sessionId)}
                    style={{
                      padding: '14px 20px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: isExpanded ? '#f8fafc' : 'transparent',
                      borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        fontSize: 16, transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.15s', display: 'inline-block',
                      }}>▶</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                          会话 {si + 1}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          {formatTime(sess.startTime)} ~ {formatTime(sess.endTime)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
                      <span>💬 {sess.chatCount} 对话</span>
                      <span>👆 {sess.clickCount} 点击</span>
                      <span style={{ color: '#6366f1', fontWeight: 600 }}>📄 {sess.detailEntries.length} 次进详情</span>
                    </div>
                  </div>

                  {/* Session detail: behavior chain */}
                  {isExpanded && (
                    <div style={{ padding: '16px 20px' }}>
                      {/* Detail page entry summary */}
                      {sess.detailEntries.length > 0 && (
                        <div style={{
                          background: '#f8fafc', borderRadius: 8, padding: '12px 16px', marginBottom: 16,
                          border: '1px solid #e2e8f0',
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                            📄 进入标讯详情页路径
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {sess.detailEntries.map((d, di) => (
                              <div key={di} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 11, flexShrink: 0, width: 60 }}>
                                  {new Date(d.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                <span style={{
                                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                                  background: d.source === '对话列表' ? '#ede9fe' : '#dbeafe',
                                  color: d.source === '对话列表' ? '#6366f1' : '#2563eb',
                                  flexShrink: 0,
                                }}>
                                  {d.source === '对话列表' ? '💬 对话列表' : '📋 标讯列表'}
                                </span>
                                <span style={{ fontSize: 11, color: '#1e293b' }}>→</span>
                                <span style={{ fontSize: 12, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {d.bidName || '标讯详情'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Full event timeline */}
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                        🕐 完整行为时间线 ({sess.events.length} 个事件)
                      </div>
                      <div style={{ position: 'relative', paddingLeft: 20 }}>
                        {/* Timeline line */}
                        <div style={{
                          position: 'absolute', left: 7, top: 8, bottom: 8,
                          width: 2, background: '#e2e8f0',
                        }} />
                        {sess.events.map((evt, ei) => (
                          <div key={ei} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8,
                            position: 'relative',
                          }}>
                            {/* Dot */}
                            <div style={{
                              position: 'absolute', left: -16,
                              width: 12, height: 12, borderRadius: '50%',
                              background: evt.type === 'chat' ? '#f59e0b' : '#2563eb',
                              border: '2px solid #fff', boxShadow: '0 0 0 1px #e2e8f0',
                              marginTop: 2, flexShrink: 0,
                            }} />
                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 11, flexShrink: 0 }}>
                                  {new Date(evt.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                <span style={{
                                  fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 3,
                                  background: evt.type === 'chat' ? '#fef3c7' : '#dbeafe',
                                  color: evt.type === 'chat' ? '#d97706' : '#2563eb',
                                }}>
                                  {evt.type === 'chat' ? '对话' : '点击'}
                                </span>
                                {evt.intent && (
                                  <IntentBadge intent={evt.intent} />
                                )}
                              </div>
                              <div style={{ fontSize: 13, color: '#1e293b', marginTop: 2, lineHeight: 1.4 }}>
                                {evt.description}
                              </div>
                              {evt.detail && (
                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {evt.detail}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, icon, color }: { label: string; value: number; icon: string; color?: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
      padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || '#1e293b', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function SourceBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round(count / total * 100) : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
        <span style={{ fontWeight: 500, color: '#334155' }}>{label}</span>
        <span style={{ color: '#94a3b8' }}>{count} ({pct}%)</span>
      </div>
      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3, background: color,
          width: `${Math.max(pct, 2)}%`, transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  )
}

const USER_COLORS = ['#6366f1', '#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#d97706']

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

// ===== Click Analytics Panel =====

const categoryColorMap: Record<string, string> = {
  '导航': '#8b5cf6', '标讯浏览': '#2563eb', '商机处理': '#10b981',
  '筛选': '#06b6d4', '对话交互': '#f59e0b', '标讯操作': '#ec4899',
  '搜索': '#6366f1', '其他': '#94a3b8',
}

const categoryIconMap: Record<string, string> = {
  '导航': '🧭', '标讯浏览': '📋', '商机处理': '💼',
  '筛选': '🔍', '对话交互': '💬', '标讯操作': '⚡',
  '搜索': '🔎', '其他': '📌',
}

function CategoryBadge({ category }: { category: string }) {
  const color = categoryColorMap[category] || '#94a3b8'
  const icon = categoryIconMap[category] || '📌'
  return (
    <span style={{
      fontSize: 11, fontWeight: 600,
      background: color + '15', color: color,
      borderRadius: 6, padding: '3px 10px',
      display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
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
      {/* Left: Timeline table */}
      <div>
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
                  <span><CategoryBadge category={p.category} /></span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{p.page}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right: Stats sidebar */}
      <div>
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
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 13, flexShrink: 0, opacity: 0.7 }}>{categoryIconMap[category] || '📌'}</span>
                  <span style={{ flex: 1, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{desc}</span>
                  <span style={{ color: '#94a3b8', fontSize: 11, flexShrink: 0 }}>{count}次</span>
                </div>
              ))}
            </div>
          )}
        </div>

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
                        height: '100%', borderRadius: 3, background: color,
                        width: `${Math.max(pct, 2)}%`, transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

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
                      height: '100%', borderRadius: 3, background: '#10b981',
                      width: `${Math.max(pct, 2)}%`, transition: 'width 0.3s ease',
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
      background: color + '18', color: color,
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
  greeting: '问候', thanks: '感谢', help: '帮助/能力',
  statistics: '统计概况', filter_region: '区域筛选', filter_industry: '行业筛选',
  filter_budget: '预算筛选', view_all: '查看全部', view_pending: '查看待处理',
  view_opportunities: '商机关联', keyword_search: '关键词搜索',
  fallback: '未识别', unknown: '未知',
}

const intentColorMap: Record<string, string> = {
  greeting: '#10b981', thanks: '#6366f1', help: '#8b5cf6',
  statistics: '#2563eb', filter_region: '#0891b2', filter_industry: '#0d9488',
  filter_budget: '#d97706', view_all: '#2563eb', view_pending: '#ea580c',
  view_opportunities: '#059669', keyword_search: '#7c3aed',
  fallback: '#ef4444', unknown: '#94a3b8',
}
