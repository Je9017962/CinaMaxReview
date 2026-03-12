import { useState, useEffect, useRef } from 'react'
import { useUser } from './UserContext.jsx'

export default function AuthModal({ onClose }) {
  const { signIn, signUp } = useUser()
  const [mode,    setMode]    = useState('signin')
  const [form,    setForm]    = useState({ username: '', email: '', password: '', confirm: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const firstInputRef = useRef(null)

  // Focus first input and trap Escape key
  useEffect(() => {
    firstInputRef.current?.focus()
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setError('')
  }

  const switchMode = (m) => {
    setMode(m)
    setError('')
    setForm({ username: '', email: '', password: '', confirm: '' })
  }

  const handleSubmit = async () => {
    if (loading) return
    setLoading(true)
    setError('')

    if (mode === 'signup' && form.password !== form.confirm) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    const authError = mode === 'signin'
      ? await signIn(form.username.trim(), form.password)
      : await signUp(form.username.trim(), form.email.trim(), form.password)

    setLoading(false)
    if (authError) { setError(authError); return }
    onClose()
  }

  const inp = {
    width: '100%',
    background: 'var(--color-input-bg)',
    border: '1px solid var(--color-input-border)',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'var(--font-body)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'signin' ? 'Sign in' : 'Create account'}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div style={{
        background: 'var(--color-card)', border: '1px solid var(--color-border-mid)',
        borderRadius: 24, maxWidth: 440, width: '100%',
        overflow: 'hidden', boxShadow: 'var(--shadow-modal)',
        animation: 'fadeUp 0.25s ease',
      }}>
        {/* Accent bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg,var(--color-primary),var(--color-accent),var(--color-primary))' }} />

        <div style={{ padding: '32px 32px 28px' }}>
          {/* Branding */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: 4 }}>
              Cina<span style={{ color: 'var(--color-accent)' }}>Max</span>
              <span style={{ color: 'var(--color-text-faint)', fontWeight: 400, fontSize: 14 }}> Review</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', letterSpacing: 2 }}>
              {mode === 'signin' ? 'WELCOME BACK' : 'JOIN THE COMMUNITY'}
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: 'var(--color-bg-deep)',
            borderRadius: 12, padding: 4, marginBottom: 22,
            border: '1px solid var(--color-border)',
          }}>
            {['signin', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                aria-pressed={mode === m}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', borderRadius: 9,
                  cursor: 'pointer',
                  background: mode === m
                    ? 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))'
                    : 'transparent',
                  color: mode === m ? '#fff' : 'var(--color-text-muted)',
                  fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  letterSpacing: 1, transition: 'all 0.2s',
                }}
              >
                {m === 'signin' ? 'SIGN IN' : 'SIGN UP'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label htmlFor="auth-username" style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                USERNAME
              </label>
              <input
                id="auth-username"
                ref={firstInputRef}
                value={form.username}
                onChange={set('username')}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="e.g. FilmCritic99"
                autoComplete="username"
                style={inp}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-email" style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  EMAIL
                </label>
                <input
                  id="auth-email"
                  value={form.email}
                  onChange={set('email')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  style={inp}
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-password" style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                PASSWORD
              </label>
              <input
                id="auth-password"
                value={form.password}
                onChange={set('password')}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                style={inp}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-confirm" style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  CONFIRM PASSWORD
                </label>
                <input
                  id="auth-confirm"
                  value={form.confirm}
                  onChange={set('confirm')}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Repeat password"
                  type="password"
                  autoComplete="new-password"
                  style={inp}
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              style={{
                marginTop: 14, padding: '10px 14px', borderRadius: 8,
                background: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                color: 'var(--color-error)', fontSize: 14,
                fontFamily: 'var(--font-mono)',
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            aria-busy={loading}
            style={{
              width: '100%', marginTop: 20,
              background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))',
              border: 'none', borderRadius: 12, color: '#fff',
              padding: '14px 0', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-mono)', opacity: loading ? 0.65 : 1,
              letterSpacing: 0.5,
            }}
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>

          {/* Demo hint */}
          {mode === 'signin' && (
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-faint)', marginTop: 14, fontFamily: 'var(--font-mono)' }}>
              Demo: <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>FilmCritic99</span>
              {' / '}
              <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>pass123</span>
            </p>
          )}

          {/* Cancel */}
          <button
            onClick={onClose}
            style={{
              width: '100%', marginTop: 10, background: 'transparent',
              border: '1px solid var(--color-border)', borderRadius: 12,
              color: 'var(--color-text-muted)', padding: '11px 0',
              fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-mono)',
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}
