import { useState } from 'react'
import { studioConfig } from '../../config/studioConfig'
import { MessageCircle, Send, CheckCircle2, Phone, Mail } from 'lucide-react'

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

export function ContactSection() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) {
      setErrorMessage('Please fill in your name, email, and message.')
      return
    }

    setLoading(true)
    setErrorMessage('')

    // Simulate sending message
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
    }, 600)
  }

  const directWhatsappUrl = `https://wa.me/${studioConfig.contact.whatsappNumber}?text=${encodeURIComponent(
    'Hello Naurèlle Beauty, I have a question regarding services / home appointments.'
  )}`

  return (
    <section id="contact" className="editorial-section" style={{ scrollMarginTop: '80px' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '640px', marginBottom: '48px' }}>
          <span className="editorial-eyebrow">Direct Inquiries</span>
          <h2 className="section-title">Let’s talk.</h2>
          <p className="section-subtitle">
            Have a question, need a home service, or looking for a squeeze-in appointment? Send us a message.
          </p>
        </div>

        {/* 2-Column Grid: Form & Direct Contact Channels */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'start'
          }}
        >
          {/* Contact Form */}
          <div className="surface-white" style={{ padding: '36px 32px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.6rem',
                color: 'var(--text-primary)',
                marginBottom: '20px',
                fontWeight: 400
              }}
            >
              Send Us a Message
            </h3>

            {success ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(122, 2, 1, 0.08)',
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <CheckCircle2 size={28} />
                </div>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '8px' }}>
                  Message Sent
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
                  Thank you for reaching out. We will get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="btn btn-minimal btn-sm"
                >
                  <span>Send Another Message</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="contact-name">Name *</label>
                  <input
                    id="contact-name"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="contact-email">Email *</label>
                    <input
                      id="contact-email"
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="contact-phone">Phone / WhatsApp</label>
                    <input
                      id="contact-phone"
                      className="form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 055 123 4567"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="contact-message">Message *</label>
                  <textarea
                    id="contact-message"
                    className="form-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your enquiry or requested service..."
                    required
                  />
                </div>

                {errorMessage && (
                  <p style={{ color: 'var(--color-accent)', fontSize: '0.86rem' }}>
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn-burgundy"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  <Send size={15} />
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Direct Contact / Chat Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Direct WhatsApp Card */}
            <div
              className="surface-white"
              style={{
                padding: '36px 32px',
                border: '1px solid var(--border-light)'
              }}
            >
              <span className="editorial-eyebrow">Instant Response</span>

              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.6rem',
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  fontWeight: 400
                }}
              >
                Chat directly
              </h3>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: 1.65, marginBottom: '24px' }}>
                For home service enquiries, squeeze-ins, or questions before your appointment, chat directly with Naurèlle Beauty.
              </p>

              <a
                href={directWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-burgundy btn-full"
                style={{ justifyContent: 'center' }}
              >
                <MessageCircle size={17} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Direct Channels List */}
            <div
              className="surface-white"
              style={{
                padding: '28px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(122, 2, 1, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent)'
                  }}
                >
                  <Phone size={16} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                    Phone Consultation
                  </strong>
                  <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {studioConfig.contact.phoneDisplay}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(122, 2, 1, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent)'
                  }}
                >
                  <Mail size={16} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                    Email Inquiries
                  </strong>
                  <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {studioConfig.contact.email}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(122, 2, 1, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent)'
                  }}
                >
                  <InstagramIcon size={16} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                    Instagram
                  </strong>
                  <a
                    href={studioConfig.contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.92rem', color: 'var(--color-accent)', textDecoration: 'underline' }}
                  >
                    {studioConfig.contact.instagramHandle}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
