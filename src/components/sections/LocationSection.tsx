import { studioConfig } from '../../config/studioConfig'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'

export function LocationSection() {
  return (
    <section className="editorial-section-sm" style={{ padding: '48px 0 80px' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '640px', marginBottom: '36px' }}>
          <span className="editorial-eyebrow">Location &amp; Directions</span>
          <h2 className="section-title">Find the Studio</h2>
          <p className="section-subtitle">
            Located in {studioConfig.address.area}, {studioConfig.address.city}. Directions and coordinates can be updated directly in the configuration.
          </p>
        </div>

        {/* Minimalist Map & Details Card */}
        <div
          className="surface-white"
          style={{
            overflow: 'hidden',
            border: '1px solid var(--border-light)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            alignItems: 'stretch'
          }}
        >
          {/* Address & Actions */}
          <div
            style={{
              padding: '40px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <MapPin size={18} style={{ color: 'var(--color-accent)' }} />
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--color-accent)',
                    fontWeight: 600
                  }}
                >
                  Studio Address
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.6rem',
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  fontWeight: 400
                }}
              >
                {studioConfig.address.area}, {studioConfig.address.city}
              </h3>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
                {studioConfig.address.fullDisplay}
              </p>

              <div
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)'
                }}
              >
                Private studio entry details and exact parking directions will be shared upon appointment confirmation.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href={studioConfig.address.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-burgundy btn-sm"
              >
                <Navigation size={14} />
                <span>Get Directions</span>
              </a>

              <a
                href={studioConfig.address.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-minimal btn-sm"
              >
                <ExternalLink size={14} />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

          {/* Integrated Minimalist Map Embed */}
          <div style={{ minHeight: '320px', position: 'relative', filter: 'grayscale(0.4) contrast(0.95)' }}>
            <iframe
              title="Naurèlle Beauty Studio Location Map"
              src={studioConfig.address.embedMapUrl}
              style={{
                width: '100%',
                height: '100%',
                minHeight: '320px',
                border: 0,
                display: 'block'
              }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
