import { PageHeader } from '@/components/layout/PageHeader'
import { BidOnePager } from '@/components/bid/BidOnePager'

export function BidOnePagerPage() {

  return (
    <div className="flex h-full flex-col bg-background">
      <PageHeader title="标讯一纸通" />
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-6">
        <div className="bg-card mx-4 mt-3 rounded-xl border p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <BidOnePager />
        </div>
      </div>
    </div>
  )
}
