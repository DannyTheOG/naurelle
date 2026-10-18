import React, { useState, useEffect } from 'react'
import { X, User, Calendar, LogOut, Check, Sparkles, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/useAuth'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, signOut, updateProfile, fetchMyBookings } = useAuth()

  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile')
  const [fullName, setFullName] = useState(profile?.fullName || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [preferredLength, setPreferredLength] = useState(profile?.beautyNotes?.preferredLength || '')
  const [allergies, setAllergies] = useState(profile?.beautyNotes?.allergies || '')
  const [nailNotes, setNailNotes] = useState(profile?.beautyNotes?.nailNotes || '')

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [bookings, setBookings] = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '')
      setPhone(profile.phone || '')
      setPreferredLength(profile.beautyNotes?.preferredLength || '')
      setAllergies(profile.beautyNotes?.allergies || '')
      setNailNotes(profile.beautyNotes?.nailNotes || '')
    }
  }, [profile])

  useEffect(() => {
    if (isOpen && activeTab === 'bookings') {
      setLoadingBookings(true)
      fetchMyBookings()
        .then((data) => setBookings(data || []))
        .finally(() => setLoadingBookings(false))
    }
  }, [isOpen, activeTab, fetchMyBookings])

  if (!isOpen || !profile) return null

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError('')
    setSaveSuccess(false)

    const res = await updateProfile({
      fullName,
      phone,
      beautyNotes: {
        preferredLength,
        allergies,
        nailNotes,
      },
    })

    setIsSaving(false)
    if (res.success) {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } else {
      setSaveError(res.error || 'Failed to update profile.')
    }
  }

  return (
    <div
      className="auth-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="profile-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="User Account and Appointments"
      >
        {/* Modal Header */}
        <div className="modal-header-responsive">
          <div style={{ minWidth: 0, paddingRight: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(1.1rem, 3.5vw, 1.25rem)',
                  margin: 0,
                  color: '#3A141E',
                }}
              >
                Client Account
              </h2>
              <span
                style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  background: profile.role === 'admin' ? '#3A141E' : '#E8DFD8',
                  color: profile.role === 'admin' ? '#FFFFFF' : '#3A141E',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600,
                }}
              >
                {profile.role}
              </span>
            </div>
            <p
              style={{
                margin: '3px 0 0 0',
                fontSize: '0.82rem',
                color: '#777',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '280px',
              }}
            >
              {profile.email}
            </p>
          </div>

          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="modal-tabs-responsive">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="modal-tab-btn"
            style={{
              borderBottom: activeTab === 'profile' ? '2px solid #3A141E' : '2px solid transparent',
              color: activeTab === 'profile' ? '#3A141E' : '#777',
              fontWeight: activeTab === 'profile' ? 600 : 500,
            }}
          >
            <User size={16} />
            <span>Profile &amp; Preferences</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className="modal-tab-btn"
            style={{
              borderBottom: activeTab === 'bookings' ? '2px solid #3A141E' : '2px solid transparent',
              color: activeTab === 'bookings' ? '#3A141E' : '#777',
              fontWeight: activeTab === 'bookings' ? 600 : 500,
            }}
          >
            <Calendar size={16} />
            <span>My Appointments</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-responsive">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {saveSuccess && (
                <div
                  style={{
                    background: '#F0FFF4',
                    border: '1px solid #C6F6D5',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.84rem',
                    color: '#2F855A',
                  }}
                >
                  <Check size={16} />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {saveError && (
                <div
                  style={{
                    background: '#FFF5F5',
                    border: '1px solid #FED7D7',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.84rem',
                    color: '#C53030',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Responsive 2-column or 1-column grid */}
              <div className="profile-form-grid">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3A141E', marginBottom: '5px' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E2DCD5',
                      outline: 'none',
                      boxSizing: 'border-box',
                      minHeight: '40px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3A141E', marginBottom: '5px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E2DCD5',
                      outline: 'none',
                      boxSizing: 'border-box',
                      minHeight: '40px',
                    }}
                  />
                </div>
              </div>

              {/* Beauty Preferences Section */}
              <div
                style={{
                  marginTop: '8px',
                  padding: '16px',
                  background: '#FBF9F7',
                  borderRadius: '12px',
                  border: '1px solid #EFEAE5',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Sparkles size={16} style={{ color: '#A06E4D' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#3A141E' }}>
                    Beauty &amp; Salon Preferences
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', marginBottom: '4px' }}>
                      Preferred Nail Length / Style
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Medium Almond, Short Square"
                      value={preferredLength}
                      onChange={(e) => setPreferredLength(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E2DCD5',
                        outline: 'none',
                        boxSizing: 'border-box',
                        minHeight: '38px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', marginBottom: '4px' }}>
                      Allergies &amp; Sensitivities
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sensitive cuticles, acetone sensitivity"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E2DCD5',
                        outline: 'none',
                        boxSizing: 'border-box',
                        minHeight: '38px',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', marginBottom: '4px' }}>
                      Special Nail Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Notes for your nail artist..."
                      value={nailNotes}
                      onChange={(e) => setNailNotes(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E2DCD5',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-burgundy btn-sm"
                  style={{ padding: '9px 24px', minHeight: '38px' }}
                >
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              {loadingBookings ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                  Loading appointments...
                </div>
              ) : bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: '#777' }}>
                  <Calendar size={36} style={{ color: '#D4C9BF', marginBottom: '12px' }} />
                  <p style={{ margin: 0, fontWeight: 500, fontSize: '0.92rem' }}>No appointments found yet.</p>
                  <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#999' }}>
                    Appointments you book while signed in will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {bookings.map((b: any, idx: number) => {
                    const servicesList = Array.isArray(b.services)
                      ? b.services.map((s: any) => s.serviceName || s.name).join(', ')
                      : (b.service || 'Appointment')

                    return (
                      <div
                        key={b.id || idx}
                        className="profile-appointment-card"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#3A141E', lineHeight: 1.3 }}>
                            {servicesList}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              background: '#E8F5E9',
                              color: '#2E7D32',
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {b.status || 'Scheduled'}
                          </span>
                        </div>

                        <div className="profile-appointment-meta">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} /> {b.date}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> {b.time}
                          </span>
                          {b.price && (
                            <span style={{ fontWeight: 600, color: '#3A141E', marginLeft: 'auto' }}>
                              ₵{b.price}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Sign Out */}
        <div className="modal-footer-responsive">
          <button
            type="button"
            onClick={() => {
              signOut()
              onClose()
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#C53030',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              padding: '6px 4px',
              minHeight: '36px',
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '8px 18px', minHeight: '36px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
