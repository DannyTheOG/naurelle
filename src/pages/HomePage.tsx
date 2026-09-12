import { useState, useEffect } from 'react'
import { HeroSection } from '../components/sections/HeroSection'
import { BrandStatement } from '../components/sections/BrandStatement'
import { ServicesSection } from '../components/sections/ServicesSection'
import { ToeServicesSection } from '../components/sections/ToeServicesSection'
import { SpecialServicesSection } from '../components/sections/SpecialServicesSection'
import { GallerySection } from '../components/sections/GallerySection'
import { HowToBookSection } from '../components/sections/HowToBookSection'
import { BookingSection } from '../components/sections/BookingSection'
import { StudioSection } from '../components/sections/StudioSection'
import { LocationSection } from '../components/sections/LocationSection'
import { ContactSection } from '../components/sections/ContactSection'
import { Calendar } from 'lucide-react'

export function HomePage() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined)
  const [selectedLengthId, setSelectedLengthId] = useState<string | undefined>(undefined)
  const [showMobileSticky, setShowMobileSticky] = useState<boolean>(false)

  // Pre-select service from Services section and transition to Booking
  const handleSelectService = (serviceId: string, lengthId?: string) => {
    setSelectedServiceId(serviceId)
    setSelectedLengthId(lengthId)
  }

  // Pre-select toe service from ToeServices section
  const handleSelectToeService = (toeServiceId: string) => {
    setSelectedServiceId(toeServiceId)
    setSelectedLengthId(undefined)
  }

  // Handle scroll for mobile sticky booking pill
  useEffect(() => {
    const handleScroll = () => {
      // Show only when scrolled past hero (approx 350px)
      setShowMobileSticky(window.scrollY > 350)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToBooking = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="main-content">
      {/* 01: Hero Section */}
      <HeroSection
        onBookClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
        onExploreClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* 02: Brand Statement */}
      <BrandStatement />

      {/* 03: Services Menu */}
      <ServicesSection onSelectService={handleSelectService} />

      {/* 04: Toe Services */}
      <ToeServicesSection onSelectToeService={handleSelectToeService} />

      {/* 05: Special Services / Home Service */}
      <SpecialServicesSection />

      {/* 06: Gallery / Nail Portfolio */}
      <GallerySection />

      {/* 07: How to Book */}
      <HowToBookSection />

      {/* 08: Appointment Booking (4-step interactive flow) */}
      <BookingSection
        preselectedServiceId={selectedServiceId}
        preselectedLengthId={selectedLengthId}
      />

      {/* 09 & 10: Studio & Studio Hours */}
      <StudioSection />

      {/* 11: Location / Map / Directions */}
      <LocationSection />

      {/* 12 & 13: Contact Form & Direct WhatsApp Chat */}
      <ContactSection />

      {/* Subtle Mobile Sticky Booking Pill */}
      {showMobileSticky && (
        <div className="mobile-sticky-bar">
          <div className="mobile-sticky-inner">
            <span style={{ fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Naurèlle Beauty
            </span>
            <a
              href="#booking"
              onClick={scrollToBooking}
              className="btn btn-burgundy btn-sm"
              style={{ padding: '8px 18px', fontSize: '0.78rem' }}
            >
              <Calendar size={13} />
              <span>Book Appointment</span>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
