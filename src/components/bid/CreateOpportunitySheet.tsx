import { useState } from 'react'
import {
  type BidInfo,
  procurementModeOptions,
  productDomainOptions,
  winRateOptions,
  mockCustomerDatabase,
} from '@/data/mock-data'
import { Button } from '@/components/ui/button'
import { X, Sparkles, ChevronDown, Search } from 'lucide-react'

interface CreateOpportunitySheetProps {
  bid: BidInfo
  onClose: () => void
  onSubmit: () => void
}

export function CreateOpportunitySheet({ bid, onClose, onSubmit }: CreateOpportunitySheetProps) {
  // 系统根据标讯信息自动预填字段
  const [formData, setFormData] = useState({
    bu: bid.bu || 'ISG',                     // 事业部，自动取自标讯BU
    isKt: '',                                // 是否KT商机，无默认值
    source: '标讯转化',                      // 商机来源，默认标讯转化
    name: bid.projectName || '',             // 商机名称 = 标讯项目名称
    customer: bid.procurementUnit || '',     // 客户名称 = 标讯采购单位
    cdbId: bid.cdbId || '',                  // CDBID
    stage: '发现需求',                       // 商机阶段，默认发现需求
    procurementMode: '普通采购',             // 采购模式，默认普通采购
    productDomain: '标准产品',               // 产品域，默认标准产品
    expectedSignDate: '',                    // 预计签约日期（只允许当前/未来日）
    expectedRevenue: '',                     // 预计收入总金额（元），非必填
    totalUnitCount: '',                      // 总台数，非必填
    winRate: '10%(项目筹备期)',              // 赢率，默认10%
    hasSolutionOpportunity: '',              // 是否有解决方案机会
    remark: bid.summary || '',               // 备注，默认填充标讯摘要
  })

  // CDBID 搜索状态
  const [cdbSearchQuery, setCdbSearchQuery] = useState('')

  // 管理各下拉框展开状态
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => prev === name ? null : name)
  }

  const update = (key: string, val: string) => {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  const handleIsKtChange = (val: string) => {
    update('isKt', val)
    setOpenDropdown(null)
    if (val === '是') update('productDomain', '标准产品')
  }

  const isFormValid = !!(
    formData.bu?.trim() &&
    formData.isKt?.trim() &&
    formData.source?.trim() &&
    formData.name?.trim() &&
    formData.customer?.trim() &&
    formData.cdbId?.trim() &&
    formData.procurementMode?.trim() &&
    formData.productDomain?.trim() &&
    formData.expectedSignDate?.trim() &&
    formData.winRate?.trim() &&
    formData.hasSolutionOpportunity?.trim()
  )

  return (
    <>
      <div className="sheet-overlay animate-fade-in" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="mx-auto max-w-[480px] rounded-t-2xl bg-card safe-bottom"
          style={{ boxShadow: 'var(--shadow-elevated)', maxHeight: '90vh' }}>

          {/* Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="h-1 w-8 rounded-full bg-muted" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2">
            <div>
              <h2 className="text-base font-bold text-foreground">创建新商机</h2>
              <p className="text-2xs text-muted-foreground mt-0.5">已根据标讯信息自动预填</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* AI Pre-fill Hint */}
          <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg bg-accent p-2.5">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <p className="text-2xs text-accent-foreground">
              以下信息已从标讯自动提取，请确认或修改后提交
            </p>
          </div>

          {/* Form */}
          <div className="overflow-y-auto scrollbar-hide px-4" style={{ maxHeight: '55vh' }}>
            <div className="flex flex-col gap-3 pb-3">

              {/* ═══ 基本信息区域 ═══ */}
              <div className="mb-3 mt-4 flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-primary"></div>
                <h3 className="text-sm font-semibold text-foreground">基本信息</h3>
              </div>

              {/* 事业部 */}
              <FormField label="事业部" required prefilled="自动填充标讯BU">
                <div className="flex h-10 w-full items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed">
                  {formData.bu}
                </div>
              </FormField>

              {/* 是否KT商机 - 选『是』时锁定产品域为标准产品 */}
              <FormField label="是否KT商机" required>
                <DropdownSelect
                  value={formData.isKt || '请选择'}
                  options={['是', '否']}
                  isOpen={openDropdown === 'isKt'}
                  onToggle={() => toggleDropdown('isKt')}
                  onSelect={handleIsKtChange}
                />
              </FormField>

              {/* 商机来源 - 只读 */}
              <FormField label="商机来源" required>
                <div className="flex h-10 w-full items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed">
                  {formData.source}
                </div>
              </FormField>

              {/* 商机名称 */}
              <FormField label="商机名称" required prefilled="自动填充标讯项目名称">
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => update('name', e.target.value)}
                  className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>

              {/* 客户名称 - 只读 */}
              <FormField label="客户名称" required prefilled="自动填充客户名称">
                <div className="flex h-10 w-full items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed">
                  {formData.customer}
                </div>
              </FormField>

              {/* CDBID */}
              <FormField label="CDBID" required prefilled={bid.cdbId ? '自动填充标讯CDBID' : false}>
                {bid.cdbId ? (
                  /* 模式A：有CDBID，只读展示 */
                  <div className="flex h-10 w-full items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed">
                    {bid.cdbId}
                  </div>
                ) : (
                  /* 模式B：无CDBID，搜索输入框 */
                  <div>
                    {formData.cdbId ? (
                      /* 已选中状态 */
                      <div className="flex h-10 w-full items-center justify-between rounded-lg border bg-muted px-3 text-sm text-muted-foreground">
                        <span>{formData.cdbId}</span>
                        <button
                          type="button"
                          onClick={() => { update('cdbId', ''); setCdbSearchQuery('') }}
                          className="text-xs text-primary hover:text-primary/80"
                        >
                          清除
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input
                            type="text"
                            value={cdbSearchQuery}
                            onChange={e => setCdbSearchQuery(e.target.value)}
                            placeholder="搜索CDBID或客户名称"
                            className="h-10 w-full rounded-lg border bg-secondary pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        {cdbSearchQuery && (
                          <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto bg-muted/50 py-1">
                            {mockCustomerDatabase.filter(c =>
                              c.cdbId.toLowerCase().includes(cdbSearchQuery.toLowerCase()) ||
                              c.name.toLowerCase().includes(cdbSearchQuery.toLowerCase())
                            ).length === 0 ? (
                              <div className="px-3 py-2 text-sm text-muted-foreground">无匹配结果</div>
                            ) : (
                              mockCustomerDatabase.filter(c =>
                                c.cdbId.toLowerCase().includes(cdbSearchQuery.toLowerCase()) ||
                                c.name.toLowerCase().includes(cdbSearchQuery.toLowerCase())
                              ).map(c => (
                                <button
                                  key={c.cdbId}
                                  onClick={() => {
                                    update('cdbId', c.cdbId)
                                    setCdbSearchQuery('')
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-secondary active:bg-secondary/80"
                                >
                                  {c.name}（{c.cdbId}）
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </FormField>

              {/* 商机阶段 - 系统锁定为「发现需求」 */}
              <FormField label="商机阶段" required>
                <div className="flex h-10 w-full items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed">
                  {formData.stage}
                </div>
              </FormField>

              {/* 采购模式 */}
              <FormField label="采购模式" required>
                <DropdownSelect
                  value={formData.procurementMode}
                  options={procurementModeOptions}
                  isOpen={openDropdown === 'procurementMode'}
                  onToggle={() => toggleDropdown('procurementMode')}
                  onSelect={(val) => { update('procurementMode', val); setOpenDropdown(null) }}
                />
              </FormField>

              {/* 产品域 - 联动『是否KT商机』 */}
              <FormField label="产品域" required>
                {formData.isKt === '是' ? (
                  <div className="flex h-10 w-full items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed">
                    {formData.productDomain}
                  </div>
                ) : (
                  <DropdownSelect
                    value={formData.productDomain}
                    options={productDomainOptions}
                    isOpen={openDropdown === 'productDomain'}
                    onToggle={() => toggleDropdown('productDomain')}
                    onSelect={(val) => { update('productDomain', val); setOpenDropdown(null) }}
                  />
                )}
              </FormField>

              {/* 预计签约日期 - 仅当前及未来日期 */}
              <FormField label="预计签约日期" required>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.expectedSignDate}
                    onChange={e => update('expectedSignDate', e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className={`h-10 w-full rounded-lg border bg-secondary px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${formData.expectedSignDate ? 'text-foreground' : 'text-transparent'}`}
                  />
                  {!formData.expectedSignDate && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      请选择日期
                    </span>
                  )}
                </div>
                <p className="mt-1 text-2xs text-muted-foreground">只能选当前日期和未来日期</p>
              </FormField>

              {/* 预计收入总金额（元） - 非必填 */}
              <FormField label="预计收入总金额（元）">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={formData.expectedRevenue}
                  onChange={e => update('expectedRevenue', e.target.value)}
                  placeholder="请输入金额"
                  data-track="填写预计收入总金额"
                  data-track-type="商机处理"
                  className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>

              {/* 总台数 - 非必填 */}
              <FormField label="总台数">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={formData.totalUnitCount}
                  onChange={e => update('totalUnitCount', e.target.value)}
                  placeholder="请输入数量"
                  data-track="填写总台数"
                  data-track-type="商机处理"
                  className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>

              {/* 赢率 */}
              <FormField label="赢率" required>
                <DropdownSelect
                  value={formData.winRate}
                  options={winRateOptions}
                  isOpen={openDropdown === 'winRate'}
                  onToggle={() => toggleDropdown('winRate')}
                  onSelect={(val) => { update('winRate', val); setOpenDropdown(null) }}
                />
              </FormField>

              {/* 是否有解决方案机会 */}
              <FormField label="是否有解决方案机会" required>
                <DropdownSelect
                  value={formData.hasSolutionOpportunity || '请选择'}
                  options={['是', '否']}
                  isOpen={openDropdown === 'hasSolutionOpportunity'}
                  onToggle={() => toggleDropdown('hasSolutionOpportunity')}
                  onSelect={(val) => { update('hasSolutionOpportunity', val); setOpenDropdown(null) }}
                />
              </FormField>

              {/* 备注 - 默认填充标讯摘要，仍可编辑 */}
              <FormField label="备注" prefilled={bid.summary ? '自动填充标讯摘要' : false}>
                <textarea
                  value={formData.remark}
                  onChange={e => update('remark', e.target.value)}
                  rows={3}
                  placeholder="请输入备注信息..."
                  data-track="编辑商机备注"
                  data-track-type="商机处理"
                  className="w-full rounded-lg border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </FormField>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="border-t px-4 pt-3 pb-2">
            <Button
              size="full"
              variant="success"
              disabled={!isFormValid}
              onClick={onSubmit}
            >
              确认创建商机
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

/** 通用下拉选择器（字符串选项） */
function DropdownSelect({ value, options, isOpen, onToggle, onSelect }: {
  value: string
  options: string[]
  isOpen: boolean
  onToggle: () => void
  onSelect: (val: string) => void
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex h-10 w-full items-center justify-between rounded-lg border bg-secondary px-3 text-sm text-foreground"
      >
        <span>{value}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-11 z-10 rounded-lg border bg-card py-1 animate-scale-in max-h-48 overflow-y-auto"
          style={{ boxShadow: 'var(--shadow-elevated)' }}>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`w-full px-3 py-2 text-left text-sm ${
                value === opt
                  ? 'bg-accent font-semibold text-primary'
                  : 'text-foreground active:bg-secondary'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function FormField({ label, required, prefilled, children }: {
  label: string
  required?: boolean
  prefilled?: boolean | string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {required && <span className="text-2xs text-destructive">*</span>}
        {prefilled && (
          <span className="rounded bg-accent px-1 py-0.5 text-[9px] font-medium text-primary">
            {typeof prefilled === 'string' ? prefilled : '自动填充'}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

