import { useState, useEffect, useMemo, useCallback } from 'react'
import { studioConfig } from '../../config/studioConfig'
import type { ServiceItem, ServiceLengthOption, ToeServiceItem, SelectedBookingService } from '../../types'
import { Check, ArrowRight, ArrowLeft, MessageCircle, Calendar, Clock, CheckCircle2, Sparkles, X, AlertCircle, ChevronDown, Loader2 } from 'lucide-react'
import { formatDuration, generateAvailableTimeSlots, getOperatingHoursForDate, APPOINTMENT_BUFFER_MINUTES, type BookedInterval } from '../../utils/bookingUtils'
import { useAuth } from '../../context/useAuth'
import { API_BASE_URL } from '../../config/api'

type BookingSectionProps = {
  preselectedServiceId?: string
  preselectedLengthId?: string
}

export function BookingSection({
  preselectedServiceId,
  preselectedLengthId
}: BookingSectionProps) {
  const { user, profile, token } = useAuth()

  // Current active step (1: Services & Length, 2: Date & Dynamic Time, 3: Confirm)
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Multi-service confirmed selections (max 3 distinct services)
  const [selectedServices, setSelectedServices] = useState<SelectedBookingService[]>([])

  // Pending service awaiting length selection before another service can be picked
  const [pendingLengthServiceId, setPendingLengthServiceId] = useState<string | null>(null)

  // Date & Time states
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedEndTime, setSelectedEndTime] = useState<string>('')

  // Slot blocking & double-booking prevention state
  const [bookedIntervals, setBookedIntervals] = useState<BookedInterval[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false)

  // Client Details
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [notes, setNotes] = useState('')

  // Autofill client contact details if signed in
  useEffect(() => {
    if (profile) {
      setClientName((prev) => prev || profile.fullName || '')
      setClientPhone((prev) => prev || profile.phone || '')
      setClientEmail((prev) => prev || profile.email || '')
    } else if (user?.email) {
      setClientEmail((prev) => prev || user.email || '')
    }
  }, [profile, user])

  // Submission & Feedback states
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Handle preselection when clicked from homepage sections (e.g. Services / ToeServices)
  useEffect(() => {
    if (!preselectedServiceId) return

    if (preselectedServiceId.startsWith('toes-')) {
      const foundToe = studioConfig.toeServices.find((t) => t.id === preselectedServiceId)
      if (foundToe) {
        setSelectedServices((prev) => {
          if (prev.some((s) => s.serviceId === foundToe.id)) return prev
          if (prev.length >= 3) return prev
          return [
            ...prev,
            {
              serviceId: foundToe.id,
              serviceName: foundToe.name,
              isToeService: true,
              price: foundToe.price,
              durationMinutes: foundToe.durationMinutes,
              displayDuration: foundToe.displayDuration
            }
          ]
        })
      }
    } else {
      // Check if preselectedServiceId matches a lengthOption id (e.g. cluster-lashes-top or gel-x-short)
      for (const s of studioConfig.services) {
        if (s.hasLengths && s.lengthOptions) {
          const foundOpt = s.lengthOptions.find((opt) => opt.id === preselectedServiceId)
          if (foundOpt) {
            setSelectedServices((prev) => {
              if (prev.some((item) => item.serviceId === s.id)) return prev
              if (prev.length >= 3) return prev
              return [
                ...prev,
                {
                  serviceId: s.id,
                  serviceName: s.name,
                  isToeService: false,
                  price: foundOpt.price,
                  durationMinutes: s.durationMinutes,
                  displayDuration: s.displayDuration,
                  lengthId: foundOpt.id,
                  lengthName: foundOpt.name
                }
              ]
            })
            return
          }
        }
      }

      const found = studioConfig.services.find((s) => s.id === preselectedServiceId)
      if (found) {
        if (found.hasLengths && found.lengthOptions && found.lengthOptions.length > 0) {
          if (preselectedLengthId) {
            const chosenLength = found.lengthOptions.find((l) => l.id === preselectedLengthId) || found.lengthOptions[0]
            setSelectedServices((prev) => {
              if (prev.some((s) => s.serviceId === found.id)) return prev
              if (prev.length >= 3) return prev
              return [
                ...prev,
                {
                  serviceId: found.id,
                  serviceName: found.name,
                  isToeService: false,
                  price: chosenLength.price,
                  durationMinutes: found.durationMinutes,
                  displayDuration: found.displayDuration,
                  lengthId: chosenLength.id,
                  lengthName: chosenLength.name
                }
              ]
            })
          } else {
            // Service has lengths/options but none preselected: open selector immediately
            setPendingLengthServiceId(found.id)
          }
        } else {
          // No length required: add immediately
          setSelectedServices((prev) => {
            if (prev.some((s) => s.serviceId === found.id)) return prev
            if (prev.length >= 3) return prev
            return [
              ...prev,
              {
                serviceId: found.id,
                serviceName: found.name,
                isToeService: false,
                price: found.basePrice,
                durationMinutes: found.durationMinutes,
                displayDuration: found.displayDuration
              }
            ]
          })
        }
      }
    }
  }, [preselectedServiceId, preselectedLengthId])

  // Total price calculation
  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, item) => sum + item.price, 0)
  }, [selectedServices])

  // Total duration in minutes
  const totalDurationMinutes = useMemo(() => {
    return selectedServices.reduce((sum, item) => sum + item.durationMinutes, 0)
  }, [selectedServices])

  const totalDurationDisplay = useMemo(() => {
    return formatDuration(totalDurationMinutes)
  }, [totalDurationMinutes])

  // Pending service object details (if any)
  const pendingService = useMemo(() => {
    if (!pendingLengthServiceId) return null
    return studioConfig.services.find((s) => s.id === pendingLengthServiceId) || null
  }, [pendingLengthServiceId])

  // User clicked a Main Service card
  const handleSelectMainService = (service: ServiceItem) => {
    setErrorMessage('')

    // If another service is awaiting selection, block until choice is made
    if (pendingLengthServiceId && pendingLengthServiceId !== service.id) {
      setErrorMessage(
        `Please select an option for ${pendingService?.name || 'the current service'} before selecting another service.`
      )
      return
    }

    const existingIndex = selectedServices.findIndex((s) => s.serviceId === service.id)

    // If service has lengths / varied options (Gel-X, Acrylic, Refill, Cluster Lashes)
    if (service.hasLengths) {
      // If it's already selected and clicked again, open selector to change option or allow removing
      if (existingIndex >= 0) {
        setPendingLengthServiceId(service.id)
        return
      }

      // If not yet selected and limit of 3 reached
      if (selectedServices.length >= 3) {
        setErrorMessage('You can choose a maximum of 3 distinct services per booking.')
        return
      }

      // Open dropdown options immediately for this service before another can be picked
      setPendingLengthServiceId(service.id)
      return
    }

    // Service does NOT have lengths (e.g. Soak Off, Builder Gel)
    if (existingIndex >= 0) {
      // Toggle off / remove
      setSelectedServices((prev) => prev.filter((s) => s.serviceId !== service.id))
      return
    }

    if (selectedServices.length >= 3) {
      setErrorMessage('You can choose a maximum of 3 distinct services per booking.')
      return
    }

    // Add service immediately
    setSelectedServices((prev) => [
      ...prev,
      {
        serviceId: service.id,
        serviceName: service.name,
        isToeService: false,
        price: service.basePrice,
        durationMinutes: service.durationMinutes,
        displayDuration: service.displayDuration
      }
    ])
  }

  // User chose a specific length for a service with lengths
  const handleConfirmServiceWithLength = (service: ServiceItem, length: ServiceLengthOption) => {
    setErrorMessage('')
    setPendingLengthServiceId(null)

    setSelectedServices((prev) => {
      const existing = prev.find((s) => s.serviceId === service.id)
      if (existing) {
        // Update length and price
        return prev.map((s) =>
          s.serviceId === service.id
            ? {
                ...s,
                lengthId: length.id,
                lengthName: length.name,
                price: length.price
              }
            : s
        )
      }

      // Add new service with chosen length
      return [
        ...prev,
        {
          serviceId: service.id,
          serviceName: service.name,
          isToeService: false,
          price: length.price,
          durationMinutes: service.durationMinutes,
          displayDuration: service.displayDuration,
          lengthId: length.id,
          lengthName: length.name
        }
      ]
    })
  }

  // Cancel pending length selection
  const handleCancelPendingLength = () => {
    setPendingLengthServiceId(null)
    setErrorMessage('')
  }

  // Remove a confirmed service from selections
  const handleRemoveService = (serviceId: string) => {
    setErrorMessage('')
    if (pendingLengthServiceId === serviceId) {
      setPendingLengthServiceId(null)
    }
    setSelectedServices((prev) => prev.filter((s) => s.serviceId !== serviceId))
  }

  // User clicked a Toe Service
  const handleSelectToeService = (toe: ToeServiceItem) => {
    setErrorMessage('')

    // If another service is awaiting length selection, block until length is chosen
    if (pendingLengthServiceId) {
      setErrorMessage(
        `Please select a length for ${pendingService?.name || 'the current service'} before selecting another service.`
      )
      return
    }

    const exists = selectedServices.some((s) => s.serviceId === toe.id)
    if (exists) {
      setSelectedServices((prev) => prev.filter((s) => s.serviceId !== toe.id))
      return
    }

    if (selectedServices.length >= 3) {
      setErrorMessage('You can choose a maximum of 3 distinct services per booking.')
      return
    }

    // Add toe service immediately (toe services do not require lengths)
    setSelectedServices((prev) => [
      ...prev,
      {
        serviceId: toe.id,
        serviceName: toe.name,
        isToeService: true,
        price: toe.price,
        durationMinutes: toe.durationMinutes,
        displayDuration: toe.displayDuration
      }
    ])
  }

  // Navigate from Step 1 to Step 2 (Date & Dynamic Time)
  const handleProceedToDateStep = () => {
    if (pendingLengthServiceId) {
      setErrorMessage(
        `Please select a length for ${pendingService?.name || 'the selected service'} before continuing.`
      )
      return
    }

    if (selectedServices.length === 0) {
      setErrorMessage('Please select at least 1 service to proceed.')
      return
    }

    setErrorMessage('')
    setCurrentStep(2)
  }

  // Date selection & dynamic slot generation
  const todayStr = useMemo(() => {
    const today = new Date()
    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-')
  }, [])

  // Fetch booked intervals for selected date from server
  const fetchAvailability = useCallback(async (date: string) => {
    if (!date) {
      setBookedIntervals([])
      return
    }
    setLoadingAvailability(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/availability?date=${encodeURIComponent(date)}`)
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.bookedIntervals)) {
          setBookedIntervals(json.bookedIntervals)
        }
      }
    } catch (err) {
      console.warn('Availability fetch notice:', err)
    } finally {
      setLoadingAvailability(false)
    }
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate)
    } else {
      setBookedIntervals([])
    }
  }, [selectedDate, fetchAvailability])

  const { slots: availableSlots, info: dateHoursInfo, exceedsOperatingHours } = useMemo(() => {
    if (!selectedDate || totalDurationMinutes <= 0) {
      return { slots: [], info: getOperatingHoursForDate(selectedDate), exceedsOperatingHours: false }
    }
    return generateAvailableTimeSlots(selectedDate, totalDurationMinutes, 30, bookedIntervals, APPOINTMENT_BUFFER_MINUTES)
  }, [selectedDate, totalDurationMinutes, bookedIntervals])

  // Reset selected time if date changes or if the selected slot is occupied / invalid
  useEffect(() => {
    if (selectedTime) {
      const matchingSlot = availableSlots.find((s) => s.startTime === selectedTime)
      if (!matchingSlot || matchingSlot.isBooked) {
        setSelectedTime('')
        setSelectedEndTime('')
      }
    }
  }, [selectedDate, availableSlots, selectedTime])

  // Step 2 Proceed to Step 3 (Confirmation)
  const handleProceedToConfirm = () => {
    if (!selectedDate || !selectedTime) {
      setErrorMessage('Please select both an appointment date and an available time slot.')
      return
    }
    setErrorMessage('')
    setCurrentStep(3)
  }

  // Step 3 Form Submission
  const handleConfirmAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName || !clientPhone || !clientEmail) {
      setErrorMessage('Please provide your name, phone number, and email address.')
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    const bookingPayload = {
      clientId: user?.id || null,
      services: selectedServices,
      totalDurationMinutes,
      totalDurationDisplay,
      date: selectedDate,
      time: selectedTime,
      endTime: selectedEndTime,
      price: totalPrice,
      name: clientName,
      phone: clientPhone,
      email: clientEmail,
      notes: notes,
      // Backward-compatible fallback fields
      service: selectedServices.map((s) => s.serviceName + (s.lengthName ? ` (${s.lengthName})` : '')).join(', '),
      length: selectedServices.filter((s) => s.lengthName).map((s) => `${s.serviceName}: ${s.lengthName}`).join('; ')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)
    let conflictOccurred = false

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingPayload),
        signal: controller.signal
      })

      if (res.status === 409) {
        conflictOccurred = true
        const errorData = await res.json().catch(() => ({}))
        setErrorMessage(
          errorData.error ||
          'The selected time slot is no longer available. Another client has already reserved an appointment during this window.'
        )
        // Refresh availability immediately and return user to Step 2 to pick a new slot
        await fetchAvailability(selectedDate)
        setCurrentStep(2)
        setSelectedTime('')
        setSelectedEndTime('')
        return
      }
    } catch (fetchErr) {
      console.warn('Booking API fetch notice:', fetchErr)
    } finally {
      clearTimeout(timeoutId)
      setSubmitting(false)
      if (!conflictOccurred) {
        setSubmitted(true)
        fetchAvailability(selectedDate)
        setTimeout(() => {
          const confirmEl = document.getElementById('booking-confirmation') || document.getElementById('booking')
          if (confirmEl) {
            confirmEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 60)
      }
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setSelectedServices([])
    setPendingLengthServiceId(null)
    setSelectedDate('')
    setSelectedTime('')
    setSelectedEndTime('')
    setClientName('')
    setClientPhone('')
    setClientEmail('')
    setNotes('')
    setSubmitted(false)
    setErrorMessage('')
  }

  // Format WhatsApp confirmation text with all services
  const servicesTextList = selectedServices
    .map(
      (s) =>
        `• ${s.serviceName}${s.lengthName ? ` (${s.lengthName})` : ''} [${s.displayDuration}] - ₵${s.price}`
    )
    .join('\n')

  const whatsappConfirmationText = `Hello Naurèlle Beauty, I would like to confirm my appointment request:\n\nServices (${selectedServices.length}):\n${servicesTextList}\n\nTotal Duration: ${totalDurationDisplay}\nEstimated Total: ₵${totalPrice}\nDate: ${selectedDate}\nTime: ${selectedTime}${
    selectedEndTime ? ` – ${selectedEndTime}` : ''
  }\n\nClient: ${clientName}\nPhone: ${clientPhone}${notes ? `\nNotes: ${notes}` : ''}`

  const whatsappBookingUrl = `https://wa.me/${studioConfig.contact.whatsappNumber}?text=${encodeURIComponent(
    whatsappConfirmationText
  )}`

  return (
    <section id="booking" className="editorial-section" style={{ scrollMarginTop: '80px' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '680px', marginBottom: '36px' }}>
          <span className="editorial-eyebrow">Reservations</span>
          <h2 className="section-title">Appointment Booking</h2>
          <p className="section-subtitle">
            Select each service and customize length before choosing another service (up to 3 distinct services).
          </p>
        </div>

        {/* 3-Step Progress Indicator Bar */}
        <div className="step-indicator-bar" aria-label="Booking steps">
          <div className={`step-indicator-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
            <span className="step-indicator-num">01</span>
            <span>Services ({selectedServices.length}/3)</span>
          </div>

          <div style={{ color: 'var(--border-subtle)' }}>&rarr;</div>

          <div className={`step-indicator-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
            <span className="step-indicator-num">02</span>
            <span>Date &amp; Time</span>
          </div>

          <div style={{ color: 'var(--border-subtle)' }}>&rarr;</div>

          <div className={`step-indicator-item ${currentStep === 3 ? 'active' : ''}`}>
            <span className="step-indicator-num">03</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Booking Container Layout */}
        <div className="booking-layout-grid">
          {/* Main Interaction Area */}
          <div className="surface-white booking-card-main">
            {submitted ? (
              /* Success State */
              <div id="booking-confirmation" style={{ textAlign: 'center', padding: '24px 8px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(122, 2, 1, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'var(--color-accent)'
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>

                <span className="editorial-eyebrow">Request Received</span>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '2rem',
                    color: 'var(--text-primary)',
                    marginBottom: '14px'
                  }}
                >
                  Appointment request received.
                </h3>

                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 24px' }}>
                  Thank you, <strong>{clientName}</strong>. Your appointment request for{' '}
                  <strong>{selectedServices.length} {selectedServices.length === 1 ? 'service' : 'services'}</strong> on{' '}
                  <strong>{selectedDate}</strong> at{' '}
                  <strong>
                    {selectedTime}
                    {selectedEndTime ? ` – ${selectedEndTime}` : ''}
                  </strong>{' '}
                  ({totalDurationDisplay}) has been received.
                </p>

                {/* Booked Services Summary List */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    padding: '20px 24px',
                    borderRadius: 'var(--radius-xs)',
                    maxWidth: '480px',
                    margin: '0 auto 32px',
                    textAlign: 'left',
                    fontSize: '0.9rem'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--text-muted)',
                      marginBottom: '12px'
                    }}
                  >
                    Reserved Services ({selectedServices.length})
                  </div>

                  {selectedServices.map((service) => (
                    <div
                      key={service.serviceId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                        borderBottom: '1px dashed var(--border-light)'
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{service.serviceName}</strong>
                        {service.lengthName && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: '6px' }}>
                            ({service.lengthName})
                          </span>
                        )}
                        <span
                          style={{
                            display: 'inline-block',
                            marginLeft: '8px',
                            fontSize: '0.75rem',
                            color: 'var(--color-accent)',
                            backgroundColor: 'rgba(122,2,1,0.06)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {service.displayDuration}
                        </span>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₵{service.price}</span>
                    </div>
                  ))}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '16px',
                      paddingTop: '8px'
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Total Duration:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{totalDurationDisplay}</strong>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginTop: '6px'
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Total:</span>
                    <strong
                      style={{
                        color: 'var(--color-accent)',
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.25rem',
                        fontWeight: 700
                      }}
                    >
                      ₵{totalPrice}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'var(--text-muted)',
                      fontSize: '0.84rem',
                      marginTop: '10px'
                    }}
                  >
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
                {/* STEP 1: CHOOSE SERVICES & LENGTHS */}
                {currentStep === 1 && (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <span className="editorial-eyebrow">Step 01</span>
                          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)', margin: 0 }}>
                            Choose Services &amp; Lengths
                          </h3>
                        </div>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: selectedServices.length === 3 ? 'var(--color-accent)' : 'var(--bg-canvas)',
                            color: selectedServices.length === 3 ? '#FFFFFF' : 'var(--text-primary)',
                            padding: '6px 14px',
                            borderRadius: '100px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            letterSpacing: '0.04em'
                          }}
                        >
                          <Sparkles size={13} />
                          <span>
                            {selectedServices.length} of 3 Selected
                            {selectedServices.length === 3 ? ' (Max)' : ''}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        Click a service to select it. If it has length options, choose your length before selecting another service.
                      </p>
                    </div>

                    {/* Active Selected Services Tray (if any selected) */}
                    {selectedServices.length > 0 && (
                      <div
                        style={{
                          backgroundColor: 'var(--bg-canvas)',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '16px 18px',
                          marginBottom: '24px'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px'
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.74rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                              fontWeight: 600,
                              color: 'var(--text-muted)'
                            }}
                          >
                            Currently Selected ({selectedServices.length}/3)
                          </span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Total: <strong style={{ color: 'var(--color-accent)' }}>₵{totalPrice}</strong> &bull; Duration:{' '}
                            <strong style={{ color: 'var(--text-primary)' }}>{totalDurationDisplay}</strong>
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {selectedServices.map((item) => (
                            <div
                              key={item.serviceId}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid var(--border-medium)',
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-xs)',
                                fontSize: '0.85rem'
                              }}
                            >
                              <strong>{item.serviceName}</strong>
                              {item.lengthName && (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                  ({item.lengthName})
                                </span>
                              )}
                              <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>₵{item.price}</span>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>[{item.displayDuration}]</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveService(item.serviceId)}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--text-muted)',
                                  padding: 0,
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Remove service"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pending Length Selection Prompt Banner */}
                    {pendingService && (
                      <div
                        style={{
                          backgroundColor: 'rgba(122, 2, 1, 0.05)',
                          border: '1px solid var(--color-accent)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '16px 20px',
                          marginBottom: '24px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
                            <strong style={{ fontSize: '0.96rem', color: 'var(--color-accent)' }}>
                              Select length for {pendingService.name}:
                            </strong>
                          </div>
                          <button
                            type="button"
                            onClick={handleCancelPendingLength}
                            className="btn btn-minimal btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.76rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                          Please choose your preferred length below before selecting another service.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                          {pendingService.lengthOptions?.map((length) => (
                            <button
                              key={length.id}
                              type="button"
                              onClick={() => handleConfirmServiceWithLength(pendingService, length)}
                              style={{
                                padding: '12px 14px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid var(--color-accent)',
                                borderRadius: 'var(--radius-xs)',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)'
                              }}
                            >
                              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                {length.name}
                              </strong>
                              {length.magnets && (
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                  {length.magnets} magnets
                                </span>
                              )}
                              <span
                                style={{
                                  fontFamily: 'var(--font-serif)',
                                  fontSize: '1.15rem',
                                  fontWeight: 700,
                                  color: 'var(--color-accent)'
                                }}
                              >
                                {length.displayPrice}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Main Nail Services Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '0.78rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          color: 'var(--text-muted)',
                          marginBottom: '4px'
                        }}
                      >
                        Nail & Lash Services
                      </span>

                      {studioConfig.services.map((service) => {
                        const confirmedItem = selectedServices.find((s) => s.serviceId === service.id)
                        const isConfirmed = Boolean(confirmedItem)
                        const isPending = pendingLengthServiceId === service.id
                        const isMaxReached = selectedServices.length >= 3 && !isConfirmed && !isPending
                        const isBlockedByPending = Boolean(pendingLengthServiceId && pendingLengthServiceId !== service.id)
                        const isLashService = service.category === 'lashes'
                        const optionTerm = isLashService ? 'option' : 'length'
                        const optionTermTitle = isLashService ? 'Option' : 'Length'

                        return (
                          <div
                            key={service.id}
                            style={{
                              border: isPending
                                ? '2px solid var(--color-accent)'
                                : isConfirmed
                                ? '1px solid var(--color-accent)'
                                : '1px solid var(--border-light)',
                              backgroundColor: isConfirmed ? '#FAF6F6' : 'var(--bg-surface)',
                              borderRadius: 'var(--radius-xs)',
                              padding: '18px 22px',
                              transition: 'all var(--transition-normal)',
                              opacity: isMaxReached ? 0.5 : isBlockedByPending ? 0.7 : 1,
                              cursor: isMaxReached ? 'not-allowed' : 'pointer',
                              position: 'relative'
                            }}
                            onClick={() => !isMaxReached && handleSelectMainService(service)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ flex: 1, paddingRight: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                                    {service.name}
                                  </strong>

                                  {confirmedItem?.lengthName && (
                                    <span
                                      style={{
                                        fontSize: '0.76rem',
                                        fontWeight: 600,
                                        backgroundColor: 'var(--color-accent)',
                                        color: '#FFFFFF',
                                        padding: '2px 8px',
                                        borderRadius: '10px'
                                      }}
                                    >
                                      {isLashService ? '' : 'Length: '}{confirmedItem.lengthName}
                                    </span>
                                  )}

                                  {!isLashService && (
                                    <span
                                      style={{
                                        fontSize: '0.74rem',
                                        fontWeight: 600,
                                        color: 'var(--color-accent)',
                                        backgroundColor: 'rgba(122,2,1,0.06)',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Clock size={11} />
                                      {service.displayDuration}
                                    </span>
                                  )}

                                  {service.hasLengths && (
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                      ({optionTermTitle} required)
                                    </span>
                                  )}
                                </div>

                                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4, display: 'block' }}>
                                  {service.description}
                                </span>
                              </div>

                              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: isConfirmed ? 'var(--color-accent)' : 'var(--text-primary)'
                                  }}
                                >
                                  {confirmedItem ? `₵${confirmedItem.price}` : service.displayPrice}
                                </span>

                                <div
                                  style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    border: isConfirmed ? '2px solid var(--color-accent)' : '1px solid var(--border-subtle)',
                                    backgroundColor: isConfirmed ? 'var(--color-accent)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FFFFFF'
                                  }}
                                >
                                  {isConfirmed ? <Check size={13} /> : service.hasLengths ? <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} /> : null}
                                </div>
                              </div>
                            </div>

                            {/* Inline Length/Option Selection Dropdown if this card is currently pending */}
                            {isPending && (
                              <div
                                style={{
                                  marginTop: '16px',
                                  paddingTop: '16px',
                                  borderTop: '1px dashed var(--border-medium)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    Select {optionTerm} for {service.name} before selecting another service:
                                  </span>
                                  <button
                                    type="button"
                                    onClick={handleCancelPendingLength}
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      color: 'var(--text-muted)',
                                      fontSize: '0.78rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                                  {service.lengthOptions?.map((length) => {
                                    const isLengthActive = confirmedItem?.lengthId === length.id
                                    return (
                                      <button
                                        key={length.id}
                                        type="button"
                                        onClick={() => handleConfirmServiceWithLength(service, length)}
                                        style={{
                                          padding: '10px 12px',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'center',
                                          gap: '3px',
                                          backgroundColor: isLengthActive ? 'var(--color-accent)' : '#FFFFFF',
                                          color: isLengthActive ? '#FFFFFF' : 'var(--text-primary)',
                                          border: isLengthActive ? '1px solid var(--color-accent)' : '1px solid var(--border-medium)',
                                          borderRadius: 'var(--radius-xs)',
                                          cursor: 'pointer',
                                          transition: 'all var(--transition-fast)'
                                        }}
                                      >
                                        <strong style={{ fontSize: '0.9rem' }}>{length.name}</strong>
                                        {length.magnets && (
                                          <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                                            {length.magnets} magnets
                                          </span>
                                        )}
                                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 700 }}>
                                          {length.displayPrice}
                                        </span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Option to change length or remove if already confirmed */}
                            {isConfirmed && !isPending && service.hasLengths && (
                              <div
                                style={{
                                  marginTop: '12px',
                                  paddingTop: '10px',
                                  borderTop: '1px dashed var(--border-light)',
                                  display: 'flex',
                                  gap: '12px',
                                  alignItems: 'center'
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => setPendingLengthServiceId(service.id)}
                                  className="btn btn-minimal btn-sm"
                                  style={{ padding: '3px 10px', fontSize: '0.76rem' }}
                                >
                                  Change {optionTermTitle} ({confirmedItem?.lengthName})
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveService(service.id)}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    color: 'var(--color-accent)',
                                    fontSize: '0.76rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Remove Service
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {/* Toe Services Section */}
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
                          Toe Services (1 hr each &bull; No length required)
                        </span>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '10px' }}>
                          {studioConfig.toeServices.map((toe) => {
                            const isSelected = selectedServices.some((s) => s.serviceId === toe.id)
                            const isMaxReached = selectedServices.length >= 3 && !isSelected

                            return (
                              <div
                                key={toe.id}
                                className={`selection-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => !isMaxReached && handleSelectToeService(toe)}
                                style={{
                                  padding: '14px 16px',
                                  opacity: isMaxReached ? 0.5 : 1,
                                  cursor: isMaxReached ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                                      {toe.name}
                                    </strong>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: '0.72rem',
                                      color: 'var(--color-accent)',
                                      backgroundColor: 'rgba(122,2,1,0.06)',
                                      padding: '1px 6px',
                                      borderRadius: '10px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                  >
                                    <Clock size={10} />
                                    {toe.displayDuration}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-serif)',
                                      fontSize: '1.15rem',
                                      fontWeight: 700,
                                      color: isSelected ? 'var(--color-accent)' : 'var(--text-primary)'
                                    }}
                                  >
                                    {toe.displayPrice}
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
                      </div>
                    </div>

                    {/* Feedback error message */}
                    {errorMessage && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: 'var(--color-accent)',
                          fontSize: '0.86rem',
                          marginBottom: '16px',
                          backgroundColor: 'rgba(122,2,1,0.05)',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-xs)'
                        }}
                      >
                        <AlertCircle size={15} />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Step 1 Bottom Action Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border-light)'
                      }}
                    >
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        {selectedServices.length > 0 ? (
                          <span>
                            Selected <strong>{selectedServices.length} of 3</strong> &bull; Est. Duration:{' '}
                            <strong style={{ color: 'var(--text-primary)' }}>{totalDurationDisplay}</strong> &bull; Total:{' '}
                            <strong style={{ color: 'var(--color-accent)' }}>₵{totalPrice}</strong>
                          </span>
                        ) : (
                          <span>Select at least 1 service to continue (up to 3 max).</span>
                        )}
                      </div>

                      <button
                        onClick={handleProceedToDateStep}
                        className="btn btn-burgundy btn-sm"
                        disabled={selectedServices.length === 0 || Boolean(pendingLengthServiceId)}
                        style={{ opacity: selectedServices.length === 0 || Boolean(pendingLengthServiceId) ? 0.6 : 1 }}
                      >
                        <span>Continue to Date &amp; Time</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: DATE & DYNAMIC TIME */}
                {currentStep === 2 && (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <span className="editorial-eyebrow">Step 02</span>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                        Choose Date &amp; Time
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Time slots are dynamically calculated based on your total appointment duration.
                      </p>
                    </div>

                    {/* Duration Banner */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-xs)',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} style={{ color: 'var(--color-accent)' }} />
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          Combined Duration for <strong>{selectedServices.length} {selectedServices.length === 1 ? 'service' : 'services'}</strong>:
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: 'var(--color-accent)'
                        }}
                      >
                        {totalDurationDisplay}
                      </span>
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

                      {/* Dynamic Time Slots Selection */}
                      {selectedDate && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                              <Clock size={14} style={{ color: 'var(--color-accent)' }} />
                              <span>Available Time Slots *</span>
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {loadingAvailability && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  <Loader2 size={12} className="spin" /> Checking schedule...
                                </span>
                              )}
                              {dateHoursInfo.isOpen && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  {dateHoursInfo.dayName} Hours: {dateHoursInfo.displayHours}
                                </span>
                              )}
                            </div>
                          </div>

                          {!dateHoursInfo.isOpen ? (
                            <div
                              style={{
                                padding: '20px',
                                backgroundColor: 'rgba(122, 2, 1, 0.04)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-xs)',
                                textAlign: 'center',
                                color: 'var(--color-accent)'
                              }}
                            >
                              <strong>{dateHoursInfo.reason || 'The studio is closed on this day.'}</strong>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                                Please select a Monday through Saturday.
                              </p>
                            </div>
                          ) : exceedsOperatingHours ? (
                            <div
                              style={{
                                padding: '20px',
                                backgroundColor: 'rgba(122, 2, 1, 0.04)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-xs)',
                                textAlign: 'center',
                                color: 'var(--color-accent)'
                              }}
                            >
                              <strong>Selected duration ({totalDurationDisplay}) exceeds {dateHoursInfo.dayName} operating hours ({dateHoursInfo.displayHours}).</strong>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                                Please adjust your selected services or choose a weekday for more available time.
                              </p>
                            </div>
                          ) : availableSlots.length === 0 ? (
                            <div
                              style={{
                                padding: '20px',
                                backgroundColor: 'var(--bg-canvas)',
                                borderRadius: 'var(--radius-xs)',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontSize: '0.88rem'
                              }}
                            >
                              No remaining slots can accommodate a {totalDurationDisplay} appointment on this date.
                              Please select an upcoming date.
                            </div>
                          ) : (
                            <div>
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 124px), 1fr))',
                                  gap: '10px'
                                }}
                              >
                                {availableSlots.map((slot) => {
                                  const isBooked = Boolean(slot.isBooked)
                                  const isSelected = selectedTime === slot.startTime && !isBooked

                                  return (
                                    <button
                                      key={slot.startTime}
                                      type="button"
                                      disabled={isBooked}
                                      aria-disabled={isBooked}
                                      onClick={() => {
                                        if (isBooked) return
                                        setSelectedTime(slot.startTime)
                                        setSelectedEndTime(slot.endTime)
                                        setErrorMessage('')
                                      }}
                                      title={isBooked ? 'This slot is reserved (includes 20-min buffer)' : `Select ${slot.startTime}`}
                                      style={{
                                        padding: '10px 8px',
                                        minHeight: '62px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '2px',
                                        backgroundColor: isBooked
                                          ? 'rgba(0, 0, 0, 0.035)'
                                          : isSelected
                                          ? 'var(--color-accent)'
                                          : 'var(--bg-surface)',
                                        color: isBooked
                                          ? '#8E8880'
                                          : isSelected
                                          ? 'var(--text-white)'
                                          : 'var(--text-primary)',
                                        border: isBooked
                                          ? '1px dashed #D5CFCA'
                                          : isSelected
                                          ? '1px solid var(--color-accent)'
                                          : '1px solid var(--border-subtle)',
                                        borderRadius: 'var(--radius-xs)',
                                        opacity: isBooked ? 0.65 : 1,
                                        transition: 'all var(--transition-fast)',
                                        cursor: isBooked ? 'not-allowed' : 'pointer',
                                        position: 'relative'
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: '0.90rem',
                                          fontWeight: 600,
                                          fontFamily: 'var(--font-sans)',
                                          textDecoration: isBooked ? 'line-through' : 'none',
                                          color: isBooked ? '#8E8880' : undefined
                                        }}
                                      >
                                        {slot.startTime}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: '0.68rem',
                                          color: isBooked
                                            ? '#A59F98'
                                            : isSelected
                                            ? 'rgba(255,255,255,0.85)'
                                            : 'var(--text-muted)'
                                        }}
                                      >
                                        until {slot.endTime}
                                      </span>
                                      {isBooked ? (
                                        <span
                                          style={{
                                            fontSize: '0.62rem',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em',
                                            color: '#6B6560',
                                            backgroundColor: 'rgba(0, 0, 0, 0.07)',
                                            padding: '1px 6px',
                                            borderRadius: '4px',
                                            marginTop: '3px',
                                            lineHeight: 1.2
                                          }}
                                        >
                                          Reserved
                                        </span>
                                      ) : null}
                                    </button>
                                  )
                                })}
                              </div>

                              {/* Slot Legend & Buffer note */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  flexWrap: 'wrap',
                                  gap: '10px',
                                  marginTop: '12px',
                                  padding: '8px 12px',
                                  backgroundColor: 'var(--bg-canvas)',
                                  borderRadius: 'var(--radius-xs)',
                                  fontSize: '0.78rem',
                                  color: 'var(--text-muted)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    <span
                                      style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '2px',
                                        backgroundColor: 'var(--bg-surface)',
                                        border: '1px solid var(--border-subtle)'
                                      }}
                                    />
                                    Available
                                  </span>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    <span
                                      style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '2px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.07)',
                                        border: '1px dashed #D5CFCA'
                                      }}
                                    />
                                    Reserved
                                  </span>
                                </div>
                                <span>20-minute operational buffer included between bookings</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {errorMessage && (
                      <p style={{ color: 'var(--color-accent)', fontSize: '0.86rem', marginBottom: '16px' }}>
                        {errorMessage}
                      </p>
                    )}

                    <div className="booking-actions-row">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="btn btn-minimal btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <ArrowLeft size={14} />
                        <span>Previous (Services)</span>
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

                {/* STEP 3: CONFIRM & CLIENT DETAILS */}
                {currentStep === 3 && (
                  <form onSubmit={handleConfirmAppointment}>
                    <div style={{ marginBottom: '24px' }}>
                      <span className="editorial-eyebrow">Step 03</span>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                        Client Details &amp; Confirmation
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Review your appointment schedule and enter your contact details.
                      </p>
                    </div>

                    {/* Selected Services Quick Summary in Form */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        padding: '16px 20px',
                        borderRadius: 'var(--radius-xs)',
                        marginBottom: '24px'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.74rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          color: 'var(--text-muted)',
                          display: 'block',
                          marginBottom: '8px'
                        }}
                      >
                        Reserved Appointment Summary
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {selectedServices.map((s) => (
                          <div key={s.serviceId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                            <span>
                              <strong>{s.serviceName}</strong>
                              {s.lengthName ? ` (${s.lengthName})` : ''} — {s.displayDuration}
                            </span>
                            <span style={{ fontWeight: 600 }}>₵{s.price}</span>
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          marginTop: '12px',
                          paddingTop: '8px',
                          borderTop: '1px dashed var(--border-light)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.86rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        <span>Date &amp; Time:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {selectedDate} &bull; {selectedTime} – {selectedEndTime} ({totalDurationDisplay})
                        </strong>
                      </div>
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
                          autoComplete="name"
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Phone / WhatsApp *</label>
                          <input
                            type="tel"
                            className="form-input"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            placeholder="e.g. 055 123 4567"
                            autoComplete="tel"
                            inputMode="tel"
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
                            autoComplete="email"
                            inputMode="email"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Notes or Special Requests (Optional)</label>
                        <textarea
                          className="form-textarea"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Share any sensitivities, nail health details, inspiration references..."
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
                        onClick={() => setCurrentStep(2)}
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
                padding: '30px 24px',
                border: '1px solid var(--border-light)',
                position: 'sticky',
                top: '100px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="editorial-eyebrow" style={{ margin: 0 }}>Appointment Summary</span>
                {selectedServices.length > 0 && !submitted && (
                  <button
                    onClick={() => {
                      setSelectedServices([])
                      setPendingLengthServiceId(null)
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Clear selected services"
                  >
                    <X size={12} />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Selected Services Itemized List */}
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '16px' }}>
                {selectedServices.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.86rem', fontStyle: 'italic', padding: '8px 0' }}>
                    No services selected yet. Choose up to 3 services in Step 01.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedServices.map((service) => (
                      <div key={service.serviceId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block' }}>
                            {service.serviceName}
                          </strong>
                          {service.lengthName && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Length: {service.lengthName}
                            </span>
                          )}
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '0.72rem',
                              color: 'var(--color-accent)',
                              marginTop: '2px'
                            }}
                          >
                            ⏱ {service.displayDuration}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          ₵{service.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Schedule Details */}
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Total Duration</span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {totalDurationMinutes > 0 ? totalDurationDisplay : '—'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Date</span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {selectedDate || 'Select in Step 02'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Time Slot</span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {selectedTime ? `${selectedTime} – ${selectedEndTime}` : 'Select in Step 02'}
                  </span>
                </div>
              </div>

              {/* Price Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Total Price
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: 'var(--color-accent)'
                  }}
                >
                  {totalPrice > 0 ? `₵${totalPrice}` : '—'}
                </span>
              </div>

              {/* Studio Assurance Note */}
              <div
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  padding: '14px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  color: 'var(--text-muted)'
                }}
              >
                An upfront deposit of ₵50 is required to secure your appointment. Kindly forward proof of payment via WhatsApp to confirm your booking.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
