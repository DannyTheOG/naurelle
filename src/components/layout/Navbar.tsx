import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sparkles, Calendar } from 'lucide-react'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  return (
    <header className="navbar-sticky">
      <div className={`navbar-inner ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="brand-logo" aria-label="Naurélle Beauty Home">
          <img src="/hero.png" alt="Naurélle Logo" className="brand-logo-img" />
          <span>Naurélle</span>
        </Link>

        <nav className="nav-menu">
          <Link
            to="/services"
            className={`nav-link ${location.pathname === '/services' ? 'active' : ''}`}
          >
            Services
          </Link>
          <Link
            to="/gallery"
            className={`nav-link ${location.pathname === '/gallery' ? 'active' : ''}`}
          >
            Gallery
          </Link>
          <Link
            to="/policies"
            className={`nav-link ${location.pathname === '/policies' ? 'active' : ''}`}
          >
            Policies
          </Link>
          <Link
            to="/contact"
            className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
          >
            Contact
          </Link>
          <Link to="/bookings" className="btn btn-gold btn-sm">
            <Calendar className="w-4 h-4" size={16} />
            <span>Book Ritual</span>
          </Link>
        </nav>

        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" onClick={() => setMobileMenuOpen(false)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <Link to="/" className="brand-logo">
                <img src="/hero.png" alt="Naurélle Logo" className="brand-logo-img" />
                <span>Naurélle</span>
              </Link>
              <button
                className="mobile-toggle"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-links">
              <Link
                to="/"
                className={location.pathname === '/' ? 'active' : ''}
              >
                Home
              </Link>
              <Link
                to="/services"
                className={location.pathname === '/services' ? 'active' : ''}
              >
                Services Menu
              </Link>
              <Link
                to="/gallery"
                className={location.pathname === '/gallery' ? 'active' : ''}
              >
                Gallery Showcase
              </Link>
              <Link
                to="/policies"
                className={location.pathname === '/policies' ? 'active' : ''}
              >
                Booking Policies
              </Link>
              <Link
                to="/contact"
                className={location.pathname === '/contact' ? 'active' : ''}
              >
                Contact & Studio Location
              </Link>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
              <Link to="/bookings" className="btn btn-gold style-full" style={{ width: '100%' }}>
                <Sparkles size={18} />
                <span>Book Appointment</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
