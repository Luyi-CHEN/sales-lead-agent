import { Settings, ChevronRight, Bell, Shield, HelpCircle, LogOut } from 'lucide-react'

export function ProfilePage() {
  const menuItems = [
    { icon: Bell, label: '通知设置', desc: '管理标讯推送提醒' },
    { icon: Shield, label: '数据权限', desc: '查看可见区域和类别' },
    { icon: Settings, label: '偏好设置', desc: '匹配规则与筛选条件' },
    { icon: HelpCircle, label: '使用帮助', desc: '操作指引与常见问题' },
  ]

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="sticky top-0 z-20 bg-card px-4 py-3 border-b">
        <h1 className="text-xl font-bold text-foreground">我的</h1>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 pb-24">
        {/* Profile Card */}
        <div className="rounded-xl border bg-card p-4 mb-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              张
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-foreground">张伟</h2>
              <p className="text-xs text-muted-foreground">华东区域销售经理</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">156</p>
              <p className="text-2xs text-muted-foreground">累计标讯</p>
            </div>
            <div className="text-center border-x">
              <p className="text-lg font-bold text-foreground">43</p>
              <p className="text-2xs text-muted-foreground">已转商机</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-success">27.6%</p>
              <p className="text-2xs text-muted-foreground">转化率</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="rounded-xl border bg-card overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          {menuItems.map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-secondary ${
                  i < menuItems.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-2xs text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            )
          })}
        </div>

        {/* Logout */}
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border bg-card py-3 text-sm font-medium text-destructive active:bg-secondary"
          style={{ boxShadow: 'var(--shadow-card)' }}>
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>
    </div>
  )
}