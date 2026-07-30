import { Link } from 'react-router-dom'
import { HeroSection } from '../components/sections/HeroSection'
import { ServicesSection } from '../components/sections/ServicesSection'
import { PricingSection } from '../components/sections/PricingSection'
import { GallerySection } from '../components/sections/GallerySection'
import { TestimonialsSection } from '../components/sections/TestimonialsSection'
import { FaqSection } from '../components/sections/FaqSection'
import { Sparkles, Calendar, Heart } from 'lucide-react'

export function HomePage() {
  return (
    <div className="page-wrapper">
      <HeroSection />

      {/* Intro Studio Band */}
      <section style={{ margin: '32px 0 48px' }}>
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
              A refined beauty ritual built for comfort, confidence, and glow.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-baby-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Sparkles size={22} style={{ color: 'var(--color-pink-accent-dark)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Curated Beauty</h3>
              <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.92rem' }}>
                Every service is meticulously styled using premium formulas to feel modern, elevated, and effortless.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Calendar size={22} style={{ color: 'var(--color-gold)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Precise Appointments</h3>
              <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.92rem' }}>
                Choose your preferred time, treatment, and add-ons in a few simple steps with real-time deposit tracking.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-baby-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Heart size={22} style={{ color: 'var(--color-pink-accent-dark)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Calm Finish</h3>
              <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.92rem' }}>
                Expect a thoughtful, high-touch experience from consultation to post-treatment aftercare guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ServicesSection />
      <PricingSection />
      <GallerySection />
      <TestimonialsSection />
      <FaqSection />

      {/* Bottom CTA Banner */}
      <section style={{ margin: '48px 0 20px' }}>
        <div
          className="glass-panel"
          style={{
            padding: '48px 32px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, var(--color-charcoal) 0%, #2E252A 100%)',
            color: 'var(--color-white)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div className="eyebrow" style={{ justifyContent: 'center', color: 'var(--color-gold)' }}>
            <span>Reserve Your Visit</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: 'var(--color-white)', marginBottom: '16px' }}>
            Ready to experience the Naurélle ritual?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 28px', fontSize: '1.05rem' }}>
            Appointments fill quickly. Reserve your preferred date and time online in under 2 minutes.
          </p>
          <Link to="/bookings" className="btn btn-gold btn-lg">
            <Sparkles size={18} />
            <span>Book Your Appointment</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
