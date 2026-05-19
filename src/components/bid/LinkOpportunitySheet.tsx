import { useState } from 'react'
import { type BidInfo, mockOpportunities, mockCustomerDatabase } from '@/data/mock-data'
import { Button } from '@/components/ui/button'
import { X, Search, CheckCircle2, Link2, Building2, Briefcase, ChevronRight } from 'lucide-react'

interface LinkOpportunitySheetProps {
  bid: BidInfo
  onClose: () => void
  onLink: (oppId: string, linkedCdbId?: string, manualOppId?: string) => void
}

export function LinkOpportunitySheet({ bid, onClose, onLink }: LinkOpportunitySheetProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedCdbId, setSelectedCdbId] = useState<string>('')
  const [cdbSearchQuery, setCdbSearchQuery] = useState('')
  const [manualOppId, setManualOppId] = useState('')

  const needCdbId = !bid.cdbId
  const cdbIdReady = !needCdbId || !!selectedCdbId

  // 根据标讯信息筛选商机列表（客户名称统一显示当前标讯采购单位）
  const customerName = bid.procurementUnit || '未公示'
  const filteredOpportunities = mockOpportunities

  const trimmedManualId = manualOppId.trim()
  const hasAnyOppRef = !!selectedId || !!trimmedManualId
  const canSubmit = hasAnyOppRef && cdbIdReady

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
              <h2 className="text-base font-bold text-foreground">
                {cdbIdReady ? '关联已有商机' : '补录CDBID'}
              </h2>
              <p className="text-2xs text-muted-foreground mt-0.5">
                {cdbIdReady
                  ? '单选一个商机与当前标讯关联'
                  : '请先补录CDBID，系统将据此匹配潜在商机'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step 1: CDBID Selection (when bid has no cdbId) */}
          {needCdbId && !selectedCdbId && (
            <div className="px-4 pb-3">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                CDBID <span className="text-destructive">*</span>
                <span className="ml-1.5 rounded bg-accent px-1 py-0.5 text-[9px] font-medium text-primary">标讯无CDBID，需补录</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={cdbSearchQuery}
                  onChange={e => setCdbSearchQuery(e.target.value)}
                  placeholder="搜索CDBID或客户名称"
                  className="h-10 w-full rounded-lg border bg-secondary pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {cdbSearchQuery && (
                <div className="border rounded-lg mt-1 max-h-52 overflow-y-auto bg-muted/50 py-1">
                  {mockCustomerDatabase.filter(c =>
                    c.cdbId.toLowerCase().includes(cdbSearchQuery.toLowerCase()) ||
                    c.name.toLowerCase().includes(cdbSearchQuery.toLowerCase())
                  ).length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">无匹配结果</div>
                  ) : (
                    mockCustomerDatabase.filter(c =>
                      c.cdbId.toLowerCase().includes(cdbSearchQuery.toLowerCase()) ||
                      c.name.toLowerCase().includes(cdbSearchQuery.toLowerCase())
                    ).map(c => (
                      <button
                        key={c.cdbId}
                        onClick={() => {
                          setSelectedCdbId(c.cdbId)
                          setCdbSearchQuery('')
                        }}
                        className="w-full px-3 py-2.5 text-left text-sm text-foreground hover:bg-secondary active:bg-secondary/80 flex items-center justify-between"
                        data-track={`选择CDBID：${c.cdbId}`}
                        data-track-type="商机处理"
                      >
                        <span>{c.name}（{c.cdbId}）</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))
                  )}
                </div>
              )}
              {!cdbSearchQuery && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-warning-muted p-2.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                  <p className="text-2xs text-foreground/70">
                    补录CDBID后，系统将自动展示匹配的潜在商机列表
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Opportunity List (shown when cdbId is ready) */}
          {cdbIdReady && (
            <>
              {/* CDBID display bar (when just filled) */}
              {needCdbId && selectedCdbId && (
                <div className="mx-4 mb-3 flex items-center justify-between rounded-lg bg-accent p-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs text-accent-foreground">
                      已补录CDBID：<span className="font-medium">{selectedCdbId}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedCdbId(''); setSelectedId(null) }}
                    className="text-xs text-primary hover:text-primary/80"
                    data-track="重新选择CDBID"
                    data-track-type="商机处理"
                  >
                    重新选择
                  </button>
                </div>
              )}

              {/* Bid context hint */}
              {bid.relatedOpportunityCount > 0 && (
                <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg bg-accent p-2.5">
                  <Link2 className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-2xs text-accent-foreground">
                    该标讯可能关联 {bid.relatedOpportunityCount} 条商机，请从下方列表中单选
                  </p>
                </div>
              )}

              {/* Opportunity List */}
              <div className="overflow-y-auto scrollbar-hide px-4" style={{ maxHeight: '32vh' }}>
                {filteredOpportunities.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    未找到匹配的商机
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pb-3">
                    {filteredOpportunities.map(opp => (
                      <div
                        key={opp.id}
                        onClick={() => setSelectedId(prev => prev === opp.id ? null : opp.id)}
                        className={`card-press relative cursor-pointer rounded-xl border p-3.5 transition-all duration-200 ${
                          selectedId === opp.id
                            ? 'border-primary bg-accent ring-1 ring-primary'
                            : 'bg-card hover:border-primary/30'
                        }`}
                        data-track={`选择关联商机：${opp.id}`}
                        data-track-type="商机处理"
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
              {/* 手动填写商机编号（非必填） */}
              <div className="px-4 pb-3 pt-1">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  商机编号
                  <span className="ml-1.5 text-2xs text-muted-foreground/80">（非必填）</span>
                </label>
                <input
                  type="text"
                  value={manualOppId}
                  onChange={e => setManualOppId(e.target.value)}
                  placeholder="如未找到可关联商机，可手动填写"
                  className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  data-track="手动填写商机编号"
                  data-track-type="商机处理"
                />
              </div>
            </>
          )}

          {/* Bottom Action */}
          <div className="border-t px-4 pt-3 pb-2">
            <Button
              size="full"
              disabled={!canSubmit}
              onClick={() => { if (!canSubmit) return; onLink(selectedId || '', selectedCdbId || undefined, trimmedManualId || undefined) }}
              data-track="确认关联已有商机"
              data-track-type="商机处理"
            >
              {!cdbIdReady
                ? '请先补录CDBID'
                : (selectedId ? '确认关联' : (trimmedManualId ? '确认关联（手填编号）' : '请选择或填写商机编号'))
              }
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
