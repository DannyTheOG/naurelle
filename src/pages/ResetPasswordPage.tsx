import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Check } from 'lucide-react'
import { API_BASE_URL } from '../config/api'

interface PasswordRequirement {
  label: string
  met: boolean
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [validatingToken, setValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenError, setTokenError] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    let cancelled = false

    const validateToken = async () => {
      if (!token.trim()) {
        setValidatingToken(false)
        setTokenValid(false)
        setTokenError('Password reset token is missing. Please request a new reset link.')
        return
      }

      setValidatingToken(true)
      setTokenError('')
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`
        )
        const data = await res.json().catch(() => ({}))
        if (!cancelled) {
          if (res.ok && data.valid) {
            setTokenValid(true)
          } else {
            setTokenValid(false)
            setTokenError(data.error || 'This password reset link is invalid or has expired.')
          }
        }
      } catch {
        if (!cancelled) {
          setTokenValid(false)
          setTokenError('Unable to verify your reset link right now. Please try again.')
        }
      } finally {
        if (!cancelled) {
          setValidatingToken(false)
        }
      }
    }

    validateToken()
    return () => {
      cancelled = true
    }
  }, [token])

  const requirements: PasswordRequirement[] = useMemo(
    () => [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'One uppercase letter (A–Z)', met: /[A-Z]/.test(password) },
      { label: 'One lowercase letter (a–z)', met: /[a-z]/.test(password) },
      { label: 'One number (0–9)', met: /[0-9]/.test(password) },
    ],
    [password]
  )

  const allRequirementsMet = requirements.every((req) => req.met)
  const passwordsMatch = password.length > 0 && password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!allRequirementsMet) {
      setErrorMsg('Please meet all password strength requirements before continuing.')
      return
    }

    if (!passwordsMatch) {
      setErrorMsg('Passwords do not match. Please re-enter both fields.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Your password has been reset successfully. Redirecting to sign in...')
        setTimeout(() => {
          navigate('/?auth=signin', { replace: true })
        }, 2000)
      } else {
        setErrorMsg(data.error || 'Failed to reset password. Please request a new reset link.')
      }
    } catch {
      setErrorMsg('Network error while resetting password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main
      className="main-content"
      style={{
        minHeight: 'calc(100vh - 160px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 16px 72px',
        backgroundColor: 'var(--bg-canvas, #FAF7F4)',
      }}
    >
      <div
        className="surface-white"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px 28px',
          borderRadius: '14px',
          border: '1px solid var(--border-light, #EAE3DC)',
          boxShadow: '0 10px 30px rgba(58, 20, 30, 0.06)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="editorial-eyebrow">Account Recovery</span>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.85rem',
              color: '#3A141E',
              margin: '6px 0 8px 0',
              fontWeight: 500,
            }}
          >
            Set New Password
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#6B6865', margin: 0, lineHeight: 1.5 }}>
            Choose a strong password for your Naurèlle Beauty account.
          </p>
        </div>

        {/* Loading State */}
        {validatingToken ? (
          <div style={{ textAlign: 'center', padding: '28px 12px', color: '#6B6865' }}>
            <Loader2 size={28} className="animate-spin" style={{ color: '#3A141E', margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Verifying your reset link...</p>
          </div>
        ) : !tokenValid ? (
          /* Invalid / Expired Token State */
          <div>
            <div
              style={{
                background: '#FFF5F5',
                border: '1px solid #FED7D7',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '0.88rem',
                color: '#C53030',
                lineHeight: 1.5,
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{tokenError}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                to="/?auth=forgot"
                className="btn btn-burgundy"
                style={{ width: '100%', textAlign: 'center', padding: '12px', textDecoration: 'none' }}
              >
                Request a New Reset Link
              </Link>
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  fontSize: '0.85rem',
                  color: '#3A141E',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={15} />
                <span>Return Home</span>
              </Link>
            </div>
          </div>
        ) : successMsg ? (
          /* Success State */
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                background: '#F0FFF4',
                border: '1px solid #C6F6D5',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '0.9rem',
                color: '#2F855A',
                lineHeight: 1.5,
                textAlign: 'left',
              }}
            >
              <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{successMsg}</span>
            </div>

            <Link
              to="/?auth=signin"
              className="btn btn-burgundy"
              style={{ width: '100%', textAlign: 'center', padding: '12px', textDecoration: 'none' }}
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          /* Reset Form */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errorMsg && (
              <div
                style={{
                  background: '#FFF5F5',
                  border: '1px solid #FED7D7',
                  borderRadius: '8px',
                  padding: '10px 12px',
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

            {/* New Password */}
            <div>
              <label
                htmlFor="new-password"
                style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3A141E', marginBottom: '5px' }}
              >
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#888' }} />
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #E2DCD5',
                    outline: 'none',
                    boxSizing: 'border-box',
                    minHeight: '42px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '9px',
                    background: 'none',
                    border: 'none',
                    color: '#777',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Password Strength Checklist */}
            <div
              style={{
                backgroundColor: '#FAF8F6',
                border: '1px solid #EAE3DC',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '6px 12px',
              }}
            >
              {requirements.map((req) => (
                <div
                  key={req.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.76rem',
                    color: req.met ? '#2F855A' : '#777',
                    fontWeight: req.met ? 600 : 400,
                  }}
                >
                  <Check size={13} style={{ opacity: req.met ? 1 : 0.3 }} />
                  <span>{req.label}</span>
                </div>
              ))}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3A141E', marginBottom: '5px' }}
              >
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#888' }} />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 38px',
                    borderRadius: '8px',
                    border:
                      confirmPassword.length > 0 && !passwordsMatch
                        ? '1px solid #E53E3E'
                        : '1px solid #E2DCD5',
                    outline: 'none',
                    boxSizing: 'border-box',
                    minHeight: '42px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '9px',
                    background: 'none',
                    border: 'none',
                    color: '#777',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p style={{ margin: '5px 0 0', fontSize: '0.76rem', color: '#C53030' }}>
                  Passwords do not match.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !allRequirementsMet || !passwordsMatch}
              className="btn btn-burgundy"
              style={{
                marginTop: '6px',
                padding: '12px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.92rem',
                minHeight: '44px',
                opacity: submitting || !allRequirementsMet || !passwordsMatch ? 0.65 : 1,
              }}
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
              <span>{submitting ? 'Updating Password...' : 'Reset Password'}</span>
            </button>

            <Link
              to="/?auth=signin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '4px',
                fontSize: '0.84rem',
                color: '#3A141E',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={15} />
              <span>Back to Sign In</span>
            </Link>
          </form>
        )}
      </div>
    </main>
  )
}

