import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Video, Sparkles } from 'lucide-react'
import { Toast } from '../components/ui/Toast'

export function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      setToastMessage({ text: 'Please complete all fields in the contact form.', type: 'error' })
      return
    }
    setToastMessage({ text: `Thank you, ${formData.name}. Your message has been received!`, type: 'success' })
    setFormData({ name: '', email: '', message: '' })
  }

  // Calculate live studio open/closed status
  const getStudioStatus = () => {
    const now = new Date()
    const day = now.getDay() // 0 = Sun, 1 = Mon, ...
    const hour = now.getHours()

    if (day === 0) return { open: false, label: 'Closed Today (Sunday)' }
    if (day === 6) {
      if (hour >= 10 && hour < 17) return { open: true, label: 'Open Now (Sat 10 AM - 5 PM)' }
      return { open: false, label: 'Closed Now (Sat 10 AM - 5 PM)' }
    }
    if (hour >= 10 && hour < 19) return { open: true, label: 'Open Now (Mon-Fri 10 AM - 7 PM)' }
    return { open: false, label: 'Closed Now (Mon-Fri 10 AM - 7 PM)' }
  }

  const status = getStudioStatus()

  return (
    <div className="page-wrapper">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span>Get in Touch</span>
        </div>
        <h1 className="section-title">Visit the Studio or Reach Out</h1>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          We’d love to hear from you for appointment consultations, styling questions, or location directions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Contact Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '28px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Studio Details</h2>
              <div
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: status.open ? '#E8F5E9' : '#FFEBEE',
                  color: status.open ? '#2E7D32' : '#C62828',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: status.open ? '#4CAF50' : '#E57373',
                    display: 'inline-block'
                  }}
                />
                <span>{status.label}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={20} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Location Address:</strong>
                  <p style={{ color: 'var(--color-charcoal-muted)' }}>12A Abelenkpe Road, East Legon, Accra</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Phone size={20} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Phone:</strong>
                  <p style={{ color: 'var(--color-charcoal-muted)' }}>+233 55 123 4567</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Mail size={20} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Email:</strong>
                  <p style={{ color: 'var(--color-charcoal-muted)' }}>hello@naurellebeauty.com</p>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '20px', marginTop: '20px' }}>
              <strong style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem' }}>Social Channels & WhatsApp:</strong>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a href="https://wa.me/233551234567" target="_blank" rel="noreferrer" className="btn btn-gold btn-sm">
                  <MessageCircle size={16} />
                  <span>WhatsApp Chat</span>
                </a>
                <a href="https://www.instagram.com/naurellebeauty" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  <span>Instagram</span>
                </a>
                <a href="https://www.tiktok.com/@naurellebeauty" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  <Video size={16} />
                  <span>TikTok</span>
                </a>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: 'var(--color-gold)' }} />
              <span>Operating Hours</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem', color: 'var(--color-charcoal)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Monday – Friday:</span>
                <strong>10:00 AM – 7:00 PM</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Saturday:</span>
                <strong>10:00 AM – 5:00 PM</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E57373' }}>
                <span>Sunday:</span>
                <strong>Closed</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Map & Form Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '16px', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '1.1rem', padding: '8px 8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--color-gold)' }} />
              <span>Studio Map Location</span>
            </h3>
            <iframe
              title="Naurélle Beauty location"
              src="https://www.google.com/maps?q=East%20Legon%20Accra&z=13&output=embed"
              style={{ width: '100%', height: '240px', border: 0, borderRadius: 'var(--radius-sm)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="glass-card" style={{ padding: '28px 24px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Send Us a Message</h3>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Your Name</label>
                <input
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Your Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Your Message</label>
                <textarea
                  className="form-textarea"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Ask a question about treatments or booking dates..."
                  required
                />
              </div>

              <button type="submit" className="btn btn-pink style-full" style={{ width: '100%' }}>
                <Send size={16} />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage.text} type={toastMessage.type} onClose={() => setToastMessage(null)} />
      )}
    </div>
  )
}
