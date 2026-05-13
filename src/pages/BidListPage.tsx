import { PageHeader } from '@/components/layout/PageHeader'
import { BidListTab } from '@/components/bid/BidListTab'

/**
 * 标讯管理独立页面
 * 从「全部应用 / 任务操作中心 / 标讯管理」入口进入
 * 复用项目原有的 BidListTab 列表组件 + 顶部返回标题栏
 */
export function BidListPage() {
  return (
    <div className="flex h-full flex-col bg-background">
      <PageHeader title="标讯列表" />
      <div className="flex-1 overflow-hidden">
        <BidListTab />
      </div>
    </div>
  )
}
