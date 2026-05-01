import { useState } from 'react'
import { type BidInfo, mockOpportunities } from '@/data/mock-data'
import { Button } from '@/components/ui/button'
import { X, Search, CheckCircle2, Link2, Building2, Briefcase } from 'lucide-react'

interface LinkOpportunitySheetProps {
  bid: BidInfo
  onClose: () => void
  onLink: (oppId: string) => void
}

export function LinkOpportunitySheet({ bid, onClose, onLink }: LinkOpportunitySheetProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // 根据标讯信息筛选商机列表（客户名称统一显示当前标讯采购单位）
  const customerName = bid.procurementUnit || '未公示'
  const filteredOpportunities = mockOpportunities
    .filter(opp =>
      !searchQuery ||
      opp.name.includes(searchQuery) ||
      customerName.includes(searchQuery) ||
      opp.id.includes(searchQuery)
    )

  return (
    <>
      {/* Overlay */}
      <div className="sheet-overlay animate-fade-in" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="mx-auto max-w-[480px] rounded-t-2xl bg-card safe-bottom"
          style={{ boxShadow: 'var(--shadow-elevated)', maxHeight: '85vh' }}>

          {/* Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="h-1 w-8 rounded-full bg-muted" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground">关联已有商机</h2>
              <p className="text-2xs text-muted-foreground mt-0.5">
                选择一个商机与当前标讯关联
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索商机编号或名称..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border bg-secondary pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Bid context hint */}
          {bid.relatedOpportunityCount > 0 && (
            <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg bg-accent p-2.5">
              <Link2 className="h-4 w-4 text-primary shrink-0" />
              <p className="text-2xs text-accent-foreground">
                该标讯可能关联 {bid.relatedOpportunityCount} 条商机，请从下方列表中选择
              </p>
            </div>
          )}

          {/* Opportunity List */}
          <div className="overflow-y-auto scrollbar-hide px-4" style={{ maxHeight: '45vh' }}>
            {filteredOpportunities.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                未找到匹配的商机
              </div>
            ) : (
              <div className="flex flex-col gap-2 pb-3">
                {filteredOpportunities.map(opp => (
                  <div
                    key={opp.id}
                    onClick={() => setSelectedId(opp.id)}
                    className={`card-press relative cursor-pointer rounded-xl border p-3.5 transition-all duration-200 ${
                      selectedId === opp.id
                        ? 'border-primary bg-accent ring-1 ring-primary'
                        : 'bg-card hover:border-primary/30'
                    }`}
                  >
                    {/* Selected check */}
                    {selectedId === opp.id && (
                      <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
                    )}

                    <p className="text-xs text-muted-foreground mb-1">{opp.id}</p>
                    <h3 className="text-sm font-semibold text-foreground mb-2 pr-8">{opp.name}</h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {customerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {opp.stage}
                      </span>
                      <span className="font-medium text-foreground">¥{opp.amount}万</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className="border-t px-4 pt-3 pb-2">
            <Button
              size="full"
              disabled={!selectedId}
              onClick={() => selectedId && onLink(selectedId)}
            >
              {selectedId ? '确认关联' : '请选择一个商机'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
