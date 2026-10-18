import React, { useState } from 'react'
import { X, Mail, Lock, User, Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/useAuth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const { signInWithEmail, signUp, isConfigured } = useAuth()

  if (!isOpen) return null

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFullName('')
    setPhone('')
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!isConfigured) {
      setErrorMsg('Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
      return
    }

    setLoading(true)

    if (mode === 'signin') {
      const res = await signInWithEmail(email, password)
      setLoading(false)
      if (res.success) {
        onClose()
        resetForm()
      } else {
        setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.')
      }
    } else {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.')
        setLoading(false)
        return
      }

      const res = await signUp(email, password, { fullName, phone })
      setLoading(false)
      if (res.success) {
        setSuccessMsg(res.message || 'Account created successfully!')
        setTimeout(() => {
          onClose()
          resetForm()
        }, 1500)
      } else {
        setErrorMsg(res.error || 'Failed to create account.')
      }
    }
  }

  return (
    <div
      className="auth-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="User Authentication"
      >
        {/* Close Button with touch target */}
        <button
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
          }}
        >
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px', paddingRight: '24px', paddingLeft: '24px' }}>
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.15rem, 4vw, 1.35rem)',
              letterSpacing: '0.08em',
              fontWeight: 600,
              color: '#3A141E',
              margin: '0 0 6px 0',
            }}
          >
            NAURÈLLE BEAUTY
          </p>
          <p style={{ fontSize: '0.84rem', color: '#6B6865', margin: 0, lineHeight: 1.4 }}>
            {mode === 'signin' ? 'Sign in to access your appointments & preferences' : 'Create an account for expedited booking'}
          </p>
        </div>

        {/* Mode Tab Toggle */}
        <div
          style={{
            display: 'flex',
            background: '#F5F2EE',
            borderRadius: '10px',
            padding: '3px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('signin')
              setErrorMsg('')
              setSuccessMsg('')
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              background: mode === 'signin' ? '#FFFFFF' : 'transparent',
              color: mode === 'signin' ? '#3A141E' : '#777',
              fontWeight: mode === 'signin' ? 600 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: mode === 'signin' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
              minHeight: '38px',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setErrorMsg('')
              setSuccessMsg('')
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              background: mode === 'signup' ? '#FFFFFF' : 'transparent',
              color: mode === 'signup' ? '#3A141E' : '#777',
              fontWeight: mode === 'signup' ? 600 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: mode === 'signup' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
              minHeight: '38px',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Alert Notifications */}
        {errorMsg && (
          <div
            style={{
              background: '#FFF5F5',
              border: '1px solid #FED7D7',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '0.84rem',
              color: '#C53030',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: '#F0FFF4',
              border: '1px solid #C6F6D5',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.84rem',
              color: '#2F855A',
              lineHeight: 1.4,
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3A141E', marginBottom: '5px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#888' }} />
                  <input
                    type="text"
                    required
                    placeholder="Amara Osei"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #E2DCD5',
                      outline: 'none',
                      boxSizing: 'border-box',
                      minHeight: '42px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3A141E', marginBottom: '5px' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#888' }} />
                  <input
                    type="tel"
                    placeholder="+233 24 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #E2DCD5',
                      outline: 'none',
                      boxSizing: 'border-box',
                      minHeight: '42px',
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3A141E', marginBottom: '5px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#888' }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #E2DCD5',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: '42px',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3A141E', marginBottom: '5px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#888' }} />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '8px',
                  border: '1px solid #E2DCD5',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: '42px',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-burgundy"
            style={{
              marginTop: '8px',
              padding: '12px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.92rem',
              minHeight: '44px',
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.78rem', color: '#8A8580', lineHeight: 1.4 }}>
          By continuing, you agree to Naurèlle Beauty appointment terms & salon policies.
        </p>
      </div>
    </div>
  )
}
