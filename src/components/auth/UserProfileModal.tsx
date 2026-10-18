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
      className="mobile-nav-overlay"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid #EFEAE5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FAF7F4',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.25rem',
                  margin: 0,
                  color: '#3A141E',
                }}
              >
                Client Account
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  background: profile.role === 'admin' ? '#3A141E' : '#E8DFD8',
                  color: profile.role === 'admin' ? '#FFFFFF' : '#3A141E',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontWeight: 600,
                }}
              >
                {profile.role}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#777' }}>
              {profile.email}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#666',
              padding: '6px',
              borderRadius: '50%',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: 'flex',
            padding: '12px 28px 0',
            borderBottom: '1px solid #EFEAE5',
            gap: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '10px 4px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '2px solid #3A141E' : '2px solid transparent',
              color: activeTab === 'profile' ? '#3A141E' : '#777',
              fontWeight: activeTab === 'profile' ? 600 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <User size={16} />
            <span>Profile & Preferences</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '10px 4px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'bookings' ? '2px solid #3A141E' : '2px solid transparent',
              color: activeTab === 'bookings' ? '#3A141E' : '#777',
              fontWeight: activeTab === 'bookings' ? 600 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Calendar size={16} />
            <span>My Appointments</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
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
                    fontSize: '0.85rem',
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
                    fontSize: '0.85rem',
                    color: '#C53030',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{saveError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3A141E', marginBottom: '6px' }}>
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
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3A141E', marginBottom: '6px' }}>
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
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Beauty Preferences Section */}
              <div
                style={{
                  marginTop: '12px',
                  padding: '16px',
                  background: '#FBF9F7',
                  borderRadius: '12px',
                  border: '1px solid #EFEAE5',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Sparkles size={16} style={{ color: '#A06E4D' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#3A141E' }}>
                    Beauty & Salon Preferences
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
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#666', marginBottom: '4px' }}>
                      Allergies & Sensitivities
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
                        fontSize: '0.88rem',
                        outline: 'none',
                        boxSizing: 'border-box',
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
                        fontSize: '0.88rem',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-burgundy btn-sm"
                  style={{ padding: '9px 24px' }}
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
                <div style={{ textAlign: 'center', padding: '36px 20px', color: '#777' }}>
                  <Calendar size={36} style={{ color: '#D4C9BF', marginBottom: '12px' }} />
                  <p style={{ margin: 0, fontWeight: 500 }}>No appointments found yet.</p>
                  <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#999' }}>
                    Appointments you book while signed in will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {bookings.map((b: any, idx: number) => {
                    const servicesList = Array.isArray(b.services)
                      ? b.services.map((s: any) => s.serviceName || s.name).join(', ')
                      : (b.service || 'Appointment')

                    return (
                      <div
                        key={b.id || idx}
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          border: '1px solid #EAE5DF',
                          background: '#FAF8F6',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#3A141E' }}>
                            {servicesList}
                          </span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              background: '#E8F5E9',
                              color: '#2E7D32',
                              fontWeight: 600,
                            }}
                          >
                            {b.status || 'Scheduled'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#666' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} /> {b.date}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} /> {b.time}
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
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid #EFEAE5',
            background: '#FAF7F4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
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
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '8px 18px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
