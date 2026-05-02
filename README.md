# 销售通 - 智能标讯管理

> 面向传统制造业销售人员的移动端智能助手原型，通过 AI 对话交互帮助销售高效处理招标信息、关联商机。
> 配套 PC 分析看板实时汇聚多设备用户行为数据，用于原型测试验证。

## 在线访问

| 端 | 地址 |
|---|---|
| 📱 手机原型 | [luyi-chen.github.io/sales-lead-agent/](https://luyi-chen.github.io/sales-lead-agent/) |
| 📊 PC 分析看板 | [luyi-chen.github.io/sales-lead-agent/analytics](https://luyi-chen.github.io/sales-lead-agent/analytics) |

## 部署架构

```
┌───────────────────────────┐
│  📱 手机端 / 💻 PC 浏览器  │
└─────────┬─────────────────┘
          │ HTTPS
          ▼
┌───────────────────────────┐
│  GitHub Pages             │  ← 前端静态托管（dist/）
│  React SPA                │
└─────────┬─────────────────┘
          │ 跨域 HTTPS
          ▼
┌───────────────────────────┐
│  阿里云 FC 3.0            │  ← Serverless 分析 API
│  Node.js 18 事件驱动      │
└─────────┬─────────────────┘
          │ ali-oss SDK
          ▼
┌───────────────────────────┐
│  阿里云 OSS               │  ← JSON 文件持久化存储
│  analytics-data/          │
│  ├── chat-logs.json       │
│  └── click-paths.json     │
└───────────────────────────┘
```

**月度成本**：< 1 元（FC 免费额度 + OSS 极少存储量）

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

### 前端

| 类型 | 技术 | 版本 |
|------|------|------|
| 框架 | React + TypeScript (strict) | 18.3 / 5.6 |
| 构建 | Vite | 6.0 |
| 样式 | Tailwind CSS + CSS Variables 设计系统 | 3.4 |
| 路由 | React Router | v7 |
| 图标 | Lucide React | 0.468 |
| 状态管理 | React Context API | - |

### 后端 / 云服务

| 类型 | 技术 | 说明 |
|------|------|------|
| 云函数 | 阿里云 FC 3.0 | Node.js 18 内置运行时，事件驱动 Handler |
| 对象存储 | 阿里云 OSS | JSON 文件存储分析数据 |
| 前端托管 | GitHub Pages | 自动部署 gh-pages 分支 |
| 云端 SDK | ali-oss | OSS 读写操作 |

## 项目结构

```
src/
├── App.tsx                              # 路由入口（手机端 + PC 看板）
├── main.tsx                             # React 挂载点
├── index.css                            # 设计系统（颜色 tokens、间距、阴影）
│
├── data/
│   └── mock-data.ts                     # Mock 数据（20条真实标讯 + 商机）
│
├── store/
│   ├── app-store.tsx                    # 标讯业务状态管理（Context Provider）
│   └── analytics-store.tsx             # 行为分析数据管理（localStorage + FC API）
│
├── pages/
│   ├── HomePage.tsx                     # 主页（助手 Tab + 标讯列表 Tab）
│   ├── DetailPage.tsx                   # 标讯详情页（信息展示 + 商机操作）
│   └── AnalyticsPage.tsx               # PC 端分析看板
│
├── components/
│   ├── chat/
│   │   └── ChatTab.tsx                  # AI 助手对话（含意图识别引擎）
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
    └── supabase.ts                     # Supabase 连接器（可选）

aliyun-fc/                               # 阿里云 FC 云函数代码
├── index.js                             # FC 3.0 事件驱动 Handler
└── package.json                         # 云函数依赖（ali-oss）

vite-plugin-analytics-api.ts             # Vite 开发服务器分析 API 插件
.env.production                          # 生产环境变量（FC API 地址）
```

## 核心功能

### 1. AI 助手对话

以对话为中心的交互范式，前端规则引擎实现意图识别：

| 意图 | 示例输入 | 系统响应 |
|------|---------|---------|
| 问候 | "你好"、"hello" | 显示待处理标讯数量 + 快捷操作 |
| 统计 | "有多少标讯"、"统计" | 区域/行业/预算分布汇总 |
| 区域筛选 | "江苏的标讯" | 筛选该区域标讯列表 |
| 行业筛选 | "教育行业" | 筛选该行业标讯列表 |
| 预算筛选 | "预算超过500万" | 大项目排序列表（自动提取数字阈值） |
| 查看全部 | "所有标讯" | 完整列表 |
| 待处理 | "新的标讯" | 待处理标讯 |
| 商机关联 | "有哪些可以关联商机" | 匹配商机的标讯 |
| 关键词搜索 | "服务器"、"GPU" | 搜索标讯名称/摘要/关键词 |
| 帮助 | "你能做什么" | 功能说明 |

意图识别引擎位置：`src/components/chat/ChatTab.tsx` 第 584 行 `detectIntent()` 函数。

### 2. 标讯详情页

- 标讯基本信息展示（项目名称、采购单位、预算金额、截止时间等）
- 采购需求概况
- 匹配原因标签（替代传统的匹配百分比分数）
- 采购人联系方式（电话脱敏显示 + 拨号脱敏保护）
- 原始公告链接跳转
- 三种商机操作：关联已有商机 / 新建商机 / 标记无商机

### 3. PC 分析看板

| Tab | 模块 | 说明 |
|-----|------|------|
| 用户行为链路 | 用户列表 | 独立用户识别，彩色头像，事件/详情入口统计 |
| | 行为链路时间线 | 按会话折叠，逐条事件（对话/点击）时序展示 |
| | 详情页入口来源 | 区分"从对话列表"与"从标讯列表"进入详情页 |
| | 全局来源统计 | 所有用户进入详情页的来源占比 |
| 对话意图分析 | 意图分布 | 意图频率分布、Fallback 占比、意图覆盖率 |
| 点击路径分析 | 操作热力 | 操作时间线、热门功能排行、操作类别分布、页面活跃度 |
| — | 数据导出 | CSV 导出所有对话日志和点击路径（含 userId） |

PC 看板每 5 秒自动从云端拉取最新数据，汇聚所有设备的用户行为。

### 4. 用户识别系统

| 标识 | 存储方式 | 生命周期 | 说明 |
|------|---------|---------|------|
| `userId` | `localStorage` | 持久化（同一设备+浏览器） | 关闭浏览器后仍保留，用于跨会话识别同一用户 |
| `sessionId` | `sessionStorage` | 单次标签页 | 每次打开新标签页生成新 ID，用于区分独立会话 |

> **识别边界**：userId 基于设备 + 浏览器粒度。同一用户在手机和电脑上访问 = 2 个 userId；两位用户共用同一手机浏览器 = 1 个 userId。适用于原型测试场景，正式产品需对接账号体系。

### 5. 行为埋点系统

通过 `data-track` HTML 属性实现语义化追踪，无需修改业务逻辑：

```html
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

### 6. 数据流转

```
手机端用户操作
    ↓ ClickTracker 自动捕获（附 userId + sessionId）
localStorage 本地缓存 + POST 到 FC API（fire-and-forget）
    ↓ FC 云函数处理
读取 OSS JSON → 追加新记录 → 写回 OSS
    ↓ PC 看板定时拉取
用户行为链路 + 意图分析 + 点击热力 + CSV 导出
```

数据采用「离线优先」策略：先存 localStorage 再同步云端，网络异常不影响使用。

## 云函数 API

FC 云函数提供 RESTful 接口，代码位于 `aliyun-fc/index.js`：

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/chat` | 获取全部对话日志 |
| POST | `/chat` | 追加一条对话记录 |
| DELETE | `/chat` | 清空对话数据 |
| GET | `/clicks` | 获取全部点击路径 |
| POST | `/clicks` | 追加一条点击记录 |
| DELETE | `/clicks` | 清空点击数据 |

**环境变量**（在 FC 控制台配置）：

| 变量名 | 说明 | 示例值 |
|--------|------|-------|
| `OSS_REGION` | OSS 区域 | `oss-cn-beijing` |
| `OSS_BUCKET` | Bucket 名称 | `sales-lead-app` |
| `OSS_ACCESS_KEY_ID` | RAM AccessKey ID | - |
| `OSS_ACCESS_KEY_SECRET` | RAM AccessKey Secret | - |

**CORS 说明**：`Access-Control-Allow-Origin` 由 FC 平台 HTTP 触发器自动添加，云函数代码中不重复设置，避免浏览器因重复头拒绝请求。

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

### ChatLogEntry（对话日志）

```typescript
interface ChatLogEntry {
  id: string
  timestamp: string           // ISO 时间戳
  userInput: string           // 用户输入
  systemResponse: string      // 系统响应
  detectedIntent: string      // 识别的意图
  responseType: string        // 响应类型
  sessionId: string           // 会话 ID（sessionStorage，单次标签页）
  userId: string              // 用户 ID（localStorage，持久化）
}
```

### ClickPathEntry（点击路径）

```typescript
interface ClickPathEntry {
  id: string
  timestamp: string           // ISO 时间戳
  description: string         // 操作描述（data-track）
  category: string            // 操作类别（data-track-type）
  page: string                // 所在页面
  detail?: string             // 补充信息（data-track-detail）
  sessionId: string           // 会话 ID
  userId: string              // 用户 ID
}
```

## 生产部署

### 前端部署（GitHub Pages）

```bash
# 构建
npm run build

# 部署到 gh-pages 分支
npx gh-pages -d dist
```

GitHub 仓库 Settings → Pages → Source 选择 `gh-pages` 分支。

### 云函数部署（阿里云 FC）

1. 登录阿里云 FC 控制台，创建函数（Node.js 18 运行时）
2. 将 `aliyun-fc/index.js` 代码粘贴到在线编辑器
3. 在终端执行 `npm install ali-oss` 安装依赖
4. 配置环境变量（OSS 凭证，详见上方表格）
5. 创建 HTTP 触发器，设置「无需认证」
6. 将触发器 URL 填入 `.env.production`：

```bash
VITE_ANALYTICS_API=https://your-fc-trigger-url.cn-beijing.fcapp.run
```

7. 重新 `npm run build` 并部署前端

### 本地开发分析 API

开发模式下，`vite-plugin-analytics-api.ts` 提供本地分析 API，数据存储在 `.analytics-data/` 目录。无需连接远程 FC 即可完整开发和调试。

## 二次开发指南

### 改造入口速查

| 改造目标 | 修改文件 | 说明 |
|---------|---------|------|
| **替换 Mock 为真实 API** | `src/store/app-store.tsx` | 第 20 行 `useState(mockBids)` 改为异步 API 调用 |
| **修改/新增标讯字段** | `src/data/mock-data.ts` | BidInfo 接口定义 + mock 数据 |
| **调整对话意图/话术** | `src/components/chat/ChatTab.tsx` | `detectIntent()` 函数（第 584 行） |
| **修改标讯详情页布局** | `src/pages/DetailPage.tsx` | 各信息模块展示 |
| **修改标讯卡片样式** | `src/components/bid/BidCard.tsx` | 列表中每张卡片的展示 |
| **修改商机操作弹窗** | `src/components/bid/*.Sheet.tsx` | 三个底部操作面板 |
| **修改整体配色** | `src/index.css` | CSS Variables 设计 tokens |
| **修改路由/页面结构** | `src/App.tsx` | 路由定义 |
| **修改顶部 Tab** | `src/pages/HomePage.tsx` | 助手/标讯双 Tab 切换 |
| **新增/修改行为埋点** | 各组件的 `data-track` 属性 | 无需修改 JS 逻辑 |
| **修改部署路径** | `vite.config.ts` 中的 `base` | 当前为 `'/sales-lead-agent/'` |
| **修改云函数逻辑** | `aliyun-fc/index.js` | FC 3.0 事件驱动 Handler |

### 对接真实后端 API

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

- **开发环境**：分析 API 由 `vite-plugin-analytics-api.ts` 在本地提供，数据存储在 `.analytics-data/` 目录
- **生产环境**：分析数据通过 `VITE_ANALYTICS_API` 环境变量指向阿里云 FC API，持久化到 OSS
- Mock 数据包含 20 条真实格式的标讯记录，来自政府采购公告
- 手机端页面限制在 480px 宽度内，PC 看板无宽度限制
- 对话日志和点击路径数据存储在浏览器 localStorage 中（最多 5000 条/类），同时同步到云端
- 电话号码全程脱敏处理（中间四位显示为 `****`），点击拨号时同样显示脱敏号码（原型演示模式，不触发真实拨号）

## License

MIT
