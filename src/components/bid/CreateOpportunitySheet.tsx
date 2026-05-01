import { useState } from 'react'
import {
  type BidInfo,
  opportunityStages,
  buOptions,
  procurementModeOptions,
  productDomainOptions,
  winRateOptions,
} from '@/data/mock-data'
import { Button } from '@/components/ui/button'
import { X, Sparkles, ChevronDown } from 'lucide-react'

interface CreateOpportunitySheetProps {
  bid: BidInfo
  onClose: () => void
  onSubmit: () => void
}

export function CreateOpportunitySheet({ bid, onClose, onSubmit }: CreateOpportunitySheetProps) {
  // 计算产品总金额（元）= 预算金额（万元）× 10000
  const budgetInYuan = bid.budgetAmount
    ? String(Math.round(parseFloat(bid.budgetAmount.replace(/,/g, '')) * 10000))
    : ''

  // 系统根据标讯信息自动预填字段
  const [formData, setFormData] = useState({
    bu: 'ISG',                              // 事业部，默认ISG
    source: '标讯转化',                      // 商机来源，默认标讯转化
    name: bid.projectName || '',             // 商机名称 = 标讯项目名称
    customer: bid.procurementUnit || '',     // 客户名称 = 标讯采购单位
    stage: '发现需求',                       // 商机阶段，默认发现需求
    procurementMode: '普通采购',             // 采购模式，默认普通采购
    productDomain: '标准产品',               // 产品域，默认标准产品
    expectedSignDate: bid.startDate || '',   // 预计签约日期 = 标讯预计采购开始时间
    winRate: '10%(项目筹备期)',              // 赢率，默认10%
    totalAmount: budgetInYuan,               // 产品总金额（元）
    totalQuantity: bid.totalQuantity || '',  // 主机总台数
    remark: '',                              // 备注，默认为空
  })

  // 管理各下拉框展开状态
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => prev === name ? null : name)
  }

  const update = (key: string, val: string) => {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  const canSubmit = formData.name.trim() && formData.customer.trim()

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

              {/* 事业部 - 下拉选项（仅ISG） */}
              <FormField label="事业部" required prefilled>
                <DropdownSelect
                  value={formData.bu}
                  options={buOptions}
                  isOpen={openDropdown === 'bu'}
                  onToggle={() => toggleDropdown('bu')}
                  onSelect={(val) => { update('bu', val); setOpenDropdown(null) }}
                />
              </FormField>

              {/* 商机来源 - 文本框 */}
              <FormField label="商机来源" prefilled>
                <input
                  type="text"
                  value={formData.source}
                  onChange={e => update('source', e.target.value)}
                  className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>

              {/* 商机名称 - 文本框，取标讯项目名称 */}
              <FormField label="商机名称" required prefilled>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => update('name', e.target.value)}
                  className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>

              {/* 客户名称 - 文本框，取标讯采购单位 */}
              <FormField label="客户名称" required prefilled>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={e => update('customer', e.target.value)}
                  className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>

              {/* 商机阶段 - 下拉选项 */}
              <FormField label="商机阶段">
                <DropdownSelect
                  value={formData.stage}
                  options={opportunityStages}
                  isOpen={openDropdown === 'stage'}
                  onToggle={() => toggleDropdown('stage')}
                  onSelect={(val) => { update('stage', val); setOpenDropdown(null) }}
                />
              </FormField>

              {/* 采购模式 - 下拉选项 */}
              <FormField label="采购模式" prefilled>
                <DropdownSelect
                  value={formData.procurementMode}
                  options={procurementModeOptions}
                  isOpen={openDropdown === 'procurementMode'}
                  onToggle={() => toggleDropdown('procurementMode')}
                  onSelect={(val) => { update('procurementMode', val); setOpenDropdown(null) }}
                />
              </FormField>

              {/* 产品域 - 下拉选项 */}
              <FormField label="产品域" prefilled>
                <DropdownSelect
                  value={formData.productDomain}
                  options={productDomainOptions}
                  isOpen={openDropdown === 'productDomain'}
                  onToggle={() => toggleDropdown('productDomain')}
                  onSelect={(val) => { update('productDomain', val); setOpenDropdown(null) }}
                />
              </FormField>

              {/* 产品总金额（元）+ 主机总台数 两列 */}
              <div className="grid grid-cols-2 gap-2.5">
                <FormField label="产品总金额（元）" prefilled>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    onChange={e => update('totalAmount', e.target.value)}
                    placeholder="0"
                    className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </FormField>
                <FormField label="主机总台数" prefilled>
                  <input
                    type="number"
                    value={formData.totalQuantity}
                    onChange={e => update('totalQuantity', e.target.value)}
                    placeholder="0"
                    className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </FormField>
              </div>

              {/* 预计签约日期 - 日期格式字段 */}
              <FormField label="预计签约日期" prefilled>
                <input
                  type="date"
                  value={formData.expectedSignDate}
                  onChange={e => update('expectedSignDate', e.target.value)}
                  className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>

              {/* 赢率 - 下拉选项 */}
              <FormField label="赢率（Winrate）" prefilled>
                <DropdownSelect
                  value={formData.winRate}
                  options={winRateOptions}
                  isOpen={openDropdown === 'winRate'}
                  onToggle={() => toggleDropdown('winRate')}
                  onSelect={(val) => { update('winRate', val); setOpenDropdown(null) }}
                />
              </FormField>

              {/* 备注 - 段落文本框 */}
              <FormField label="备注">
                <textarea
                  value={formData.remark}
                  onChange={e => update('remark', e.target.value)}
                  rows={3}
                  placeholder="请输入备注信息..."
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
              disabled={!canSubmit}
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

/** 通用下拉选择器 */
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
  prefilled?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {required && <span className="text-2xs text-destructive">*</span>}
        {prefilled && (
          <span className="rounded bg-accent px-1 py-0.5 text-[9px] font-medium text-primary">
            自动填充
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
