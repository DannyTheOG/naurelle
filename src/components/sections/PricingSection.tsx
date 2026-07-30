import { Check, Sparkles, HelpCircle } from 'lucide-react'

const pricingData = [
  {
    name: 'Gel Manicure',
    price: '₵75',
    category: 'Gel Polish',
    note: 'Includes precision cuticle care & high-shine top coat',
    features: ['Gentle cuticle e-file cleaning', 'Custom nude/blush shade match', 'High-shine gel top coat', 'Relaxing hand massage & oil'],
    popular: true
  },
  {
    name: 'BIAB Builder Gel Overlay',
    price: '₵95',
    category: 'Natural Nail Builder',
    note: 'Reinforces natural nail structure to promote healthy growth',
    features: ['High-strength BIAB formula', 'Flawless apex structuring', 'Lasts up to 4 weeks', 'Prevents nail chipping & splitting']
  },
  {
    name: 'Sculpted Acrylic Set',
    price: '₵120',
    category: 'Nail Extensions',
    note: 'Bespoke sculpted extension set with custom shape & length',
    features: ['1-on-1 shape consultation', 'Lightweight strong polymer', 'Includes 2 nail art accent nails', 'Complimentary aftercare kit']
  }
]

type PricingSectionProps = {
  onSelectService?: (serviceName: string) => void
}

export function PricingSection({ onSelectService }: PricingSectionProps) {
  const handleSelect = (e: React.MouseEvent, name: string) => {
    e.preventDefault()
    if (onSelectService) onSelectService(name)
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="section" id="pricing" style={{ padding: '48px 0', scrollMarginTop: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span>Transparent Pricing</span>
        </div>
        <h2 className="section-title">Clear pricing for every signature nail treatment.</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          No hidden fees. Every appointment includes personal consultation, medical-grade sanitization, and nourishing hand care.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {pricingData.map((item) => (
          <div
            className={`glass-card ${item.popular ? 'popular-card' : ''}`}
            key={item.name}
            style={{
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              border: item.popular ? '2px solid var(--color-gold)' : '1px solid var(--color-border-subtle)',
              background: item.popular ? 'linear-gradient(180deg, var(--color-white) 0%, var(--color-gold-light) 100%)' : 'var(--color-white)'
            }}
          >
            {item.popular && (
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--color-gold)',
                  color: 'var(--color-white)',
                  padding: '4px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={12} />
                <span>Most Requested</span>
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span className="pill-badge" style={{ marginBottom: '8px' }}>{item.category}</span>
              <h3 style={{ fontSize: '1.6rem', marginTop: '4px' }}>{item.name}</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: '12px 0 4px' }}>
                {item.price}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-pink-accent-dark)' }}>{item.note}</p>
            </div>

            <div style={{ flex: 1, borderTop: '1px solid var(--color-border-subtle)', paddingTop: '20px', marginBottom: '24px' }}>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {item.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-baby-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} style={{ color: 'var(--color-pink-accent-dark)' }} />
                    </div>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href="#booking"
              onClick={(e) => handleSelect(e, item.name)}
              className={`btn ${item.popular ? 'btn-gold' : 'btn-outline'} style-full`}
              style={{ width: '100%' }}
            >
              <span>Select Treatment</span>
            </a>
          </div>
        ))}
      </div>

      <div
        className="glass-panel"
        style={{
          marginTop: '36px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <HelpCircle size={24} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '2px' }}>Deposit Policy Notice</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-charcoal-muted)' }}>
            A GHS 50–75 deposit is required upon booking approval to hold your time slot. Deposits are deducted from your final total at checkout.
          </p>
        </div>
      </div>
    </section>
  )
}
