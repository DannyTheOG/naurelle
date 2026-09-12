import { ArrowRight } from 'lucide-react'

type HeroSectionProps = {
  onBookClick?: () => void
  onExploreClick?: () => void
}

export function HeroSection({ onBookClick, onExploreClick }: HeroSectionProps) {
  const scrollTo = (e: React.MouseEvent, id: string, callback?: () => void) => {
    e.preventDefault()
    if (callback) callback()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" className="editorial-section-lg" style={{ paddingTop: '56px', scrollMarginTop: '80px' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Minimal Editorial Typography */}
          <div style={{ maxWidth: '580px' }}>
            <span className="editorial-eyebrow">NAURÈLLE BEAUTY</span>

            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.75rem, 5.2vw, 4.5rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                marginBottom: '28px',
                color: 'var(--text-primary)'
              }}
            >
              Minimal nails.<br />
              <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Beautifully done.</span>
            </h1>

            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.7,
                color: 'var(--text-muted)',
                marginBottom: '36px',
                maxWidth: '480px'
              }}
            >
              Specializing in minimalist nails, nail art, builder gel overlays, Russian manicures, Gel X and acrylic services.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href="#booking"
                onClick={(e) => scrollTo(e, 'booking', onBookClick)}
                className="btn btn-burgundy"
                style={{ padding: '16px 32px' }}
              >
                <span>Book Appointment</span>
              </a>

              <a
                href="#services"
                onClick={(e) => scrollTo(e, 'services', onExploreClick)}
                className="btn btn-editorial-outline"
                style={{ padding: '16px 30px' }}
              >
                <span>Explore Services</span>
                <ArrowRight size={15} />
              </a>
            </div>
          </div>

          {/* Right Column: High-End Editorial Photography */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--bg-surface)',
                boxShadow: 'var(--shadow-card)',
                aspectRatio: '4 / 3',
                maxHeight: '520px'
              }}
            >
              <img
                src="/naurelle-hero.jpg"
                alt="Naurèlle Beauty minimalist manicured nails on natural limestone"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

            {/* Subtle Editorial Caption */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                fontSize: '0.72rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)'
              }}
            >
              <span>Naurèlle Rituals</span>
              <span>Editorial Series 01</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
