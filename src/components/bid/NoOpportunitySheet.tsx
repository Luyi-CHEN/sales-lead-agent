import { useState } from 'react'
import { noOpportunityReasons } from '@/data/mock-data'
import { Button } from '@/components/ui/button'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'

interface NoOpportunitySheetProps {
  onClose: () => void
  onSubmit: () => void
}

export function NoOpportunitySheet({ onClose, onSubmit }: NoOpportunitySheetProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [otherText, setOtherText] = useState('')
  const [remark, setRemark] = useState('')

  const isOther = selectedReason === '其他原因'
  const canSubmit = selectedReason && (!isOther || otherText.trim())

  return (
    <>
      <div className="sheet-overlay animate-fade-in" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="mx-auto max-w-[480px] rounded-t-2xl bg-card safe-bottom"
          style={{ boxShadow: 'var(--shadow-elevated)', maxHeight: '85vh' }}>

          {/* Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="h-1 w-8 rounded-full bg-muted" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground">反馈无商机</h2>
              <p className="text-2xs text-muted-foreground mt-0.5">请选择无商机的主要原因</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Reason List */}
          <div className="overflow-y-auto scrollbar-hide px-4" style={{ maxHeight: '50vh' }}>
            <div className="flex flex-col gap-2 pb-3">
              {noOpportunityReasons.map(reason => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`card-press relative flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 ${
                    selectedReason === reason
                      ? 'border-primary bg-accent'
                      : 'bg-card'
                  }`}
                >
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    selectedReason === reason
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/30'
                  }`}>
                    {selectedReason === reason && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    selectedReason === reason ? 'font-semibold text-foreground' : 'text-foreground'
                  }`}>
                    {reason}
                  </span>
                </button>
              ))}
            </div>

            {/* Other reason input */}
            {isOther && (
              <div className="mb-3 animate-scale-in">
                <textarea
                  placeholder="请输入具体原因..."
                  value={otherText}
                  onChange={e => setOtherText(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            )}

            {/* Remark */}
            <div className="mb-3">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">备注（可选）</label>
              <textarea
                placeholder="补充说明..."
                value={remark}
                onChange={e => setRemark(e.target.value)}
                rows={2}
                className="w-full rounded-xl border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Tip */}
            <div className="mb-3 flex items-start gap-2 rounded-lg bg-warning-muted p-2.5">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <p className="text-2xs text-foreground/70">
                提交后该标讯将标记为「无商机」，如后续有变化可在详情页重新操作
              </p>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="border-t px-4 pt-3 pb-2">
            <Button
              size="full"
              variant={canSubmit ? "destructive" : "default"}
              disabled={!canSubmit}
              onClick={onSubmit}
              className={!canSubmit ? 'opacity-40' : ''}
            >
              {canSubmit ? '确认提交' : '请选择原因'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}