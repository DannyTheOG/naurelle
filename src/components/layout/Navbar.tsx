import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X, ArrowUpRight } from 'lucide-react'

type NavbarProps = {
  onOpenBooking?: () => void
}

export function Navbar({ onOpenBooking }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('hero')

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      const sections = ['hero', 'services', 'toes', 'gallery', 'how-to-book', 'booking', 'studio', 'contact']
      const scrollPos = window.scrollY + 140

      for (const sectionId of sections) {
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

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Comprehensive scroll lock and Escape key handling when mobile drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return

    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalTouchAction = document.body.style.touchAction

    // Lock page scrolling in background
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.touchAction = originalTouchAction
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen])

  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)

    if (sectionId === 'booking' && onOpenBooking) {
      onOpenBooking()
    }

    // Defer scrollIntoView so that body scroll lock is released first
    setTimeout(() => {
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 50)
  }

  return (
    <>
      <header className="navbar-wrapper" style={{ boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.04)' : 'none' }}>
        <div className="container">
          <div className="navbar-inner">
            {/* Logo / Brand Name */}
            <a
              href="#hero"
              onClick={(e) => scrollToSection(e, 'hero')}
              className="navbar-brand"
              aria-label="Naurèlle Beauty Home"
            >
              NAURÈLLE BEAUTY
            </a>

            {/* Desktop Navigation */}
            <nav className="navbar-nav" aria-label="Main Navigation">
              <a
                href="#hero"
                onClick={(e) => scrollToSection(e, 'hero')}
                className={`navbar-link ${activeSection === 'hero' ? 'active' : ''}`}
              >
                Home
              </a>
              <a
                href="#services"
                onClick={(e) => scrollToSection(e, 'services')}
                className={`navbar-link ${activeSection === 'services' || activeSection === 'toes' ? 'active' : ''}`}
              >
                Services
              </a>
              <a
                href="#booking"
                onClick={(e) => scrollToSection(e, 'booking')}
                className={`navbar-link ${activeSection === 'booking' ? 'active' : ''}`}
              >
                Appointments
              </a>
              <a
                href="#studio"
                onClick={(e) => scrollToSection(e, 'studio')}
                className={`navbar-link ${activeSection === 'studio' ? 'active' : ''}`}
              >
                Studio
              </a>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, 'contact')}
                className={`navbar-link ${activeSection === 'contact' ? 'active' : ''}`}
              >
                Contact
              </a>

              <a
                href="#booking"
                onClick={(e) => scrollToSection(e, 'booking')}
                className="btn btn-burgundy btn-sm"
                style={{ padding: '10px 22px' }}
              >
                <span>Book Appointment</span>
              </a>
            </nav>

            {/* Mobile Hamburger Toggle Button */}
            <button
              className="navbar-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Minimalist Drawer Portaled Directly to document.body */}
      {mobileMenuOpen && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="mobile-nav-overlay"
            onClick={() => setMobileMenuOpen(false)}
            role="presentation"
          >
            <div
              id="mobile-navigation-drawer"
              className="mobile-nav-drawer"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              <div className="mobile-nav-header">
                <span className="navbar-brand" style={{ fontSize: '1.25rem' }}>
                  NAURÈLLE BEAUTY
                </span>
                <button
                  className="navbar-mobile-close-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              <nav className="mobile-nav-links" aria-label="Mobile Navigation Links">
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
                  className={activeSection === 'services' || activeSection === 'toes' ? 'active' : ''}
                >
                  Services Menu
                </a>
                <a
                  href="#gallery"
                  onClick={(e) => scrollToSection(e, 'gallery')}
                  className={activeSection === 'gallery' ? 'active' : ''}
                >
                  Portfolio Gallery
                </a>
                <a
                  href="#booking"
                  onClick={(e) => scrollToSection(e, 'booking')}
                  className={activeSection === 'booking' ? 'active' : ''}
                >
                  Appointments
                </a>
                <a
                  href="#studio"
                  onClick={(e) => scrollToSection(e, 'studio')}
                  className={activeSection === 'studio' ? 'active' : ''}
                >
                  The Studio &amp; Hours
                </a>
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, 'contact')}
                  className={activeSection === 'contact' ? 'active' : ''}
                >
                  Contact &amp; Location
                </a>
              </nav>

              <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
                <a
                  href="#booking"
                  onClick={(e) => scrollToSection(e, 'booking')}
                  className="btn btn-burgundy btn-full"
                  style={{ justifyContent: 'space-between' }}
                >
                  <span>Book Appointment</span>
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
