import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { type BidInfo, type BidStatus, mockBids } from '@/data/mock-data'

interface AppState {
  bids: BidInfo[]
  updateBidStatus: (bidId: string, status: BidStatus, relatedOppId?: string) => void
  markBidRead: (bidId: string) => void
  unreadCount: number
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

  const markBidRead = useCallback((bidId: string) => {
    setBids(prev => prev.map(b =>
      b.id === bidId ? { ...b, isRead: true } : b
    ))
  }, [])

  const unreadCount = bids.filter(b => b.status === 'pending').length

  return (
    <AppContext.Provider value={{ bids, updateBidStatus, markBidRead, unreadCount }}>
      {children}
    </AppContext.Provider>
  )
}
