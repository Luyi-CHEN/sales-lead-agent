import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAppState } from '@/store/app-store'
import { BidCard } from '@/components/bid/BidCard'

export function BidListTab() {
  const { bids } = useAppState()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'feedback'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const filteredBids = bids.filter(b => {
    const matchTab =
      activeFilter === 'all' ||
      (activeFilter === 'pending' && b.status === 'pending') ||
      (activeFilter === 'feedback' && ['linked', 'no_opportunity', 'new_opportunity'].includes(b.status))

    const matchSearch = !searchQuery ||
      b.projectName.includes(searchQuery) ||
      b.procurementUnit.includes(searchQuery)

    return matchTab && matchSearch
  })

  const filters = [
    { key: 'all' as const, label: '全部', count: bids.length },
    { key: 'pending' as const, label: '待处理', count: bids.filter(b => b.status === 'pending').length },
    { key: 'feedback' as const, label: '已反馈', count: bids.filter(b => ['linked', 'no_opportunity', 'new_opportunity'].includes(b.status)).length },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Filter + Search Row */}
      <div className="border-b bg-card px-4 py-2">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground active:bg-secondary"
          >
            <Search className="h-4 w-4" />
          </button>
          <div className="flex flex-1 gap-1 overflow-x-auto scrollbar-hide">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  activeFilter === f.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {f.label} {f.count}
              </button>
            ))}
          </div>
        </div>

        {/* Collapsible search */}
        {showSearch && (
          <div className="animate-scale-in pb-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索项目名称或招标单位..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-lg border bg-secondary pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Bid List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3">
        {filteredBids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="mb-3 text-4xl">📋</div>
            <p className="text-sm">暂无标讯数据</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredBids.map(bid => (
              <BidCard
                key={bid.id}
                bid={bid}
                onClick={() => navigate(`/bid/${bid.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
