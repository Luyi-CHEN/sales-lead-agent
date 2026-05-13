import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { type BidInfo, type BidStatus, mockBids } from '@/data/mock-data'

interface AppState {
  bids: BidInfo[]
  updateBidStatus: (bidId: string, status: BidStatus, relatedOppId?: string) => void
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

  const updateBidStatus = useCallback((bidId: string, status: BidStatus, relatedOppId?: string) => {
    setBids(prev => prev.map(b =>
      b.id === bidId
        ? { ...b, status, relatedOpportunityId: relatedOppId ?? b.relatedOpportunityId }
        : b
    ))
  }, [])

  const linkIntentBid = useCallback((realtimeBidId: string, intentBidId: string) => {
    setBids(prev => {
      const intent = prev.find(b => b.id === intentBidId)
      const intentStatus = intent?.status ?? 'pending'
      const intentOppId = intent?.relatedOpportunityId
      return prev.map(b =>
        b.id === realtimeBidId
          ? {
              ...b,
              linkedIntentBidId: intentBidId,
              // 状态跟随被关联意向招标
              status: intentStatus,
              relatedOpportunityId: intentOppId ?? b.relatedOpportunityId,
            }
          : b
      )
    })
  }, [])

  const markNoLink = useCallback((realtimeBidId: string) => {
    setBids(prev => prev.map(b =>
      b.id === realtimeBidId
        ? { ...b, linkedIntentBidId: null, status: 'pending' }
        : b
    ))
  }, [])

  return (
    <AppContext.Provider value={{ bids, updateBidStatus, linkIntentBid, markNoLink }}>
      {children}
    </AppContext.Provider>
  )
}
