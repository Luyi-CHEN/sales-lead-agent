import { type BidInfo, industryColors } from '@/data/mock-data'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Link2 } from 'lucide-react'

interface BidCardProps {
  bid: BidInfo
  onClick: () => void
}

const statusConfig = {
  pending: { label: '待处理', variant: 'new' as const },
  linked: { label: '已关联商机', variant: 'done' as const },
  no_opportunity: { label: '无商机反馈', variant: 'destructive' as const },
  new_opportunity: { label: '已新建商机', variant: 'done' as const },
}

export function BidCard({ bid, onClick }: BidCardProps) {
  const status = statusConfig[bid.status]
  const industryClass = industryColors[bid.industry] || 'bg-secondary text-muted-foreground'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
      data-track="查看标讯详情"
      data-track-type="标讯浏览"
      data-track-detail={bid.projectName}
      className="card-press relative cursor-pointer rounded-xl border bg-card p-4"
      style={{ boxShadow: 'var(--shadow-card)', position: 'relative', zIndex: 1 }}
    >
      {/* Unread indicator */}
      {!bid.isRead && (
        <span className="absolute top-4 right-4 dot-pulse" />
      )}

      {/* Header: status + BU + bidType + industry + related opportunity tag */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <Badge variant={status.variant}>{status.label}</Badge>
        <span className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-2xs font-medium text-muted-foreground">
          {bid.bu}
        </span>
        <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-2xs font-medium text-primary">
          {bid.bidType}
        </span>
        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-2xs font-medium ${industryClass}`}>
          {bid.industry}
        </span>
        {bid.status === 'pending' && bid.relatedOpportunityCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-2xs font-medium text-primary ml-auto">
            <Link2 className="h-2.5 w-2.5" />
            可能关联 {bid.relatedOpportunityCount} 条商机
          </span>
        )}
      </div>

      {/* Project Name */}
      <h3 className="text-sm font-semibold text-foreground leading-snug mb-1 pr-4 line-clamp-2">
        {bid.projectName}
      </h3>

      {/* Procurement Unit */}
      <p className="text-xs text-muted-foreground mb-2.5 truncate">
        {bid.procurementUnit || '未公示采购单位'}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-2xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {bid.region} · {bid.city}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {bid.deadline}
        </span>
        <span className="ml-auto text-xs font-semibold text-foreground">
          ¥{bid.budgetAmount}万
        </span>
      </div>
    </div>
  )
}
