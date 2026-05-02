import { useEffect, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAnalytics } from '@/store/analytics-store'

/**
 * Maps route pathname to a human-readable Chinese page name.
 */
function getPageName(pathname: string): string {
  if (pathname === '/' || pathname === '') return '首页'
  if (pathname.startsWith('/bid/')) return '标讯详情'
  if (pathname.startsWith('/analytics')) return '分析看板'
  return pathname.replace(/^\//, '')
}

/**
 * Walks up the DOM tree to find the nearest ancestor with a `data-track` attribute.
 * Returns null if none found within 10 levels.
 */
function findTrackableAncestor(el: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = el
  for (let i = 0; i < 10 && current; i++) {
    if (current.getAttribute('data-track')) return current
    current = current.parentElement
  }
  return null
}

/**
 * ClickTracker component — captures user interactions on elements marked with
 * `data-track` attributes and logs them as business-level semantic events.
 *
 * Supported attributes on tracked elements:
 * - data-track="中文操作描述"       (required) Human-readable action description
 * - data-track-type="业务类别"      (optional) Category: 导航, 标讯浏览, 商机处理, 筛选, 对话交互, 标讯操作
 * - data-track-detail="额外上下文"  (optional) Extra context like bid name
 *
 * Also logs page navigation events automatically.
 */
export function ClickTracker() {
  const { logClick } = useAnalytics()
  const location = useLocation()
  const pageRef = useRef(getPageName(location.pathname))
  const lastNavTime = useRef(Date.now())

  // Track page navigation
  useEffect(() => {
    const newPage = getPageName(location.pathname)
    const prevPage = pageRef.current
    pageRef.current = newPage

    // Don't log analytics page visits (admin noise)
    if (newPage === '分析看板') return

    // Only log if page actually changed
    if (newPage !== prevPage || Date.now() - lastNavTime.current > 1000) {
      lastNavTime.current = Date.now()
      logClick({
        description: `进入「${newPage}」`,
        category: '导航',
        page: newPage,
        detail: location.pathname,
      })
    }
  }, [location.pathname, logClick])

  const handleClick = useCallback((e: MouseEvent) => {
    const el = e.target as HTMLElement
    if (!el) return

    // Skip analytics page clicks
    if (pageRef.current === '分析看板') return

    // Find nearest trackable ancestor
    const tracked = findTrackableAncestor(el)
    if (!tracked) return // Only log elements with data-track

    const description = tracked.getAttribute('data-track') || ''
    const category = tracked.getAttribute('data-track-type') || '其他'
    const detail = tracked.getAttribute('data-track-detail') || ''

    logClick({
      description,
      category,
      page: pageRef.current,
      detail: detail || undefined,
    })
  }, [logClick])

  useEffect(() => {
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [handleClick])

  return null
}
