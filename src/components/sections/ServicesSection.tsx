import { studioConfig } from '../../config/studioConfig'
import { ArrowUpRight } from 'lucide-react'

type ServicesSectionProps = {
  onSelectService: (serviceId: string, lengthId?: string) => void
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const handleServiceSelect = (serviceId: string, lengthId?: string) => {
    onSelectService(serviceId, lengthId)
    const el = document.getElementById('booking')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="services" className="editorial-section" style={{ scrollMarginTop: '80px' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '640px', marginBottom: '48px' }}>
          <span className="editorial-eyebrow">Service Menu</span>
          <h2 className="section-title">Services</h2>
          <p className="section-subtitle">
            Choose your service and find the finish that suits you.
          </p>
        </div>

        {/* Services List with Thin Hairline Dividers & Typography */}
        <div style={{ borderTop: '1px solid var(--border-light)' }}>
          {studioConfig.services.map((service) => (
            <div
              key={service.id}
              className="service-menu-row"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '36px 0',
                borderBottom: '1px solid var(--border-light)'
              }}
            >
              {/* Header row: Service name, description, and primary CTA */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '16px',
                  width: '100%'
                }}
              >
                <div style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '6px' }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.5rem, 2.5vw, 1.95rem)',
                        fontWeight: 400,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {service.name}
                    </h3>
                    {!service.hasLengths && (
                      <span
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: 'var(--color-accent)',
                          fontFamily: 'var(--font-serif)'
                        }}
                      >
                        {service.displayPrice}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {service.description}
                  </p>
                </div>

                {!service.hasLengths && (
                  <button
                    onClick={() => handleServiceSelect(service.id)}
                    className="btn btn-editorial-outline btn-sm"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <span>Book Service</span>
                    <ArrowUpRight size={14} />
                  </button>
                )}
              </div>

              {/* Lengths breakdown for services that require length */}
              {service.hasLengths && service.lengthOptions && (
                <div
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}
                >
                  {service.lengthOptions.map((length) => (
                    <button
                      key={length.id}
                      onClick={() => handleServiceSelect(service.id, length.id)}
                      style={{
                        textAlign: 'left',
                        padding: '16px',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-xs)',
                        transition: 'all var(--transition-normal)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-light)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {length.name}
                        </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-serif)' }}>
                          {length.displayPrice}
                        </span>
                      </div>

                      {length.magnets && (
                        <span style={{ fontSize: '0.75rem', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                          {length.magnets} magnets guide
                        </span>
                      )}

                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)', marginTop: '4px' }}>
                        Select Length &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
