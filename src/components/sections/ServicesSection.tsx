import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import type { Service } from '../../types'

const servicesData: Service[] = [
  {
    id: 'lash-lift',
    name: 'Classic Lash Lift',
    price: '$95',
    priceValue: 95,
    duration: '60 mins',
    category: 'lashes',
    description: 'A soft, lifted lash look that opens the eyes beautifully and lasts 6 to 8 weeks effortless glow.',
    highlights: ['Keratin lash boost', 'Aftercare nourishment guide', 'Custom curl mapping'],
    image: '/lash-lift.png',
    popular: true
  },
  {
    id: 'gel-manicure',
    name: 'Gel Manicure',
    price: '$75',
    priceValue: 75,
    duration: '45 mins',
    category: 'nails',
    description: 'A glossy, chip-resistant manicure in your favourite nude, rose, or sparkle shimmer finish.',
    highlights: ['Nail shaping & cuticle care', 'High-shine gel top coat', 'Relaxing hand massage'],
    image: '/gel-manicure.png',
    popular: true
  },
  {
    id: 'hybrid-fill',
    name: 'Hybrid Fill',
    price: '$85',
    priceValue: 85,
    duration: '75 mins',
    category: 'combo',
    description: 'A fresh refill combining classic and volume fan lashes for a clean shape and long-lasting volume.',
    highlights: ['Deep lash cleansing', 'Seamless fan placement', 'Lightweight comfortable finish'],
    image: '/hybrid-fill.png'
  }
]

export function ServicesSection() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'lashes' | 'nails' | 'combo'>('all')

  const filteredServices = activeCategory === 'all'
    ? servicesData
    : servicesData.filter(s => s.category === activeCategory)

  return (
    <section className="section" style={{ padding: '48px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span>Signature Menu</span>
        </div>
        <h2 className="section-title">Lash and nail rituals designed to feel elevated.</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          Select a signature service tailored to your style. Every visit includes private consultation and premium studio care.
        </p>

        {/* Category Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
          {(['all', 'lashes', 'nails', 'combo'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`btn btn-sm ${activeCategory === cat ? 'btn-gold' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {cat === 'all' ? 'All Treatments' : cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {filteredServices.map((service) => (
          <article className="glass-card" key={service.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '220px', overflow: 'hidden', borderTopLeftRadius: 'var(--radius-md)', borderTopRightRadius: 'var(--radius-md)' }}>
              <img
                src={service.image}
                alt={service.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {service.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'var(--color-gold)',
                    color: 'var(--color-white)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={12} />
                  <span>Popular</span>
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(28,22,25,0.75)',
                  backdropFilter: 'blur(8px)',
                  color: 'var(--color-white)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Clock size={12} />
                <span>{service.duration}</span>
              </div>
            </div>

            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.4rem' }}>{service.name}</h3>
                <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-pink-accent-dark)' }}>
                  {service.price}
                </span>
              </div>

              <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.92rem', marginBottom: '16px', flex: 1 }}>
                {service.description}
              </p>

              <div style={{ borderTop: '1px dashed var(--color-border-subtle)', paddingTop: '14px', marginBottom: '20px' }}>
                {service.highlights.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-charcoal)', marginBottom: '6px' }}>
                    <CheckCircle2 size={14} style={{ color: 'var(--color-gold)' }} />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <Link
                to={`/bookings?service=${encodeURIComponent(service.name)}`}
                className="btn btn-pink btn-sm style-full"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>Book This Ritual</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
