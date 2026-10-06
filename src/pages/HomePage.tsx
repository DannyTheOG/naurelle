import { useState } from 'react'
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

export function HomePage() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined)
  const [selectedLengthId, setSelectedLengthId] = useState<string | undefined>(undefined)

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

      {/* 08: Appointment Booking */}
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
    </div>
  )
}
