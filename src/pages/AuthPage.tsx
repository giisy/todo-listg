import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/services/supabase'
import { cn } from '@/utils/cn'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
})

type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) })

  const handleLogin = async (data: LoginData) => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleRegister = async (data: RegisterData) => {
    setLoading(true)
    setError('')
    try {
      const { error, data: signUpData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { 
          data: { name: data.name },
          emailRedirectTo: window.location.origin
        },
      })
      if (error) {
        setError(error.message)
      } else if (signUpData.session) {
        setSuccess('Account created! Redirecting...')
      } else {
        setSuccess('Account created! Please check your email to verify.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Signup error:', err)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mx-auto mb-3 shadow-glow">
            <CheckCircle2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">TaskFlow</h1>
          <p className="text-sm text-text-muted mt-1">Your premium productivity app</p>
        </div>

        {/* Card */}
        <div className="card p-6 space-y-5">
          {/* Tabs */}
          <div className="flex bg-bg-primary rounded-md p-1 gap-1">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={cn(
                  'flex-1 py-2 rounded-md text-sm font-medium transition-all duration-150 capitalize',
                  mode === m
                    ? 'bg-bg-card text-text-primary shadow-card'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error / Success */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-md bg-accent-rose/10 border border-accent-rose/20 text-xs text-accent-rose"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-md bg-accent-emerald/10 border border-accent-emerald/20 text-xs text-accent-emerald"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                onSubmit={loginForm.handleSubmit(handleLogin)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-2xs text-text-muted font-medium mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      {...loginForm.register('email')}
                      type="email"
                      placeholder="you@example.com"
                      className="input pl-9"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-2xs text-accent-rose mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-2xs text-text-muted font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      {...loginForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input pl-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-2xs text-accent-rose mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-2.5"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : 'Sign In'}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                onSubmit={registerForm.handleSubmit(handleRegister)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-2xs text-text-muted font-medium mb-1.5">Your Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      {...registerForm.register('name')}
                      placeholder="Gisa"
                      className="input pl-9"
                      autoFocus
                    />
                  </div>
                  {registerForm.formState.errors.name && (
                    <p className="text-2xs text-accent-rose mt-1">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-2xs text-text-muted font-medium mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      {...registerForm.register('email')}
                      type="email"
                      placeholder="you@example.com"
                      className="input pl-9"
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-2xs text-accent-rose mt-1">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-2xs text-text-muted font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      {...registerForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input pl-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-2xs text-accent-rose mt-1">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-2xs text-text-muted font-medium mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      {...registerForm.register('confirm')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input pl-9"
                    />
                  </div>
                  {registerForm.formState.errors.confirm && (
                    <p className="text-2xs text-accent-rose mt-1">{registerForm.formState.errors.confirm.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-2.5"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : 'Create Account'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-2xs text-text-muted mt-4">
          Your data is securely stored with Supabase
        </p>
      </motion.div>
    </div>
  )
}