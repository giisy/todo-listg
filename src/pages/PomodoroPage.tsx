import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Coffee, Brain, Timer, CheckCircle2, Settings, Save, Check, Loader2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

type Mode = 'work' | 'break'

export default function PomodoroPage() {
  const { state, dispatch } = useApp()
  const workDuration = state.settings.pomodoroWork * 60
  const breakDuration = state.settings.pomodoroBreak * 60

  const [mode, setMode] = useState<Mode>('work')
  const [timeLeft, setTimeLeft] = useState(workDuration)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [pomodoroWork, setPomodoroWork] = useState(state.settings.pomodoroWork)
  const [pomodoroBreak, setPomodoroBreak] = useState(state.settings.pomodoroBreak)
  const [savedTimer, setSavedTimer] = useState(false)
  const [savingTimer, setSavingTimer] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = mode === 'work' ? workDuration : breakDuration
  const progress = ((total - timeLeft) / total) * 100

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current!)
            setIsRunning(false)
            if (mode === 'work') {
              setSessions(s => s + 1)
              setMode('break')
              setTimeLeft(breakDuration)
            } else {
              setMode('work')
              setTimeLeft(workDuration)
            }
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, mode, workDuration, breakDuration])

  const reset = () => {
    setIsRunning(false)
    setTimeLeft(mode === 'work' ? workDuration : breakDuration)
  }

  const switchMode = (m: Mode) => {
    setIsRunning(false)
    setMode(m)
    setTimeLeft(m === 'work' ? workDuration : breakDuration)
  }

  const handleSaveTimer = async () => {
    setSavingTimer(true)
    try {
      dispatch({ type: 'UPDATE_SETTINGS', payload: { pomodoroWork, pomodoroBreak } })
      setSavedTimer(true)
      setTimeout(() => setSavedTimer(false), 2000)
    } finally {
      setSavingTimer(false)
    }
  }

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')

  const size = 260
  const strokeWidth = 8
  const r = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * r

  const pendingTasks = state.tasks.filter(t => t.status !== 'done' && t.status !== 'archived').slice(0, 5)

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-text-primary">Pomodoro</h2>
          <p className="text-xs text-text-muted mt-0.5">Stay focused, work in intervals</p>
        </div>

        {/* Mode tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => switchMode('work')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150',
              mode === 'work' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            )}
          >
            <Brain size={14} />
            Focus
          </button>
          <button
            onClick={() => switchMode('break')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150',
              mode === 'break' ? 'bg-accent-emerald text-white' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            )}
          >
            <Coffee size={14} />
            Break
          </button>
          <div className="ml-auto flex items-center gap-2 text-xs text-text-muted">
            <CheckCircle2 size={13} className="text-accent-emerald" />
            {sessions} sessions completed
          </div>
        </div>

        {/* Timer */}
        <div className="card p-8 flex flex-col items-center gap-6">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(42,47,56,0.8)" strokeWidth={strokeWidth} />
              <motion.circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none"
                stroke={mode === 'work' ? '#3B82F6' : '#10B981'}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-5xl font-bold text-text-primary font-mono tracking-tight">{minutes}:{seconds}</span>
              <span className={cn('text-xs font-medium uppercase tracking-widest', mode === 'work' ? 'text-accent-blue' : 'text-accent-emerald')}>
                {mode === 'work' ? 'Focus Time' : 'Break Time'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={reset} className="w-12 h-12 rounded-full border border-border hover:border-border/80 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-150">
              <RotateCcw size={18} />
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRunning(!isRunning)}
              className={cn('w-16 h-16 rounded-full flex items-center justify-center text-white shadow-glow transition-all duration-150', mode === 'work' ? 'bg-accent-blue hover:bg-accent-blue-dim' : 'bg-accent-emerald hover:bg-emerald-600')}
            >
              {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </motion.button>
            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
              <Timer size={18} className="text-text-muted" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn('w-2.5 h-2.5 rounded-full transition-all duration-300', i < sessions % 4 ? 'bg-accent-blue' : 'bg-border')} />
            ))}
          </div>
          <p className="text-xs text-text-muted">Every 4 sessions = long break</p>
        </div>

        {/* Pending tasks */}
        {pendingTasks.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={14} className="text-text-secondary" />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Focus On</span>
            </div>
            <div className="space-y-2">
              {pendingTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-white/3 transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-blue flex-shrink-0" />
                  <span className="text-sm text-text-primary truncate">{task.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timer Settings */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={14} className="text-text-secondary" />
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Timer Settings</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-2xs text-text-muted font-medium mb-1.5">Work Duration (minutes)</label>
              <input type="number" min={1} max={60} value={pomodoroWork} onChange={e => setPomodoroWork(Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="block text-2xs text-text-muted font-medium mb-1.5">Break Duration (minutes)</label>
              <input type="number" min={1} max={30} value={pomodoroBreak} onChange={e => setPomodoroBreak(Number(e.target.value))} className="input" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              Work <span className="text-accent-blue font-medium">{pomodoroWork}m</span> · Break <span className="text-accent-emerald font-medium">{pomodoroBreak}m</span>
            </p>
            <button
              onClick={handleSaveTimer}
              disabled={savingTimer}
              className={cn('btn-primary text-xs py-1.5 px-4', savedTimer && 'bg-accent-emerald hover:bg-accent-emerald', savingTimer && 'opacity-70 cursor-not-allowed')}
            >
              {savingTimer ? <><Loader2 size={13} className="animate-spin" />Saving...</> : savedTimer ? <><Check size={13} />Saved!</> : <><Save size={13} />Save</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}