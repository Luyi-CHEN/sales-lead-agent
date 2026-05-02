# 销售通 - 智能标讯管理

> 面向传统制造业销售人员的移动端智能助手原型，通过 AI 对话交互帮助销售高效处理招标信息、关联商机。

## 快速开始

```bash
# 克隆项目
git clone https://github.com/Luyi-CHEN/sales-lead-agent.git
cd sales-lead-agent

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动后访问：

| 端 | 地址 | 说明 |
|---|---|---|
| 手机原型 | `http://localhost:5173/sales-lead-agent/` | 480px 移动端界面 |
| PC 分析看板 | `http://localhost:5173/sales-lead-agent/analytics` | 用户行为分析后台 |

> 手机端可通过局域网 IP 访问（如 `http://192.168.x.x:5173/sales-lead-agent/`），开发服务器已默认启用 `--host`。

## 技术栈

| 类型 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 样式 | Tailwind CSS 3 + CSS Variables 设计系统 |
| 路由 | React Router v7 |
| 图标 | Lucide React |
| 状态管理 | React Context API |

## 项目结构

```
src/
├── App.tsx                              # 路由入口（手机端 + PC 看板）
├── main.tsx                             # React 挂载点
├── index.css                            # 设计系统（颜色 tokens、间距、阴影）
│
├── data/
│   └── mock-data.ts                     # ⭐ Mock 数据（BidInfo + Opportunity 接口定义）
│
├── store/
│   ├── app-store.tsx                    # 标讯状态管理（Context Provider）
│   └── analytics-store.tsx             # 行为分析数据（localStorage + 服务端 API）
│
├── pages/
│   ├── HomePage.tsx                     # 主页（助手 Tab + 标讯列表 Tab）
│   ├── DetailPage.tsx                   # 标讯详情页（信息展示 + 商机操作）
│   └── AnalyticsPage.tsx               # PC 端分析看板
│
├── components/
│   ├── chat/
│   │   └── ChatTab.tsx                  # ⭐ AI 助手对话（含意图识别引擎）
│   │
│   ├── bid/
│   │   ├── BidCard.tsx                  # 标讯卡片组件
│   │   ├── BidListTab.tsx              # 标讯列表 + 筛选
│   │   ├── LinkOpportunitySheet.tsx    # 关联已有商机弹窗
│   │   ├── CreateOpportunitySheet.tsx  # 新建商机弹窗
│   │   └── NoOpportunitySheet.tsx      # 标记无商机弹窗
│   │
│   ├── analytics/
│   │   └── ClickTracker.tsx            # 用户点击行为追踪（data-track 属性）
│   │
│   ├── layout/
│   │   └── PageHeader.tsx              # 通用页头
│   │
│   └── ui/                             # 基础 UI 组件（Button, Badge, Toast）
│
└── lib/
    ├── utils.ts                        # 工具函数
    └── supabase.ts                     # Supabase 云端连接（可选）

vite-plugin-analytics-api.ts            # Vite 开发服务器分析 API 插件
vite.config.ts                          # Vite 配置
supabase-setup.sql                      # Supabase 建表脚本（云端部署用）
```

## 核心功能

### 1. AI 助手对话（ChatTab）

以对话为中心的交互范式，支持自然语言查询标讯：

| 意图 | 示例输入 | 系统响应 |
|------|---------|---------|
| 问候 | "你好"、"hello" | 显示待处理标讯数量 + 快捷操作 |
| 统计 | "有多少标讯"、"统计" | 区域/行业/预算分布汇总 |
| 区域筛选 | "江苏的标讯" | 筛选该区域标讯列表 |
| 行业筛选 | "教育行业" | 筛选该行业标讯列表 |
| 预算筛选 | "预算超过500万" | 大项目排序列表 |
| 查看全部 | "所有标讯" | 完整列表 |
| 待处理 | "新的标讯" | 待处理标讯 |
| 商机关联 | "有哪些可以关联商机" | 匹配商机的标讯 |
| 关键词搜索 | "服务器"、"GPU" | 按关键词搜索 |
| 帮助 | "你能做什么" | 功能说明 |

