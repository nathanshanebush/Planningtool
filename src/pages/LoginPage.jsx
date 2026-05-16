import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/shared/Button'
import { isSupabaseConfigured } from '../lib/supabase'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message ?? 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-coal flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-1.5 h-8 bg-orange rounded-full" />
          <span className="text-3xl font-medium text-white tracking-wide">impera</span>
        </div>

        <div className="bg-jet rounded-2xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Sign in</h2>
          <p className="text-white/50 text-sm mb-6">Campaign Command Center</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full bg-coal border border-white/10 text-white placeholder-white/30 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-white/60 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-coal border border-white/10 text-white placeholder-white/30 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange/60 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button className="text-sm text-white/40 hover:text-white/70 transition-colors">
              Forgot password?
            </button>
          </div>

          {!isSupabaseConfigured && (
            <div className="mt-5 pt-5 border-t border-white/10 text-center">
              <p className="text-xs text-white/30 mb-2">No auth configured — running in demo mode</p>
              <Link
                to="/"
                className="text-sm font-medium text-orange hover:underline"
              >
                Enter as Demo Super Admin →
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          Impera · Campaign Command Center
        </p>
        <p className="text-center text-xs text-white/20 mt-1">
          <Link to="/admin" className="hover:text-white/40 transition-colors">Admin Panel</Link>
          {' · '}
          <Link to="/" className="hover:text-white/40 transition-colors">Dashboard</Link>
        </p>
      </div>
    </div>
  )
}
