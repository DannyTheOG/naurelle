import { useState, useEffect } from 'react'
import { Menu, X, Sparkles, Calendar } from 'lucide-react'

const SECTIONS = ['services', 'pricing', 'gallery', 'booking', 'policies', 'contact']

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('hero')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      // Scroll Spy logic
      const scrollPos = window.scrollY + 120
      for (const sectionId of SECTIONS) {
        const el = document.getElementById(sectionId)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="navbar-sticky">
      <div className={`navbar-inner ${scrolled ? 'scrolled' : ''}`}>
        <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} className="brand-logo" aria-label="Naurélle Beauty Home">
          <img src="/hero.png" alt="Naurélle Logo" className="brand-logo-img" />
          <span>Naurélle</span>
        </a>

        <nav className="nav-menu">
          <a
            href="#services"
            onClick={(e) => scrollToSection(e, 'services')}
            className={`nav-link ${activeSection === 'services' ? 'active' : ''}`}
          >
            Services
          </a>
          <a
            href="#gallery"
            onClick={(e) => scrollToSection(e, 'gallery')}
            className={`nav-link ${activeSection === 'gallery' ? 'active' : ''}`}
          >
            Gallery
          </a>
          <a
            href="#policies"
            onClick={(e) => scrollToSection(e, 'policies')}
            className={`nav-link ${activeSection === 'policies' ? 'active' : ''}`}
          >
            Policies
          </a>
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, 'contact')}
            className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
          >
            Contact
          </a>
          <a
            href="#booking"
            onClick={(e) => scrollToSection(e, 'booking')}
            className="btn btn-gold btn-sm"
          >
            <Calendar size={16} />
            <span>Book Ritual</span>
          </a>
        </nav>

        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" onClick={() => setMobileMenuOpen(false)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} className="brand-logo">
                <img src="/hero.png" alt="Naurélle Logo" className="brand-logo-img" />
                <span>Naurélle</span>
              </a>
              <button
                className="mobile-toggle"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="drawer-links">
              <a
                href="#hero"
                onClick={(e) => scrollToSection(e, 'hero')}
                className={activeSection === 'hero' ? 'active' : ''}
              >
                Home
              </a>
              <a
                href="#services"
                onClick={(e) => scrollToSection(e, 'services')}
                className={activeSection === 'services' ? 'active' : ''}
              >
                Services Menu
              </a>
              <a
                href="#gallery"
                onClick={(e) => scrollToSection(e, 'gallery')}
                className={activeSection === 'gallery' ? 'active' : ''}
              >
                Gallery Showcase
              </a>
              <a
                href="#policies"
                onClick={(e) => scrollToSection(e, 'policies')}
                className={activeSection === 'policies' ? 'active' : ''}
              >
                Booking Policies
              </a>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, 'contact')}
                className={activeSection === 'contact' ? 'active' : ''}
              >
                Contact & Location
              </a>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
              <a
                href="#booking"
                onClick={(e) => scrollToSection(e, 'booking')}
                className="btn btn-gold style-full"
                style={{ width: '100%' }}
              >
                <Sparkles size={18} />
                <span>Book Appointment</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
