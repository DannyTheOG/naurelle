import { useState, useEffect } from 'react'
import { Calendar, Clock, Sparkles, CheckCircle2, ShieldAlert, Send } from 'lucide-react'
import type { BookingForm } from '../../types'
import { Toast } from '../ui/Toast'

const initialForm: BookingForm = {
  service: 'Gel Manicure',
  date: '',
  time: '10:00',
  technician: 'Any available',
  addOns: [],
  name: '',
  phone: '',
  email: '',
  instagram: '',
  notes: ''
}

type BookingSectionProps = {
  preselectedService?: string
}

export function BookingSection({ preselectedService }: BookingSectionProps) {
  const [formData, setFormData] = useState<BookingForm>(initialForm)
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [confirmation, setConfirmation] = useState('')
  const [availabilityMessage, setAvailabilityMessage] = useState('')

  useEffect(() => {
    if (preselectedService) {
      setFormData(prev => ({ ...prev, service: preselectedService }))
    }
  }, [preselectedService])

  const calculateDeposit = () => {
    return formData.service === 'Gel Manicure' ? 50 : 75
  }

  const calculateBasePrice = () => {
    if (formData.service === 'Gel Manicure') return 75
    if (formData.service === 'BIAB Builder Gel Overlay') return 95
    if (formData.service === 'Sculpted Acrylic Set') return 120
    return 75
  }

  const calculateAddonsTotal = () => {
    let sum = 0
    if (formData.addOns.includes('Chrome & Gold Shimmer Art')) sum += 20
    if (formData.addOns.includes('Paraffin Moisture Care')) sum += 15
    return sum
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddOnToggle = (addOn: string) => {
    setFormData(prev => ({
      ...prev,
      addOns: prev.addOns.includes(addOn)
        ? prev.addOns.filter(i => i !== addOn)
        : [...prev.addOns, addOn]
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.email || !formData.date || !formData.time) {
      setToastMessage({
        text: 'Please complete your name, phone, email, date, and time to reserve your appointment.',
        type: 'error'
      })
      return
    }

    setLoading(true)
    const depositAmount = calculateDeposit()
    const availability = formData.date && formData.time ? 'Available' : 'Pending review'
    setAvailabilityMessage(`${availability} — deposit of GHS ${depositAmount} is required to confirm your booking.`)

    try {
      const response = await fetch('http://localhost:4000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'Pending Deposit',
          depositAmount
        })
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      setToastMessage({
        text: `Thank you ${formData.name}, your request has been sent successfully!`,
        type: 'success'
      })

      setConfirmation(
        `Thank you, ${formData.name}. Your request is now pending deposit payment. Once paid, your booking will be confirmed and you will receive an email notification.`
      )

      setTimeout(() => {
        setFormData(initialForm)
      }, 3000)
    } catch {
      setToastMessage({
        text: 'Your booking could not be sent right now. Please email hello@naurellebeauty.com directly.',
        type: 'error'
      })
      setConfirmation('Your booking could not be sent right now. Please email hello@naurellebeauty.com directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section" id="booking" style={{ padding: '48px 0', scrollMarginTop: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span>Nail Appointment Reservations</span>
        </div>
        <h2 className="section-title">Reserve your nail treatment & secure your deposit.</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          Fill in your preferences below. Our studio team will confirm availability and send your deposit invoice link.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Booking Form Card */}
        <div className="glass-card" style={{ padding: '32px 28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: 'var(--color-gold)' }} />
                <span>Select Nail Service Ritual</span>
              </label>
              <select className="form-select" name="service" value={formData.service} onChange={handleChange}>
                <option value="Gel Manicure">Gel Manicure ($75)</option>
                <option value="BIAB Builder Gel Overlay">BIAB Builder Gel Overlay ($95)</option>
                <option value="Sculpted Acrylic Set">Sculpted Acrylic Set ($120)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} style={{ color: 'var(--color-gold)' }} />
                  <span>Date</span>
                </label>
                <input
                  className="form-input"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} style={{ color: 'var(--color-gold)' }} />
                  <span>Preferred Time</span>
                </label>
                <select className="form-select" name="time" value={formData.time} onChange={handleChange}>
                  <option value="10:00">10:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="18:00">06:00 PM</option>
                </select>
              </div>
            </div>

            {/* Add-ons Selection */}
            <div className="form-group">
              <label className="form-label">Optional Add-ons</label>
              <div className="addon-checkbox-grid">
                <label className={`addon-card ${formData.addOns.includes('Chrome & Gold Shimmer Art') ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.addOns.includes('Chrome & Gold Shimmer Art')}
                    onChange={() => handleAddOnToggle('Chrome & Gold Shimmer Art')}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Chrome & Gold Art</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-pink-accent-dark)' }}>+GHS 20</span>
                  </div>
                </label>

                <label className={`addon-card ${formData.addOns.includes('Paraffin Moisture Care') ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.addOns.includes('Paraffin Moisture Care')}
                    onChange={() => handleAddOnToggle('Paraffin Moisture Care')}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>Paraffin Hand Care</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-pink-accent-dark)' }}>+GHS 15</span>
                  </div>
                </label>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Client Details</h3>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    className="form-input"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0551234567"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    className="form-input"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Instagram Handle (Optional)</label>
                <input
                  className="form-input"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@yourhandle"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Special Notes / Style Requests</label>
                <textarea
                  className="form-textarea"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Share any nail shape preferences, sensitivities, or art inspirations..."
                />
              </div>
            </div>

            <button type="submit" className="btn btn-gold btn-lg style-full" disabled={loading} style={{ width: '100%' }}>
              <Send size={18} />
              <span>{loading ? 'Submitting Reservation...' : 'Proceed to Deposit'}</span>
            </button>
          </form>
        </div>

        {/* Live Summary Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            className="glass-card"
            style={{
              padding: '28px 24px',
              background: 'linear-gradient(135deg, var(--color-white) 0%, var(--color-gold-light) 100%)',
              border: '1px solid var(--color-border-gold)'
            }}
          >
            <div className="pill-badge gold" style={{ marginBottom: '12px' }}>
              <Sparkles size={12} />
              <span>Live Reservation Summary</span>
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>{formData.service}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-charcoal-muted)' }}>Base Price:</span>
                <strong>₵{calculateBasePrice()}</strong>
              </div>
              {formData.addOns.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-charcoal-muted)' }}>Add-ons Total:</span>
                  <strong>+GHS {calculateAddonsTotal()}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '10px' }}>
                <span>Date & Time:</span>
                <strong>{formData.date || 'Select date'} @ {formData.time}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Nail Technician:</span>
                <strong>{formData.technician}</strong>
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-white)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-subtle)',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Required Deposit:</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-pink-accent-dark)' }}>
                  GHS {calculateDeposit()}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-charcoal-muted)' }}>
                Required to lock your time slot. Deducted from final bill.
              </p>
            </div>

            {availabilityMessage && (
              <div style={{ padding: '12px', background: 'rgba(212,175,55,0.15)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#856404', marginBottom: '12px', display: 'flex', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{availabilityMessage}</span>
              </div>
            )}

            {confirmation && (
              <div style={{ padding: '14px', background: 'var(--color-baby-pink-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--color-pink-accent-dark)', fontWeight: 600, display: 'flex', gap: '8px' }}>
                <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                <span>{confirmation}</span>
              </div>
            )}
          </div>
        </aside>
      </div>

      {toastMessage && (
        <Toast message={toastMessage.text} type={toastMessage.type} onClose={() => setToastMessage(null)} />
      )}
    </section>
  )
}
