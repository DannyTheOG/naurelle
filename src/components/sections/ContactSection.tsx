import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Video, Sparkles, Navigation } from 'lucide-react'
import { Toast } from '../ui/Toast'

export function ContactSection() {
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


  const getStudioStatus = () => {
    const now = new Date()
    const day = now.getDay()
    const hour = now.getHours()

    if (day === 0) return { open: false, label: 'Closed Today' }
    if (day === 6) {
      if (hour >= 10 && hour < 17) return { open: true, label: 'Open Now' }
      return { open: false, label: 'Closed Now' }
    }
    if (hour >= 10 && hour < 19) return { open: true, label: 'Open Now' }
    return { open: false, label: 'Closed Now' }
  }

  const status = getStudioStatus()

  return (
    <section className="section" id="contact" style={{ padding: '48px 0', scrollMarginTop: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span>Get in Touch</span>
        </div>
        <h2 className="section-title">Visit the Studio or Reach Out</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          We’d love to welcome you to our private studio space for appointment consultations, styling questions, or location directions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Studio Details Main Card */}
        <div className="glass-card" style={{ padding: '32px 28px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} style={{ color: 'var(--color-gold)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem' }}>Studio Details</h3>
              </div>
            </div>

            <div
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                background: status.open ? '#E8F5E9' : '#FFEBEE',
                color: status.open ? '#2E7D32' : '#C62828',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: status.open ? '1px solid #C8E6C9' : '1px solid #FFCDD2'
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

          {/* Contact Touchpoints Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'var(--color-nude-light)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-baby-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={18} style={{ color: 'var(--color-pink-accent-dark)' }} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', marginBottom: '2px' }}>Address</strong>
                <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.88rem', lineHeight: 1.4 }}>12A Abelenkpe Road, East Legon, Accra</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'var(--color-nude-light)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-gold-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={18} style={{ color: 'var(--color-gold)' }} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', marginBottom: '2px' }}>Direct Line</strong>
                <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.88rem' }}>+233 55 123 4567</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'var(--color-nude-light)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-baby-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={18} style={{ color: 'var(--color-pink-accent-dark)' }} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', marginBottom: '2px' }}>Email Desk</strong>
                <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.88rem' }}>hello@naurellebeauty.com</p>
              </div>
            </div>
          </div>

          {/* Operating Timetable Card */}
          <div style={{ background: 'var(--color-white)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: 'var(--color-gold)' }} />
              <span>Studio Hours Timetable</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed var(--color-border-subtle)' }}>
                <span style={{ color: 'var(--color-charcoal-muted)' }}>Monday – Friday:</span>
                <strong>10:00 AM – 7:00 PM</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed var(--color-border-subtle)' }}>
                <span style={{ color: 'var(--color-charcoal-muted)' }}>Saturday:</span>
                <strong>10:00 AM – 5:00 PM</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E57373' }}>
                <span>Sunday:</span>
                <strong>Closed</strong>
              </div>
            </div>
          </div>

          {/* Social Channels & Action Links */}
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '20px' }}>
            <strong style={{ display: 'block', marginBottom: '12px', fontSize: '0.88rem' }}>Connect & Chat Directly:</strong>
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

        {/* Map & Inquiry Form Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Interactive Map */}
          <div className="glass-card" style={{ padding: '16px', overflow: 'hidden', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px 14px' }}>
              <h4 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={16} style={{ color: 'var(--color-gold)' }} />
                <span>Studio Location Map</span>
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-pink-accent-dark)', fontWeight: 600 }}>East Legon</span>
            </div>
            <iframe
              title="Naurélle Beauty location"
              src="https://www.google.com/maps?q=East%20Legon%20Accra&z=13&output=embed"
              style={{ width: '100%', height: '230px', border: 0, borderRadius: 'var(--radius-sm)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Instant Inquiry Form */}
          <div className="glass-card" style={{ padding: '28px 24px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Send Us a Message</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-charcoal-muted)', marginBottom: '16px' }}>
              Have a question about nail appointments, BIAB refills, or custom nail art? Leave us a note.
            </p>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <input
                  className="form-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Your Email"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <textarea
                  className="form-textarea"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Your Message"
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
    </section>
  )
}
