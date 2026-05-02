import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppState } from '@/store/app-store'
import { industryColors } from '@/data/mock-data'
import {
  MapPin, Clock, Building2, Phone, User, Tag,
  Link2, XCircle, PlusCircle, ExternalLink, Share2,
  Banknote, Calendar, Layers, Globe
} from 'lucide-react'
// Phone number masking — prototype demo only, prevent testers from calling real contacts
function maskPhone(phone: string): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    // Mobile: 138****1234
    return digits.slice(0, 3) + '****' + digits.slice(7)
  }
  if (digits.length >= 7) {
    // Landline: keep first 3 & last 2, mask middle
    const head = digits.slice(0, 3)
    const tail = digits.slice(-2)
    const mid = '*'.repeat(digits.length - 5)
    return head + mid + tail
  }
  return phone  // too short to mask
}

import { LinkOpportunitySheet } from '@/components/bid/LinkOpportunitySheet'
import { NoOpportunitySheet } from '@/components/bid/NoOpportunitySheet'
import { CreateOpportunitySheet } from '@/components/bid/CreateOpportunitySheet'
import { useToast } from '@/components/ui/toast'

const statusConfig = {
  pending: { label: '待处理', variant: 'new' as const },
  linked: { label: '已关联商机', variant: 'done' as const },
  no_opportunity: { label: '无商机反馈', variant: 'destructive' as const },
  new_opportunity: { label: '已新建商机', variant: 'done' as const },
}

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { bids, markBidRead, updateBidStatus } = useAppState()
  const { showToast } = useToast()

  const bid = bids.find(b => b.id === id)

  const [showLinkSheet, setShowLinkSheet] = useState(false)
  const [showNoOppSheet, setShowNoOppSheet] = useState(false)
  const [showCreateSheet, setShowCreateSheet] = useState(false)

  useEffect(() => {
    if (bid && !bid.isRead) {
      markBidRead(bid.id)
    }
  }, [bid, markBidRead])

  if (!bid) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
        <p>标讯不存在</p>
        <Button variant="link" onClick={() => navigate('/')}>返回首页</Button>
      </div>
    )
  }

  const status = statusConfig[bid.status]
  const isProcessed = bid.status !== 'pending'
  const industryClass = industryColors[bid.industry] || 'bg-secondary text-muted-foreground'

  const handleLink = (oppId: string) => {
    updateBidStatus(bid.id, 'linked', oppId)
    setShowLinkSheet(false)
    showToast('已成功关联商机', 'success')
  }

  const handleNoOpp = () => {
    updateBidStatus(bid.id, 'no_opportunity')
    setShowNoOppSheet(false)
    showToast('已反馈无商机', 'success')
  }

  const handleCreate = () => {
    updateBidStatus(bid.id, 'new_opportunity')
    setShowCreateSheet(false)
    showToast('新商机创建成功', 'success')
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <PageHeader
        title="标讯详情"
        right={
          <button
            data-track="分享标讯"
            data-track-type="标讯操作"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground active:bg-secondary"
          >
            <Share2 className="h-[18px] w-[18px]" />
          </button>
        }
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-28">
        {/* Hero section */}
        <div className="border-b bg-card px-4 py-4">
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <Badge variant={status.variant}>{status.label}</Badge>
            <span className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-2xs font-medium text-muted-foreground">
              {bid.bu}
            </span>
            <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-2xs font-medium text-primary">
              {bid.bidType}
            </span>
            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-2xs font-medium ${industryClass}`}>
              {bid.industry}
            </span>
            {bid.keywords && (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-secondary px-1.5 py-0.5 text-2xs font-medium text-muted-foreground">
                <Tag className="h-2.5 w-2.5" />
                {bid.keywords}
              </span>
            )}
            {bid.status === 'pending' && bid.relatedOpportunityCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-2xs font-medium text-primary ml-auto">
                <Link2 className="h-2.5 w-2.5" />
                可能关联 {bid.relatedOpportunityCount} 条商机
              </span>
            )}
          </div>
          <h1 className="text-lg font-bold text-foreground leading-snug mb-2">
            {bid.projectName}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            {bid.procurementUnit || '未公示采购单位'}
          </p>
          {bid.announcementName !== bid.projectName && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 opacity-70">
              公告：{bid.announcementName}
            </p>
          )}
        </div>

        {/* Key Info Grid */}
        <div className="bg-card mx-4 mt-3 rounded-xl border p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">关键信息</h2>
          <div className="grid grid-cols-2 gap-3">
            <InfoCell icon={<Banknote className="h-3.5 w-3.5" />} label="预算金额" value={`${bid.budgetAmount}万元`} highlight />
            <InfoCell icon={<Globe className="h-3.5 w-3.5" />} label="所在区域" value={`${bid.region} · ${bid.city}`} />
            <InfoCell icon={<Building2 className="h-3.5 w-3.5" />} label="事业部" value={bid.bu} />
            <InfoCell icon={<Layers className="h-3.5 w-3.5" />} label="标讯类型" value={bid.bidType} />
            <InfoCell icon={<Calendar className="h-3.5 w-3.5" />} label="采购开始" value={bid.startDate} />
            <InfoCell icon={<Clock className="h-3.5 w-3.5" />} label="采购截止" value={bid.deadline} />
            <InfoCell icon={<Layers className="h-3.5 w-3.5" />} label="主行业" value={bid.industry} />
            <InfoCell icon={<Tag className="h-3.5 w-3.5" />} label="关键词" value={bid.keywords || '—'} />
            {bid.totalQuantity && (
              <InfoCell icon={<MapPin className="h-3.5 w-3.5" />} label="数量总计" value={bid.totalQuantity} />
            )}
          </div>
        </div>

        {/* Procurement Summary */}
        <div className="bg-card mx-4 mt-3 rounded-xl border p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">采购需求概况</h2>
          <p className="text-sm text-foreground leading-relaxed">
            {bid.procurementSummary}
          </p>
        </div>

        {/* Contact Section (only if contact info available) */}
        {(bid.contactPerson || bid.contactPhone) ? (
          <div className="bg-card mx-4 mt-3 rounded-xl border p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">采购人联系方式</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
                  <User className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{bid.contactPerson || '未公示'}</p>
                  <p className="text-xs text-muted-foreground">{maskPhone(bid.contactPhone) || '未公示'}</p>
                </div>
              </div>
              {bid.contactPhone && (
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-success-foreground"
                  onClick={(e) => {
                    e.preventDefault()
                    window.alert(`原型演示模式\n\n拨号号码（已脱敏）：${maskPhone(bid.contactPhone)}`)
                  }}
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-4 mt-3 rounded-xl border border-dashed bg-secondary/50 p-3 text-center">
            <p className="text-xs text-muted-foreground">采购人联系方式暂未公示，请查看原始公告获取更多信息</p>
          </div>
        )}

        {/* Source Link */}
        <div className="mx-4 mt-3 mb-4">
          <a
            href={bid.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-track="查看原始公告"
            data-track-type="标讯浏览"
            className="flex w-full items-center justify-between rounded-xl border bg-card p-4 text-sm text-primary active:bg-accent"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <span className="flex items-center gap-2 font-medium">
              <ExternalLink className="h-4 w-4" />
              查看原始公告
            </span>
            <span className="text-xs text-muted-foreground">来源网站</span>
          </a>
        </div>

        {/* Related Opportunity (if linked) */}
        {bid.status === 'linked' && bid.relatedOpportunityId && (
          <div className="bg-success-muted mx-4 mb-4 rounded-xl border border-success/20 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="h-4 w-4 text-success" />
              <span className="text-xs font-semibold text-success">已关联商机</span>
            </div>
            <p className="text-sm font-medium text-foreground">{bid.relatedOpportunityId}</p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      {!isProcessed && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card px-4 pt-3 safe-bottom"
          style={{ boxShadow: 'var(--shadow-bottom-bar)' }}>
          <div className="mx-auto max-w-[480px] flex gap-2.5">
            <Button
              variant="outline"
              size="full"
              className="flex-1 gap-1.5"
              onClick={() => setShowNoOppSheet(true)}
              data-track="标记为「无商机」"
              data-track-type="商机处理"
            >
              <XCircle className="h-4 w-4" />
              无商机
            </Button>
            <Button
              variant="default"
              size="full"
              className="flex-1 gap-1.5"
              onClick={() => setShowLinkSheet(true)}
              data-track="关联已有商机"
              data-track-type="商机处理"
            >
              <Link2 className="h-4 w-4" />
              关联商机
            </Button>
            <Button
              variant="success"
              size="full"
              className="flex-1 gap-1.5"
              onClick={() => setShowCreateSheet(true)}
              data-track="新建商机"
              data-track-type="商机处理"
            >
              <PlusCircle className="h-4 w-4" />
              新建
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Sheets */}
      {showLinkSheet && (
        <LinkOpportunitySheet
          bid={bid}
          onClose={() => setShowLinkSheet(false)}
          onLink={handleLink}
        />
      )}
      {showNoOppSheet && (
        <NoOpportunitySheet
          onClose={() => setShowNoOppSheet(false)}
          onSubmit={handleNoOpp}
        />
      )}
      {showCreateSheet && (
        <CreateOpportunitySheet
          bid={bid}
          onClose={() => setShowCreateSheet(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  )
}

function InfoCell({ icon, label, value, highlight }: {
  icon: React.ReactNode; label: string; value: string; highlight?: boolean
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-2xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium truncate ${highlight ? 'text-primary' : 'text-foreground'}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
