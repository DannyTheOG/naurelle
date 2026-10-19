import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Ban,
  Search,
  PlusCircle,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { API_BASE_URL } from '../../config/api'
import { formatDuration } from '../../utils/bookingUtils'

interface BookingsManagerModalProps {
  isOpen: boolean
  onClose: () => void
}

type BookingItem = {
  id: string | number
  date: string
  time: string
  endTime?: string
  end_time?: string
  totalDurationMinutes?: number
  total_duration_minutes?: number
  price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  name?: string
  client_name?: string
  phone?: string
  client_phone?: string
  email?: string
  client_email?: string
  notes?: string
  service?: string
  services?: any[]
  createdAt?: string
  created_at?: string
  client?: {
    full_name?: string
    phone?: string
    email?: string
  }
}

export const BookingsManagerModal: React.FC<BookingsManagerModalProps> = ({ isOpen, onClose }) => {
  const { profile, token } = useAuth()

  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')

  // Filters
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Block time state
  const [showBlockTimeModal, setShowBlockTimeModal] = useState<boolean>(false)
  const [blockDate, setBlockDate] = useState<string>(() => {
    const today = new Date()
    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-')
  })
  const [blockTime, setBlockTime] = useState<string>('13:00')
  const [blockDuration, setBlockDuration] = useState<number>(60)
  const [blockReason, setBlockReason] = useState<string>('Studio Maintenance & Sanitisation')
  const [isBlocking, setIsBlocking] = useState<boolean>(false)

  // Fetch bookings from admin endpoint
  const loadBookings = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setErrorMsg('')

    try {
      const params = new URLSearchParams()
      if (selectedDateFilter) params.append('date', selectedDateFilter)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (searchQuery.trim()) params.append('search', searchQuery.trim())

      const res = await fetch(`${API_BASE_URL}/api/admin/bookings?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to load appointments')
      }

      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setBookings(json.data)
      } else {
        setBookings([])
      }
    } catch (err: any) {
      console.error('Error fetching admin bookings:', err)
      setErrorMsg(err.message || 'Error loading appointments.')
    } finally {
      setLoading(false)
    }
  }, [token, selectedDateFilter, statusFilter, searchQuery])

  useEffect(() => {
    if (isOpen) {
      loadBookings()
    }
  }, [isOpen, loadBookings])

  // Update status handler (confirm, complete, cancel, no_show)
  const handleUpdateStatus = async (id: string | number, newStatus: string) => {
    if (!token) return
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      const json = await res.json()
      if (res.ok && json.success) {
        setSuccessMsg(`Appointment status updated to ${newStatus}.`)
        setTimeout(() => setSuccessMsg(''), 3000)
        // Refresh local list
        loadBookings()
      } else {
        setErrorMsg(json.error || 'Failed to update status.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error updating booking status.')
    }
  }

  // Handle block studio time submission
  const handleBlockTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !blockDate || !blockTime) return

    setIsBlocking(true)
    setErrorMsg('')

    try {
      // Format 24h to 12h for consistent server format if needed
      const [hStr, mStr] = blockTime.split(':')
      let h = parseInt(hStr, 10)
      const m = mStr || '00'
      const period = h >= 12 ? 'PM' : 'AM'
      const h12 = h % 12 === 0 ? 12 : h % 12
      const formattedTime = `${h12 < 10 ? '0' : ''}${h12}:${m} ${period}`

      const res = await fetch(`${API_BASE_URL}/api/admin/bookings/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: blockDate,
          time: formattedTime,
          durationMinutes: Number(blockDuration),
          reason: blockReason
        })
      })

      const json = await res.json()
      if (res.ok && json.success) {
        setSuccessMsg(`Blocked ${formattedTime} (${blockDuration} mins) on ${blockDate}. Slot is now reserved.`)
        setShowBlockTimeModal(false)
        setTimeout(() => setSuccessMsg(''), 3500)
        loadBookings()
      } else {
        setErrorMsg(json.error || 'Failed to block studio time.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error blocking studio time.')
    } finally {
      setIsBlocking(false)
    }
  }

  // Computed summary metrics
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length
    }
  }, [bookings])

  if (!isOpen) return null

  // Ensure only admin or staff can access
  if (profile?.role !== 'admin' && profile?.role !== 'staff') {
    return (
      <div className="auth-modal-overlay" onClick={onClose} role="presentation">
        <div className="profile-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center', padding: '32px' }}>
          <Ban size={40} style={{ color: 'var(--color-accent)', margin: '0 auto 16px' }} />
          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Access Restricted
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Only studio administrators and authorized staff have permissions to manage bookings and schedule blocks.
          </p>
          <button onClick={onClose} className="btn btn-burgundy btn-sm">
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="profile-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Studio Bookings Manager"
        style={{
          maxWidth: '900px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FFFFFF'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="editorial-eyebrow" style={{ marginBottom: 0 }}>Studio Management</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  background: 'var(--color-accent)',
                  color: '#FFFFFF',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600
                }}
              >
                {profile?.role}
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.4rem',
                margin: '4px 0 0',
                color: 'var(--text-primary)'
              }}
            >
              Bookings &amp; Schedule Manager
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={loadBookings}
              className="btn btn-minimal btn-sm"
              style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Refresh appointments"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span className="desktop-only">Refresh</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="modal-close-btn"
              aria-label="Close Bookings Manager"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Feedback Banners */}
        {successMsg && (
          <div
            style={{
              backgroundColor: '#F0FDF4',
              borderBottom: '1px solid #DCFCE7',
              padding: '10px 24px',
              color: '#166534',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              borderBottom: '1px solid #FEE2E2',
              padding: '10px 24px',
              color: '#991B1B',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Summary Stat Pills & Controls */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'var(--bg-canvas)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          {/* Metrics row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Overview:
            </span>
            <span style={{ fontSize: '0.82rem', padding: '3px 10px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
              Total: <strong>{stats.total}</strong>
            </span>
            <span style={{ fontSize: '0.82rem', padding: '3px 10px', borderRadius: '12px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46' }}>
              Confirmed: <strong>{stats.confirmed}</strong>
            </span>
            <span style={{ fontSize: '0.82rem', padding: '3px 10px', borderRadius: '12px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}>
              Pending: <strong>{stats.pending}</strong>
            </span>
            <span style={{ fontSize: '0.82rem', padding: '3px 10px', borderRadius: '12px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', color: '#4B5563' }}>
              Completed: <strong>{stats.completed}</strong>
            </span>
            <span style={{ fontSize: '0.82rem', padding: '3px 10px', borderRadius: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
              Cancelled: <strong>{stats.cancelled}</strong>
            </span>

            <button
              type="button"
              onClick={() => setShowBlockTimeModal(true)}
              className="btn btn-burgundy btn-sm"
              style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={14} />
              <span>Block Studio Time</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {/* Date filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Filter Date
              </label>
              <input
                type="date"
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.85rem',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Status filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.85rem',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled (Slot freed)</option>
                <option value="no_show">No Show (Slot freed)</option>
              </select>
            </div>

            {/* Search query */}
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Search Client / Contact
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 28px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.85rem',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Search size={14} style={{ position: 'absolute', left: '9px', top: '9px', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0 }}>Loading appointments...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-canvas)',
                borderRadius: 'var(--radius-xs)',
                border: '1px dashed var(--border-light)'
              }}
            >
              <Calendar size={36} style={{ color: 'var(--border-medium)', margin: '0 auto 12px' }} />
              <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                No appointments found
              </h4>
              <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>
                {selectedDateFilter || statusFilter !== 'all' || searchQuery
                  ? 'Try clearing or modifying your filters above.'
                  : 'No appointments have been booked yet.'}
              </p>
              {(selectedDateFilter || statusFilter !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDateFilter('')
                    setStatusFilter('all')
                    setSearchQuery('')
                  }}
                  className="btn btn-minimal btn-sm"
                  style={{ marginTop: '14px' }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {bookings.map((booking) => {
                const clientName = booking.name || booking.client_name || booking.client?.full_name || 'Guest Client'
                const clientPhone = booking.phone || booking.client_phone || booking.client?.phone || 'No phone'
                const clientEmail = booking.email || booking.client_email || booking.client?.email || ''
                const duration = booking.totalDurationMinutes || booking.total_duration_minutes || 60
                const endTime = booking.endTime || booking.end_time || ''

                const servicesText = Array.isArray(booking.services) && booking.services.length > 0
                  ? booking.services.map((s) => s.serviceName + (s.lengthName ? ` (${s.lengthName})` : '')).join(' + ')
                  : (booking.service || 'Appointment')

                const isCancelled = booking.status === 'cancelled' || booking.status === 'no_show'
                const isConfirmed = booking.status === 'confirmed'
                const isPending = booking.status === 'pending'
                const isCompleted = booking.status === 'completed'

                return (
                  <div
                    key={booking.id}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '16px 18px',
                      backgroundColor: isCancelled ? '#FAFAFA' : '#FFFFFF',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                      opacity: isCancelled ? 0.75 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: '1.05rem',
                              fontWeight: 700,
                              color: 'var(--text-primary)'
                            }}
                          >
                            {booking.date}
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: 'rgba(58, 20, 30, 0.06)',
                              color: 'var(--color-accent)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            <Clock size={12} />
                            {booking.time} {endTime ? `– ${endTime}` : ''}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            ({formatDuration(duration)} duration + 20m buffer)
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            backgroundColor: isConfirmed
                              ? '#ECFDF5'
                              : isPending
                              ? '#FFFBEB'
                              : isCompleted
                              ? '#F3F4F6'
                              : '#FEF2F2',
                            color: isConfirmed
                              ? '#065F46'
                              : isPending
                              ? '#92400E'
                              : isCompleted
                              ? '#374151'
                              : '#991B1B',
                            border: `1px solid ${
                              isConfirmed
                                ? '#A7F3D0'
                                : isPending
                                ? '#FDE68A'
                                : isCompleted
                                ? '#E5E7EB'
                                : '#FECACA'
                            }`
                          }}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    {/* Services and Price */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-accent)', fontSize: '0.94rem' }}>
                          {servicesText}
                        </span>
                        <span style={{ fontWeight: 700, fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                          ₵{booking.price || 0}
                        </span>
                      </div>
                    </div>

                    {/* Client Information details */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '8px',
                        backgroundColor: 'var(--bg-canvas)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.84rem',
                        marginBottom: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={13} style={{ color: 'var(--text-muted)' }} />
                        <strong style={{ color: 'var(--text-primary)' }}>{clientName}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} style={{ color: 'var(--text-muted)' }} />
                        <a href={`tel:${clientPhone}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                          {clientPhone}
                        </a>
                      </div>
                      {clientEmail && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={13} style={{ color: 'var(--text-muted)' }} />
                          <a href={`mailto:${clientEmail}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                            {clientEmail}
                          </a>
                        </div>
                      )}
                    </div>

                    {booking.notes && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px' }}>
                        <strong>Notes:</strong> {booking.notes}
                      </div>
                    )}

                    {/* Action buttons row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px',
                        paddingTop: '8px',
                        borderTop: '1px dashed var(--border-light)'
                      }}
                    >
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Slot Blocking: {isCancelled ? 'Released (Available for other clients)' : 'Active (Slot Reserved)'}
                      </span>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                            className="btn btn-burgundy btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                          >
                            <CheckCircle2 size={12} />
                            <span>Confirm Slot</span>
                          </button>
                        )}

                        {isConfirmed && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(booking.id, 'completed')}
                            className="btn btn-minimal btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                          >
                            <span>Mark Completed</span>
                          </button>
                        )}

                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Cancel this appointment? This will release the blocked time slot so other customers can book it.')) {
                                handleUpdateStatus(booking.id, 'cancelled')
                              }
                            }}
                            className="btn btn-minimal btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.76rem', color: '#991B1B' }}
                          >
                            <XCircle size={12} />
                            <span>Cancel &amp; Free Slot</span>
                          </button>
                        )}

                        {isCancelled && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                            className="btn btn-minimal btn-sm"
                            style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                          >
                            <span>Reactivate Slot</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FFFFFF'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Appointments automatically block a 20-minute operational buffer.
          </span>
          <button type="button" onClick={onClose} className="btn btn-minimal btn-sm">
            Close
          </button>
        </div>
      </div>

      {/* Sub-modal: Block Studio Time */}
      {showBlockTimeModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowBlockTimeModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xs)',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                Block Studio Time
              </h3>
              <button
                type="button"
                onClick={() => setShowBlockTimeModal(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Block out a custom time window for breaks, studio cleaning, or private sessions. This slot will appear greyed out and marked with a "Reserved" badge on the client booking calendar.
            </p>

            <form onSubmit={handleBlockTimeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={blockTime}
                    onChange={(e) => setBlockTime(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Duration (mins) *
                  </label>
                  <select
                    value={blockDuration}
                    onChange={(e) => setBlockDuration(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins (1 hr)</option>
                    <option value={90}>90 mins (1.5 hrs)</option>
                    <option value={120}>120 mins (2 hrs)</option>
                    <option value={180}>180 mins (3 hrs)</option>
                    <option value={240}>240 mins (Half Day)</option>
                    <option value={480}>480 mins (Full Day)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Reason / Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Studio Sanitation, Lunch Break"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowBlockTimeModal(false)}
                  className="btn btn-minimal btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBlocking}
                  className="btn btn-burgundy btn-sm"
                >
                  {isBlocking ? 'Blocking...' : 'Confirm Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
