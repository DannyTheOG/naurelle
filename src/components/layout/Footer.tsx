import { MessageCircle } from 'lucide-react'

export function Footer() {
  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="site-footer" style={{ padding: '32px 20px 24px', background: 'var(--color-charcoal)', borderTop: '2px solid var(--color-gold)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
        
        {/* Brand Title */}
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--color-white)', letterSpacing: '0.04em', margin: 0 }}>
            Naurélle Beauty
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.65)', marginTop: '4px' }}>
            Nail Technology & BIAB Gel Studio • East Legon, Accra
          </p>
        </div>

        {/* Minimal Navigation Links */}
        <nav style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.88rem' }}>
          <a href="#hero" onClick={(e) => scrollTo(e, 'hero')} style={{ color: 'rgba(255, 255, 255, 0.8)', transition: 'color 0.2s' }}>Home</a>
          <span style={{ color: 'var(--color-gold)', opacity: 0.5 }}>•</span>
          <a href="#services" onClick={(e) => scrollTo(e, 'services')} style={{ color: 'rgba(255, 255, 255, 0.8)', transition: 'color 0.2s' }}>Services</a>
          <span style={{ color: 'var(--color-gold)', opacity: 0.5 }}>•</span>
          <a href="#pricing" onClick={(e) => scrollTo(e, 'pricing')} style={{ color: 'rgba(255, 255, 255, 0.8)', transition: 'color 0.2s' }}>Pricing</a>
          <span style={{ color: 'var(--color-gold)', opacity: 0.5 }}>•</span>
          <a href="#gallery" onClick={(e) => scrollTo(e, 'gallery')} style={{ color: 'rgba(255, 255, 255, 0.8)', transition: 'color 0.2s' }}>Portfolio</a>
          <span style={{ color: 'var(--color-gold)', opacity: 0.5 }}>•</span>
          <a href="#booking" onClick={(e) => scrollTo(e, 'booking')} style={{ color: 'rgba(255, 255, 255, 0.8)', transition: 'color 0.2s' }}>Book</a>
          <span style={{ color: 'var(--color-gold)', opacity: 0.5 }}>•</span>
          <a href="#policies" onClick={(e) => scrollTo(e, 'policies')} style={{ color: 'rgba(255, 255, 255, 0.8)', transition: 'color 0.2s' }}>Policies</a>
          <span style={{ color: 'var(--color-gold)', opacity: 0.5 }}>•</span>
          <a href="#contact" onClick={(e) => scrollTo(e, 'contact')} style={{ color: 'rgba(255, 255, 255, 0.8)', transition: 'color 0.2s' }}>Contact</a>
        </nav>

        {/* Minimal Social Icons */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a
            href="https://wa.me/233551234567"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <MessageCircle size={15} />
            <span>WhatsApp</span>
          </a>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>
          <a
            href="https://instagram.com/naurellebeauty"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            <span>Instagram</span>
          </a>
        </div>

        {/* Minimal Copyright */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px', width: '100%', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)' }}>
          &copy; {new Date().getFullYear()} Naurélle Beauty. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
