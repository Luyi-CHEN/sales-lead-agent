import { useState } from 'react'
import { type BidInfo } from '@/data/mock-data'
import { Button } from '@/components/ui/button'
import { X, FileText } from 'lucide-react'

interface FollowUpSheetProps {
  bid: BidInfo
  onClose: () => void
  onSubmit: (remark: string) => void
}

export function FollowUpSheet({ bid, onClose, onSubmit }: FollowUpSheetProps) {
  const isEditing = bid.status === 'following'
  const [remark, setRemark] = useState(bid.followUpRemark || '')

  const canSubmit = remark.trim().length > 0

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
              <h2 className="text-base font-bold text-foreground">
                {isEditing ? '编辑跟进备注' : '标讯跟进'}
              </h2>
              <p className="text-2xs text-muted-foreground mt-0.5">
                {isEditing ? '更新当前跟进备注信息' : '填写跟进备注，标讯状态将置为「跟进中」'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto scrollbar-hide px-4" style={{ maxHeight: '50vh' }}>
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                跟进备注 <span className="text-destructive">*</span>
              </label>
              <textarea
                placeholder="请输入跟进备注..."
                value={remark}
                onChange={e => setRemark(e.target.value)}
                rows={5}
                className="w-full rounded-xl border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {!isEditing && (
              <div className="mb-3 flex items-start gap-2 rounded-lg bg-info-muted p-2.5">
                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
                <p className="text-2xs text-foreground/70">
                  提交后该标讯将标记为「跟进中」，您可随时回来编辑备注
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className="border-t px-4 pt-3 pb-2">
            <Button
              size="full"
              variant="warning"
              disabled={!canSubmit}
              onClick={() => canSubmit && onSubmit(remark.trim())}
              className={!canSubmit ? 'opacity-40' : ''}
              data-track={isEditing ? '保存跟进备注' : '提交「跟进中」反馈'}
              data-track-type="商机处理"
            >
              {canSubmit ? (isEditing ? '保存备注' : '确认提交') : '请填写跟进备注'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
