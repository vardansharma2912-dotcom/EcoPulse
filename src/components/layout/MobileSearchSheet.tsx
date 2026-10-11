import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Search, X, Bell, BookOpen, Calculator, BarChart3, LayoutDashboard, ArrowRight } from 'lucide-react'
import { useAppState } from '../../state'

export interface MobileSearchSheetProps {
  isOpen: boolean
  onClose: () => void
}

const QUICK_PAGES = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Reminders', path: '/reminders', icon: Bell },
  { title: 'Appliance Calculator', path: '/calculator', icon: Calculator },
  { title: 'Weekly Analytics', path: '/analytics', icon: BarChart3 },
  { title: 'Conservation Guide', path: '/learn', icon: BookOpen },
]

export const MobileSearchSheet: React.FC<MobileSearchSheetProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const { state } = useAppState()
  const navigate = useNavigate()

  const filteredReminders = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return state.reminders.filter(
      (r) => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
    )
  }, [state.reminders, query])

  const filteredPages = useMemo(() => {
    if (!query.trim()) return QUICK_PAGES
    const q = query.toLowerCase()
    return QUICK_PAGES.filter((p) => p.title.toLowerCase().includes(q))
  }, [query])

  const handleSelect = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Search EcoPulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex flex-col justify-start p-3 sm:p-4"
        >
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full max-w-lg mx-auto glass-strong rounded-2xl shadow-2xl p-4 flex flex-col max-h-[85dvh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-2 pb-3 border-b border-emerald-900/10">
              <Search className="w-5 h-5 text-emerald-800 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reminders, guides, pages..."
                autoFocus
                className="flex-1 bg-transparent border-none text-[#14301f] placeholder:text-slate-500 font-medium text-base focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="p-1.5 rounded-lg text-slate-500 hover:text-[#14301f] hover:bg-emerald-800/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto pt-3 space-y-4">
              {filteredReminders.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900/70 mb-2 px-1">
                    Matching Reminders
                  </h3>
                  <div className="space-y-1.5">
                    {filteredReminders.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSelect('/reminders')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-800/10 text-left transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#14301f]">{r.title}</p>
                          <p className="text-xs text-slate-600 capitalize">
                            {r.category} · {r.time}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-emerald-700" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900/70 mb-2 px-1">
                  {query.trim() ? 'Matching Pages' : 'Quick Navigation'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {filteredPages.map((page) => {
                    const Icon = page.icon
                    return (
                      <button
                        key={page.path}
                        type="button"
                        onClick={() => handleSelect(page.path)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-800/10 text-left transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-700/10 text-emerald-800 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-[#14301f]">{page.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
