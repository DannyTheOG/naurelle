import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import { Menu, X, ArrowUpRight, User } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { AuthModal } from '../auth/AuthModal'
import { UserProfileModal } from '../auth/UserProfileModal'
import { BookingsManagerModal } from '../admin/BookingsManagerModal'
import { UserAvatarMenu } from './UserAvatarMenu'

type NavbarProps = {
  onOpenBooking?: () => void
}

export function Navbar({ onOpenBooking }: NavbarProps) {
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('hero')

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'bookings'>('profile')
  const [bookingsModalOpen, setBookingsModalOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // Automatically open AuthModal when redirected with ?auth=signin or ?auth=forgot
  useEffect(() => {
    const authParam = searchParams.get('auth')
    if (authParam === 'signin' || authParam === 'signup' || authParam === 'forgot') {
      setAuthModalMode(authParam)
      setAuthModalOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('auth')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

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

  const handleOpenProfile = () => {
    setProfileModalTab('profile')
    setProfileModalOpen(true)
  }

  const handleOpenBookings = () => {
    if (profile?.role && profile.role !== 'client') {
      setBookingsModalOpen(true)
      return
    }
    setProfileModalTab('bookings')
    setProfileModalOpen(true)
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

              {/* Sign In Button when logged out */}
              {!user && (
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

              <a
                href="#booking"
                onClick={(e) => scrollToSection(e, 'booking')}
                className="btn btn-burgundy btn-sm"
                style={{ padding: '10px 22px' }}
              >
                <span>Book Appointment</span>
              </a>
            </nav>

            {/* Right Controls: Unified Avatar Menu (all screen sizes) + Mobile Hamburger */}
            <div className="navbar-right-controls">
              {user && (
                <UserAvatarMenu
                  displayName={displayName}
                  email={user.email}
                  profile={profile}
                  onOpenProfile={handleOpenProfile}
                  onOpenBookings={handleOpenBookings}
                  onLogout={signOut}
                />
              )}

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

              {/* Mobile Sign-In Action (when logged out; logged-in users use the topbar avatar menu) */}
              {!user && (
                <div
                  style={{
                    padding: '12px 14px',
                    background: '#F9F6F3',
                    borderRadius: '10px',
                    marginBottom: '16px',
                  }}
                >
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
                </div>
              )}

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
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false)
          setAuthModalMode('signin')
        }}
        initialMode={authModalMode}
      />

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onOpenBookingsManager={() => setBookingsModalOpen(true)}
        initialTab={profileModalTab}
      />

      {/* Studio Bookings Manager Modal (Admin/Staff) */}
      <BookingsManagerModal isOpen={bookingsModalOpen} onClose={() => setBookingsModalOpen(false)} />
    </>
  )
}
