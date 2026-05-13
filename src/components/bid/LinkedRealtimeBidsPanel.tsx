import { type BidInfo } from '@/data/mock-data'
import { Radio, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface LinkedRealtimeBidsPanelProps {
  bids: BidInfo[]    // 反向关联的实时招标列表
}

export function LinkedRealtimeBidsPanel({ bids }: LinkedRealtimeBidsPanelProps) {
  const navigate = useNavigate()
  if (bids.length === 0) return null

  return (
    <div
      className="bg-card mx-4 mt-3 rounded-xl border p-4"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <Radio className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">关联的实时招标</span>
        <span className="text-2xs text-muted-foreground">共 {bids.length} 条</span>
      </div>

      <div className="space-y-2">
        {bids.map(b => (
          <div
            key={b.id}
            onClick={() => navigate(`/bid/${b.id}`)}
            data-track="点击关联实时招标卡片"
            data-track-type="标讯关联"
            data-track-detail={b.id}
            className="flex items-start gap-2 rounded-lg border bg-secondary/30 p-2.5 cursor-pointer active:bg-accent transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-2xs font-medium text-primary">
                  {b.bidType}
                </span>
                <span className="text-2xs text-muted-foreground">{b.id}</span>
              </div>
              <p className="text-xs font-medium text-foreground line-clamp-2 break-all leading-snug">
                {b.announcementName || b.projectName}
              </p>
              <div className="mt-1 flex items-center gap-2 text-2xs text-muted-foreground">
                <span>{b.region}·{b.industry}</span>
                {b.budgetAmount && <span>预算 {b.budgetAmount}万</span>}
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-1 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
