export type BidStatus = 'pending' | 'linked' | 'no_opportunity' | 'new_opportunity'

export interface BidInfo {
  id: string
  bu: string                // 事业部（BU）
  bidType: string           // 标讯类型：意向招标 | 实时招标
  region: string            // 战区
  province: string          // 省份
  city: string              // 城市
  industry: string          // 主行业
  announcementName: string  // 公告名称
  procurementUnit: string   // 采购单位
  projectName: string       // 项目名称
  procurementSummary: string // 采购需求概况
  summary: string           // 标讯摘要（一句话概述）
  highValueCustomer: boolean // 是否高价值客户
  totalQuantity: string     // 数量总计
  keywords: string          // 关键词
  budgetAmount: string      // 预算金额（万元）
  startDate: string         // 预计采购开始时间
  deadline: string          // 预计采购截止时间
  contactPhone: string      // 采购人电话
  contactPerson: string     // 采购人联系人
  sourceUrl: string         // 原始文章链接
  status: BidStatus
  relatedOpportunityCount: number  // 可能关联的商机数量
  relatedOpportunityId?: string
  cdbId?: string  // 客户主数据库唯一编号
  // 实时招标与历史意向招标的关联字段（仅实时招标使用）
  linkedIntentBidIds?: string[]      // 系统匹配的候选意向招标 id 列表
  linkedIntentBidId?: string | null  // 用户决策：undefined=未决策、null=明确不关联、string=已关联
}

