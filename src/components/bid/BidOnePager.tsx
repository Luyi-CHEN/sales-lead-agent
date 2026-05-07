import { mockBidOnePager } from '@/data/mock-data'
import { FileText, Target, DollarSign, BarChart3, TrendingUp, Newspaper, BookOpen } from 'lucide-react'

export function BidOnePager() {
  const data = mockBidOnePager

  const externalPct = Math.round((data.itSpending.external / data.itSpending.total) * 100)
  const internalPct = 100 - externalPct

  const chartMax = 14000
  const cooperationData = data.historicalCooperation.data
  const totals = cooperationData.map(d => ({
    year: d.year,
    total: d.REL + d.ISG + d.SSG,
  }))

  return (
    <div className="text-sm text-foreground">
      {/* 1. 客户基础信息 */}
      <section>
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <FileText className="w-4 h-4" />
          基础信息
        </h3>
        <div className="grid grid-cols-2 gap-0 rounded-lg overflow-hidden border">
          <div className="bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground mb-0.5">客户编号</div>
            <div className="text-sm font-semibold">{data.customerInfo.uid}</div>
          </div>
          <div className="bg-background p-3">
            <div className="text-xs text-muted-foreground mb-0.5">战区/纵队</div>
            <div className="text-sm font-semibold">{data.customerInfo.region}</div>
          </div>
          <div className="bg-background p-3">
            <div className="text-xs text-muted-foreground mb-0.5">行业经理</div>
            <div className="text-sm font-semibold">{data.customerInfo.industryManager}</div>
          </div>
          <div className="bg-muted/40 p-3">
            <div className="text-xs text-muted-foreground mb-0.5">管理子行业</div>
            <div className="text-sm font-semibold">{data.customerInfo.subIndustry}</div>
          </div>
        </div>
      </section>

      {/* 2. IT信息化战略方向 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <Target className="w-4 h-4" />
          IT信息化战略方向
        </h3>
        <div className="bg-blue-50 border-l-[3px] border-blue-500 rounded-r-md p-4 text-sm leading-relaxed text-foreground">
          {data.itStrategy}
        </div>
      </section>

      {/* 3. IT Spending 分布 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <DollarSign className="w-4 h-4" />
          IT Spending 分布 (单位: 百万美元)
        </h3>
        <div className="flex items-center gap-8 mb-4">
          {/* 环形图 */}
          <div className="relative w-28 h-28 rounded-full flex-shrink-0" style={{ background: `conic-gradient(#3B82F6 0% ${externalPct}%, #10B981 ${externalPct}% 100%)` }}>
            <div className="absolute inset-0 m-auto w-16 h-16 bg-background rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">{data.itSpending.total} M$</span>
            </div>
          </div>
          {/* 图例 */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span>对外IT Spending {data.itSpending.external}M$ ({externalPct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>对内IT Spending {data.itSpending.internal}M$ ({internalPct}%)</span>
            </div>
          </div>
        </div>
        {/* 联想可参与份额 */}
        <div className="space-y-2">
          <div className="bg-blue-50 rounded-lg p-3 text-sm font-semibold text-foreground">
            对外IT Spending {data.itSpending.lenovoShare.total}M$
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground mb-0.5">桌面级硬件</div>
              <div className="text-sm font-semibold text-green-700">{data.itSpending.lenovoShare.desktop}M$</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground mb-0.5">企业级硬件</div>
              <div className="text-sm font-semibold text-blue-700">{data.itSpending.lenovoShare.enterprise}M$</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground mb-0.5">软件及服务</div>
              <div className="text-sm font-semibold text-yellow-700">{data.itSpending.lenovoShare.software}M$</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 产品可参与度 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <BarChart3 className="w-4 h-4" />
          产品可参与度 (%)
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.productParticipation.desktop}</div>
            <div className="text-xs text-muted-foreground mt-1">桌面级硬件</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.productParticipation.enterprise}</div>
            <div className="text-xs text-muted-foreground mt-1">企业级硬件</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{data.productParticipation.software}</div>
            <div className="text-xs text-muted-foreground mt-1">软件及服务</div>
          </div>
        </div>
      </section>

      {/* 5. SOW 产品占比 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <Target className="w-4 h-4" />
          SOW 产品占比 (%)
        </h3>
        <div className="space-y-3">
          {data.sowProducts.map((item) => (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{item.name}</span>
                <span className="text-sm font-semibold">{item.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. 历史合作 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <TrendingUp className="w-4 h-4" />
          历史合作
        </h3>

        {/* 柱状图 */}
        <div className="mb-4">
          <div className="text-xs text-muted-foreground mb-2">历史合作金额趋势</div>
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
              <span>14000</span>
              <span>12000</span>
              <span>10000</span>
              <span>8000</span>
              <span>6000</span>
              <span>4000</span>
              <span>2000</span>
              <span>0</span>
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
                <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">FY2023(万元)</th>
                <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">FY2024(万元)</th>
                <th className="text-right p-2.5 text-xs font-medium text-muted-foreground">FY2025(万元)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2.5">REL</td>
                <td className="p-2.5 text-right">{cooperationData[0].REL.toLocaleString()}</td>
                <td className="p-2.5 text-right">{cooperationData[1].REL.toLocaleString()}</td>
                <td className="p-2.5 text-right">{cooperationData[2].REL.toLocaleString()}</td>
              </tr>
              <tr className="border-t bg-muted/20">
                <td className="p-2.5">ISG</td>
                <td className="p-2.5 text-right">{cooperationData[0].ISG.toLocaleString()}</td>
                <td className="p-2.5 text-right">{cooperationData[1].ISG.toLocaleString()}</td>
                <td className="p-2.5 text-right">{cooperationData[2].ISG.toLocaleString()}</td>
              </tr>
              <tr className="border-t">
                <td className="p-2.5">SSG</td>
                <td className="p-2.5 text-right">{cooperationData[0].SSG.toLocaleString()}</td>
                <td className="p-2.5 text-right">{cooperationData[1].SSG.toLocaleString()}</td>
                <td className="p-2.5 text-right">{cooperationData[2].SSG.toLocaleString()}</td>
              </tr>
              <tr className="border-t font-bold bg-muted/30">
                <td className="p-2.5">总计</td>
                <td className="p-2.5 text-right">{totals[0].total.toLocaleString()}</td>
                <td className="p-2.5 text-right">{totals[1].total.toLocaleString()}</td>
                <td className="p-2.5 text-right">{totals[2].total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. 经营分析 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <TrendingUp className="w-4 h-4" />
          经营分析
        </h3>
        <p className="text-sm leading-relaxed text-foreground">
          {data.businessAnalysis}
        </p>
      </section>

      {/* 8. 近期动态 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <Newspaper className="w-4 h-4" />
          近期动态
        </h3>
        <div className="space-y-3">
          {data.recentNews.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-sm leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* 9. 历史案例推荐 */}
      <section className="border-t border-border/50 pt-4 mt-4">
        <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
          <BookOpen className="w-4 h-4" />
          历史案例推荐
        </h3>
        <div className="rounded-xl border bg-card p-4">
          {data.caseStudy.split('\n\n').map((block, idx) => {
            const lines = block.split('\n')
            const title = lines[0]
            const body = lines.slice(1).join('\n')
            return (
              <div key={idx}>
                <div className="font-semibold text-sm mb-2">{title}</div>
                {body && (
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
