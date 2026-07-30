import { useState } from 'react'
import { Sparkles, Clock, CheckCircle2, ArrowRight } from 'lucide-react'
import type { Service } from '../../types'

const servicesData: Service[] = [
  {
    id: 'gel-manicure',
    name: 'Gel Manicure',
    price: '₵75',
    priceValue: 75,
    duration: '45 mins',
    category: 'gel',
    description: 'A glossy, chip-resistant gel manicure featuring precision cuticle care, nail shaping, and a high-shine nude top coat.',
    highlights: ['Nail shaping & cuticle care', 'Non-toxic gel polish blend', 'High-shine chip-resistant finish'],
    image: '/gel-manicure.png',
    popular: true
  },
  {
    id: 'builder-gel',
    name: 'BIAB Builder Gel Overlay',
    price: '₵95',
    priceValue: 95,
    duration: '60 mins',
    category: 'builder',
    description: 'A strengthening builder gel overlay designed to protect natural nails, promote natural growth, and maintain a smooth nude apex.',
    highlights: ['Natural nail reinforcement', 'Custom nude/blush shade match', 'Lasts 4+ weeks with refills'],
    image: '/builder-gel.png',
    popular: true
  },
  {
    id: 'acrylic-set',
    name: 'Sculpted Acrylic Full Set',
    price: '₵120',
    priceValue: 120,
    duration: '75 mins',
    category: 'sculpted',
    description: 'Bespoke sculpted acrylic extensions with your preferred shape (almond, square, coffin) and optional gold French or metallic art.',
    highlights: ['Lightweight strong structure', 'Custom length & shape mapping', 'Complimentary cuticle oil oil treatment'],
    image: '/acrylic-set.png'
  }
]

type ServicesSectionProps = {
  onSelectService?: (serviceName: string) => void
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'gel' | 'builder' | 'sculpted'>('all')

  const filteredServices = activeCategory === 'all'
    ? servicesData
    : servicesData.filter(s => s.category === activeCategory)

  const handleBookClick = (e: React.MouseEvent, serviceName: string) => {
    e.preventDefault()
    if (onSelectService) {
      onSelectService(serviceName)
    }
    const el = document.getElementById('booking')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="section" id="services" style={{ padding: '48px 0', scrollMarginTop: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span>Nail Tech Menu</span>
        </div>
        <h2 className="section-title">Signature nail rituals for every mood & moment.</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          Select a signature nail treatment tailored to your style. Every visit includes private consultation, hygiene-first care, and hand massage.
        </p>

        {/* Category Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
          {(['all', 'gel', 'builder', 'sculpted'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`btn btn-sm ${activeCategory === cat ? 'btn-gold' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {cat === 'all' ? 'All Treatments' : cat === 'builder' ? 'BIAB Builder Gel' : cat}
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

              <a
                href="#booking"
                onClick={(e) => handleBookClick(e, service.name)}
                className="btn btn-pink btn-sm style-full"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>Book This Treatment</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
