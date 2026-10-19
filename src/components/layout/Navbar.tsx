import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X, ArrowUpRight, User, Calendar } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { AuthModal } from '../auth/AuthModal'
import { UserProfileModal } from '../auth/UserProfileModal'
import { BookingsManagerModal } from '../admin/BookingsManagerModal'

type NavbarProps = {
  onOpenBooking?: () => void
}

export function Navbar({ onOpenBooking }: NavbarProps) {
  const { user, profile } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('hero')

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [bookingsModalOpen, setBookingsModalOpen] = useState(false)

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

  const displayName = profile?.fullName
    ? profile.fullName.split(' ')[0]
    : user?.email?.split('@')[0] || 'Account'

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

              {/* User Account Button */}
              {user ? (
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="navbar-link navbar-user-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(58, 20, 30, 0.05)',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: '1px solid rgba(58, 20, 30, 0.1)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#3A141E',
                    maxWidth: '180px',
                  }}
                >
                  <User size={12} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
                  {profile?.role && profile.role !== 'client' && (
                    <span
                      style={{
                        fontSize: '0.5rem',
                        textTransform: 'uppercase',
                        background: '#3A141E',
                        color: '#FFF',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        flexShrink: 0,
                      }}
                    >
                      {profile.role}
                    </span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="navbar-link"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                >
                  Sign In
                </button>
              )}

              {/* Studio Management Button for Admin / Staff */}
              {profile?.role && profile.role !== 'client' && (
                <button
                  type="button"
                  onClick={() => setBookingsModalOpen(true)}
                  className="navbar-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(58, 20, 30, 0.08)',
                    color: '#3A141E',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: '1px solid rgba(58, 20, 30, 0.15)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                  title="Studio Bookings & Schedule"
                >
                  <Calendar size={14} />
                  <span>Bookings</span>
                </button>
              )}

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

              {/* Mobile User Profile Header */}
              <div
                style={{
                  padding: '12px 14px',
                  background: '#F9F6F3',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setProfileModalOpen(true)
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#3A141E',
                      width: '100%',
                      textAlign: 'left',
                      padding: '2px 0',
                    }}
                  >
                    <User size={18} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName.charAt(0).toUpperCase()}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setAuthModalOpen(true)
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#3A141E',
                      width: '100%',
                      textAlign: 'left',
                      padding: '2px 0',
                    }}
                  >
                    <User size={18} style={{ flexShrink: 0 }} />
                    <span>Sign In / Create Account</span>
                  </button>
                )}

                {profile?.role && profile.role !== 'client' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setBookingsModalOpen(true)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(58, 20, 30, 0.08)',
                      border: '1px solid rgba(58, 20, 30, 0.15)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#3A141E',
                    }}
                  >
                    <Calendar size={16} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Bookings
                    </span>
                  </button>
                )}
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
                  Services
                </a>
                <a
                  href="#gallery"
                  onClick={(e) => scrollToSection(e, 'gallery')}
                  className={activeSection === 'gallery' ? 'active' : ''}
                >
                  Portfolio Gallery
                </a>
                <a
                  href="#studio"
                  onClick={(e) => scrollToSection(e, 'studio')}
                  className={activeSection === 'studio' ? 'active' : ''}
                >
                  Studio
                </a>
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, 'contact')}
                  className={activeSection === 'contact' ? 'active' : ''}
                >
                  Contact
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

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onOpenBookingsManager={() => setBookingsModalOpen(true)}
      />

      {/* Studio Bookings Manager Modal (Admin/Staff) */}
      <BookingsManagerModal isOpen={bookingsModalOpen} onClose={() => setBookingsModalOpen(false)} />
    </>
  )
}
