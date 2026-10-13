import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { AppStateProvider } from './state'
import { ToastProvider } from './context/ToastContext'
import { TourProvider } from './context/TourContext'
import { AppLayout } from './components/layout/AppLayout'

const DashboardPage = React.lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
)
const RemindersPage = React.lazy(() =>
  import('./pages/RemindersPage').then((m) => ({ default: m.RemindersPage }))
)
const CalculatorPage = React.lazy(() =>
  import('./pages/CalculatorPage').then((m) => ({ default: m.CalculatorPage }))
)
const AnalyticsPage = React.lazy(() =>
  import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
)
const LearnPage = React.lazy(() =>
  import('./pages/LearnPage').then((m) => ({ default: m.LearnPage }))
)
const SettingsPage = React.lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
)
const NotFoundPage = React.lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
)

export const GlassLoadingFallback: React.FC = () => (
  <div
    role="status"
    aria-label="Loading page content"
    className="min-h-[50vh] flex items-center justify-center p-4 sm:p-8 select-none"
  >
    <div className="glass-panel px-6 py-5 rounded-2xl flex items-center gap-3.5 shadow-lg border border-white/60">
      <div
        className="w-5 h-5 rounded-full border-2 border-emerald-600/30 border-t-emerald-700 animate-spin"
        aria-hidden="true"
      />
      <span className="text-sm font-semibold text-[#14301f] tracking-wide">
        Loading EcoPulse...
      </span>
    </div>
  </div>
)

export default function App(): React.JSX.Element {
  return (
    <AppStateProvider>
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <BrowserRouter>
            <TourProvider>
              <Suspense fallback={<GlassLoadingFallback />}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="dashboard" element={<Navigate to="/" replace />} />
                    <Route path="reminders" element={<RemindersPage />} />
                    <Route path="calculator" element={<CalculatorPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="learn" element={<LearnPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </TourProvider>
          </BrowserRouter>
        </ToastProvider>
      </MotionConfig>
    </AppStateProvider>
  )
}


