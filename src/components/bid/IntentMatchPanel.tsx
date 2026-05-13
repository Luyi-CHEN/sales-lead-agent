import { type BidInfo } from '@/data/mock-data'
import { Link2, Sparkles, X, CheckCircle2, ChevronRight, Circle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const statusLabel = (s: BidInfo['status']) => ({
  pending: '已分配（待跟进）',
  linked: '已反馈（关联已有商机）',
  no_opportunity: '已反馈（无商机）',
  new_opportunity: '已反馈（新商机）',
}[s])

// =============== 顶部提醒条（三态紧凑常驻） ===============

interface IntentMatchBannerProps {
  realtimeBid: BidInfo
  candidatesCount: number
  linkedIntent?: BidInfo
  onOpenSheet: () => void
}

export function IntentMatchBanner({
  realtimeBid,
  candidatesCount,
  linkedIntent,
  onOpenSheet,
}: IntentMatchBannerProps) {
  const decision = realtimeBid.linkedIntentBidId

  // Case B：已关联（只读展示，不可操作）
  if (decision && linkedIntent) {
    return (
      <div className="w-full flex items-center gap-1.5 px-4 py-2 bg-success-muted border-b border-success/20">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
        <span className="text-xs font-semibold text-success shrink-0">已关联：</span>
        <span className="text-xs text-foreground truncate">{linkedIntent.procurementUnit}</span>
      </div>
    )
  }

  // Case C：明确不关联（只读展示）
  if (decision === null) {
    return (
      <div className="w-full flex items-center gap-1.5 px-4 py-2 bg-secondary/60 border-b">
        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">未关联历史意向招标</span>
      </div>
    )
  }

  // Case A：未决策（紫色高亮，可点击进入抽屉）
  if (candidatesCount === 0) return null
  return (
    <button
      type="button"
      onClick={onOpenSheet}
      className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-primary/[0.07] border-b border-primary/15 active:bg-primary/10 transition-colors"
      data-track="打开关联意向招标抽屉"
      data-track-type="标讯关联"
      data-track-detail={`${candidatesCount}条候选`}
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-xs text-foreground">
          系统匹配到 <span className="font-bold text-primary">{candidatesCount}</span> 条相关历史意向招标，请处理
        </span>
      </div>
      <ChevronRight className="h-4 w-4 text-primary shrink-0" />
    </button>
  )
}

// =============== 底部抽屉（仅未决策时弹出，承载候选列表 + 决策） ===============

interface IntentMatchSheetProps {
  realtimeBid: BidInfo
  candidates: BidInfo[]
  onClose: () => void
  onLink: (intentBidId: string) => void
  onMarkNoLink: () => void
}

export function IntentMatchSheet({
  realtimeBid,
  candidates,
  onClose,
  onLink,
  onMarkNoLink,
}: IntentMatchSheetProps) {
  return (
    <>
      <div className="sheet-overlay animate-fade-in" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div
          className="mx-auto max-w-[480px] rounded-t-2xl bg-card safe-bottom flex flex-col"
          style={{ boxShadow: 'var(--shadow-elevated)', maxHeight: '85vh' }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-2 pb-1 shrink-0">
            <div className="h-1 w-8 rounded-full bg-muted" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3 shrink-0">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-foreground">关联历史意向招标</h2>
              <p className="text-2xs text-muted-foreground mt-0.5">
                请选择一条进行关联，关联后状态将自动跟随且不可更改；如均不相关请选择不关联
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 候选列表（可滚动） */}
          <div className="overflow-y-auto scrollbar-hide px-4 flex-1" style={{ maxHeight: '50vh' }}>
            <div className="space-y-2 pb-3">
              {candidates.map(c => (
                <IntentBidMiniCard
                  key={c.id}
                  bid={c}
                  actionSlot={
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onLink(c.id)
                      }}
                      className="shrink-0 inline-flex items-center gap-0.5 rounded-md bg-primary px-2 py-1 text-2xs font-semibold text-primary-foreground active:opacity-80"
                      data-track="关联意向招标"
                      data-track-type="标讯关联"
                      data-track-detail={`${realtimeBid.id}|${c.id}`}
                    >
                      <Link2 className="h-3 w-3" />
                      关联此条
                    </button>
                  }
                />
              ))}
            </div>
          </div>

          {/* 底部固定按钮 */}
          <div className="border-t bg-card px-4 py-3 shrink-0">
            <button
              onClick={onMarkNoLink}
              className="w-full rounded-md border border-border bg-card py-2.5 text-sm font-medium text-muted-foreground active:bg-accent"
              data-track="不关联意向招标"
              data-track-type="标讯关联"
              data-track-detail={realtimeBid.id}
            >
              以上都不关联，进入常规反馈流程
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// =============== 内部小卡片 ===============

function IntentBidMiniCard({ bid, actionSlot }: { bid: BidInfo; actionSlot?: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <div
      className="flex items-start gap-2 rounded-lg border bg-card p-2.5 cursor-pointer active:bg-accent transition-colors"
      onClick={() => navigate(`/bid/${bid.id}`)}
      data-track="点击候选意向招标卡片"
      data-track-type="标讯浏览"
      data-track-detail={bid.id}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-2xs font-medium text-muted-foreground">
            {bid.bidType}
          </span>
          <span className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-2xs font-medium text-muted-foreground">
            {statusLabel(bid.status)}
          </span>
        </div>
        <p className="text-xs font-medium text-foreground line-clamp-1 break-all">{bid.procurementUnit}</p>
        <p className="mt-0.5 text-2xs text-muted-foreground line-clamp-2 break-all">{bid.projectName}</p>
        <div className="mt-1 flex items-center gap-2 text-2xs text-muted-foreground">
          <span>{bid.region}·{bid.industry}</span>
          {bid.budgetAmount && <span>预算 {bid.budgetAmount}万</span>}
        </div>
      </div>
      {actionSlot}
    </div>
  )
}
