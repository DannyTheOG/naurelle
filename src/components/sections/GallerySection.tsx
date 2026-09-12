import { useState, useRef, useEffect } from 'react'
import { galleryItems } from '../../config/studioConfig'
import type { GalleryCategory, GalleryItem } from '../../types'
import { Modal } from '../ui/Modal'
import { Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'

const categories: { key: GalleryCategory; label: string }[] = [
  { key: 'all', label: 'All Work' },
  { key: 'minimalist', label: 'Minimalist Nails' },
  { key: 'nail-art', label: 'Nail Art' },
  { key: 'gel-x', label: 'Gel X' },
  { key: 'builder-gel', label: 'Builder Gel' },
  { key: 'acrylic', label: 'Acrylic' },
  { key: 'toes', label: 'Toes' }
]

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all')
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)

  const tabsRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current
      const maxScroll = scrollWidth - clientWidth
      setCanScrollLeft(scrollLeft > 6)
      setCanScrollRight(scrollLeft < maxScroll - 6)
      if (maxScroll > 0) {
        setScrollProgress(Math.min(1, Math.max(0, scrollLeft / maxScroll)))
      }
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  const filteredItems = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory)

  return (
    <section id="gallery" className="editorial-section" style={{ scrollMarginTop: '80px' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '640px', marginBottom: '36px' }}>
          <span className="editorial-eyebrow">Visual Editorial</span>
          <h2 className="section-title">Gallery</h2>
          <p className="section-subtitle">
            A visual curation of clean shapes, sheer nudes, and quiet details.
          </p>
        </div>

        {/* Minimal Category Filter Tabs with Mobile Slide Track & Indicators */}
        <div className="gallery-tabs-wrapper">
          {canScrollLeft && (
            <div className="gallery-fade-left">
              <button
                type="button"
                className="gallery-scroll-arrow"
                onClick={() => tabsRef.current?.scrollBy({ left: -140, behavior: 'smooth' })}
                aria-label="Slide tabs left"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}

          <div
            ref={tabsRef}
            onScroll={checkScroll}
            className="gallery-filter-tabs"
            role="tablist"
            aria-label="Gallery categories"
          >
            {categories.map((cat) => (
              <button
                key={cat.key}
                role="tab"
                aria-selected={activeCategory === cat.key}
                onClick={(e) => {
                  setActiveCategory(cat.key)
                  e.currentTarget.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'center',
                    block: 'nearest'
                  })
                }}
                className={`gallery-filter-tab-btn ${activeCategory === cat.key ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {canScrollRight && (
            <div className="gallery-fade-right">
              <button
                type="button"
                className="gallery-scroll-arrow"
                onClick={() => tabsRef.current?.scrollBy({ left: 140, behavior: 'smooth' })}
                aria-label="Slide tabs right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Visual Indicator of sliding for mobile */}
          <div className="gallery-slide-indicator-mobile" aria-hidden="true">
            <span className="gallery-slide-hint">
              <span>Slide categories</span>
              <span>&rarr;</span>
            </span>
            <div className="gallery-slide-progress-track">
              <div
                className="gallery-slide-progress-bar"
                style={{
                  transform: `translateX(${scrollProgress * 150}%)`
                }}
              />
            </div>
          </div>
        </div>

        {/* Editorial Photo Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px'
          }}
        >
          {filteredItems.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelectedImage(item)}
              style={{
                cursor: 'pointer',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xs)',
                transition: 'all var(--transition-normal)',
                position: 'relative',
                boxShadow: 'var(--shadow-subtle)'
              }}
              onMouseEnter={(e) => {
                const img = e.currentTarget.querySelector('img')
                if (img) img.style.transform = 'scale(1.03)'
              }}
              onMouseLeave={(e) => {
                const img = e.currentTarget.querySelector('img')
                if (img) img.style.transform = 'scale(1.0)'
              }}
            >
              <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
                <img
                  src={item.image}
                  alt={item.alt}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  loading="lazy"
                />

                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(216, 217, 217, 0.85)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <Maximize2 size={14} />
                </div>
              </div>

              <div
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--border-light)'
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.15rem',
                    color: 'var(--text-primary)',
                    fontWeight: 400
                  }}
                >
                  {item.title}
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--color-accent)'
                  }}
                >
                  {item.categoryLabel}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)}>
        {selectedImage && (
          <div>
            <div style={{ maxHeight: '70vh', overflow: 'hidden', borderRadius: 'var(--radius-xs)', marginBottom: '16px' }}>
              <img
                src={selectedImage.image}
                alt={selectedImage.alt}
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                {selectedImage.title}
              </h3>
              <span style={{ fontSize: '0.76rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                {selectedImage.categoryLabel}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
