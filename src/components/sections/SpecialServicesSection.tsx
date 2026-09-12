import { studioConfig } from '../../config/studioConfig'
import { MessageCircle } from 'lucide-react'

export function SpecialServicesSection() {
  const whatsappUrl = `https://wa.me/${studioConfig.contact.whatsappNumber}?text=${encodeURIComponent(
    studioConfig.contact.whatsappDefaultMessage
  )}`

  return (
    <section className="editorial-section-sm" style={{ padding: '64px 0 72px' }}>
      <div className="container">
        <div
          className="surface-white"
          style={{
            padding: '48px 36px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '820px',
            margin: '0 auto',
            border: '1px solid var(--border-light)'
          }}
        >
          <span className="editorial-eyebrow" style={{ letterSpacing: '0.24em' }}>
            VIP &amp; Urgent Bookings
          </span>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
              fontWeight: 400,
              color: 'var(--text-primary)',
              marginBottom: '16px',
              letterSpacing: '-0.01em'
            }}
          >
            Home Service / Squeeze In
          </h2>

          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'var(--text-muted)',
              maxWidth: '560px',
              marginBottom: '28px'
            }}
          >
            Need an appointment outside regular availability? Contact Naurèlle Beauty directly to enquire about home service or squeeze-in appointments.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-burgundy"
            style={{ padding: '14px 32px' }}
          >
            <MessageCircle size={17} />
            <span>WhatsApp Me</span>
          </a>
        </div>
      </div>
    </section>
  )
}
