import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import { type BidInfo, type BidStatus, mockBids } from '@/data/mock-data'

interface AppState {
  bids: BidInfo[]
  updateBidStatus: (bidId: string, status: BidStatus, relatedOppId?: string) => void
  // 反馈流程扩展：一次性写入状态及关联反馈字段
  updateBidFeedback: (bidId: string, status: BidStatus, data?: {
    relatedOpportunityId?: string
    noOppHasIsgProduct?: '是' | '否'
    followUpRemark?: string
    linkedCdbId?: string
  }) => void
  // 跟进中备注支持多次编辑
  updateFollowUpRemark: (bidId: string, remark: string) => void
  // 实时招标 ↔ 意向招标 关联管理（决策一经做出即不可逆）
  linkIntentBid: (realtimeBidId: string, intentBidId: string) => void   // 选择关联：status 跟随被关联意向招标
  markNoLink: (realtimeBidId: string) => void                            // 显式不关联：进入常规反馈流程
}

const AppContext = createContext<AppState | null>(null)

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used inside AppProvider')
  return ctx
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [bids, setBids] = useState<BidInfo[]>(mockBids)

  // 派生 bids：已关联意向招标的实时招标，status / relatedOpportunityId / followUpRemark 等实时跟随被关联意向招标
  // 这样意向招标的状态后续变化（如反馈无商机/新建商机/跟进中），所有关联它的实时招标会自动同步
  const effectiveBids = useMemo<BidInfo[]>(() => {
    const intentMap = new Map(
      bids.filter(b => b.bidType === '意向招标').map(b => [b.id, b])
    )
    return bids.map(b => {
      if (b.bidType === '实时招标' && b.linkedIntentBidId) {
        const intent = intentMap.get(b.linkedIntentBidId)
        if (intent) {
          return {
            ...b,
            status: intent.status,
            relatedOpportunityId: intent.relatedOpportunityId ?? b.relatedOpportunityId,
            followUpRemark: intent.followUpRemark ?? b.followUpRemark,
            noOppHasIsgProduct: intent.noOppHasIsgProduct ?? b.noOppHasIsgProduct,
            linkedCdbId: intent.linkedCdbId ?? b.linkedCdbId,
          }
        }
      }
      return b
    })
  }, [bids])

  const updateBidStatus = useCallback((bidId: string, status: BidStatus, relatedOppId?: string) => {
    setBids(prev => prev.map(b =>
      b.id === bidId
        ? { ...b, status, relatedOpportunityId: relatedOppId ?? b.relatedOpportunityId }
        : b
    ))
  }, [])

  const updateBidFeedback = useCallback((bidId: string, status: BidStatus, data?: {
    relatedOpportunityId?: string
    noOppHasIsgProduct?: '是' | '否'
    followUpRemark?: string
    linkedCdbId?: string
  }) => {
    setBids(prev => prev.map(b =>
      b.id === bidId
        ? {
            ...b,
            status,
            relatedOpportunityId: data?.relatedOpportunityId ?? b.relatedOpportunityId,
            ...(data?.noOppHasIsgProduct !== undefined && { noOppHasIsgProduct: data.noOppHasIsgProduct }),
            ...(data?.followUpRemark !== undefined && { followUpRemark: data.followUpRemark }),
            ...(data?.linkedCdbId !== undefined && { linkedCdbId: data.linkedCdbId }),
          }
        : b
    ))
  }, [])

  const updateFollowUpRemark = useCallback((bidId: string, remark: string) => {
    setBids(prev => prev.map(b =>
      b.id === bidId
        ? { ...b, followUpRemark: remark }
        : b
    ))
  }, [])

  const linkIntentBid = useCallback((realtimeBidId: string, intentBidId: string) => {
    // 仅设置关联指针，status / relatedOpportunityId 由 effectiveBids 派生层实时同步
    setBids(prev => prev.map(b =>
      b.id === realtimeBidId
        ? { ...b, linkedIntentBidId: intentBidId }
        : b
    ))
  }, [])

  const markNoLink = useCallback((realtimeBidId: string) => {
    setBids(prev => prev.map(b =>
      b.id === realtimeBidId
        ? { ...b, linkedIntentBidId: null, status: 'assigned' }
        : b
    ))
  }, [])

  return (
    <AppContext.Provider value={{ bids: effectiveBids, updateBidStatus, updateBidFeedback, updateFollowUpRemark, linkIntentBid, markNoLink }}>
      {children}
    </AppContext.Provider>
  )
}
