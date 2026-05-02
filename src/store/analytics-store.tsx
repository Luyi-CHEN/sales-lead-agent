import { createContext, useContext, useCallback, useRef, useEffect, type ReactNode } from 'react'

// ===== Types =====

export interface ChatLogEntry {
  id: string
  timestamp: string
  userInput: string
  systemResponse: string
  detectedIntent: string
  responseType: string // text, bid-list, quick-actions, bid-alert
  sessionId: string
}

export interface ClickPathEntry {
  id: string
  timestamp: string
  description: string   // Human-readable Chinese, e.g. "查看标讯详情"
  category: string      // Business category: 导航, 标讯浏览, 商机处理, 筛选, 对话交互
  page: string          // Current page in Chinese: 首页-助手, 首页-标讯列表, 标讯详情
  detail?: string       // Extra context (e.g., bid name, filter value)
  sessionId: string
}

interface AnalyticsState {
  logChat: (entry: Omit<ChatLogEntry, 'id' | 'timestamp' | 'sessionId'>) => void
  logClick: (entry: Omit<ClickPathEntry, 'id' | 'timestamp' | 'sessionId'>) => void
  getChatLogs: () => ChatLogEntry[]
  getClickPaths: () => ClickPathEntry[]
  clearChatLogs: () => void
  clearClickPaths: () => void
  exportChatLogsCSV: () => string
  exportClickPathsCSV: () => string
  fetchServerData: () => Promise<void>
  sessionId: string
}

const CHAT_LOG_KEY = 'sales_analytics_chat_logs'
const CLICK_PATH_KEY = 'sales_analytics_click_paths'
const MAX_ENTRIES = 5000

// ===== Helpers =====

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getSessionId(): string {
  let sid = sessionStorage.getItem('analytics_session_id')
  if (!sid) {
    sid = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
    sessionStorage.setItem('analytics_session_id', sid)
  }
  return sid
}

function readFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeToStorage<T>(key: string, data: T[], maxEntries: number): void {
  const trimmed = data.length > maxEntries ? data.slice(-maxEntries) : data
  try {
    localStorage.setItem(key, JSON.stringify(trimmed))
  } catch {
    try {
      localStorage.setItem(key, JSON.stringify(trimmed.slice(-Math.floor(maxEntries / 2))))
    } catch {
      // give up
    }
  }
}

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

// ===== Server API helpers =====

// VITE_ANALYTICS_API: Set to your Alibaba Cloud FC endpoint URL in production
// e.g. "https://xxx.cn-hangzhou.fc.aliyuncs.com/2016-08-15/proxy/analytics-service/analytics-api"
// When not set, falls back to local Vite dev server API (same origin)
function getApiBase(): string {
  const remoteApi = import.meta.env.VITE_ANALYTICS_API as string | undefined
  if (remoteApi) return remoteApi.replace(/\/$/, '')
  return window.location.origin + '/api/analytics'
}