**意图识别引擎位置**：`src/components/chat/ChatTab.tsx` 第 584 行 `detectIntent()` 函数。

### 2. 标讯详情页（DetailPage）

- 标讯基本信息展示（项目名称、采购单位、预算金额、截止时间等）
- 采购需求概况
- 匹配原因标签（替代传统的匹配百分比分数）
- 采购人联系方式（点击按钮直接调起手机拨号，使用 `tel:` 协议）
- 原始公告链接跳转
- 三种商机操作：关联已有商机 / 新建商机 / 标记无商机

### 3. PC 分析看板（AnalyticsPage）

| 模块 | 说明 |
|------|------|
| 对话意图分析 | 意图频率分布、Fallback 占比、意图覆盖率 |
| 点击路径分析 | 操作时间线、热门功能排行、操作类别分布、页面活跃度 |
| 数据导出 | CSV 导出所有对话日志和点击路径 |

### 4. 行为埋点系统

通过 `data-track` HTML 属性实现语义化追踪，无需修改业务逻辑：

```html
<!-- 示例：在任何可点击元素上添加 -->
<button
  data-track="查看标讯详情"
  data-track-type="标讯浏览"
  data-track-detail={bid.projectName}
>
```

| 属性 | 作用 | 示例值 |
|------|------|-------|
| `data-track` | 操作描述（中文） | "查看标讯详情"、"筛选「教育」标讯" |
| `data-track-type` | 操作类别 | 导航、标讯浏览、商机处理、筛选、对话交互 |
| `data-track-detail` | 补充信息 | 项目名称、筛选值等 |

## 数据模型

### BidInfo（标讯）

```typescript
interface BidInfo {
  id: string
  bu: string                 // 事业部
  bidType: string            // 标讯类型
  region: string             // 战区
  province: string           // 省份
  city: string               // 城市
  industry: string           // 主行业
  announcementName: string   // 公告名称
  procurementUnit: string    // 采购单位
  projectName: string        // 项目名称
  procurementSummary: string // 采购需求概况
  totalQuantity: string      // 数量总计
  keywords: string           // 关键词
  budgetAmount: string       // 预算金额（万元）
  startDate: string          // 预计采购开始时间
  deadline: string           // 预计采购截止时间
  contactPhone: string       // 采购人电话
  contactPerson: string      // 采购人联系人
  sourceUrl: string          // 原始公告链接
  status: 'pending' | 'linked' | 'no_opportunity' | 'new_opportunity'
  isRead: boolean
  relatedOpportunityCount: number
  relatedOpportunityId?: string
}
```

### Opportunity（商机）

```typescript
interface Opportunity {
  id: string
  name: string
  customerName: string
  stage: string
  amount: string
  owner: string
  probability: number
  createDate: string
}
```

## 二次开发指南

### 改造入口速查

| 改造目标 | 修改文件 | 说明 |
|---------|---------|------|
| **替换 Mock 数据为真实 API** | `src/store/app-store.tsx` | 第 20 行 `useState(mockBids)` 改为异步 API 调用 |
| **修改/新增标讯字段** | `src/data/mock-data.ts` | BidInfo 接口定义 + mock 数据 |
| **调整对话意图/话术** | `src/components/chat/ChatTab.tsx` | `detectIntent()` 函数（第 584 行） |
| **修改标讯详情页布局** | `src/pages/DetailPage.tsx` | 各信息模块展示 |
| **修改标讯卡片样式** | `src/components/bid/BidCard.tsx` | 列表中每张卡片的展示 |
| **修改商机操作弹窗** | `src/components/bid/Create\|Link\|NoOpportunitySheet.tsx` | 三个底部操作面板 |
| **修改整体配色** | `src/index.css` | CSS Variables 设计 tokens |
| **修改路由/页面结构** | `src/App.tsx` | 路由定义 |
| **修改顶部 Tab** | `src/pages/HomePage.tsx` | 助手/标讯双 Tab 切换 |
| **新增/修改行为埋点** | 各组件的 `data-track` 属性 | 无需修改 JS 逻辑 |
| **修改部署路径** | `vite.config.ts` 中的 `base` | 当前为 `'/sales-lead-agent/'` |

