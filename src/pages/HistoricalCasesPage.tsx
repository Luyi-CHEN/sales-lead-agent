import { PageHeader } from '@/components/layout/PageHeader'
import { HistoricalCaseCard } from '@/components/case/HistoricalCaseCard'
import { mockHistoricalCases } from '@/data/mock-data'

export function HistoricalCasesPage() {
  const cases = mockHistoricalCases

  return (
    <div className="flex h-full flex-col bg-background">
      <PageHeader title="历史案例推荐" />
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-6">
        {/* 顶部说明栏 */}
        <div className="mx-4 mt-3 rounded-lg bg-primary/5 border border-primary/15 px-3 py-2">
          <p className="text-xs text-foreground/80 leading-relaxed">
            为您推荐 <span className="font-semibold text-primary">{cases.length}</span> 条历史成交案例，推荐逻辑：若为库内客户，展示近三个月该客户历史订单；若为非库内客户，展示同产品+同战区+同一级行业的近三个月历史订单。
          </p>
        </div>

        {/* 案例卡片列表 */}
        <div className="mx-4 mt-3 space-y-3">
          {cases.map((c) => (
            <HistoricalCaseCard key={c.id} data={c} />
          ))}
        </div>
      </div>
    </div>
  )
}
