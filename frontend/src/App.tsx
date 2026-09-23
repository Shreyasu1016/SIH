import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { AppLayout } from './components/layout/AppLayout'
import { LandingPage } from './pages/LandingPage'
import { UploadPage } from './pages/UploadPage'
import { DashboardPage } from './pages/DashboardPage'
import { VersionsPage } from './pages/VersionsPage'
import { ChecklistPage } from './pages/ChecklistPage'
import { GapAnalysisPage } from './pages/GapAnalysisPage'
import { ReportPage } from './pages/ReportPage'

/**
 * NormAI frontend shell — routes + i18n.
 * Backend integration point: swap mock JSON imports in pages for API clients.
 */
export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="versions" element={<VersionsPage />} />
            <Route path="checklist" element={<ChecklistPage />} />
            <Route path="gaps" element={<GapAnalysisPage />} />
            <Route path="report" element={<ReportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
