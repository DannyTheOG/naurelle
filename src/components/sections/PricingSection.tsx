import { useState, useEffect, useRef } from 'react'
import { Check, Sparkles, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const pricingData = [
  {
    name: 'Gel Manicure',
    price: '₵75',
    category: 'Gel Polish',
    note: 'Includes precision cuticle care & high-shine top coat',
    features: ['Gentle cuticle e-file cleaning', 'Custom nude/blush shade match', 'High-shine gel top coat', 'Relaxing hand massage & oil'],
    popular: true
  },
  {
    name: 'BIAB Builder Gel Overlay',
    price: '₵95',
    category: 'Natural Nail Builder',
    note: 'Reinforces natural nail structure to promote healthy growth',
    features: ['High-strength BIAB formula', 'Flawless apex structuring', 'Lasts up to 4 weeks', 'Prevents nail chipping & splitting']
  },
  {
    name: 'Sculpted Acrylic Set',
    price: '₵120',
    category: 'Nail Extensions',
    note: 'Bespoke sculpted extension set with custom shape & length',
    features: ['1-on-1 shape consultation', 'Lightweight strong polymer', 'Includes 2 nail art accent nails', 'Complimentary aftercare kit']
  }
]

type PricingSectionProps = {
  onSelectService?: (serviceName: string) => void
}

export function PricingSection({ onSelectService }: PricingSectionProps) {
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

  const maxIndex = Math.max(0, pricingData.length - itemsPerPage)

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
    if (distance > 40) handleNext()
    else if (distance < -40) handlePrev()
    touchStartX.current = null
    touchEndX.current = null
  }

  const handleSelect = (e: React.MouseEvent, name: string) => {
    e.preventDefault()
    if (onSelectService) onSelectService(name)
    const el = document.getElementById('contact') || document.getElementById('services')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="section" id="pricing" style={{ padding: '48px 0', scrollMarginTop: '80px', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span>Transparent Pricing</span>
        </div>
        <h2 className="section-title">Clear pricing for every signature nail treatment.</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          No hidden fees. Every appointment includes personal consultation, medical-grade sanitization, and nourishing hand care.
        </p>
      </div>

      {/* Multi-Card Slider Frame */}
      <div
        style={{
          position: 'relative',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '10px 4px'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrows */}
        {pricingData.length > itemsPerPage && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous pricing card"
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
              aria-label="Next pricing card"
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
            {pricingData.map((item) => (
              <div
                key={item.name}
                style={{
                  minWidth: `${100 / itemsPerPage}%`,
                  maxWidth: `${100 / itemsPerPage}%`,
                  boxSizing: 'border-box',
                  padding: '0 8px',
                  flexShrink: 0
                }}
              >
                <div
                  className={`glass-card ${item.popular ? 'popular-card' : ''}`}
                  style={{
                    padding: '32px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: item.popular ? '2px solid var(--color-gold)' : '1px solid var(--color-border-subtle)',
                    background: item.popular ? 'linear-gradient(180deg, var(--color-white) 0%, var(--color-gold-light) 100%)' : 'var(--color-white)',
                    height: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {item.popular && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--color-gold)',
                        color: 'var(--color-white)',
                        padding: '4px 16px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={12} />
                      <span>Most Requested</span>
                    </div>
                  )}

                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <span className="pill-badge" style={{ marginBottom: '8px' }}>{item.category}</span>
                    <h3 style={{ fontSize: '1.6rem', marginTop: '4px' }}>{item.name}</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: '12px 0 4px' }}>
                      {item.price}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-pink-accent-dark)' }}>{item.note}</p>
                  </div>

                  <div style={{ flex: 1, borderTop: '1px solid var(--color-border-subtle)', paddingTop: '20px', marginBottom: '24px' }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {item.features.map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--color-charcoal)' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-baby-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Check size={12} style={{ color: 'var(--color-pink-accent-dark)' }} />
                          </div>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#contact"
                    onClick={(e) => handleSelect(e, item.name)}
                    className={`btn ${item.popular ? 'btn-gold' : 'btn-outline'} style-full`}
                    style={{ width: '100%' }}
                  >
                    <span>Select Treatment</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        {pricingData.length > itemsPerPage && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to pricing slide ${idx + 1}`}
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

      <div
        className="glass-panel"
        style={{
          marginTop: '36px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <HelpCircle size={24} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '2px' }}>Deposit Policy Notice</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-charcoal-muted)' }}>
            A GHS 50–75 deposit is required upon booking approval to hold your time slot. Deposits are deducted from your final total at checkout.
          </p>
        </div>
      </div>
    </section>
  )
}
