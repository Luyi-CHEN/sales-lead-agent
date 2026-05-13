import {
  FileCheck2,
  Receipt,
  BookMarked,
  MonitorSmartphone,
  Laptop2,
  ClipboardList,
  Upload,
  CalendarDays,
  PackageOpen,
  BarChart3,
  Printer,
  Crosshair,
  UserPlus,
  CheckSquare2,
  UploadCloud,
  Box,
  Inbox,
  Tv,
  Layers3,
  GraduationCap,
  Shield,
  FileBarChart,
  PieChart,
  Megaphone,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAnalytics } from '@/store/analytics-store'

// ==========================================
// 应用入口定义
// ==========================================
type AppEntry = { label: string; icon: LucideIcon; route?: string }
type AppGroup = { title: string; apps: AppEntry[] }

const APP_GROUPS: AppGroup[] = [
  {
    title: '常用应用',
    apps: [
      { label: '审批中心', icon: FileCheck2 },
      { label: '政采清单', icon: Receipt },
      { label: '投标资质', icon: BookMarked },
      { label: '联想工作台', icon: MonitorSmartphone },
    ],
  },
  {
    title: '任务操作中心',
    apps: [
      { label: '样机管理系统', icon: Laptop2 },
      { label: '审批中心', icon: ClipboardList },
      { label: '商机报备', icon: Upload },
      { label: 'Account Plan', icon: CalendarDays },
      { label: '库存上报', icon: PackageOpen },
      { label: '线索管理', icon: BarChart3 },
      { label: '智能设备开发', icon: Printer },
      { label: '测试定位', icon: Crosshair },
      { label: '客户拜访', icon: UserPlus },
      { label: '任务中心', icon: CheckSquare2 },
      { label: '一键call high', icon: UploadCloud },
      { label: '标讯管理', icon: Megaphone, route: '/bids' },
    ],
  },
  {
    title: '内容操作中心',
    apps: [
      { label: '方案展示中心', icon: Box },
      { label: '故障工单', icon: Inbox },
      { label: '直播', icon: Tv },
      { label: '行业纵队', icon: Layers3 },
      { label: 'KT', icon: GraduationCap },
      { label: 'ISG', icon: Shield },
      { label: '培训报表', icon: FileBarChart },
      { label: '数据看板', icon: PieChart },
    ],
  },
]

// ==========================================
// AppsTab — 应用中心 / 全部应用
// ==========================================
export function AppsTab() {
  const { logClick } = useAnalytics()
  const navigate = useNavigate()

  const handleAppClick = (groupTitle: string, app: AppEntry) => {
    logClick({
      description: `点击应用入口「${app.label}」`,
      category: '应用中心',
      page: '首页-全部应用',
      detail: `${groupTitle} / ${app.label}`,
    })
    if (app.route) {
      navigate(app.route)
    }
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-3 pt-3 pb-20">
      <div className="flex flex-col gap-3">
        {APP_GROUPS.map(group => (
          <section
            key={group.title}
            className="relative rounded-2xl bg-white/85 backdrop-blur-sm px-4 pt-3.5 pb-4 shadow-[0_6px_20px_-10px_rgba(100,80,200,0.18)]"
          >
            {/* 分组标题 */}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[13px] font-medium text-muted-foreground">
                {group.title}
              </h3>
            </div>

            {/* 应用图标 4 列网格 */}
            <div className="grid grid-cols-4 gap-y-4 gap-x-2">
              {group.apps.map(app => {
                const Icon = app.icon
                return (
                  <button
                    key={app.label}
                    onClick={() => handleAppClick(group.title, app)}
                    data-track={`点击应用「${app.label}」`}
                    data-track-type="应用入口"
                    data-track-detail={`${group.title}/${app.label}`}
                    className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[hsl(248_40%_96%)]">
                      <Icon className="h-5 w-5 text-[hsl(232_70%_58%)]" strokeWidth={1.8} />
                    </span>
                    <span className="text-[11.5px] leading-tight text-foreground/85 text-center line-clamp-1 w-full px-0.5">
                      {app.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