async function postToServer(endpoint: string, data: unknown): Promise<void> {
  try {
    const base = getApiBase()
    const isRemote = !!import.meta.env.VITE_ANALYTICS_API
    // Remote API: /chat or /clicks (no /api/analytics prefix)
    // Local API: /api/analytics/chat or /api/analytics/clicks
    const url = isRemote ? `${base}${endpoint}` : `${window.location.origin}/api/analytics${endpoint}`
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch {
    // Silently fail — server API is optional
  }
}

async function fetchFromServer<T>(endpoint: string): Promise<T[]> {
  try {
    const base = getApiBase()
    const isRemote = !!import.meta.env.VITE_ANALYTICS_API
    const url = isRemote ? `${base}${endpoint}` : `${window.location.origin}/api/analytics${endpoint}`
    const res = await fetch(url)
    if (res.ok) return await res.json()
  } catch {
    // Server not available
  }
  return []
}

async function deleteFromServer(endpoint: string): Promise<void> {
  try {
    const base = getApiBase()
    const isRemote = !!import.meta.env.VITE_ANALYTICS_API
    const url = isRemote ? `${base}${endpoint}` : `${window.location.origin}/api/analytics${endpoint}`
    await fetch(url, { method: 'DELETE' })
  } catch {
    // Silently fail
  }
}

// ===== Context =====

const AnalyticsContext = createContext<AnalyticsState | null>(null)

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext)
  if (!ctx) throw new Error('useAnalytics must be used inside AnalyticsProvider')
  return ctx
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const sessionId = useRef(getSessionId()).current
  const chatLogsRef = useRef<ChatLogEntry[]>(readFromStorage(CHAT_LOG_KEY))
  const clickPathsRef = useRef<ClickPathEntry[]>(readFromStorage(CLICK_PATH_KEY))

  // Persist on page unload
  useEffect(() => {
    const save = () => {
      writeToStorage(CHAT_LOG_KEY, chatLogsRef.current, MAX_ENTRIES)
      writeToStorage(CLICK_PATH_KEY, clickPathsRef.current, MAX_ENTRIES)
    }
    window.addEventListener('beforeunload', save)
    return () => window.removeEventListener('beforeunload', save)
  }, [])

  // Auto-persist every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      writeToStorage(CHAT_LOG_KEY, chatLogsRef.current, MAX_ENTRIES)
      writeToStorage(CLICK_PATH_KEY, clickPathsRef.current, MAX_ENTRIES)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const logChat = useCallback((entry: Omit<ChatLogEntry, 'id' | 'timestamp' | 'sessionId'>) => {
    const record: ChatLogEntry = {
      ...entry,
      id: generateId(),
      timestamp: new Date().toISOString(),
      sessionId,
    }
    chatLogsRef.current = [...chatLogsRef.current, record]
    writeToStorage(CHAT_LOG_KEY, chatLogsRef.current, MAX_ENTRIES)
    // Sync to server (fire-and-forget)
    postToServer('/chat', record)
  }, [sessionId])

  const logClick = useCallback((entry: Omit<ClickPathEntry, 'id' | 'timestamp' | 'sessionId'>) => {
    const record: ClickPathEntry = {
      ...entry,
      id: generateId(),
      timestamp: new Date().toISOString(),
      sessionId,
    }
    clickPathsRef.current = [...clickPathsRef.current, record]
    writeToStorage(CLICK_PATH_KEY, clickPathsRef.current, MAX_ENTRIES)
    // Sync to server (fire-and-forget)
    postToServer('/clicks', record)
  }, [sessionId])

  const getChatLogs = useCallback(() => chatLogsRef.current, [])
  const getClickPaths = useCallback(() => clickPathsRef.current, [])

  // Fetch data from server (for PC analytics dashboard, merges all device data)
  const fetchServerData = useCallback(async () => {
    const [serverChats, serverClicks] = await Promise.all([
      fetchFromServer<ChatLogEntry>('/chat'),
      fetchFromServer<ClickPathEntry>('/clicks'),
    ])
    chatLogsRef.current = serverChats
    clickPathsRef.current = serverClicks
  }, [])

  const clearChatLogs = useCallback(() => {
    chatLogsRef.current = []
    localStorage.removeItem(CHAT_LOG_KEY)
    deleteFromServer('/chat')
  }, [])

  const clearClickPaths = useCallback(() => {
    clickPathsRef.current = []
    localStorage.removeItem(CLICK_PATH_KEY)
    deleteFromServer('/clicks')
  }, [])

  const exportChatLogsCSV = useCallback(() => {
    const headers = ['ID', 'Timestamp', 'SessionID', 'UserInput', 'SystemResponse', 'DetectedIntent', 'ResponseType']
    const rows = chatLogsRef.current.map(e => [
      e.id, e.timestamp, e.sessionId,
      escapeCSV(e.userInput), escapeCSV(e.systemResponse),
      escapeCSV(e.detectedIntent), e.responseType,
    ].join(','))
    return [headers.join(','), ...rows].join('\n')
  }, [])

  const exportClickPathsCSV = useCallback(() => {
    const headers = ['ID', 'Timestamp', 'SessionID', 'Description', 'Category', 'Page', 'Detail']
    const rows = clickPathsRef.current.map(e => [
      e.id, e.timestamp, e.sessionId,
      escapeCSV(e.description), escapeCSV(e.category),
      escapeCSV(e.page), escapeCSV(e.detail || ''),
    ].join(','))
    return [headers.join(','), ...rows].join('\n')
  }, [])

  return (
    <AnalyticsContext.Provider
      value={{
        logChat, logClick,
        getChatLogs, getClickPaths,
        clearChatLogs, clearClickPaths,
        exportChatLogsCSV, exportClickPathsCSV,
        fetchServerData,
        sessionId,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}
