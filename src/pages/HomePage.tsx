import { useState, useEffect, useRef } from 'react'
import { HeroSection } from '../components/sections/HeroSection'
import { ServicesSection } from '../components/sections/ServicesSection'
import { PricingSection } from '../components/sections/PricingSection'
import { GallerySection } from '../components/sections/GallerySection'
import { PoliciesSection } from '../components/sections/PoliciesSection'
import { ContactSection } from '../components/sections/ContactSection'
import { Sparkles, Calendar, Heart, ChevronLeft, ChevronRight } from 'lucide-react'

const philosophyCards = [
  {
    id: 'art',
    icon: Sparkles,
    iconBg: 'var(--color-baby-pink)',
    iconColor: 'var(--color-pink-accent-dark)',
    title: 'Curated Nail Art',
    description: 'Every set is meticulously styled using premium non-toxic gels and BIAB overlays to feel modern, elevated, and durable.'
  },
  {
    id: 'appointments',
    icon: Calendar,
    iconBg: 'var(--color-gold-light)',
    iconColor: 'var(--color-gold)',
    title: 'Precise Appointments',
    description: 'Choose your preferred time, treatment, and nail art add-ons in a few simple steps with real-time deposit tracking.'
  },
  {
    id: 'finish',
    icon: Heart,
    iconBg: 'var(--color-baby-pink)',
    iconColor: 'var(--color-pink-accent-dark)',
    title: 'Calm Finish',
    description: 'Expect a thoughtful, high-touch experience from consultation to post-treatment cuticle care and hand massage.'
  }
]

export function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(3)

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Handle responsive items per page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1)
      } else if (window.innerWidth < 960) {
        setItemsPerPage(2)
      } else {
        setItemsPerPage(3)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Check URL hash on initial mount
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const id = hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }, [])

  const maxIndex = Math.max(0, philosophyCards.length - itemsPerPage)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    if (distance > 40) handleNext()
    else if (distance < -40) handlePrev()
    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <div className="page-wrapper">
      <HeroSection />

      {/* Studio Philosophy Multi-Card Slider */}
      <section style={{ margin: '24px 0 48px', overflow: 'hidden' }}>
        <div
          className="glass-panel"
          style={{
            padding: '36px 24px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(245,239,234,0.9) 100%)',
            border: '1px solid var(--color-border-subtle)',
            position: 'relative'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 32px' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>
              <span>Studio Philosophy</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 2.8vw, 2.5rem)', color: 'var(--color-charcoal)' }}>
              A refined nail ritual built for nail health, elegance, and confidence.
            </h2>
          </div>

          {/* Navigation Arrows */}
          {philosophyCards.length > itemsPerPage && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous philosophy card"
                style={{
                  position: 'absolute',
                  left: '8px',
                  top: '55%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--color-border-subtle)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-charcoal)',
                  cursor: 'pointer'
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next philosophy card"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '55%',
                  transform: 'translateY(-50%)',
                  zIndex: 20,
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--color-border-subtle)',
                  boxShadow: 'var(--shadow-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-charcoal)',
                  cursor: 'pointer'
                }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Sliding Track */}
          <div style={{ overflow: 'hidden', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
                transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                width: '100%'
              }}
            >
              {philosophyCards.map((card) => {
                const IconComp = card.icon
                return (
                  <div
                    key={card.id}
                    style={{
                      minWidth: `${100 / itemsPerPage}%`,
                      maxWidth: `${100 / itemsPerPage}%`,
                      boxSizing: 'border-box',
                      padding: '0 8px',
                      flexShrink: 0
                    }}
                  >
                    <div className="glass-card" style={{ padding: '24px', height: '100%', boxSizing: 'border-box' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <IconComp size={22} style={{ color: card.iconColor }} />
                      </div>
                      <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '8px' }}>{card.title}</h3>
                      <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.90rem' }}>
                        {card.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pagination Dots */}
          {philosophyCards.length > itemsPerPage && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to philosophy slide ${idx + 1}`}
                  style={{
                    width: currentIndex === idx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '999px',
                    background: currentIndex === idx ? 'var(--color-gold)' : 'var(--color-border-subtle)',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <ServicesSection />
      <PricingSection />
      <GallerySection />
      <PoliciesSection />
      <ContactSection />
    </div>
  )
}
