# 销售通 - 智能标讯管理

> 面向传统制造业销售人员的移动端智能助手原型，通过 AI 对话交互帮助销售高效处理招标信息、关联商机。
> 配套 PC 分析看板实时汇聚多设备用户行为数据，用于原型测试验证。

## 在线访问

| 端 | 地址 |
|---|---|
| 📱 手机端原型 | [https://luyi-chen.github.io/sales-lead-agent/](https://luyi-chen.github.io/sales-lead-agent/) |
| 📊 PC端分析看板 | [https://luyi-chen.github.io/sales-lead-agent/analytics](https://luyi-chen.github.io/sales-lead-agent/analytics) |

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
│   ├── BidOnePagerPage.tsx             # 标讯一纸通独立页面
│   └── AnalyticsPage.tsx               # PC 端分析看板
│
├── components/
│   ├── chat/
│   │   └── ChatTab.tsx                  # AI 助手对话（含意图识别引擎）
│   │
│   ├── bid/
│   │   ├── BidCard.tsx                  # 标讯卡片组件
│   │   ├── BidListTab.tsx              # 标讯列表 + 筛选
│   │   ├── CreateOpportunitySheet.tsx  # 新建商机弹窗
│   │   ├── NoOpportunitySheet.tsx      # 标记无商机弹窗
│   │   ├── BidOnePager.tsx             # 标讯一纸通展示组件
│   │   ├── IntentMatchPanel.tsx        # 实时招标关联意向招标（Banner + Sheet 双组件）
│   │   └── LinkedRealtimeBidsPanel.tsx # 意向招标反向展示关联的实时招标列表
│   │
│   ├── case/
│   │   └── HistoricalCaseCard.tsx      # 历史成单案例卡片
│   │
│   ├── apps/
│   │   └── AppsTab.tsx                  # 应用中心 Tab（三级入口页）
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

pages/
├── HomePage.tsx                         # 主页（助手 Tab + 标讯列表 Tab + 应用中心 Tab）
├── BidListPage.tsx                      # 标讯管理独立页（从应用中心进入）
├── DetailPage.tsx                       # 标讯详情页（信息展示 + 商机操作 + 关联决策）
├── BidOnePagerPage.tsx                 # 标讯一纸通独立页面
├── HistoricalCasesPage.tsx             # 历史案例推荐页（从详情页进入）
└── AnalyticsPage.tsx                   # PC 端分析看板

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
| 关键词搜索 | "服务器"、"GPU" | 搜索标讯名称/摘要/关键词 |
| 帮助 | "你能做什么" | 功能说明 |

意图识别引擎位置：`src/components/chat/ChatTab.tsx` 第 584 行 `detectIntent()` 函数。

**对话意图筛选优化**：用户在对话中通过自然语言筛选（如行业、区域）时，卡片列表会精确展示筛选后的标讯数据，而不是全部数据。支持行业/区域筛选后精确展示对应标讯卡片，确保筛选结果与用户意图一致。

**对话窗口标讯卡片**：对话中展示的标讯卡片默认只展示前 3 条，不提供展开按钮，用户可通过快捷操作「查看全部标讯」查看完整列表。卡片样式与通用列表卡片（`BidCard`）统一，采用三行布局：
- 第一行：状态标签 + 行业标签
- 第二行：项目名称
- 第三行：地区城市 + 截止日期 + 预算金额

### 2. 标讯详情页

- 标讯基本信息展示（项目名称、采购单位、预算金额、截止时间等）
- CDBID 展示（有值显示编号，无值显示"暂无"）
- 采购需求概况
- **标讯一纸通入口卡片**：点击跳转至独立页面（路由 `/bid/:id/one-pager`），展示客户全景画像
- 匹配原因标签（替代传统的匹配百分比分数）
- 采购人联系方式（电话脱敏显示 + 拨号脱敏保护）
  - **电话按钮交互优化**：点击后使用 Toast 组件提示脱敏号码（替代原 `window.alert`，移动端兼容性更好），避免移动端弹窗无响应问题
  - 按钮使用 `<button>` 元素，添加 `active:scale-95` 点击缩放动画反馈，提升触控体验
  - 补充 `data-track="拨号采购人"` 埋点属性，PC 分析看板可统计用户拨号行为
- 原始公告链接跳转
- **产品信息模块**：展示产品标签、标讯关键词、产品经理三个字段
- 商机操作：【关联已有商机】【新建商机】【无商机】【跟进中】四种反馈按钮

**标讯状态流转（四态体系）：**

| 状态值 | 用户可见名称 | 说明 |
|--------|-------------|------|
| `assigned` | 已分配 | 默认初始状态，标讯进入系统后自动分配 |
| `following` | 跟进中 | 用户标记跟进中，可多次编辑跟进备注 |
| `converted` | 已转化 | 关联已有商机或新建商机后流转至此状态 |
| `abandoned` | 已放弃 | 标记无商机后流转至此状态 |

**实时招标关联决策流程（前置步骤）：**

实时招标类型标讯在进入详情页时，系统会自动匹配历史意向招标。用户必须先完成关联决策，才能进行商机反馈：

1. **未决策**（默认）：顶部显示 Banner "系统匹配到 N 条相关历史意向招标，请处理"，底部反馈按钮隐藏
2. **点击 Banner** → 弹出抽屉展示候选意向招标列表
3. **选择关联** → `linkedIntentBidId` 设为意向招标 ID，状态同步跟随该意向招标，隐藏反馈按钮
4. **选择不关联** → `linkedIntentBidId` 设为 `null`，此时展示底部反馈按钮（无商机 / 关联 / 新建 / 跟进中）

> 意向招标类型标讯无此步骤，直接进入底部反馈流程。

**新建商机表单**（分为两个模块）：

- **基本信息**：CDBID（必填，有值时只读展示，无值时内联搜索框支持按CDBID/客户名称模糊搜索选择）、事业部、商机来源、商机名称、客户名称、商机阶段、采购模式、产品域、预计签约日期、赢率、是否有解决方案机会、备注（除备注外全部必填）
- **产品明细**：支持多组，每组包含物料产品组（下拉联动）、产线（只读自动带出）、预计收入总金额（元）
  - 产品域选择"简单方案"时，新增「方案/立项产品组」下拉，选择后自动填充物料产品组（可编辑）和产线（只读）
  - 产品域切换时自动重置产品明细

物料产品组与产线映射：

| 物料产品组 | 产线 |
|-----------|------|
| 企业级System x(A7) | A7产品组产品线 |
| B7企业级服务器(B7) | XC |
| 企业级存储-NAS(16) | SAN-NAS |
| 企业级存储-SAN(18) | SAN-NAS |

### 3. 标讯一纸通模块

详情页新增的独立页面，提供客户全景画像可视化展示：

- **客户基础信息**：企业名称、行业、规模等核心信息
- **IT 信息化战略方向**：战略描述文本区块
- **IT Spending 分布**：纯 CSS `conic-gradient` 实现的环形图，展示各品类投入占比
- **产品可参与度**：以色块形式展示各产品线的可参与程度
- **SOW 产品占比**：纯 CSS `flexbox` 实现的进度条，展示各产品占比
- **历史合作**：柱状图 + 表格双视图展示历年合作金额
- **经营分析**：文本区块展示客户经营洞察
- **近期动态**：文本区块展示客户最新动态

所有图表均采用纯 CSS 实现，无需引入图表库，保持轻量化。

### 4. 实时招标 ↔ 意向招标关联决策机制 ✨新增

针对【实时招标】类型的标讯，系统自动匹配可能关联的历史【意向招标】，由销售手动决策后锁定。

**匹配策略**：依序按 cdbId / 采购单位 / 行业 / 战区 取并集，最多展示 3 条候选。

**交互设计**：顶部提醒条 `IntentMatchBanner` + 底部抽屉 `IntentMatchSheet` 双组件模式，首屏不遮挡标讯主体信息。Banner 三态独立配色：

| 状态 | Banner 表现 | 可点击 |
|---|---|---|
| 未决策 | 🟦 「系统匹配到 N 条相关历史意向招标，请处理」 | 是，打开 Sheet |
| 已关联 | ✅ 「已关联：供应商名称」 | 只读展示 |
| 明确不关联 | ⚪ 「未关联历史意向招标」 | 只读展示 |

**决策不可逆规则**：一经选择关联或不关联即不可变更，避免误操作产生重复商机。

**双向关联展示**：
- 实时招标详情页 → 顶部 Banner + 中部「关联的意向招标」独立入口卡跳转
- 意向招标详情页 → `LinkedRealtimeBidsPanel` 反向展示所有被关联的实时招标列表，点击可返回

**状态联动**：选择关联后，实时招标的 status 与 relatedOpportunityId 通过派生层（`AppProvider` 的 `effectiveBids`）**实时跟随**被关联意向招标；后续意向招标状态变化（反馈无商机 / 新建商机）会自动同步到所有关联它的实时招标。选择不关联则进入常规反馈流程（无商机/关联商机/新建商机）。

### 5. 历史案例推荐 ✨新增

标讯详情页新增【历史案例推荐】入口，点击跳转独立页 `/bid/:id/cases`，以列表卡片展示与当前标讯相关的历史成单案例。字段参考 `测试数据/历史案例推荐.xlsx`：

| 字段 | 说明 |
|---|---|
| industry / subIndustry | 行业 / 子行业 |
| region | 战区 |
| customerName / projectName | 客户名称 / 项目名称 |
| orderTime | 下单时间 |
| product / businessScenario | 产品 / 业务场景 |
| totalAmount | 总金额（$M 百万美元） |
| ar / ss / se | Account Rep / Solution Specialist / Solution Engineer |

### 6. PC 分析看板

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

### 7. 用户识别系统

| 标识 | 存储方式 | 生命周期 | 说明 |
|------|---------|---------|------|
| `userId` | `localStorage` | 持久化（同一设备+浏览器） | 关闭浏览器后仍保留，用于跨会话识别同一用户 |
| `sessionId` | `sessionStorage` | 单次标签页 | 每次打开新标签页生成新 ID，用于区分独立会话 |

> **识别边界**：userId 基于设备 + 浏览器粒度。同一用户在手机和电脑上访问 = 2 个 userId；两位用户共用同一手机浏览器 = 1 个 userId。适用于原型测试场景，正式产品需对接账号体系。

### 8. 行为埋点系统

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
| `data-track` | 操作描述（中文） | "查看标讯详情"、"跳转关联意向招标详情" |
| `data-track-type` | 操作类别 | 导航、标讯浏览、商机处理、筛选、对话交互、标讯操作、**标讯关联**、**快捷入口**、**多模态输入**、**应用入口**、搜索 |
| `data-track-detail` | 补充信息 | 项目名称、筛选值等 |

**类目色板一览**（AnalyticsPage 看板独立调色，与品牌主色区分）：

| 类目 | 色值 | 图标 |
|---|---|---|
| 导航 | #8b5cf6 | 🧭 |
| 标讯浏览 | #3b82f6 | 📋 |
| 商机处理 | #10b981 | 💼 |
| 筛选 | #06b6d4 | 🔍 |
| 对话交互 | #f59e0b | 💬 |
| 标讯操作 | #ec4899 | ⚡ |
| 标讯关联 ✨ | #0ea5e9 | 🔗 |
| 快捷入口 ✨ | #f43f5e | 🚀 |
| 多模态输入 ✨ | #14b8a6 | 🎙️ |
| 应用入口 ✨ | #a855f7 | 🧩 |
| 搜索 | #6366f1 | 🔎 |
| 其他 | #94a3b8 | 📌 |

**页面识别**：`ClickTracker` 支持按页面维度自动分类追踪事件，已覆盖：首页、标讯列表、标讯详情、标讯深度思考、历史案例推荐、分析看板。

**关联决策双向跳转闭环均归为 `标讯关联` 类目**，便于在看板上做专项漏斗分析：
- `打开关联意向招标抽屉`、`关联意向招标`、`不关联意向招标`、`跳转关联意向招标详情`、`点击关联实时招标卡片`

### 9. 数据流转

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
  cdbId?: string             // 客户主数据库唯一编号
  // 状态：pending=已分配(待跟进)；linked=已关联意向招标；no_opportunity/new_opportunity=已反馈（无商机/新商机）
  status: 'assigned' | 'following' | 'converted' | 'abandoned'
  // 关联意向招标决策（仅 bidType=实时招标 适用）
  linkedIntentBidIds?: string[]      // 系统匹配的候选意向招标 id 列表
  linkedIntentBidId?: string | null  // undefined=未决策、null=明确不关联、string=已关联
}
```

### HistoricalCase（历史成单案例）

```typescript
interface HistoricalCase {
  id: string
  industry: string         // 行业
  subIndustry: string      // 子行业
  region: string           // 战区
  customerName: string     // 客户名称
  projectName: string      // 项目名称
  orderTime: string        // 下单时间
  product: string          // 产品
  businessScenario: string // 业务场景
  totalAmount: number      // 总金额（百万美元）
  ar: string               // Account Rep
  ss: string               // Solution Specialist
  se: string               // Solution Engineer
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
  hasSolutionOpportunity?: '是' | '否'  // 是否有解决方案机会
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
| **修改商机操作弹窗** | `src/components/bid/*.Sheet.tsx` | 两个底部操作面板 |
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


