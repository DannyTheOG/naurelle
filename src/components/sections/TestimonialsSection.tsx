import { Star, Quote, CheckCircle2 } from 'lucide-react'
import type { Testimonial } from '../../types'

const testimonialsData: Testimonial[] = [
  {
    name: 'Amina K.',
    role: 'Regular Client',
    rating: 5,
    comment: 'The lash lift at Naurélle is honestly life-changing! My natural lashes look so lifted and open without needing mascara every morning. The studio is so calming too.',
    treatment: 'Classic Lash Lift',
    date: 'Verified Visit'
  },
  {
    name: 'Elena M.',
    role: 'Beauty Enthusiast',
    rating: 5,
    comment: 'Best gel manicure experience in Accra. The attention to cuticle detail, smooth nude polish finish, and gold accents were flawless. Lasted over 3 weeks!',
    treatment: 'Gel Manicure',
    date: 'Verified Visit'
  },
  {
    name: 'Chloe T.',
    role: 'Creative Director',
    rating: 5,
    comment: 'Loved the private studio atmosphere. Very professional appointment scheduling, quick deposit confirmation, and my hybrid extensions feel so lightweight.',
    treatment: 'Hybrid Fill',
    date: 'Verified Visit'
  }
]

export function TestimonialsSection() {
  return (
    <section className="section" style={{ padding: '48px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span>Client Praise</span>
        </div>
        <h2 className="section-title">Glowing reviews from our lovely studio guests.</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          Read why our clients trust Naurélle for their soft luxury beauty rituals.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {testimonialsData.map((t, idx) => (
          <div className="glass-card" key={idx} style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Quote size={32} style={{ color: 'var(--color-baby-pink)', position: 'absolute', top: '20px', right: '20px', opacity: 0.6 }} />

            <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} size={16} fill="var(--color-gold)" style={{ color: 'var(--color-gold)' }} />
              ))}
            </div>

            <p style={{ color: 'var(--color-charcoal)', fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.6, flex: 1, marginBottom: '20px' }}>
              "{t.comment}"
            </p>

            <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--color-charcoal)' }}>{t.name}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-pink-accent-dark)' }}>{t.treatment}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#4CAF50', fontWeight: 600 }}>
                <CheckCircle2 size={14} />
                <span>{t.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
