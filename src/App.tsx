import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/store/app-store'
import { ToastProvider } from '@/components/ui/toast'
import { HomePage } from '@/pages/HomePage'
import { DetailPage } from '@/pages/DetailPage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppProvider>
        <ToastProvider>
          <div className="mx-auto h-[100dvh] max-w-[480px] overflow-hidden bg-background">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/bid/:id" element={<DetailPage />} />
            </Routes>
          </div>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App