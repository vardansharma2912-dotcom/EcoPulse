import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Bell,
  Calculator,
  BarChart3,
  BookOpen,
  Settings as SettingsIcon,
  Zap,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/calculator', label: 'Calculator', icon: Calculator },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#090b0e] text-slate-100 flex flex-col lg:flex-row">
      {/* Desktop Sidebar (lg+) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-[#222936] bg-[#0d1017] p-5 shrink-0 sticky top-0 h-screen">
        <div>
          {/* Logo & Project Banner */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                EcoPulse
              </span>
              <p className="text-[11px] text-slate-400">Energy Saving Reminder</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#151922]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Bottom Project Metadata */}
        <div className="p-3 rounded-xl bg-[#12151c] border border-[#222936] text-[11px] text-slate-400 space-y-1">
          <p className="font-medium text-slate-300">CHE110 Environmental Studies</p>
          <p className="text-slate-500">Assignment Submission: 20 Oct 2026</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-[#222936] bg-[#0d1017] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-white">EcoPulse</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono px-2 py-0.5 rounded bg-[#1a1e28] border border-[#2d3647]">
            CHE110
          </span>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (< lg) */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 bg-[#0d1017]/95 backdrop-blur-md border-t border-[#222936] z-50 px-2 py-1.5 flex justify-around"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
