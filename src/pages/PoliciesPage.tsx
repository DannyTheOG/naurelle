import { Link } from 'react-router-dom'
import { ShieldCheck, Clock, AlertTriangle, Sparkles, Heart } from 'lucide-react'

export function PoliciesPage() {
  return (
    <div className="page-wrapper">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span>Studio Etiquette</span>
        </div>
        <h1 className="section-title">Booking Terms & Salon Etiquette</h1>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          Please review our studio policies prior to your appointment to ensure a calm, relaxed experience for all guests.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        <div className="glass-card" style={{ padding: '32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} style={{ color: 'var(--color-gold)' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem' }}>Booking Essentials</h2>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.94rem' }}>
              <AlertTriangle size={18} style={{ color: 'var(--color-pink-accent-dark)', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Deposit Policy:</strong> Deposits are required upon booking approval and are strictly non-refundable.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.94rem' }}>
              <Clock size={18} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Rescheduling Window:</strong> Appointments can only be rescheduled at least 24 hours in advance.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.94rem' }}>
              <AlertTriangle size={18} style={{ color: '#E57373', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Late Arrival:</strong> Arrivals over 15 minutes late may be cancelled to protect subsequent guest appointments.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.94rem' }}>
              <AlertTriangle size={18} style={{ color: '#E57373', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>No-Show Terms:</strong> Unannounced no-shows automatically forfeit their deposit.</span>
            </li>
          </ul>
        </div>

        <div className="glass-card" style={{ padding: '32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-baby-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={22} style={{ color: 'var(--color-pink-accent-dark)' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem' }}>Studio Notes & Comfort</h2>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.94rem' }}>
              <Sparkles size={18} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Private Space:</strong> To preserve our tranquil studio atmosphere, no extra guests or children are permitted.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.94rem' }}>
              <Sparkles size={18} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Clean Canvas:</strong> Please arrive with clean lashes and nails free of heavy waterproof cosmetics.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.94rem' }}>
              <Sparkles size={18} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Early Arrival:</strong> We recommend arriving 5–10 minutes early to settle into your appointment calmly.</span>
            </li>
          </ul>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/bookings" className="btn btn-gold btn-lg">
          <Sparkles size={18} />
          <span>I Understand — Book Appointment</span>
        </Link>
      </div>
    </div>
  )
}
