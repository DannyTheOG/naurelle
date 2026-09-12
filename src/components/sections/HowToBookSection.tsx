const bookingSteps = [
  {
    num: '01',
    title: 'Choose your service',
    description: 'Select the nail or toe service you want.'
  },
  {
    num: '02',
    title: 'Choose your length',
    description: 'Select your preferred length where applicable.'
  },
  {
    num: '03',
    title: 'Choose your date & time',
    description: 'Select an available appointment.'
  },
  {
    num: '04',
    title: 'Confirm',
    description: 'Review your details and confirm your appointment.'
  }
]

export function HowToBookSection() {
  return (
    <section id="how-to-book" className="editorial-section-sm" style={{ scrollMarginTop: '80px', padding: '64px 0' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '640px', marginBottom: '48px' }}>
          <span className="editorial-eyebrow">Booking Guide</span>
          <h2 className="section-title">How to Book</h2>
          <p className="section-subtitle">
            An effortless four-step ritual to secure your private studio session.
          </p>
        </div>

        {/* 4 Minimal Step Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '32px',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '36px'
          }}
        >
          {bookingSteps.map((step) => (
            <div key={step.num} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2.5rem',
                  lineHeight: 1,
                  color: 'var(--color-accent)',
                  fontWeight: 300
                }}
              >
                {step.num}
              </span>

              <h3
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  color: 'var(--text-primary)'
                }}
              >
                {step.title}
              </h3>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
