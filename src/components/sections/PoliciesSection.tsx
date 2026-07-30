import { useState, useEffect, useRef } from 'react'
import { ShieldCheck, Clock, Sparkles, Heart, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'

const etiquettePolicies = [
  {
    id: 'deposit',
    title: 'Deposit Policy',
    tag: 'Non-Refundable',
    tagColor: 'gold',
    icon: ShieldCheck,
    iconBg: 'var(--color-gold-light)',
    iconColor: 'var(--color-gold)',
    description: 'Deposits are required upon booking approval to secure your private time slot. All deposits are deducted from your total checkout bill.'
  },
  {
    id: 'reschedule',
    title: 'Punctuality & Rescheduling',
    tag: '24-Hour Notice',
    tagColor: 'pink',
    icon: Clock,
    iconBg: 'var(--color-baby-pink)',
    iconColor: 'var(--color-pink-accent-dark)',
    description: 'Please provide at least 24 hours notice for any appointment changes. Arrivals over 15 minutes late may be rescheduled to protect guest schedules.'
  },
  {
    id: 'preparation',
    title: 'Nail Preparation',
    tag: 'Bare Nails Recommended',
    tagColor: 'gold',
    icon: Sparkles,
    iconBg: 'var(--color-gold-light)',
    iconColor: 'var(--color-gold)',
    description: 'Arrive with clean, bare natural nails or existing Naurélle gel polish. Foreign acrylic or gel soak-offs require an advance removal add-on.'
  },
  {
    id: 'sanctuary',
    title: 'Private Sanctuary Space',
    tag: 'Guest Only',
    tagColor: 'pink',
    icon: Heart,
    iconBg: 'var(--color-baby-pink)',
    iconColor: 'var(--color-pink-accent-dark)',
    description: 'To preserve a peaceful, relaxing sanctuary for rest and nail care, our studio space is reserved strictly for scheduled guests with no extra visitors.'
  }
]

export function PoliciesSection() {
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

  // Reset index when items per page changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [itemsPerPage])

  const maxIndex = Math.max(0, etiquettePolicies.length - itemsPerPage)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    if (distance > 40) {
      handleNext()
    } else if (distance < -40) {
      handlePrev()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault()
    const target = document.getElementById('contact') || document.getElementById('services')
    target?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="section" id="policies" style={{ padding: '48px 0', scrollMarginTop: '80px', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span>Studio Etiquette</span>
        </div>
        <h2 className="section-title">Studio Guidelines & Guest Comfort</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          Please review our studio etiquette policies slider to ensure a serene, seamless experience for every guest.
        </p>
      </div>

      {/* Multi-Card Slider Frame */}
      <div
        style={{
          position: 'relative',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '10px 4px',
          marginBottom: '32px'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrows */}
        {etiquettePolicies.length > itemsPerPage && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous etiquette card"
              style={{
                position: 'absolute',
                left: '-12px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 20,
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--color-border-subtle)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-charcoal)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={handleNext}
              aria-label="Next etiquette card"
              style={{
                position: 'absolute',
                right: '-12px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 20,
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--color-border-subtle)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-charcoal)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Sliding Multi-Card Track */}
        <div style={{ overflow: 'hidden', width: '100%', borderRadius: 'var(--radius-md)' }}>
          <div
            style={{
              display: 'flex',
              transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
              width: '100%'
            }}
          >
            {etiquettePolicies.map((item) => {
              const IconComp = item.icon
              return (
                <div
                  key={item.id}
                  style={{
                    minWidth: `${100 / itemsPerPage}%`,
                    maxWidth: `${100 / itemsPerPage}%`,
                    boxSizing: 'border-box',
                    padding: '0 8px',
                    flexShrink: 0
                  }}
                >
                  <article
                    className="glass-card"
                    style={{
                      padding: '32px 24px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: 'var(--color-white)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-subtle)',
                      height: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: item.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px'
                      }}
                    >
                      <IconComp size={24} style={{ color: item.iconColor }} />
                    </div>

                    <span className={`pill-badge ${item.tagColor}`} style={{ marginBottom: '12px', fontSize: '0.75rem' }}>
                      <CheckCircle2 size={12} />
                      <span>{item.tag}</span>
                    </span>

                    <h3 style={{ fontSize: '1.35rem', marginBottom: '10px', color: 'var(--color-charcoal)' }}>{item.title}</h3>

                    <p style={{ fontSize: '0.9rem', color: 'var(--color-charcoal-muted)', lineHeight: 1.55 }}>
                      {item.description}
                    </p>
                  </article>
                </div>
              )
            })}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        {etiquettePolicies.length > itemsPerPage && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to etiquette slide ${idx + 1}`}
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

      <div style={{ textAlign: 'center' }}>
        <a href="#contact" onClick={scrollToContact} className="btn btn-gold btn-lg">
          <Sparkles size={18} />
          <span>I Understand — Visit Studio</span>
        </a>
      </div>
    </section>
  )
}
