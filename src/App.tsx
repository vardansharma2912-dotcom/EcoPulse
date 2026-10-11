import { useState } from 'react'
import { 
  Zap, 
  Leaf, 
  Bell, 
  BarChart3, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Laptop
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

const sampleEnergyData = [
  { time: '08:00', watts: 320 },
  { time: '10:00', watts: 450 },
  { time: '12:00', watts: 280 },
  { time: '14:00', watts: 520 },
  { time: '16:00', watts: 390 },
  { time: '18:00', watts: 210 },
  { time: '20:00', watts: 150 },
]

export default function App() {
  const [pulseCount, setPulseCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                EcoPulse <span className="text-emerald-400 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono">v0.1.0</span>
              </span>
              <p className="text-xs text-slate-400">Smart Energy Saving Reminder System</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5 text-emerald-400" /> CHE110 Project
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Deadline: 20 Oct 2026
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        {/* Verification Status Banner */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 mb-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Project Environment Verified & Running
                </h1>
                <p className="text-sm text-slate-300 mt-0.5">
                  CHE110 Environmental Studies Group Assignment workspace initialized cleanly in isolated directory.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 self-start md:self-auto px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Dev Server Active
            </div>
          </div>
        </div>

        {/* Tech Stack Diagnostics Grid */}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified Tech Stack Integrations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-mono">Core</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-base font-semibold text-white">React 19 + TypeScript</p>
            <p className="text-xs text-slate-400 mt-1">Vite 8 build system & fast HMR</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-mono">Styling</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-base font-semibold text-white">Tailwind CSS</p>
            <p className="text-xs text-slate-400 mt-1">Vite plugin with modern styling utilities</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-mono">Analytics</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-base font-semibold text-white">Recharts</p>
            <p className="text-xs text-slate-400 mt-1">Ready for real-time energy tracking charts</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-mono">Icons</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-base font-semibold text-white">Lucide React</p>
            <p className="text-xs text-slate-400 mt-1">Lightweight, modern iconography loaded</p>
          </div>
        </div>

        {/* Live Feature Preview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recharts Verification Card */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" /> Recharts Live Test
                </h3>
                <p className="text-xs text-slate-400">Validating chart rendering & SVG canvas pipeline</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">Energy Load (Watts)</span>
            </div>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sampleEnergyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#34d399' }}
                  />
                  <Area type="monotone" dataKey="watts" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#energyGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive State & Notification Preview Card */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Interactive State Test</h3>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Test React reactive state updates and animation responsiveness.
              </p>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 mb-6 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Simulated Energy Pulses</p>
                <p className="text-4xl font-extrabold text-emerald-400 font-mono mt-2">{pulseCount}</p>
                <p className="text-[11px] text-slate-500 mt-1">Units saved: {(pulseCount * 0.15).toFixed(2)} kWh</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                id="pulse-btn"
                onClick={() => setPulseCount(prev => prev + 1)}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition text-slate-950 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Leaf className="w-4 h-4" /> Trigger Pulse Counter
              </button>
              <button
                type="button"
                id="reset-btn"
                onClick={() => setPulseCount(0)}
                className="w-full py-2 px-4 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-xl text-xs transition cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-5 bg-slate-950/80 text-center text-xs text-slate-400">
        <p>EcoPulse • CHE110 Environmental Studies Group Assignment • Submission: 20 October 2026</p>
      </footer>
    </div>
  )
}
