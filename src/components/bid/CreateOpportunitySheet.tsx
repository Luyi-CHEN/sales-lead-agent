import { useState } from 'react'
import {
  type BidInfo,
  opportunityStages,
  buOptions,
  procurementModeOptions,
  productDomainOptions,
  winRateOptions,
  materialProductGroups,
} from '@/data/mock-data'
import { Button } from '@/components/ui/button'
import { X, Sparkles, ChevronDown, Trash2 } from 'lucide-react'

interface CreateOpportunitySheetProps {
  bid: BidInfo
  onClose: () => void
  onSubmit: () => void
}

export function CreateOpportunitySheet({ bid, onClose, onSubmit }: CreateOpportunitySheetProps) {
  // 系统根据标讯信息自动预填字段
  const [formData, setFormData] = useState({
    bu: 'ISG',                              // 事业部，默认ISG
    source: '标讯转化',                      // 商机来源，默认标讯转化
    name: bid.projectName || '',             // 商机名称 = 标讯项目名称
    customer: bid.procurementUnit || '',     // 客户名称 = 标讯采购单位
    stage: '发现需求',                       // 商机阶段，默认发现需求
    procurementMode: '普通采购',             // 采购模式，默认普通采购
    productDomain: '标准产品',               // 产品域，默认标准产品
    expectedSignDate: '',                    // 预计签约日期
    winRate: '10%(项目筹备期)',              // 赢率，默认10%
    hasSolutionOpportunity: '',              // 是否有解决方案机会
    remark: '',                              // 备注，默认为空
  })

  // 产品明细数组状态
  const [productDetails, setProductDetails] = useState<Array<{
    materialGroupId: string
    productLine: string
    estimatedAmount: string
  }>>([{ materialGroupId: '', productLine: '', estimatedAmount: '' }])

  // 管理各下拉框展开状态
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => prev === name ? null : name)
  }

  const update = (key: string, val: string) => {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  const handleMaterialGroupChange = (index: number, groupId: string) => {
    const group = materialProductGroups[groupId]
    setProductDetails(prev => prev.map((item, i) =>
      i === index ? { ...item, materialGroupId: groupId, productLine: group?.productLine || '' } : item
    ))
  }

  const handleProductDetailChange = (index: number, field: 'estimatedAmount', value: string) => {
    setProductDetails(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const addProductDetail = () => {
    setProductDetails(prev => [...prev, { materialGroupId: '', productLine: '', estimatedAmount: '' }])
  }

  const removeProductDetail = (index: number) => {
    setProductDetails(prev => prev.filter((_, i) => i !== index))
  }

  const isFormValid =
    formData.bu && formData.source && formData.name && formData.customer &&
    formData.stage && formData.procurementMode && formData.productDomain &&
    formData.expectedSignDate && formData.winRate && formData.hasSolutionOpportunity &&
    productDetails.every(p => p.materialGroupId && p.estimatedAmount)

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
                <DropdownSelect
                  value={formData.bu}
                  options={buOptions}
                  isOpen={openDropdown === 'bu'}
                  onToggle={() => toggleDropdown('bu')}
                  onSelect={(val) => { update('bu', val); setOpenDropdown(null) }}
                />
              </FormField>

              {/* 商机来源 */}
              <FormField label="商机来源" required>
                <input
                  type="text"
                  value={formData.source}
                  onChange={e => update('source', e.target.value)}
                  className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
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

              {/* 客户名称 */}
              <FormField label="客户名称" required prefilled="自动填充标讯采购单位">
                <input
                  type="text"
                  value={formData.customer}
                  onChange={e => update('customer', e.target.value)}
                  className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </FormField>

              {/* 商机阶段 */}
              <FormField label="商机阶段" required>
                <DropdownSelect
                  value={formData.stage}
                  options={opportunityStages}
                  isOpen={openDropdown === 'stage'}
                  onToggle={() => toggleDropdown('stage')}
                  onSelect={(val) => { update('stage', val); setOpenDropdown(null) }}
                />
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

              {/* 产品域 */}
              <FormField label="产品域" required>
                <DropdownSelect
                  value={formData.productDomain}
                  options={productDomainOptions}
                  isOpen={openDropdown === 'productDomain'}
                  onToggle={() => toggleDropdown('productDomain')}
                  onSelect={(val) => { update('productDomain', val); setOpenDropdown(null) }}
                />
              </FormField>

              {/* 预计签约日期 */}
              <FormField label="预计签约日期" required>
                <input
                  type="date"
                  value={formData.expectedSignDate}
                  onChange={e => update('expectedSignDate', e.target.value)}
                  placeholder="请选择日期"
                  className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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

              {/* 备注 */}
              <FormField label="备注">
                <textarea
                  value={formData.remark}
                  onChange={e => update('remark', e.target.value)}
                  rows={3}
                  placeholder="请输入备注信息..."
                  className="w-full rounded-lg border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </FormField>

              {/* ═══ 产品明细区域 ═══ */}
              <div className="mb-3 mt-4 flex items-center gap-2">
                <div className="h-4 w-1 rounded-full bg-primary"></div>
                <h3 className="text-sm font-semibold text-foreground">产品明细</h3>
              </div>

              {productDetails.map((detail, index) => (
                <div key={index} className="rounded-lg border border-border/50 bg-muted/30 p-3 mb-3">
                  {/* 组头：第N组 + 删除按钮 */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">第{index + 1}组</span>
                    {productDetails.length > 1 && (
                      <button
                        onClick={() => removeProductDetail(index)}
                        className="flex items-center gap-1 text-xs text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        删除
                      </button>
                    )}
                  </div>

                  {/* 物料产品组 */}
                  <FormField label="物料产品组" required>
                    <ObjectDropdownSelect
                      value={detail.materialGroupId}
                      items={Object.entries(materialProductGroups).map(([id, { name }]) => ({ id, name }))}
                      isOpen={openDropdown === `materialGroup_${index}`}
                      onToggle={() => toggleDropdown(`materialGroup_${index}`)}
                      onSelect={(id) => { handleMaterialGroupChange(index, id); setOpenDropdown(null) }}
                    />
                  </FormField>

                  {/* 产线 - 只读 */}
                  <FormField label="产线">
                    <input
                      type="text"
                      value={detail.productLine}
                      readOnly
                      className="h-10 w-full rounded-lg border bg-muted px-3 text-sm text-muted-foreground focus:outline-none cursor-not-allowed"
                    />
                  </FormField>

                  {/* 预计收入总金额（元） */}
                  <FormField label="预计收入总金额（元）" required>
                    <input
                      type="number"
                      value={detail.estimatedAmount}
                      onChange={e => handleProductDetailChange(index, 'estimatedAmount', e.target.value)}
                      placeholder="0"
                      className="h-10 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </FormField>
                </div>
              ))}

              {/* 添加产品明细按钮 */}
              <button
                onClick={addProductDetail}
                className="w-full rounded-lg border border-dashed border-primary/50 py-2 text-xs text-primary"
              >
                + 添加产品明细
              </button>
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

/** 对象下拉选择器（id/name 选项，支持下拉展示name，选中后存id） */
function ObjectDropdownSelect({ value, items, isOpen, onToggle, onSelect }: {
  value: string
  items: Array<{ id: string; name: string }>
  isOpen: boolean
  onToggle: () => void
  onSelect: (id: string) => void
}) {
  const selectedItem = items.find(item => item.id === value)
  const displayValue = selectedItem?.name || '请选择'

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex h-10 w-full items-center justify-between rounded-lg border bg-secondary px-3 text-sm text-foreground"
      >
        <span>{displayValue}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-11 z-10 rounded-lg border bg-card py-1 animate-scale-in max-h-48 overflow-y-auto"
          style={{ boxShadow: 'var(--shadow-elevated)' }}>
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full px-3 py-2 text-left text-sm ${
                value === item.id
                  ? 'bg-accent font-semibold text-primary'
                  : 'text-foreground active:bg-secondary'
              }`}
            >
              {item.name}
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
