export function BrandStatement() {
  return (
    <section className="editorial-section-sm" style={{ padding: '64px 0 88px' }}>
      <div className="container-narrow">
        <div style={{ textAlign: 'center' }}>
          <span className="editorial-eyebrow" style={{ letterSpacing: '0.28em' }}>
            Philosophy
          </span>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
              lineHeight: 1.15,
              color: 'var(--text-primary)',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
              fontWeight: 400
            }}
          >
            Nails, refined.
          </h2>

          <div
            style={{
              width: '40px',
              height: '1px',
              backgroundColor: 'var(--color-accent)',
              margin: '0 auto 28px'
            }}
          />

          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
              lineHeight: 1.8,
              color: 'var(--text-muted)',
              maxWidth: '680px',
              margin: '0 auto'
            }}
          >
            Thoughtfully designed nail services for those who appreciate clean details, timeless style, and beautifully finished nails.
          </p>
        </div>
      </div>
    </section>
  )
}
