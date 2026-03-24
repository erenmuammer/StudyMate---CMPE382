import { useState } from 'react'
import { usePomodoro } from '../../hooks/usePomodoro'
import { IconTimer, IconCoffee, IconBook } from '../Icons'

export default function PomodoroTimer() {
  const [expanded, setExpanded] = useState(false)
  const { displayTime, isRunning, isBreak, cycle, toggle, reset, skip, progress } = usePomodoro()

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-40 transition-all duration-300 shadow-lg ${
          isRunning
            ? 'bg-primary animate-pulse-glow'
            : 'bg-surface border border-slate-700 hover:border-primary'
        }`}
        title="Pomodoro Timer"
      >
        <IconTimer className="w-6 h-6 text-slate-200" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-72 bg-bg-deep border border-slate-700 rounded-2xl shadow-2xl z-40 animate-bounce-in">
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
          {isBreak ? <><IconCoffee className="w-4 h-4" /> Mola (Break)</> : <><IconBook className="w-4 h-4" /> Calisma (Focus)</>}
        </span>
        <button
          onClick={() => setExpanded(false)}
          className="text-slate-500 hover:text-slate-300 transition-colors text-lg"
        >
          {'\u2715'}
        </button>
      </div>

      <div className="flex flex-col items-center py-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="6" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={isBreak ? '#22C55E' : '#06B6D4'}
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-mono text-slate-100">{displayTime}</span>
            <span className="text-xs text-slate-500">Dongu {cycle}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 pb-4">
        <button onClick={reset} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 text-sm transition-colors">
          Sifirla
        </button>
        <button
          onClick={toggle}
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
            isRunning ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-primary/20 text-primary hover:bg-primary/30'
          }`}
        >
          {isRunning ? 'Durdur' : 'Baslat'}
        </button>
        <button onClick={skip} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 text-sm transition-colors">
          Atla
        </button>
      </div>

      {isBreak && (
        <div className="px-4 pb-4 text-center">
          <p className="text-xs text-green-400 flex items-center justify-center gap-1">
            <IconCoffee className="w-3.5 h-3.5" /> Bir cay ic, biraz dinlen!
          </p>
        </div>
      )}
    </div>
  )
}
