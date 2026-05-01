import { BarChart3 } from 'lucide-react'

export function StatsPage() {
  const stats = [
    { label: '本月标讯', value: '28', change: '+12%' },
    { label: '已处理', value: '19', change: '+8%' },
    { label: '关联商机', value: '7', change: '+3' },
    { label: '待处理', value: '9', change: '-' },
  ]

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="sticky top-0 z-20 bg-card px-4 py-3 border-b">
        <h1 className="text-xl font-bold text-foreground">数据统计</h1>
        <p className="text-xs text-muted-foreground mt-0.5">2026年5月</p>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 pb-24">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
              <p className="text-2xs text-muted-foreground mb-1">{s.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-foreground">{s.value}</span>
                <span className="text-2xs font-medium text-success mb-1">{s.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder chart area */}
        <div className="rounded-xl border bg-card p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-sm font-semibold text-foreground mb-3">处理趋势</h3>
          <div className="flex items-end justify-between gap-2 h-32 px-2">
            {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-primary/20 transition-all duration-500"
                  style={{ height: `${h}%` }}
                >
                  <div
                    className="w-full rounded-t-md bg-primary transition-all duration-700"
                    style={{ height: `${Math.min(100, h * 0.7)}%`, marginTop: `${100 - Math.min(100, h * 0.7)}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {['一', '二', '三', '四', '五', '六', '日'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion */}
        <div className="mt-3 rounded-xl border bg-card p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            转化分析
          </h3>
          <div className="flex flex-col gap-3">
            <ProgressRow label="标讯→商机转化率" value={36} />
            <ProgressRow label="关联已有商机" value={58} />
            <ProgressRow label="新建商机" value={42} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}