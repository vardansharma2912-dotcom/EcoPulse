import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppStateProvider } from './state'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { RemindersPage } from './pages/RemindersPage'
import { CalculatorPage } from './pages/CalculatorPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { LearnPage } from './pages/LearnPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App(): React.JSX.Element {
  return (
    <AppStateProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="calculator" element={<CalculatorPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppStateProvider>
  )
}
