import { mockBidOnePager } from '@/data/mock-data'
import { FileText, Tag, TrendingUp, Building2, Newspaper, Globe, BarChart3 } from 'lucide-react'

export function BidOnePager() {
  const data = mockBidOnePager

  // 历史交易：动态计算 Y 轴最大值与每年合计
  const cooperationData = data.historicalCooperation.data
  const maxAmount = Math.max(...cooperationData.flatMap(d => [d.REL, d.ISG, d.SSG]), 1)
  const chartMax = Math.ceil(maxAmount / 2000) * 2000  // 向上取 2000 整数倍
  const yTicks = Array.from({ length: 6 }, (_, i) => Math.round(chartMax - (chartMax / 5) * i))
  const totals = cooperationData.map(d => ({
    year: d.year,
    total: d.REL + d.ISG + d.SSG,
  }))

  return (
    <div className="text-sm text-foreground">
      {/* 1. 基础信息 */}
      <section>
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <FileText className="w-4 h-4" />
          基础信息
        </h3>
        <div className="grid grid-cols-2 gap-0 rounded-lg overflow-hidden border">
          <div className="bg-muted/40 p-3 col-span-2">
            <div className="text-xs text-muted-foreground mb-0.5">客户名称</div>
            <div className="text-sm font-semibold">{data.customerInfo.customerName}</div>
          </div>
          <div className="bg-background p-3 border-t">
            <div className="text-xs text-muted-foreground mb-0.5">客户编号</div>
            <div className="text-sm font-semibold">{data.customerInfo.uid}</div>
          </div>
          <div className="bg-muted/40 p-3 border-t">
            <div className="text-xs text-muted-foreground mb-0.5">行业纵队</div>
            <div className="text-sm font-semibold">{data.customerInfo.industryColumn}</div>
          </div>
          <div className="bg-background p-3 border-t col-span-2">
            <div className="text-xs text-muted-foreground mb-0.5">战区</div>
            <div className="text-sm font-semibold">{data.customerInfo.region}</div>
          </div>
        </div>
      </section>

      {/* 2. 客户标签 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <Tag className="w-4 h-4" />
          客户标签
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.customerTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* 3. 财报分析 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <TrendingUp className="w-4 h-4" />
          财报分析
        </h3>
        <div className="space-y-2">
          {data.financialAnalysis.split('\n').map((paragraph, idx) => (
            <p key={idx} className="text-sm leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* 4. 企业情报 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <Building2 className="w-4 h-4" />
          企业情报
        </h3>
        <div className="space-y-2">
          {data.enterpriseIntelligence.split('\n').map((paragraph, idx) => (
            <p key={idx} className="text-sm leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* 5. 历史交易 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <BarChart3 className="w-4 h-4" />
          历史交易
        </h3>

        {/* 柱状图 */}
        <div className="mb-4">
          <div className="text-xs text-muted-foreground mb-2">历史交易金额趋势</div>
          {/* 图例 */}
          <div className="flex items-center gap-4 mb-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span>REL</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>ISG</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
              <span>SSG</span>
            </div>
          </div>

          <div className="flex gap-4">
            {/* Y轴 */}
            <div className="flex flex-col justify-between text-xs text-muted-foreground text-right pr-2 py-1" style={{ height: 160 }}>
              {yTicks.map((t) => (
                <span key={t}>{t.toLocaleString()}</span>
              ))}
            </div>
            {/* 图表区域 */}
            <div className="flex-1 flex items-end justify-around gap-2" style={{ height: 160 }}>
              {cooperationData.map((d) => (
                <div key={d.year} className="flex flex-col items-center gap-1 flex-1">
                  <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: 140 }}>
                    <div
                      className="w-4 bg-blue-500 rounded-t-sm"
                      style={{ height: `${(d.REL / chartMax) * 140}px` }}
                      title={`REL: ${d.REL}`}
                    />
                    <div
                      className="w-4 bg-emerald-500 rounded-t-sm"
                      style={{ height: `${(d.ISG / chartMax) * 140}px` }}
                      title={`ISG: ${d.ISG}`}
                    />
                    <div
                      className="w-4 bg-orange-500 rounded-t-sm"
                      style={{ height: `${(d.SSG / chartMax) * 140}px` }}
                      title={`SSG: ${d.SSG}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{d.year}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right mt-1">金额 (万元)</div>
        </div>

        {/* 数据表格 */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-2.5 text-xs font-medium text-muted-foreground">BU</th>
                {cooperationData.map((d) => (
                  <th key={d.year} className="text-right p-2.5 text-xs font-medium text-muted-foreground">
                    {d.year}(万元)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2.5">REL</td>
                {cooperationData.map((d) => (
                  <td key={d.year} className="p-2.5 text-right">{d.REL.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="border-t bg-muted/20">
                <td className="p-2.5">ISG</td>
                {cooperationData.map((d) => (
                  <td key={d.year} className="p-2.5 text-right">{d.ISG.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="border-t">
                <td className="p-2.5">SSG</td>
                {cooperationData.map((d) => (
                  <td key={d.year} className="p-2.5 text-right">{d.SSG.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="border-t font-bold bg-muted/30">
                <td className="p-2.5">总计</td>
                {totals.map((t) => (
                  <td key={t.year} className="p-2.5 text-right">{t.total.toLocaleString()}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. 客户新闻 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <Newspaper className="w-4 h-4" />
          客户新闻
        </h3>
        <div className="space-y-3">
          {data.customerNews.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-sm leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* 7. 行业情报 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <Globe className="w-4 h-4" />
          行业情报
        </h3>
        <div className="space-y-2">
          {data.industryIntelligence.split('\n').map((paragraph, idx) => (
            <p key={idx} className="text-sm leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </section>
    </div>
  )
}
