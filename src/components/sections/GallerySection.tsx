import { useState, useEffect, useRef } from 'react'
import { Maximize2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { Modal } from '../ui/Modal'
import type { GalleryItem } from '../../types'

const galleryItemsData: GalleryItem[] = [
  {
    id: '1',
    title: 'Soft Almond Gel Set',
    category: 'manicure',
    description: 'Rose nude gel finish with fine gold shimmer foil detail.',
    image: '/gel-manicure.png',
    featured: true
  },
  {
    id: '2',
    title: 'BIAB Builder Gel Glow',
    category: 'builder',
    description: 'Nude pink BIAB builder gel overlay reinforcing natural nails.',
    image: '/builder-gel.png',
    featured: false
  },
  {
    id: '3',
    title: 'Sculpted French Gold Tips',
    category: 'art',
    description: 'Almond sculpted acrylic set with fine metallic gold French tips.',
    image: '/acrylic-set.png',
    featured: true
  },
  {
    id: '4',
    title: 'Rose Quartz BIAB Overlay',
    category: 'builder',
    description: 'Sheer translucent rose quartz builder gel for a healthy natural shine.',
    image: '/builder-gel.png',
    featured: false
  },
  {
    id: '5',
    title: 'Minimalist Metallic Art',
    category: 'art',
    description: 'Bespoke hand-painted gold chrome lines on nude gel base.',
    image: '/acrylic-set.png',
    featured: true
  },
  {
    id: '6',
    title: 'Nude Rose Gel Polish',
    category: 'manicure',
    description: 'Glossy nude rose gel manicure with precision e-file cuticle care.',
    image: '/gel-manicure.png',
    featured: false
  }
]

export function GallerySection() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'manicure' | 'builder' | 'art'>('all')
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(3)

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Filter items based on active tab
  const filteredItems = activeFilter === 'all'
    ? galleryItemsData
    : galleryItemsData.filter(item => item.category === activeFilter)

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

  // Reset slider index when filter or items per page change
  useEffect(() => {
    setCurrentIndex(0)
  }, [activeFilter, itemsPerPage])

  const maxIndex = Math.max(0, filteredItems.length - itemsPerPage)

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

  return (
    <section className="section" id="gallery" style={{ padding: '48px 0', scrollMarginTop: '80px', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span>Nail Art Portfolio</span>
        </div>
        <h2 className="section-title">Signature nail looks that speak to soft luxury.</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          Browse our responsive multi-card portfolio slider featuring BIAB overlays, gel manicures, and gold nail art.
        </p>

        {/* Category Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
          {(['all', 'manicure', 'builder', 'art'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`btn btn-sm ${activeFilter === filter ? 'btn-gold' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {filter === 'all' ? 'All Portfolio' : filter === 'builder' ? 'BIAB Builder' : filter === 'art' ? 'Nail Art' : 'Gel Manicure'}
            </button>
          ))}
        </div>
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
        {filteredItems.length > itemsPerPage && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous portfolio card"
              style={{
                position: 'absolute',
                left: '-12px',
                top: '45%',
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
              aria-label="Next portfolio card"
              style={{
                position: 'absolute',
                right: '-12px',
                top: '45%',
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
            {filteredItems.map((item) => (
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
                  onClick={() => setSelectedItem(item)}
                  style={{
                    cursor: 'pointer',
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-md)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.4s ease'
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, transparent 40%, rgba(28,22,25,0.75) 100%)',
                        opacity: 0.95
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(8px)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-charcoal)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <Maximize2 size={16} />
                    </div>
                    <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', color: 'var(--color-white)', textAlign: 'left' }}>
                      <span className="pill-badge gold" style={{ fontSize: '0.72rem', padding: '2px 8px', marginBottom: '6px' }}>
                        <Sparkles size={10} />
                        <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
                      </span>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-white)', marginBottom: '4px' }}>{item.title}</h3>
                      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{item.description}</p>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        {filteredItems.length > itemsPerPage && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to portfolio page ${idx + 1}`}
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

      {/* Lightbox Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)}>
        {selectedItem && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={selectedItem.image}
              alt={selectedItem.title}
              style={{ width: '100%', maxHeight: '440px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}
            />
            <span className="pill-badge gold" style={{ marginBottom: '8px' }}>{selectedItem.category}</span>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{selectedItem.title}</h3>
            <p style={{ color: 'var(--color-charcoal-muted)' }}>{selectedItem.description}</p>
          </div>
        )}
      </Modal>
    </section>
  )
}
