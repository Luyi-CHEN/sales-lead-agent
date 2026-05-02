import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/store/app-store'
import { AnalyticsProvider } from '@/store/analytics-store'
import { ClickTracker } from '@/components/analytics/ClickTracker'
import { ToastProvider } from '@/components/ui/toast'
import { HomePage } from '@/pages/HomePage'
import { DetailPage } from '@/pages/DetailPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AnalyticsProvider>
        <AppProvider>
          <ToastProvider>
            <ClickTracker />
            <Routes>
              {/* PC Analytics Dashboard — no mobile constraints */}
              <Route path="/analytics" element={<AnalyticsPage />} />

              {/* Mobile prototype — constrained to 480px */}
              <Route
                path="*"
                element={
                  <div className="mx-auto h-[100dvh] max-w-[480px] overflow-hidden bg-background">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/bid/:id" element={<DetailPage />} />
                    </Routes>
                  </div>
                }
              />
            </Routes>
          </ToastProvider>
        </AppProvider>
      </AnalyticsProvider>
    </BrowserRouter>
  )
}

export default App
