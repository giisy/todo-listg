import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, RotateCcw, Coffee, Brain, SkipForward } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/utils/cn'

type Session = 'work' | 'break'

const WORK_MINUTES = 25
const BREAK_MINUTES = 5

function playBeep(type: 'start' | 'end') {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'end') {
      // Triple beep for session end
      const times = [0, 0.3, 0.6]
      times.forEach(t => {
        const o = ctx.createOscillator()
        const g = ctx.createGain()
        o.connect(g)
        g.connect(ctx.destination)
        o.frequency.value = 880
        g.gain.setValueAtTime(0.3, ctx.currentTime + t)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25)
        o.start(ctx.currentTime + t)
        o.stop(ctx.currentTime + t + 0.25)
      })
    } else {
      osc.frequency.value = 440
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    }

    setTimeout(() => ctx.close(), 2000)
  } catch { /* ignore if AudioContext not available */ }
}

export default function FocusMode({ children, onExit }: { children: React.ReactNode; onExit: () => void }) {
  const { state } = useApp()
  const [session, setSession] = useState<Session>('work')
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSeconds = session === 'work' ? WORK_MINUTES * 60 : BREAK_MINUTES * 60
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  const switchSession = useCallback((next: Session) => {
    playBeep('end')
    setSession(next)
    setSecondsLeft(next === 'work' ? WORK_MINUTES * 60 : BREAK_MINUTES * 60)
    setIsRunning(false)
    if (next === 'work') setSessions(s => s + 1)

    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification(next === 'work' ? '☕ Break selesai!' : '🍅 Sesi kerja selesai!', {
        body: next === 'work' ? 'Waktunya fokus lagi.' : `Istirahat ${BREAK_MINUTES} menit yuk!`,
        icon: '/todo-listg/icon-192.png',
      })
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!)
            const next: Session = session === 'work' ? 'break' : 'work'
            switchSession(next)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning, session, switchSession])

  const handlePlayPause = () => {
    if (!isRunning) playBeep('start')
    setIsRunning(r => !r)
    if (Notification.permission === 'default') Notification.requestPermission()
  }

  const handleReset = () => {
    setIsRunning(false)
    setSecondsLeft(session === 'work' ? WORK_MINUTES * 60 : BREAK_MINUTES * 60)
  }

  const handleSkip = () => {
    setIsRunning(false)
    const next: Session = session === 'work' ? 'break' : 'work'
    switchSession(next)
  }

  // Circumference for SVG ring
  const size = 200
  const strokeWidth = 8
  const r = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-bg-primary z-50 flex flex-col"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="h-14 border-b border-border/30 flex items-center justify-between px-6 flex-shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
            session === 'work' ? 'bg-accent-rose/10' : 'bg-accent-emerald/10'
          )}>
            {session === 'work'
              ? <Brain size={16} className="text-accent-rose" />
              : <Coffee size={16} className="text-accent-emerald" />
            }
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">Focus Mode</h1>
            <div className={cn(
              'flex items-center gap-1.5 text-2xs',
              session === 'work' ? 'text-accent-rose' : 'text-accent-emerald'
            )}>
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                isRunning ? 'animate-pulse' : 'opacity-50',
                session === 'work' ? 'bg-accent-rose' : 'bg-accent-emerald'
              )} />
              <span>{session === 'work' ? 'Work Session' : 'Break Time'} · {sessions} done</span>
            </div>
          </div>
        </div>
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/40 hover:border-border text-text-muted hover:text-text-primary transition-all text-xs"
        >
          <X size={13} /> Exit Focus
        </button>
      </motion.div>

      {/* Main content — split: left = timer, right = tasks */}
      <div className="flex-1 flex overflow-hidden">

        {/* Timer panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-80 flex-shrink-0 flex flex-col items-center justify-center gap-8 border-r border-border/30 p-8"
        >
          {/* Session tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => { setSession('work'); setIsRunning(false); setSecondsLeft(WORK_MINUTES * 60) }}
              className={cn(
                'px-4 py-1.5 rounded-md text-xs font-medium transition-all',
                session === 'work'
                  ? 'bg-accent-rose/15 text-accent-rose border border-accent-rose/30'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
              )}
            >
              <Brain size={11} className="inline mr-1" />
              Work
            </button>
            <button
              onClick={() => { setSession('break'); setIsRunning(false); setSecondsLeft(BREAK_MINUTES * 60) }}
              className={cn(
                'px-4 py-1.5 rounded-md text-xs font-medium transition-all',
                session === 'break'
                  ? 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
              )}
            >
              <Coffee size={11} className="inline mr-1" />
              Break
            </button>
          </div>

          {/* Ring timer */}
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              {/* Track */}
              <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none"
                stroke={`rgb(var(--color-border) / 0.4)`}
                strokeWidth={strokeWidth}
              />
              {/* Progress */}
              <motion.circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none"
                stroke={session === 'work' ? '#F43F5E' : '#10B981'}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-4xl font-bold text-text-primary font-mono tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-2xs text-text-muted uppercase tracking-widest">
                {session === 'work' ? `${WORK_MINUTES}min focus` : `${BREAK_MINUTES}min rest`}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="w-9 h-9 rounded-full border border-border/40 hover:border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-all"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>

            <button
              onClick={handlePlayPause}
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-lg',
                session === 'work'
                  ? 'bg-accent-rose hover:bg-accent-rose/80'
                  : 'bg-accent-emerald hover:bg-accent-emerald/80'
              )}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
            </button>

            <button
              onClick={handleSkip}
              className="w-9 h-9 rounded-full border border-border/40 hover:border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-all"
              title={`Skip to ${session === 'work' ? 'break' : 'work'}`}
            >
              <SkipForward size={14} />
            </button>
          </div>

          {/* Sessions counter */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i < (sessions % 4)
                    ? 'bg-accent-rose scale-110'
                    : 'bg-border/50'
                )}
              />
            ))}
            <span className="text-2xs text-text-muted ml-2">{sessions % 4}/4 sessions</span>
          </div>
        </motion.div>

        {/* Tasks panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1 overflow-hidden"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  )
}