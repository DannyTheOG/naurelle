import { useState, useEffect } from 'react'
import { studioConfig } from '../../config/studioConfig'
import type { ServiceItem, ServiceLengthOption, ToeServiceItem } from '../../types'
import { Check, ArrowRight, ArrowLeft, MessageCircle, Calendar, Clock, CheckCircle2 } from 'lucide-react'

type BookingSectionProps = {
  preselectedServiceId?: string
  preselectedLengthId?: string
}

export function BookingSection({
  preselectedServiceId,
  preselectedLengthId
}: BookingSectionProps) {
  // Current active step (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Selection states
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)
  const [isToeService, setIsToeService] = useState<boolean>(false)
  const [selectedToeService, setSelectedToeService] = useState<ToeServiceItem | null>(null)
  const [selectedLength, setSelectedLength] = useState<ServiceLengthOption | null>(null)

  // Date & Time states
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')

  // Client Details
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [notes, setNotes] = useState('')

  // Submission & Feedback states
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Preselection handler when clicked from Services or ToeServices
  useEffect(() => {
    if (preselectedServiceId) {
      if (preselectedServiceId.startsWith('toes-')) {
        const foundToe = studioConfig.toeServices.find((t) => t.id === preselectedServiceId)
        if (foundToe) {
          setIsToeService(true)
          setSelectedToeService(foundToe)
          setSelectedService(null)
          setSelectedLength(null)
          setCurrentStep(3) // auto-skip length
        }
      } else {
        const found = studioConfig.services.find((s) => s.id === preselectedServiceId)
        if (found) {
          setIsToeService(false)
          setSelectedService(found)
          setSelectedToeService(null)

          if (found.hasLengths) {
            if (preselectedLengthId && found.lengthOptions) {
              const foundLength = found.lengthOptions.find((l) => l.id === preselectedLengthId)
              setSelectedLength(foundLength || found.lengthOptions[0])
              setCurrentStep(3)
            } else {
              setSelectedLength(null)
              setCurrentStep(2)
            }
          } else {
            setSelectedLength(null)
            setCurrentStep(3) // skip length
          }
        }
      }
    }
  }, [preselectedServiceId, preselectedLengthId])

  // Current calculated price
  const calculatePrice = (): number => {
    if (isToeService && selectedToeService) {
      return selectedToeService.price
    }
    if (selectedService) {
      if (selectedService.hasLengths && selectedLength) {
        return selectedLength.price
      }
      return selectedService.basePrice
    }
    return 0
  }

  // Handle Step 1 service selection
  const handleSelectMainService = (service: ServiceItem) => {
    setIsToeService(false)
    setSelectedToeService(null)
    setSelectedService(service)
    setSelectedLength(null)

    if (service.hasLengths) {
      setCurrentStep(2)
    } else {
      setCurrentStep(3)
    }
  }

  const handleSelectToeServiceOption = (toe: ToeServiceItem) => {
    setIsToeService(true)
    setSelectedService(null)
    setSelectedToeService(toe)
    setSelectedLength(null)
    setCurrentStep(3) // toe services skip length
  }

  // Handle Step 2 length selection
  const handleSelectLength = (length: ServiceLengthOption) => {
    setSelectedLength(length)
    setCurrentStep(3)
  }

  // Step 3 Next validation
  const handleProceedToConfirm = () => {
    if (!selectedDate || !selectedTime) {
      setErrorMessage('Please select both a date and an available appointment time.')
      return
    }
    setErrorMessage('')
    setCurrentStep(4)
  }

  // Step 4 Form Submission
  const handleConfirmAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName || !clientPhone || !clientEmail) {
      setErrorMessage('Please provide your name, phone number, and email address.')
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    const serviceName = isToeService && selectedToeService
      ? selectedToeService.name
      : selectedService?.name || 'Nail Service'

    const lengthName = selectedLength ? selectedLength.name : undefined
    const finalPrice = calculatePrice()

    const bookingPayload = {
      service: serviceName,
      length: lengthName,
      date: selectedDate,
      time: selectedTime,
      price: finalPrice,
      name: clientName,
      phone: clientPhone,
      email: clientEmail,
      notes: notes
    }

    try {
      await fetch('http://localhost:4000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      })
    } catch {
      // Fallback gracefully without blocking client experience
      console.warn('Booking API offline or unavailable; continuing to confirmation state.')
    } finally {
      setSubmitting(false)
      setSubmitted(true)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setSelectedService(null)
    setIsToeService(false)
    setSelectedToeService(null)
    setSelectedLength(null)
    setSelectedDate('')
    setSelectedTime('')
    setClientName('')
    setClientPhone('')
    setClientEmail('')
    setNotes('')
    setSubmitted(false)
    setErrorMessage('')
  }

  const activeServiceName = isToeService && selectedToeService
    ? selectedToeService.name
    : selectedService?.name || 'Choose Service'

  const whatsappConfirmationText = `Hello Naurèlle Beauty, I would like to confirm my appointment request:\n\nService: ${activeServiceName}${
    selectedLength ? ` (${selectedLength.name})` : ''
  }\nDate: ${selectedDate}\nTime: ${selectedTime}\nPrice: ₵${calculatePrice()}\nName: ${clientName}\nPhone: ${clientPhone}`

  const whatsappBookingUrl = `https://wa.me/${studioConfig.contact.whatsappNumber}?text=${encodeURIComponent(
    whatsappConfirmationText
  )}`

  // Today minimum date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <section id="booking" className="editorial-section" style={{ scrollMarginTop: '80px' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '640px', marginBottom: '40px' }}>
          <span className="editorial-eyebrow">Reservations</span>
          <h2 className="section-title">Appointment Booking</h2>
          <p className="section-subtitle">
            A seamless four-step ritual to secure your private studio session.
          </p>
        </div>

        {/* 4-Step Progress Indicator Bar */}
        <div className="step-indicator-bar" aria-label="Booking steps">
          <div className={`step-indicator-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
            <span className="step-indicator-num">01</span>
            <span>Choose Service</span>
          </div>

          <div style={{ color: 'var(--border-subtle)' }}>&rarr;</div>

          <div
            className={`step-indicator-item ${
              currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''
            } ${selectedService && !selectedService.hasLengths && !isToeService ? 'editorial-eyebrow-muted' : ''}`}
          >
            <span className="step-indicator-num">02</span>
            <span>Choose Length</span>
          </div>

          <div style={{ color: 'var(--border-subtle)' }}>&rarr;</div>

          <div className={`step-indicator-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
            <span className="step-indicator-num">03</span>
            <span>Date &amp; Time</span>
          </div>

          <div style={{ color: 'var(--border-subtle)' }}>&rarr;</div>

          <div className={`step-indicator-item ${currentStep === 4 ? 'active' : ''}`}>
            <span className="step-indicator-num">04</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Booking Container Layout */}
        <div className="booking-layout-grid">
          {/* Main Interaction Area */}
          <div className="surface-white booking-card-main">
            {submitted ? (
              /* Success State */
              <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(122, 2, 1, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'var(--color-accent)'
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>

                <span className="editorial-eyebrow">Request Received</span>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '2rem',
                    color: 'var(--text-primary)',
                    marginBottom: '16px'
                  }}
                >
                  Appointment request received.
                </h3>

                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 24px' }}>
                  Thank you, <strong>{clientName}</strong>. Your appointment request for{' '}
                  <strong>{activeServiceName}</strong> on <strong>{selectedDate}</strong> at{' '}
                  <strong>{selectedTime}</strong> has been received. Our studio team will review and confirm your slot.
                </p>

                <div
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-xs)',
                    maxWidth: '440px',
                    margin: '0 auto 32px',
                    textAlign: 'left',
                    fontSize: '0.9rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Total:</span>
                    <strong style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700 }}>
                      ₵{calculatePrice()}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    <span>Contact:</span>
                    <span>{clientPhone}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href={whatsappBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-burgundy"
                    style={{ padding: '14px 28px' }}
                  >
                    <MessageCircle size={16} />
                    <span>Confirm via WhatsApp</span>
                  </a>

                  <button onClick={handleReset} className="btn btn-minimal" style={{ padding: '14px 24px' }}>
                    <span>Book Another Service</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Step-by-Step Flow */
              <div>
                {/* STEP 1: CHOOSE SERVICE TYPE */}
                {currentStep === 1 && (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <span className="editorial-eyebrow">Step 01</span>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                        Choose Service Type
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Select the primary nail or toe service you desire.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      {studioConfig.services.map((service) => {
                        const isSelected = selectedService?.id === service.id && !isToeService
                        return (
                          <div
                            key={service.id}
                            className={`selection-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelectMainService(service)}
                          >
                            <div>
                              <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-primary)' }}>
                                {service.name}
                              </strong>
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                {service.description}
                              </span>
                            </div>

                            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                              <span
                                style={{
                                  fontFamily: 'var(--font-serif)',
                                  fontSize: '1.25rem',
                                  fontWeight: 700,
                                  color: isSelected ? 'var(--color-accent)' : 'var(--text-primary)'
                                }}
                              >
                                {service.displayPrice}
                              </span>
                              <div
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--border-subtle)',
                                  backgroundColor: isSelected ? 'var(--color-accent)' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#FFFFFF'
                                }}
                              >
                                {isSelected && <Check size={12} />}
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {/* Toe Services Header & Sub-selection */}
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.78rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: 'var(--text-muted)',
                            marginBottom: '12px'
                          }}
                        >
                          Toe Services
                        </span>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                          {studioConfig.toeServices.map((toe) => {
                            const isToeSelected = isToeService && selectedToeService?.id === toe.id
                            return (
                              <div
                                key={toe.id}
                                className={`selection-card ${isToeSelected ? 'selected' : ''}`}
                                onClick={() => handleSelectToeServiceOption(toe)}
                                style={{ padding: '14px 16px' }}
                              >
                                <div>
                                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                    {toe.name}
                                  </strong>
                                </div>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '1.15rem',
                                    fontWeight: 700,
                                    color: isToeSelected ? 'var(--color-accent)' : 'var(--text-primary)'
                                  }}
                                >
                                  {toe.displayPrice}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: CHOOSE LENGTH (Only for services with lengths: Gel X, Acrylic, Refill) */}
                {currentStep === 2 && selectedService && selectedService.hasLengths && (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <span className="editorial-eyebrow">Step 02</span>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                        Choose Length for {selectedService.name}
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Length selection automatically adjusts your final appointment total.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                      {selectedService.lengthOptions?.map((length) => {
                        const isSelected = selectedLength?.id === length.id
                        return (
                          <div
                            key={length.id}
                            className={`selection-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelectLength(length)}
                          >
                            <div>
                              <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                                {length.name}
                              </strong>
                              {length.magnets && (
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                  {length.magnets} magnets length guideline
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span
                                style={{
                                  fontFamily: 'var(--font-serif)',
                                  fontSize: '1.3rem',
                                  fontWeight: 700,
                                  color: isSelected ? 'var(--color-accent)' : 'var(--text-primary)'
                                }}
                              >
                                {length.displayPrice}
                              </span>

                              <div
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--border-subtle)',
                                  backgroundColor: isSelected ? 'var(--color-accent)' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#FFFFFF'
                                }}
                              >
                                {isSelected && <Check size={12} />}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="booking-actions-row">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="btn btn-minimal btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <ArrowLeft size={14} />
                        <span>Back to Services</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: DATE & TIME */}
                {currentStep === 3 && (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <span className="editorial-eyebrow">Step 03</span>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                        Choose Date &amp; Time
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Select your preferred studio session date and available time slot.
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                      {/* Date Picker */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={14} style={{ color: 'var(--color-accent)' }} />
                          <span>Appointment Date *</span>
                        </label>
                        <input
                          type="date"
                          className="form-input"
                          min={todayStr}
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value)
                            setErrorMessage('')
                          }}
                          required
                        />
                      </div>

                      {/* Time Slots Selection */}
                      <div>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <Clock size={14} style={{ color: 'var(--color-accent)' }} />
                          <span>Available Time Slots *</span>
                        </label>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                            gap: '10px'
                          }}
                        >
                          {studioConfig.availableTimes.map((timeSlot) => {
                            const isSelected = selectedTime === timeSlot
                            return (
                              <button
                                key={timeSlot}
                                type="button"
                                onClick={() => {
                                  setSelectedTime(timeSlot)
                                  setErrorMessage('')
                                }}
                                style={{
                                  padding: '12px 8px',
                                  fontSize: '0.85rem',
                                  fontWeight: 500,
                                  fontFamily: 'var(--font-sans)',
                                  backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--bg-surface)',
                                  color: isSelected ? 'var(--text-white)' : 'var(--text-primary)',
                                  border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--border-subtle)',
                                  borderRadius: 'var(--radius-xs)',
                                  transition: 'all var(--transition-fast)',
                                  cursor: 'pointer'
                                }}
                              >
                                {timeSlot}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {errorMessage && (
                      <p style={{ color: 'var(--color-accent)', fontSize: '0.86rem', marginBottom: '16px' }}>
                        {errorMessage}
                      </p>
                    )}

                    <div className="booking-actions-row">
                      <button
                        onClick={() => {
                          if (selectedService?.hasLengths) {
                            setCurrentStep(2)
                          } else {
                            setCurrentStep(1)
                          }
                        }}
                        className="btn btn-minimal btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <ArrowLeft size={14} />
                        <span>Previous</span>
                      </button>

                      <button
                        onClick={handleProceedToConfirm}
                        className="btn btn-burgundy btn-sm"
                        disabled={!selectedDate || !selectedTime}
                        style={{ opacity: !selectedDate || !selectedTime ? 0.6 : 1 }}
                      >
                        <span>Review &amp; Confirm</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: CONFIRM & DETAILS */}
                {currentStep === 4 && (
                  <form onSubmit={handleConfirmAppointment}>
                    <div style={{ marginBottom: '24px' }}>
                      <span className="editorial-eyebrow">Step 04</span>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                        Client Details &amp; Confirmation
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Review your appointment summary and enter your contact details.
                      </p>
                    </div>

                    {/* Client Information Form Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Full Name *</label>
                        <input
                          className="form-input"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Your Name"
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Phone / WhatsApp *</label>
                          <input
                            className="form-input"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            placeholder="e.g. 055 123 4567"
                            required
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Email Address *</label>
                          <input
                            type="email"
                            className="form-input"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Notes or Requests (Optional)</label>
                        <textarea
                          className="form-textarea"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Share any sensitivities, nail health details, or specific style references..."
                          style={{ minHeight: '80px' }}
                        />
                      </div>
                    </div>

                    {errorMessage && (
                      <p style={{ color: 'var(--color-accent)', fontSize: '0.86rem', marginBottom: '16px' }}>
                        {errorMessage}
                      </p>
                    )}

                    <div className="booking-actions-row">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="btn btn-minimal btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <ArrowLeft size={14} />
                        <span>Change Date/Time</span>
                      </button>

                      <button
                        type="submit"
                        className="btn btn-burgundy"
                        disabled={submitting}
                      >
                        <span>{submitting ? 'Sending Request...' : 'Confirm Appointment'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Appointment Live Summary Sidebar */}
          <aside>
            <div
              className="surface-white"
              style={{
                padding: '32px 28px',
                border: '1px solid var(--border-light)',
                position: 'sticky',
                top: '100px'
              }}
            >
              <span className="editorial-eyebrow">Appointment Summary</span>

              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Service</span>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {activeServiceName}
                  </strong>
                </div>

                {selectedLength && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Length</span>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {selectedLength.name} {selectedLength.magnets ? `(${selectedLength.magnets} magnets)` : ''}
                    </strong>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Date</span>
                  <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {selectedDate || 'Select in Step 03'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Time</span>
                  <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {selectedTime || 'Select in Step 03'}
                  </span>
                </div>
              </div>

              {/* Price Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Total Price
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.8rem',
                    fontWeight: 700,
                    color: 'var(--color-accent)'
                  }}
                >
                  {calculatePrice() > 0 ? `₵${calculatePrice()}` : '—'}
                </span>
              </div>

              {/* Studio Assurance Note */}
              <div
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  padding: '14px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.82rem',
                  lineHeight: 1.55,
                  color: 'var(--text-muted)'
                }}
              >
                No advance online card payment required. Payment is handled upon arrival or confirmation as directed by the studio.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
