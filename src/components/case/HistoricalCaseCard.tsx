import { type HistoricalCase } from '@/data/mock-data'
import { Calendar, Package, Target, Users, Banknote } from 'lucide-react'

interface HistoricalCaseCardProps {
  data: HistoricalCase
}

export function HistoricalCaseCard({ data }: HistoricalCaseCardProps) {
  return (
    <div
      className="bg-card rounded-xl border p-4"
      style={{ boxShadow: 'var(--shadow-card)' }}
      data-track="案例卡片浏览"
      data-track-detail={`${data.customerName}|${data.projectName}|$${data.totalAmount}M`}
    >
      {/* 顶部：客户名称 + 总金额徽章 */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-foreground leading-snug flex-1 break-words">
          {data.customerName}
        </h3>
        <span className="shrink-0 inline-flex items-center gap-0.5 rounded-md bg-[hsl(38_95%_94%)] px-2 py-0.5 text-xs font-bold text-[hsl(28_85%_45%)]">
          <Banknote className="h-3 w-3" />
          ${data.totalAmount}M
        </span>
      </div>

      {/* 行业 / 子行业 / 战区 徽章组 */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
        <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-2xs font-medium text-primary">
          {data.industry}
        </span>
        <span className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-2xs font-medium text-muted-foreground">
          {data.subIndustry}
        </span>
        <span className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-2xs font-medium text-muted-foreground">
          {data.region}战区
        </span>
      </div>

      {/* 项目名称 */}
      <p className="text-sm text-foreground font-medium mb-3 leading-relaxed break-words">
        {data.projectName}
      </p>

      {/* 关键信息：3 行布局 */}
      <div className="space-y-2 mb-3 rounded-lg bg-muted/30 p-2.5">
        <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="下单时间" value={data.orderTime} />
        <InfoRow icon={<Package className="h-3.5 w-3.5" />} label="产品" value={data.product} />
        <InfoRow icon={<Target className="h-3.5 w-3.5" />} label="业务场景" value={data.businessScenario} />
      </div>

      {/* 团队成员 */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2.5">
        <Users className="h-3.5 w-3.5 shrink-0" />
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span><span className="text-muted-foreground/70 mr-1">AR</span><span className="font-medium text-foreground">{data.ar}</span></span>
          <span><span className="text-muted-foreground/70 mr-1">SS</span><span className="font-medium text-foreground">{data.ss}</span></span>
          <span><span className="text-muted-foreground/70 mr-1">SE</span><span className="font-medium text-foreground">{data.se}</span></span>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-muted-foreground shrink-0 w-16">{label}</span>
      <span className="text-foreground font-medium break-words">{value}</span>
    </div>
  )
}