### 对接真实 API 的改造步骤

原型中所有数据来自 `src/data/mock-data.ts`，对接后端 API 只需改 **2 个文件**：

**第一步**：创建 API 客户端

```typescript
// src/lib/api.ts（新建）
const BASE = import.meta.env.VITE_API_BASE || '/api'

export const api = {
  getBids:          (params?) => fetch(`${BASE}/bids?${new URLSearchParams(params)}`).then(r => r.json()),
  getBidDetail:     (id: string) => fetch(`${BASE}/bids/${id}`).then(r => r.json()),
  getOpportunities: (q?: string) => fetch(`${BASE}/opportunities?q=${q || ''}`).then(r => r.json()),
  createOpportunity:(data: any) => fetch(`${BASE}/opportunities`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }),
  linkBid:          (bidId: string, oppId: string) => fetch(`${BASE}/bids/${bidId}/link`, { method: 'POST', body: JSON.stringify({oppId}) }),
  markNoOpportunity:(bidId: string, reason: string) => fetch(`${BASE}/bids/${bidId}/feedback`, { method: 'POST', body: JSON.stringify({reason}) }),
}
```

**第二步**：修改 `app-store.tsx`

```diff
- import { mockBids } from '@/data/mock-data'
+ import { api } from '@/lib/api'

  export function AppProvider({ children }) {
-   const [bids, setBids] = useState<BidInfo[]>(mockBids)
+   const [bids, setBids] = useState<BidInfo[]>([])
+
+   useEffect(() => {
+     api.getBids().then(setBids)
+   }, [])
  }
```

**其余 UI 组件无需任何改动**，因为它们通过 `useAppState()` hook 获取数据。

### 需要的后端 API 清单

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/bids` | 标讯列表（支持分页、筛选） |
| GET | `/api/bids/:id` | 标讯详情 |
| POST | `/api/bids/:id/link` | 关联标讯到已有商机 |
| POST | `/api/bids/:id/feedback` | 标记无商机（含原因） |
| GET | `/api/opportunities` | 商机列表（搜索） |
| POST | `/api/opportunities` | 从标讯新建商机 |

## 设计系统

配色基于 CSS Variables 定义在 `src/index.css`，使用 HSL 格式：

```css
:root {
  --background: 0 0% 97.5%;    /* 页面背景 */
  --foreground: 222 47% 11%;   /* 主文字 */
  --primary: 221 83% 53%;      /* 主色调（蓝） */
  --success: 142 71% 45%;      /* 成功（绿） */
  --destructive: 0 84% 60%;    /* 危险（红） */
  --accent: 210 40% 96%;       /* 强调背景 */
  --muted-foreground: 215 16% 47%; /* 次要文字 */
}
```

修改这些变量即可全局换肤，无需逐个组件调整。

## 常用命令

```bash
npm run dev       # 启动开发服务器（含 --host 支持局域网访问）
npm run build     # TypeScript 检查 + 生产构建
npm run preview   # 预览生产构建
```

## 注意事项

- 开发服务器的分析 API（`vite-plugin-analytics-api.ts`）仅在 `npm run dev` 时可用，生产构建需要对接 Supabase 或自建后端
- Mock 数据包含 20 条真实格式的标讯记录，来自政府采购公告
- 手机端页面限制在 480px 宽度内，PC 看板无宽度限制
- 对话日志和点击路径数据存储在浏览器 localStorage 中（最多 5000 条/类），开发模式同时同步到服务端 JSON 文件

## License

MIT
