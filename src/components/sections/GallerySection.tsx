import { useState } from 'react'
import { Maximize2, Sparkles } from 'lucide-react'
import { Modal } from '../ui/Modal'
import type { GalleryItem } from '../../types'

const galleryItemsData: GalleryItem[] = [
  {
    id: '1',
    title: 'Soft Almond Gel Set',
    category: 'nails',
    description: 'Rose nude gel finish with fine gold shimmer foil detail.',
    image: '/gel-manicure.png',
    featured: true
  },
  {
    id: '2',
    title: 'Lash Lift & Glow',
    category: 'lashes',
    description: 'Lifted, bright-eyed, and effortless dark keratin lash lift.',
    image: '/lash-lift.png',
    featured: false
  },
  {
    id: '3',
    title: 'Golden Hour Glam Hybrid',
    category: 'lashes',
    description: 'Warm shimmer lighting highlighting dense fluffy hybrid extensions.',
    image: '/hybrid-fill.png',
    featured: true
  },
  {
    id: '4',
    title: 'Private Studio Aesthetic',
    category: 'studio',
    description: 'Calm, minimalist luxury space designed for rest and beauty rituals.',
    image: '/hero-studio.png',
    featured: false
  }
]

export function GallerySection() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'lashes' | 'nails' | 'studio'>('all')
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const filteredItems = activeFilter === 'all'
    ? galleryItemsData
    : galleryItemsData.filter(item => item.category === activeFilter)

  return (
    <section className="section" style={{ padding: '48px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span>Editorial Portfolio</span>
        </div>
        <h2 className="section-title">Signature looks that speak to soft luxury.</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          A look at the sculpted finishes, glossy details, and calming studio ambience that define Naurélle.
        </p>

        {/* Filter buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
          {(['all', 'lashes', 'nails', 'studio'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`btn btn-sm ${activeFilter === filter ? 'btn-gold' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {filter === 'all' ? 'All Portfolio' : filter}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredItems.map((item) => (
          <article
            className="glass-card"
            key={item.id}
            onClick={() => setSelectedItem(item)}
            style={{
              cursor: 'pointer',
              overflow: 'hidden',
              gridColumn: item.featured ? 'span 1' : 'span 1'
            }}
          >
            <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 50%, rgba(28,22,25,0.7) 100%)',
                  opacity: 0.9,
                  transition: 'opacity 0.3s ease'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255,255,255,0.85)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-charcoal)'
                }}
              >
                <Maximize2 size={16} />
              </div>
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', color: 'var(--color-white)' }}>
                <span className="pill-badge gold" style={{ fontSize: '0.7rem', padding: '2px 8px', marginBottom: '6px' }}>
                  <Sparkles size={10} />
                  <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
                </span>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-white)' }}>{item.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>{item.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)}>
        {selectedItem && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={selectedItem.image}
              alt={selectedItem.title}
              style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}
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
