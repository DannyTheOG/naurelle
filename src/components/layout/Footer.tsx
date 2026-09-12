import { studioConfig } from '../../config/studioConfig'

export function Footer() {
  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const directWhatsappUrl = `https://wa.me/${studioConfig.contact.whatsappNumber}`

  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-canvas)',
        borderTop: '1px solid var(--border-light)',
        padding: '64px 0 40px',
        color: 'var(--text-primary)'
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '32px'
          }}
        >
          {/* Brand Name */}
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            NAURÈLLE BEAUTY
          </div>

          {/* Primary Navigation Links */}
          <nav
            style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: '0.82rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            <a href="#hero" onClick={(e) => scrollTo(e, 'hero')} className="navbar-link">
              Home
            </a>
            <a href="#services" onClick={(e) => scrollTo(e, 'services')} className="navbar-link">
              Services
            </a>
            <a href="#booking" onClick={(e) => scrollTo(e, 'booking')} className="navbar-link">
              Appointments
            </a>
            <a href="#studio" onClick={(e) => scrollTo(e, 'studio')} className="navbar-link">
              Studio
            </a>
            <a href="#contact" onClick={(e) => scrollTo(e, 'contact')} className="navbar-link">
              Contact
            </a>
          </nav>

          {/* Channels & Location */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: '0.82rem',
              color: 'var(--text-muted)'
            }}
          >
            <a
              href={studioConfig.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)' }}
            >
              Instagram
            </a>
            <span>•</span>
            <a
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)' }}
            >
              WhatsApp
            </a>
            <span>•</span>
            <a
              href={studioConfig.address.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)' }}
            >
              Location
            </a>
          </div>

          {/* Minimal Copyright */}
          <div
            style={{
              paddingTop: '24px',
              borderTop: '1px solid var(--border-light)',
              width: '100%',
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
              color: 'var(--text-muted)'
            }}
          >
            &copy; {new Date().getFullYear()} Naurèlle Beauty. All rights reserved. Quiet luxury nail studio.
          </div>
        </div>
      </div>
    </footer>
  )
}
