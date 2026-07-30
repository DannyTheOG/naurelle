import { Link } from 'react-router-dom'
import { Sparkles, Calendar, Star, ShieldCheck, Heart } from 'lucide-react'

export function HeroSection() {
  return (
    <section style={{ padding: '24px 0 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="eyebrow">
            <span>Naurélle Beauty • Lashes & Nails</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 4.2rem)', lineHeight: 1.08, color: 'var(--color-charcoal)' }}>
            Modern salon rituals with a <span style={{ color: 'var(--color-pink-accent-dark)', fontStyle: 'italic' }}>soft luxury</span> finish.
          </h1>

          <p className="section-subtitle">
            From sculpted eyelash lifts to glossy, rose nude gel nails, every appointment at Naurélle is crafted to feel polished, calm, and beautifully personal.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', paddingTop: '8px' }}>
            <Link to="/bookings" className="btn btn-gold btn-lg">
              <Calendar size={18} />
              <span>Book Appointment</span>
            </Link>
            <Link to="/services" className="btn btn-outline btn-lg">
              <span>Explore Services</span>
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '16px' }}>
            <div className="pill-badge gold">
              <Star size={15} fill="var(--color-gold)" style={{ color: 'var(--color-gold)' }} />
              <span><strong>4.9 / 5</strong> Glowing Client Reviews</span>
            </div>
            <div className="pill-badge">
              <ShieldCheck size={15} />
              <span>Instant Deposit Confirmation</span>
            </div>
            <div className="pill-badge">
              <Heart size={15} />
              <span>Private Studio Space</span>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div
            className="glass-card"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(247,221,228,0.4) 100%)',
              border: '1px solid var(--color-border-subtle)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
              <img
                src="/hero-studio.png"
                alt="Naurélle Luxury Studio Interior"
                style={{
                  width: '100%',
                  height: '380px',
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: 'var(--radius-md)',
                  transition: 'transform 0.5s ease'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--color-pink-accent-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={14} style={{ color: 'var(--color-gold)' }} />
                <span>Signature Studio Glow</span>
              </div>
            </div>

            <div style={{ padding: '20px 8px 8px' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Soft luxury, designed around your ritual.</h3>
              <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Enjoy a calm studio experience with premium lash lifts, gel manicures, and bespoke add-ons in East Legon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
