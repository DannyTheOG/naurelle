import { studioConfig } from '../../config/studioConfig'
import { ArrowUpRight } from 'lucide-react'

type ToeServicesSectionProps = {
  onSelectToeService: (toeServiceId: string) => void
}

export function ToeServicesSection({ onSelectToeService }: ToeServicesSectionProps) {
  const handleSelect = (id: string) => {
    onSelectToeService(id)
    const el = document.getElementById('booking')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="toes" className="editorial-section-sm" style={{ scrollMarginTop: '80px', paddingTop: '16px' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '640px', marginBottom: '40px' }}>
          <span className="editorial-eyebrow">Pedicure &amp; Care</span>
          <h2 className="section-title">Toe Services</h2>
          <p className="section-subtitle">
            Refined treatments designed for clean proportion, durable beauty, and pristine toe care.
          </p>
        </div>

        {/* Toe Services Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}
        >
          {studioConfig.toeServices.map((item) => (
            <div
              key={item.id}
              className="surface-white"
              style={{
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all var(--transition-normal)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.4rem',
                      fontWeight: 400,
                      color: 'var(--text-primary)'
                    }}
                  >
                    {item.name}
                  </h3>
                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 700,
                      color: 'var(--color-accent)'
                    }}
                  >
                    {item.displayPrice}
                  </span>
                </div>

                {item.description && (
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    {item.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleSelect(item.id)}
                className="btn btn-editorial-outline btn-sm"
                style={{ width: '100%', justifyContent: 'space-between', marginTop: '8px' }}
              >
                <span>Book This Service</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
