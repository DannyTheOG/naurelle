import { Sparkles, ArrowRight, MapPin, ShieldCheck } from 'lucide-react'

export function HeroSection() {
  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" style={{ padding: '40px 0 32px', scrollMarginTop: '80px', textAlign: 'center' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        {/* Minimal Eyebrow */}
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <Sparkles size={14} style={{ color: 'var(--color-gold)' }} />
          <span>Naurélle Beauty • Nail Art & BIAB Gel Studio</span>
        </div>

        {/* Minimal Hero Headline */}
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, color: 'var(--color-charcoal)', fontWeight: 600, letterSpacing: '-0.02em' }}>
          Sculpted nail rituals with a <span style={{ color: 'var(--color-pink-accent-dark)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>soft luxury</span> finish.
        </h1>

        {/* Minimal Subtitle */}
        <p className="section-subtitle" style={{ maxWidth: '640px', margin: '0 auto', fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 1.6 }}>
          Specializing in builder gel overlays, glossy rose nude manicures, and gold chrome nail art in East Legon, Accra.
        </p>

        {/* Minimal CTA Buttons */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
          <a href="#services" onClick={(e) => scrollTo(e, 'services')} className="btn btn-gold btn-lg">
            <span>Explore Services</span>
            <ArrowRight size={18} />
          </a>
          <a href="#contact" onClick={(e) => scrollTo(e, 'contact')} className="btn btn-outline btn-lg">
            <span>Visit Studio</span>
          </a>
        </div>

        {/* Minimal Trust Badges */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', paddingTop: '12px', fontSize: '0.85rem' }}>
          <div className="pill-badge">
            <ShieldCheck size={14} style={{ color: 'var(--color-gold)' }} />
            <span>BIAB Gel Specialist</span>
          </div>
          <div className="pill-badge">
            <MapPin size={14} style={{ color: 'var(--color-pink-accent-dark)' }} />
            <span>East Legon, Accra</span>
          </div>
        </div>

      </div>
    </section>
  )
}
