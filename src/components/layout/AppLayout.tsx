import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Bell,
  Calculator,
  BarChart3,
  BookOpen,
  Settings as SettingsIcon,
  Leaf,
} from 'lucide-react'
import { LeafBackground } from './LeafBackground'

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
    <div className="min-h-screen text-[#14301f] flex flex-col lg:flex-row relative">
      {/* Fixed Botanical Background Layer */}
      <LeafBackground />

      {/* Desktop Floating Glass Sidebar (lg+) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between m-4 glass-panel rounded-2xl p-5 shrink-0 sticky top-4 h-[calc(100vh-2rem)] z-30">
        <div>
          {/* Logo & Project Banner */}
          <div className="flex items-center gap-3 px-2 py-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm shadow-emerald-950/15">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-[#14301f] tracking-tight block">
                EcoPulse
              </span>
              <p className="text-[11px] text-slate-600 font-medium">Smart Energy Reminder</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-950/15'
                        : 'text-slate-700 hover:text-[#14301f] hover:bg-white/60'
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

        {/* Bottom Project Metadata Card */}
        <div className="p-3.5 rounded-xl glass-card text-[11px] space-y-1 border border-white/70">
          <p className="font-bold text-[#0f2418]">CHE110 Environmental Studies</p>
          <p className="text-[#183624] font-semibold">Assignment Due: 20 Oct 2026</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 z-10">
        {/* Mobile Glass Header */}
        <header className="lg:hidden glass-panel border-b border-white/60 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#14301f]">EcoPulse</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-900 px-2 py-0.5 rounded-md bg-white/80 border border-emerald-900/15">
            CHE110
          </span>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Glass Bottom Tab Bar (< lg) */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 glass-panel border-t border-white/75 z-50 px-2 py-1.5 flex justify-around backdrop-blur-md shadow-lg"
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
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-colors ${
                  isActive
                    ? 'text-emerald-800'
                    : 'text-slate-600 hover:text-[#14301f]'
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
