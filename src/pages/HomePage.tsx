import { useEffect } from 'react'
import { HeroSection } from '../components/sections/HeroSection'
import { ServicesSection } from '../components/sections/ServicesSection'
import { PricingSection } from '../components/sections/PricingSection'
import { GallerySection } from '../components/sections/GallerySection'
import { PoliciesSection } from '../components/sections/PoliciesSection'
import { ContactSection } from '../components/sections/ContactSection'
import { Sparkles, Calendar, Heart } from 'lucide-react'

export function HomePage() {
  // Check URL hash on initial mount (e.g. #services, #gallery)
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const id = hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }, [])

  return (
    <div className="page-wrapper">
      <HeroSection />

      {/* Studio Philosophy Cards */}
      <section style={{ margin: '24px 0 48px' }}>
        <div
          className="glass-panel"
          style={{
            padding: '36px 32px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,239,234,0.9) 100%)',
            border: '1px solid var(--color-border-subtle)'
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 32px' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>
              <span>Studio Philosophy</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 2.8vw, 2.5rem)', color: 'var(--color-charcoal)' }}>
              A refined nail ritual built for nail health, elegance, and confidence.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-baby-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Sparkles size={22} style={{ color: 'var(--color-pink-accent-dark)' }} />
              </div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '8px' }}>Curated Nail Art</h3>
              <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.90rem' }}>
                Every set is meticulously styled using premium non-toxic gels and BIAB overlays to feel modern, elevated, and durable.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Calendar size={22} style={{ color: 'var(--color-gold)' }} />
              </div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '8px' }}>Precise Appointments</h3>
              <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.90rem' }}>
                Choose your preferred time, treatment, and nail art add-ons in a few simple steps with real-time deposit tracking.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-baby-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Heart size={22} style={{ color: 'var(--color-pink-accent-dark)' }} />
              </div>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '8px' }}>Calm Finish</h3>
              <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.90rem' }}>
                Expect a thoughtful, high-touch experience from consultation to post-treatment cuticle care and hand massage.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ServicesSection />
      <PricingSection />
      <GallerySection />
      <PoliciesSection />
      <ContactSection />
    </div>
  )
}
