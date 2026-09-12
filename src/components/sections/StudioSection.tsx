import { studioConfig } from '../../config/studioConfig'
import { Clock, MapPin, Phone, Mail } from 'lucide-react'

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

export function StudioSection() {
  return (
    <section id="studio" className="editorial-section" style={{ scrollMarginTop: '80px' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '640px', marginBottom: '48px' }}>
          <span className="editorial-eyebrow">The Space</span>
          <h2 className="section-title">The Studio</h2>
          <p className="section-subtitle">
            An intimate private beauty sanctuary designed for calm rituals, refined detail, and restorative nail care.
          </p>
        </div>

        {/* Studio Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center'
          }}
        >
          {/* Photography */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 'var(--radius-xs)',
                overflow: 'hidden',
                aspectRatio: '16/10',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <img
                src="/naurelle-studio.jpg"
                alt="Naurèlle Beauty studio minimalist interior"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '10px',
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)'
              }}
            >
              <span>Sanctuary Atmosphere</span>
              <span>East Legon Studio</span>
            </div>
          </div>

          {/* Studio Details & Hours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Description */}
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.8rem',
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  fontWeight: 400
                }}
              >
                A Personal Ritual
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, fontSize: '0.96rem' }}>
                Naurèlle Beauty was created to offer an antidote to hurried salon experiences. We believe nails are a personal expression of refined taste. Every appointment is conducted with single-guest focus, meticulous hygiene, and an intentional atmosphere of quiet luxury.
              </p>
            </div>

            {/* Dedicated Studio Hours Area */}
            <div
              className="surface-white"
              style={{
                padding: '24px 28px',
                border: '1px solid var(--border-light)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Clock size={16} style={{ color: 'var(--color-accent)' }} />
                <h4
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)'
                  }}
                >
                  Studio Hours
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {studioConfig.hours.map((schedule, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.9rem',
                      paddingBottom: '8px',
                      borderBottom: idx < studioConfig.hours.length - 1 ? '1px solid var(--border-light)' : 'none'
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>{schedule.day}</span>
                    <span style={{ color: schedule.isClosed ? 'var(--color-accent)' : 'var(--text-primary)', fontWeight: 500 }}>
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contact & Social Channels */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                fontSize: '0.88rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-muted)' }}>{studioConfig.address.fullDisplay}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-muted)' }}>{studioConfig.contact.phoneDisplay}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-muted)' }}>{studioConfig.contact.email}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <InstagramIcon size={16} />
                <a
                  href={studioConfig.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
                >
                  {studioConfig.contact.instagramHandle}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