export interface Opportunity {
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

// 基于真实 Excel 数据的模拟标讯（共 20 条）
// 新增字段说明：
//   • bidType：意向招标 | 实时招标 按偶/奇 index 分配（10:10）
//   • highValueCustomer：按 floor(idx/2)%2 分配（50% 是←→与 bidType 解耦）50% 否）
//   • summary：基于 procurementSummary 删除「采购：」前缀后截取 40 字作为一句话概述
// 三字段统一在 computed mockBids 中 enrich 处理，避免修改每一条原始数据
const _RAW_BIDS: Array<Omit<BidInfo, 'summary' | 'highValueCustomer'>> = [
  {
    id: 'BX-2026-001',
    cdbId: '30654576X',
    bu: 'ISG',
    bidType: '意向',
    region: '江苏',
    province: '江苏省',
    city: '常州市',
    industry: '教育',
    announcementName: '南京医科大学（本部）2026年1月(第1批)政府采购意向公告',
    procurementUnit: '南京医科大学（本部）',
    projectName: '南京医科大学常州校区教学机房及实验室设备采购项目',
    procurementSummary: '采购：本项目含教学计算机（包括学生机），实验室计算机及服务器',
    totalQuantity: '',
    keywords: '服务器',
    budgetAmount: '470',
    startDate: '2026-03-01',
    deadline: '2026-03-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://www.ccgp-jiangsu.gov.cn/jiangsu/js_cggg/details.html?gglb=cgyx&ggid=ca103ae959dd4cf8973eee473a4c2774',
    status: 'pending',
    relatedOpportunityCount: 3,
  },
  {
    id: 'BX-2026-002',
    bu: 'ISG',
    bidType: '意向',
    region: '安徽',
    province: '安徽省',
    city: '宣城市',
    industry: '教育',
    announcementName: '安徽材料工程学校2025年5月政府采购意向',
    procurementUnit: '安徽材料工程学校',
    projectName: '安徽省宁国市安徽材料工程学校人工智能技术与应用实训项目',
    procurementSummary: '采购：满足人工智能技术与应用相关课程实训，其中包括：管理控制设备、云资源计算设备、人工智能教训一体化平台、人工智能相关课程教学资源包、智能无人驾驶终端、智能搬运移动终端、人工智能前端设备应用实训平台、人工智能机器人视觉检测实训平台、人工智能技术与应用训练设备、实训操作终端、交换机、智慧黑板、蓝牙音箱、蓝牙无线麦克风、实训桌凳（双人位）、置物柜、服务器机柜、实训室环境建设等。',
    totalQuantity: '',
    keywords: '交换机',
    budgetAmount: '168',
    startDate: '2025-05-01',
    deadline: '2025-05-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=23f56b08-1cdf-4ffe-8a32-f339d26dca49',
    status: 'pending',
    relatedOpportunityCount: 3,
  },
  {
    id: 'BX-2026-003',
    cdbId: '30654576X',
    bu: 'ISG',
    bidType: '意向',
    region: '江苏',
    province: '江苏省',
    city: '连云港市',
    industry: '医疗卫生',
    announcementName: '东海县人民医院2026年1月(第1批)政府采购意向公告',
    procurementUnit: '东海县人民医院',
    projectName: '东海县医共体信息平台建设项目',
    procurementSummary: '采购：项目投资规模与资金来源：总投资3000万元，涉及软件定制开发硬件采购、监理服务等。建设目标：以健康管理和疾病预防为中心，提高医疗服务体系效率。建设内容包括医共体信息平台、综合管理驾驶舱、基层公卫一体化建设等多个系统大类及模块。硬件设备资源：包括机房服务器、存储、安全、交换机等网络硬件。',
    totalQuantity: '',
    keywords: '服务器',
    budgetAmount: '3000',
    startDate: '2026-02-01',
    deadline: '2026-02-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://www.ccgp-jiangsu.gov.cn/jiangsu/js_cggg/details.html?gglb=cgyx&ggid=b21312ff319c47999f540928bdec009e',
    status: 'pending',
    relatedOpportunityCount: 3,
  },
  {
    id: 'BX-2026-004',
    bu: 'ISG',
    bidType: '意向',
    region: '天津',
    province: '天津市',
    city: '天津市',
    industry: '政府',
    announcementName: '天津市公安局河东分局机关政府采购意向公告',
    procurementUnit: '天津市公安局河东分局机关',
    projectName: '天津市公安局河东分局采购业务技术用房信息化设备项目',
    procurementSummary: '采购：为完成公安河东分局业务技术用房信息化建设，需采购一批信息化设备。',
    totalQuantity: '',
    keywords: '信息化',
    budgetAmount: '400',
    startDate: '2025-06-01',
    deadline: '2025-06-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=b1e4f1db-e43e-4bbd-a2ed-6b91e779e32f',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-005',
    cdbId: '30654576X',
    bu: 'ISG',
    bidType: '意向',
    region: '川藏',
    province: '四川省',
    city: '成都市',
    industry: '政府',
    announcementName: '四川省妇幼保健院2025年度政府采购意向公告(第8批)',
    procurementUnit: '四川省妇幼保健院',
    projectName: '存储扩容升级',
    procurementSummary: '采购：其他存储设备。主要功能：满足我院信息系统存储需求实现部分双活存储；需配置磁盘扩展柜，实现双活存储，对控制器进行升级。前置双活存储（含4套双活存储控制器、4台异地双活存储交换设备存储机头扩展柜等，不少于48块3.84TB固态SSD硬盘，全闪不少于65TB。并进行设备搬迁、数据迁移、链路改造、服务器内存增加、业务不中断存储升级等服务。',
    totalQuantity: '1',
    keywords: '存储',
    budgetAmount: '187',
    startDate: '2025-06-01',
    deadline: '2025-06-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=487b56a9-2efc-43c4-9dca-8b6d6ffee1c0',
    status: 'pending',
    relatedOpportunityCount: 3,
  },
  {
    id: 'BX-2026-006',
    bu: 'ISG',
    bidType: '意向',
    region: '江苏',
    province: '江苏省',
    city: '南京市',
    industry: '政府',
    announcementName: '紫金山实验室2026年1月(第6批)政府采购意向公告',
    procurementUnit: '紫金山实验室',
    projectName: '紫金山实验室内生安全知识体系平台智能化改造项目',
    procurementSummary: '采购：基于AI驱动内生安全知识体系平台升级服务1项，升级后的平台支持多终端的知识访问方式，完善移动端多课题知识聚合、AI问答与报表功能，打造"找得准、推得对"的智能服务总线。同时配套支撑平台运行的GPU服务器1台和多终端协同与数据安全服务器1台。',
    totalQuantity: '',
    keywords: '服务器',
    budgetAmount: '95',
    startDate: '2026-02-01',
    deadline: '2026-02-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'https://njgc.jfh.com/purchase/detail?id=23976&type=14',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-007',
    cdbId: '30654576X',
    bu: 'ISG',
    bidType: '意向',
    region: '川藏',
    province: '四川省',
    city: '南充市',
    industry: '政府',
    announcementName: '南充市机关事务管理局2025年度政府采购意向公告(第5批)',
    procurementUnit: '南充市机关事务管理局',
    projectName: '南充卫生职业学院（筹建）信息化建设及通用办公设备政府采购',
    procurementSummary: '采购：其他信息化设备。按照南充卫生职业学院筹建工作需要，采购配备教室和实验室、计算机教学机房、网管中心机房、办公等所需信息化设备，以及办公电脑、家具等设备。',
    totalQuantity: '1',
    keywords: '信息化',
    budgetAmount: '1218.86',
    startDate: '2025-06-01',
    deadline: '2025-06-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'https://www.ccgp-sichuan.gov.cn/maincms-web/article?type=notice&id=c0502d4b-1379-4df4-9db5-4b34c85e0dd4&planId',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-008',
    bu: 'ISG',
    bidType: '意向',
    region: '天津',
    province: '天津市',
    city: '天津市',
    industry: '政府',
    announcementName: '老门诊楼通信安防改造及监控智能化轨迹分析服务器采购意向公告（第二次）',
    procurementUnit: '',
    projectName: '老门诊楼通信安防改造及医疗区监控智能化轨迹分析服务器采购',
    procurementSummary: '采购：一、医疗区监控智能化轨迹分析服务器采购：平台服务器实施，接入智能化分析超脑存储，支持国产化ARM架构；智能化分析超脑实施，接入一台支持分析144路视频流超脑，覆盖新门急诊楼、住院部主要出入口。二、老门诊楼通信安防系统改造：监控摄像机225台、监控存储1台、交换机14台、门禁设备、一键报警、通信系统等。',
    totalQuantity: '2',
    keywords: '服务器',
    budgetAmount: '120',
    startDate: '2025-05-01',
    deadline: '2025-05-01',
    contactPhone: '022-XXXX-XXX',
    contactPerson: '朱助理',
    sourceUrl: 'https://www.plap.mil.cn/freecms/site/juncai/ggxx/info/2025/8a1d039896b962b10196d17ce4140b78.html',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-009',
    cdbId: '30654576X',
    bu: 'ISG',
    bidType: '意向',
    region: '川藏',
    province: '四川省',
    city: '南充市',
    industry: '教育',
    announcementName: '南充市高坪第一小学2025年度政府采购意向公告(第1批)',
    procurementUnit: '南充市高坪第一小学',
    projectName: '信息化设备采购',
    procurementSummary: '采购：其他信息化设备。主要功能或目标：无。需满足的要求：无。',
    totalQuantity: '1',
    keywords: '信息化',
    budgetAmount: '124',
    startDate: '2025-06-01',
    deadline: '2025-06-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=4c47cadc-7252-4c89-a21b-e89f36293f05',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-010',
    bu: 'ISG',
    bidType: '意向',
    region: '北京',
    province: '北京市',
    city: '北京市',
    industry: '教育',
    announcementName: '北京交通大学2025年6月政府采购意向',
    procurementUnit: '北京交通大学',
    projectName: 'AI大模型服务平台建设',
    procurementSummary: '采购：AI服务器、智能体开发平台',
    totalQuantity: '',
    keywords: 'AI',
    budgetAmount: '500',
    startDate: '2025-06-01',
    deadline: '2025-06-01',
    contactPhone: '516-XXX-XX',
    contactPerson: '周老师',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=7ab592ae-52cd-414a-bf3b-73adab0023a5',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-011',
    cdbId: '30654576X',
    bu: 'ISG',
    bidType: '意向',
    region: '川藏',
    province: '四川省',
    city: '成都市',
    industry: '教育',
    announcementName: '四川大学2025年6至7月政府采购意向',
    procurementUnit: '四川大学',
    projectName: '国家医学攻关产教融合共享平台智算中心安全设备采购',
    procurementSummary: '采购：构建智算中心所需的防火墙、流量探针、流量镜像交换机、EDR、堡垒机等安全设备软硬件。提供物理边界防御能力；提供集群内部恶意软件防御能力，提供整体网络安全检测能力；提供集群操作审计能力。',
    totalQuantity: '',
    keywords: '交换机',
    budgetAmount: '170',
    startDate: '2025-06-01',
    deadline: '2025-06-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=5532b8cc-f9ef-441a-8008-41505fd2879d',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-012',
    bu: 'ISG',
    bidType: '意向',
    region: '安徽',
    province: '安徽省',
    city: '宣城市',
    industry: '教育',
    announcementName: '安徽材料工程学校2025年5月政府采购意向',
    procurementUnit: '安徽材料工程学校',
    projectName: '安徽材料工程学校人工智能技术与应用实训项目',
    procurementSummary: '采购：满足人工智能技术与应用相关课程实训，其中包括：管理控制设备、云资源计算设备、人工智能教训一体化平台、人工智能相关课程教学资源包、智能无人驾驶终端、智能搬运移动终端、人工智能前端设备应用实训平台、人工智能机器人视觉检测实训平台、人工智能技术与应用训练设备、实训操作终端、交换机、智慧黑板、蓝牙音箱、蓝牙无线麦克风、实训桌凳（双人位）、置物柜、服务器机柜、实训室环境建设等。',
    totalQuantity: '',
    keywords: '人工智能',
    budgetAmount: '168',
    startDate: '2025-05-01',
    deadline: '2025-05-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=23f56b08-1cdf-4ffe-8a32-f339d26dca49',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-013',
    cdbId: '30654576X',
    bu: 'ISG',
    bidType: '意向',
    region: '川藏',
    province: '四川省',
    city: '成都市',
    industry: '教育',
    announcementName: '四川大学2025年6至7月政府采购意向',
    procurementUnit: '四川大学',
    projectName: '国家医学攻关产教融合共享平台智算中心算力设备采购',
    procurementSummary: '采购：GPU超算节点3台，GPU普通节点18台，CPU计算节点28台，应用服务器4台，网络设备1套，AI+HPC集群调度系统1套。用于构建智算数据中心，为国家医学攻关产教融合创新平台提供GPU训练、推理算力支撑。上述设备质保5年，如遇故障硬盘换新，原硬盘不返还。',
    totalQuantity: '21',
    keywords: 'GPU',
    budgetAmount: '1266',
    startDate: '2025-06-01',
    deadline: '2025-06-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=4095aeba-246e-4de4-85b6-88052b324531',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-014',
    bu: 'ISG',
    bidType: '意向',
    region: '北京',
    province: '北京市',
    city: '北京市',
    industry: '教育',
    announcementName: '中共中央办公厅电子科技学院2025年5至12月政府采购意向',
    procurementUnit: '北京电子科技学院',
    projectName: '北京电子科技学院人工智能平台建设（一期）项目',
    procurementSummary: '采购：通过采购人工智能应用平台及其配套软件和一体机设备，实现智能化应用的开发和部署，与现有业务系统集成，基于业务系统数据，综合利用大模型研发、自然语言处理、多模态技术，推动学院教育教学智能化建设、科研成果转化。',
    totalQuantity: '',
    keywords: '人工智能',
    budgetAmount: '350',
    startDate: '2025-06-01',
    deadline: '2025-06-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=866cc721-3014-45d6-9151-57577a64007a',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-015',
    cdbId: '30654576X',
    bu: 'ISG',
    bidType: '意向',
    region: '川藏',
    province: '四川省',
    city: '成都市',
    industry: '教育',
    announcementName: '四川大学2025年6至7月政府采购意向',
    procurementUnit: '四川大学',
    projectName: '国家医学攻关产教融合共享平台智算中心算力设备采购（二批）',
    procurementSummary: '采购：GPU超算节点3台，GPU普通节点18台，CPU计算节点28台，应用服务器4台，网络设备1套，AI+HPC集群调度系统1套。用于构建智算数据中心，为国家医学攻关产教融合创新平台提供GPU训练、推理算力及CPU算力支撑。',
    totalQuantity: '32',
    keywords: '服务器',
    budgetAmount: '1266',
    startDate: '2025-06-01',
    deadline: '2025-06-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=4095aeba-246e-4de4-85b6-88052b324531',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-016',
    bu: 'ISG',
    bidType: '意向',
    region: '天津',
    province: '天津市',
    city: '天津市',
    industry: '教育',
    announcementName: '中国民用航空局2025年5至6月政府采购意向',
    procurementUnit: '中国民航大学',
    projectName: '校园网络设备升级项目',
    procurementSummary: '采购：采购校园网网络设备，升级校园网络基础架构。',
    totalQuantity: '',
    keywords: '网络',
    budgetAmount: '289.21',
    startDate: '2025-06-01',
    deadline: '2025-06-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=20c5b224-5471-474e-89c7-e7d50be12306',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-017',
    cdbId: '30654576X',
    bu: 'ISG',
    bidType: '意向',
    region: '川藏',
    province: '四川省',
    city: '成都市',
    industry: '教育',
    announcementName: '四川大学2025年6至7月政府采购意向',
    procurementUnit: '四川大学',
    projectName: '国家医学攻关产教融合共享平台智算中心算力设备采购（三批）',
    procurementSummary: '采购：GPU超算节点3台，GPU普通节点18台，CPU计算节点28台，应用服务器4台，网络设备1套，AI+HPC集群调度系统1套。用于调度智算中心算力、存储资源，管理AI作业等。上述设备质保5年。',
    totalQuantity: '1',
    keywords: 'AI',
    budgetAmount: '1266',
    startDate: '2025-06-01',
    deadline: '2025-06-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=4095aeba-246e-4de4-85b6-88052b324531',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-018',
    bu: 'ISG',
    bidType: '意向',
    region: '北京',
    province: '北京市',
    city: '北京市',
    industry: '教育',
    announcementName: '中共中央办公厅电子科技学院2025年5至12月政府采购意向',
    procurementUnit: '北京电子科技学院',
    projectName: '北京电子科技学院人工智能平台建设（一期）一体机设备采购',
    procurementSummary: '采购：通过采购人工智能应用平台配套一体机设备，实现智能化应用的开发和部署，与现有业务系统集成，基于业务系统数据，综合利用大模型研发、自然语言处理、多模态技术，推动学院教育教学智能化建设、科研成果转化。',
    totalQuantity: '',
    keywords: '一体机',
    budgetAmount: '350',
    startDate: '2025-06-01',
    deadline: '2025-06-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=866cc721-3014-45d6-9151-57577a64007a',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-019',
    cdbId: '30654576X',
    bu: 'ISG',
    bidType: '意向',
    region: '川藏',
    province: '四川省',
    city: '泸州市',
    industry: '教育',
    announcementName: '四川省泸县第五中学2025年度政府采购意向公告(第1批)',
    procurementUnit: '四川省泸县第五中学',
    projectName: '四川省泸县第五中学2025年数字化教学设备提档升级项目',
    procurementSummary: '采购：触控一体机。更新学校教室智慧黑板等相关教学设备及软件，助力教师高效授课，集教学展示、互动操作等功能于一体，为师生打造生动、多元的课堂环境，激发学生学习兴趣，提升教学效果与课堂参与度，推动教育信息化进程。',
    totalQuantity: '1',
    keywords: '一体机',
    budgetAmount: '200',
    startDate: '2025-06-01',
    deadline: '2025-06-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'https://www.ccgp-sichuan.gov.cn/maincms-web/article?type=notice&id=04912ca4-4c3d-44cc-aa08-d9415659fa40&planId',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
  {
    id: 'BX-2026-020',
    bu: 'ISG',
    bidType: '意向',
    region: '江苏',
    province: '江苏省',
    city: '苏州市',
    industry: '教育',
    announcementName: '苏州科技大学2025年6月政府采购意向',
    procurementUnit: '苏州科技大学',
    projectName: '苏州科技大学校园数据中心云平台扩容项目',
    procurementSummary: '采购：云计算服务器、分布式存储设备、虚拟化管理平台软件授权及配套网络交换设备，用于校园数据中心云平台扩容升级，提升校园信息化服务承载能力。',
    totalQuantity: '1',
    keywords: '服务器',
    budgetAmount: '380',
    startDate: '2025-07-01',
    deadline: '2025-07-01',
    contactPhone: '',
    contactPerson: '',
    sourceUrl: 'http://cgyx.ccgp.gov.cn/cgyx/pub/proJ/details?projId=a1b2c3d4-5678-90ab-cdef-1234567890ab',
    status: 'pending',
    relatedOpportunityCount: 0,
  },
]

// ==========================================
// 字段 enrich：为每条补全 bidType、summary、highValueCustomer
// ==========================================
function buildSummary(src: string): string {
  // 1. 去掉「采购：」前缀
  const stripped = (src || '').replace(/^采购[：:]\s*/, '').trim()
  if (!stripped) return ''
  // 2. 在首个句号「。」/ 分号「；」/「;」处截断（含分隔符），保留语义完整的首分句
  const match = stripped.match(/[。；;]/)
  if (!match || match.index === undefined) return stripped  // 无分隔符则保留全文作为兑底
  return stripped.slice(0, match.index + 1)
}

export const mockBids: BidInfo[] = (() => {
  // 第一轮：生成基础字段（含 bidType）
  const firstPass: BidInfo[] = _RAW_BIDS.map((raw, idx) => ({
    ...raw,
    bidType: idx % 2 === 0 ? '意向招标' : '实时招标',
    highValueCustomer: Math.floor(idx / 2) % 2 === 0,
    summary: buildSummary(raw.procurementSummary),
  }))
  // 第二轮：对「实时招标」动态匹配候选意向招标
  const intentBids = firstPass.filter(b => b.bidType === '意向招标')
  return firstPass.map(b => {
    if (b.bidType !== '实时招标') return b
    // 匹配策略：先 cdbId 同 → 采购单位同 → 行业同 → 战区同
    const cdbMatch = b.cdbId ? intentBids.filter(x => x.cdbId === b.cdbId) : []
    const unitMatch = intentBids.filter(x => x.procurementUnit === b.procurementUnit)
    const industryMatch = intentBids.filter(x => x.industry === b.industry)
    const regionMatch = intentBids.filter(x => x.region === b.region)
    // 按优先级去重拼接，取前 3 条
    const seen = new Set<string>()
    const candidates: string[] = []
    for (const list of [cdbMatch, unitMatch, industryMatch, regionMatch]) {
      for (const x of list) {
        if (x.id === b.id || seen.has(x.id)) continue
        seen.add(x.id)
        candidates.push(x.id)
        if (candidates.length >= 3) break
      }
      if (candidates.length >= 3) break
    }
    // 兑底：取前 1 条意向招标
    if (candidates.length === 0 && intentBids.length > 0) {
      candidates.push(intentBids[0].id)
    }
    return { ...b, linkedIntentBidIds: candidates }
  })
})()

// 模拟商机数据（用于关联匹配）
export const mockOpportunities: Opportunity[] = [
  {
    id: 'S0250521234',
    name: '东海县医共体信息平台建设项目',
    customerName: '东海县人民医院',
    stage: '发现需求',
    amount: '1,500',
    owner: '张伟',
    probability: 60,
    createDate: '2026-03-15',
  },
  {
    id: 'T0230721234',
    name: '南京医科大学常州校区教学机房及实验室设备采购项目',
    customerName: '南京医科大学（本部）',
    stage: '明确需求',
    amount: '300',
    owner: '张伟',
    probability: 45,
    createDate: '2026-02-20',
  },
  {
    id: 'B400AW9B',
    name: '存储扩容升级',
    customerName: '四川省妇幼保健院',
    stage: '方案制定',
    amount: '200',
    owner: '李明',
    probability: 75,
    createDate: '2026-01-10',
  },
]

// 无商机原因选项
export const noOpportunityReasons = [
  '无ISG需求',
  '产品/参数不匹配',
  '客户暂未提供参数要求',
  '友商竞争因素',
  '其他原因',
]

// 商机阶段选项
export const opportunityStages = [
  '发现需求',
  '明确需求',
  '方案制定',
  '投标报价',
  '签约落地',
]

// 事业部选项（仅ISG）
export const buOptions = [
  'ISG',
]

// 采购模式选项
export const procurementModeOptions = [
  '普通采购',
  '统签分采',
]

// 产品域选项
export const productDomainOptions = [
  '标准产品',
  '简单方案',
  'KT',
]

// 赢率选项
export const winRateOptions = [
  '10%(项目筹备期)',
  '20%(立项阶段)',
  '40%(需求确认)',
  '60%(方案认可)',
  '80%(商务谈判)',
  '100%(签约落地)',
]

// 行业颜色映射
export const industryColors: Record<string, string> = {
  '教育': 'bg-info-muted text-accent-foreground',
  '医疗卫生': 'bg-success-muted text-success',
  '政府': 'bg-warning-muted text-warning',
}

export const materialProductGroups: Record<string, { name: string; productLine: string }> = {
  '1': { name: '企业级System x(A7)', productLine: 'A7产品组产品线' },
  '2': { name: 'B7企业级服务器(B7)', productLine: 'XC' },
  '3': { name: '企业级存储-NAS(16)', productLine: 'SAN-NAS' },
  '4': { name: '企业级存储-SAN(18)', productLine: 'SAN-NAS' },
}

// 标讯深度思考（一纸通）数据结构
// 模块参考：基础信息 / 客户标签 / 财报分析 / 企业情报 / 历史交易 / 客户新闻 / 行业情报
export interface BidOnePagerData {
  customerInfo: {
    customerName: string
    uid: string              // 客户编号
    industryColumn: string   // 行业纵队
    region: string           // 战区
  }
  customerTags: string[]              // 客户标签
  financialAnalysis: string           // 财报分析
  enterpriseIntelligence: string      // 企业情报
  historicalCooperation: {
    data: Array<{ year: string; REL: number; ISG: number; SSG: number }>
  }
  customerNews: string                // 客户新闻
  industryIntelligence: string        // 行业情报
}

export const mockBidOnePager: BidOnePagerData = {
  customerInfo: {
    customerName: '深圳荣耀智能机器有限公司',
    uid: 'L15009265x',
    industryColumn: '制造',
    region: '广西战区',
  },
  customerTags: ['制造行业', '广西战区', '高价值客户', '战略重点客户', 'AI转型期', '全球化扩张'],
  financialAnalysis: '荣耀终端近三年营收保持稳健增长态势，FY2025实现营收约580亿元，同比增长12%。\n主营业务方面，智能手机仍占营收主体（约65%），但IoT与智慧生活产品增速显著（同比+28%）。创新业务层面，荣耀加速布局AI大模型端侧部署，MagicOS 9.0全面接入端云协同AI能力，同时积极拓展企业级解决方案市场，面向教育、医疗等垂直行业推出定制化终端产品组合。',
  enterpriseIntelligence: '荣耀近期发布新一代MagicBook商用笔记本系列，主打AI本地化能力和企业安全管理特性，计划在教育和政企市场大规模推广，预计Q3采购需求集中释放。\n荣耀研发中心正在扩建内部AI训练集群，对高性能GPU服务器和存储设备有明确采购计划，预算规模约2000万元，预计下半年启动招标。\n荣耀全球化扩张加速，海外研发中心（欧洲、东南亚）正在进行IT基础设施建设规划，涉及私有云部署、数据中心建设等，存在大型基础设施一体化解决方案合作机会。',
  historicalCooperation: {
    data: [
      { year: 'FY2023', REL: 10000, ISG: 2000, SSG: 1500 },
      { year: 'FY2024', REL: 11000, ISG: 2000, SSG: 1500 },
      { year: 'FY2025', REL: 12000, ISG: 2000, SSG: 1500 },
    ],
  },
  customerNews: '【PC硬件】荣耀近期发布新一代MagicBook商用笔记本系列，主打AI本地化能力和企业安全管理特性，计划在教育和政企市场大规模推广，预计Q3采购需求集中释放。\n\n【服务器/基础设施】荣耀研发中心正在扩建内部AI训练集群，对高性能GPU服务器和存储设备有明确采购计划，预算规模约2000万元，预计下半年启动招标。\n\n【方案服务】荣耀全球化扩张加速，海外研发中心（欧洲、东南亚）正在进行IT基础设施建设规划，涉及私有云部署、数据中心建设等，存在大型基础设施一体化解决方案合作机会。',
  industryIntelligence: '制造行业全球化扩张加速，海外研发中心（欧洲、东南亚）正在进行IT基础设施建设规划，涉及私有云部署、数据中心建设等，\n存在大型基础设施一体化解决方案合作机会。',
}

// 历史案例推荐数据结构
export interface HistoricalCase {
  id: string
  industry: string         // 行业
  subIndustry: string      // 子行业
  region: string           // 战区
  customerName: string     // 客户名称
  projectName: string      // 项目名称
  orderTime: string        // 下单时间
  product: string          // 产品
  businessScenario: string // 业务场景
  totalAmount: number      // 总金额（$M，百万美元）
  ar: string               // Account Rep
  ss: string               // Solution Specialist
  se: string               // Solution Engineer
}

export const mockHistoricalCases: HistoricalCase[] = [
  {
    id: 'case-001',
    industry: '金融',
    subIndustry: '国有银行',
    region: '北京',
    customerName: '某大型国有银行',
    projectName: '基础设施一体化建设项目',
    orderTime: 'FY25Q3',
    product: '服务器',
    businessScenario: '智能化转型',
    totalAmount: 5,
    ar: 'chenly15',
    ss: 'chenly16',
    se: 'chenly17',
  },
  {
    id: 'case-002',
    industry: '制造',
    subIndustry: '离散轻工',
    region: '广西',
    customerName: '某领先手机制造企业',
    projectName: 'AI训练集群建设项目',
    orderTime: 'FY25Q2',
    product: 'GPU服务器',
    businessScenario: 'AI大模型训练',
    totalAmount: 3.2,
    ar: 'wangjun08',
    ss: 'liuwei12',
    se: 'zhaomin25',
  },
  {
    id: 'case-003',
    industry: '教育',
    subIndustry: '高等教育',
    region: '上海',
    customerName: '某顶尖985高校',
    projectName: '智慧校园云平台升级项目',
    orderTime: 'FY25Q1',
    product: '超融合一体机',
    businessScenario: '教育信息化',
    totalAmount: 1.8,
    ar: 'sunfang19',
    ss: 'huangli33',
    se: 'chenkai41',
  },
  {
    id: 'case-004',
    industry: '医疗',
    subIndustry: '三甲医院',
    region: '成都',
    customerName: '某省会三甲综合医院',
    projectName: '医疗影像PACS系统扩容项目',
    orderTime: 'FY24Q4',
    product: '存储阵列',
    businessScenario: '影像数据集中管理',
    totalAmount: 2.4,
    ar: 'lichao27',
    ss: 'zhouyu48',
    se: 'tangping52',
  },
  {
    id: 'case-005',
    industry: '政府',
    subIndustry: '智慧城市',
    region: '杭州',
    customerName: '某东部省会政务云建设中心',
    projectName: '政务云二期扩建项目',
    orderTime: 'FY24Q3',
    product: '云服务器集群',
    businessScenario: '政务服务一体化',
    totalAmount: 4.6,
    ar: 'maoxiang31',
    ss: 'penglin44',
    se: 'gaoyuan58',
  },
]

export const mockCustomerDatabase = [
  { cdbId: '30654576X', name: '南京医科大学（本部）' },
  { cdbId: '20987431A', name: '安徽材料工程学校' },
  { cdbId: '40123876B', name: '东海县人民医院' },
  { cdbId: '50234987C', name: '天津市公安局河东分局机关' },
  { cdbId: '60345098D', name: '成都市政府采购中心' },
]

export const solutionProductGroups: Record<string, { name: string; materialGroupId: string; materialGroupName: string; productLine: string }> = {
  '1': { name: '测试方案产品组1', materialGroupId: '1', materialGroupName: '企业级System x(A7)', productLine: 'A7产品组产品线' },
  '2': { name: '测试方案产品组2', materialGroupId: '2', materialGroupName: 'B7企业级服务器(B7)', productLine: 'XC' },
}
