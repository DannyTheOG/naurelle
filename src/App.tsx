import { useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'

type Service = {
  name: string
  price: string
  description: string
}

type BookingForm = {
  service: string
  date: string
  time: string
  technician: string
  addOns: string[]
  name: string
  phone: string
  email: string
  instagram: string
  notes: string
}

const services: Service[] = [
  {
    name: 'Classic Lash Lift',
    price: '$95',
    description: 'A soft, lifted lash look that opens the eyes beautifully and lasts for weeks.',
  },
  {
    name: 'Gel Manicure',
    price: '$75',
    description: 'A glossy, chip-resistant manicure in your favourite nude, pink, or sparkle finish.',
  },
  {
    name: 'Hybrid Fill',
    price: '$85',
    description: 'A fresh refill with a clean shape and long-lasting finish for your existing set.',
  },
]

const pricing = [
  { name: 'Lash Lift', price: '$95', note: 'Includes aftercare guidance' },
  { name: 'Lash Tint', price: '$45', note: 'Perfect for definition and depth' },
  { name: 'Full Set', price: '$120', note: 'Soft glam gel finish' },
]

const galleryItems = [
  { title: 'Soft Almond Set', description: 'Rose nude with a glossy finish', image: '/gallery-1.svg' },
  { title: 'Lash Lift Glow', description: 'Lifted, bright-eyed, and effortless', image: '/gallery-2.svg' },
  { title: 'Golden Hour Glam', description: 'Warm shimmer for evening appointments', image: '/gallery-1.svg' },
]

const initialForm: BookingForm = {
  service: 'Classic Lash Lift',
  date: '',
  time: '10:00',
  technician: 'Any available',
  addOns: [],
  name: '',
  phone: '',
  email: '',
  instagram: '',
  notes: '',
}

function MainPage() {
  return (
    <div className="page">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Naurélle Beauty • Lashes & Nails</p>
          <h1>Modern salon rituals with a soft, editorial finish.</h1>
          <p className="hero-text">
            From sculpted lashes to glossy, sculpted nails, every appointment is created to feel polished,
            calm, and beautifully personal.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/bookings">
              Book now
            </Link>
            <Link className="button secondary" to="/services">
              Explore services
            </Link>
          </div>
          <div className="hero-highlights">
            <div className="stat-pill">
              <strong>4.9/5</strong>
              <span>glowing reviews</span>
            </div>
            <div className="stat-pill">
              <strong>By appointment</strong>
              <span>private booking flow</span>
            </div>
            <div className="stat-pill">
              <strong>Deposit secure</strong>
              <span>easy confirmation</span>
            </div>
          </div>
        </div>

        <aside className="hero-card">
          <img src="/hero-illustration.svg" alt="Naurélle Beauty illustration" className="hero-image" />
          <div className="hero-card-content">
            <span className="pill">Signature glow</span>
            <h2>Soft luxury, designed around your ritual.</h2>
            <p>
              Each visit is balanced with refined finishes, thoughtful detail, and a calming studio experience.
            </p>
            <ul>
              <li>Premium-quality products</li>
              <li>Private, polished treatment space</li>
              <li>Tailored colour and finish matching</li>
            </ul>
          </div>
        </aside>
      </header>

      <main>
        <section className="section intro-band">
          <div className="section-heading">
            <p className="eyebrow">Studio experience</p>
            <h2>A refined beauty ritual built for comfort, confidence, and glow.</h2>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <h3>Curated beauty</h3>
              <p>Every service is styled to feel modern, elevated, and effortless.</p>
            </article>
            <article className="feature-card">
              <h3>Precise appointments</h3>
              <p>Choose your preferred time, stylist, and add-ons in a few simple steps.</p>
            </article>
            <article className="feature-card">
              <h3>Calm finish</h3>
              <p>Expect a thoughtful, high-touch experience from consultation to aftercare.</p>
            </article>
          </div>
        </section>

        <section className="section" id="services">
          <div className="section-heading">
            <p className="eyebrow">Services</p>
            <h2>Lash and nail rituals designed to feel elevated.</h2>
          </div>

          <div className="card-grid">
            {services.map((service) => (
              <article className="service-card" key={service.name}>
                <div className="service-card-top">
                  <span className="pill">Signature</span>
                  <p className="price">{service.price}</p>
                </div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="section-heading">
            <p className="eyebrow">Pricing</p>
            <h2>Clear pricing for every signature treatment.</h2>
          </div>
          <div className="pricing-grid">
            {pricing.map((item) => (
              <article className="pricing-card" key={item.name}>
                <h3>{item.name}</h3>
                <p className="price">{item.price}</p>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section booking-section" id="booking">
          <div className="section-heading">
            <p className="eyebrow">Booking</p>
            <h2>Reserve your appointment and secure your deposit.</h2>
          </div>

          <div className="booking-grid">
            <div className="confirmation-card large-card">
              <p className="eyebrow">Reserve your visit</p>
              <h3>Choose your service, preferred date, and let the studio do the rest.</h3>
              <p>
                A dedicated booking page keeps your appointment request beautifully organised and easy to manage.
              </p>
              <Link className="button primary" to="/bookings">
                Open booking page
              </Link>
            </div>
            <div className="info-stack">
              <div className="mini-card">
                <h3>What to expect</h3>
                <p>Fast confirmation, deposit guidance, and a calm, polished experience from start to finish.</p>
              </div>
              <div className="mini-card">
                <h3>Before you arrive</h3>
                <p>Bring inspiration, share your preferred finish, and let us tailor your look beautifully.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function BookingPage() {
  const [formData, setFormData] = useState<BookingForm>(initialForm)
  const [confirmation, setConfirmation] = useState('')
  const [availabilityMessage, setAvailabilityMessage] = useState('')
  const navigate = useNavigate()

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleAddOnToggle = (addOn: string) => {
    setFormData((current) => ({
      ...current,
      addOns: current.addOns.includes(addOn)
        ? current.addOns.filter((item) => item !== addOn)
        : [...current.addOns, addOn],
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.name || !formData.phone || !formData.email || !formData.date || !formData.time) {
      setConfirmation('Please complete your name, phone, email, date, and time to reserve your appointment.')
      return
    }

    const depositAmount = formData.service === 'Classic Lash Lift' ? 50 : 75
    const availability = formData.date && formData.time ? 'Available' : 'Pending review'
    setAvailabilityMessage(`${availability} — deposit of GHS ${depositAmount} is required to confirm your booking.`)

    try {
      const response = await fetch('http://localhost:4000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'Pending Deposit', depositAmount }),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      setConfirmation(`Thank you, ${formData.name}. Your request is now pending deposit payment. Once paid, your booking will be confirmed and you will receive an email notification.`)
      setFormData(initialForm)
      navigate('/policies')
    } catch {
      setConfirmation('Your booking could not be sent right now. Please email hello@naurellebeauty.com directly.')
    }
  }

  return (
    <div className="page">
      <div className="page-topbar">
        <Link className="back-link" to="/">
          ← Back home
        </Link>
      </div>
      <section className="section booking-section">
        <div className="section-heading">
          <p className="eyebrow">Book</p>
          <h2>Reserve your appointment and secure your deposit.</h2>
        </div>

        <div className="booking-grid">
          <form className="booking-form" onSubmit={handleSubmit}>
            <label>
              Service
              <select name="service" value={formData.service} onChange={handleChange}>
                <option>Classic Lash Lift</option>
                <option>Gel Manicure</option>
                <option>Hybrid Fill</option>
              </select>
            </label>
            <label>
              Date
              <input name="date" type="date" value={formData.date} onChange={handleChange} />
            </label>
            <label>
              Time
              <select name="time" value={formData.time} onChange={handleChange}>
                <option>10:00</option>
                <option>12:00</option>
                <option>14:00</option>
                <option>16:00</option>
                <option>18:00</option>
              </select>
            </label>
            <label>
              Technician
              <select name="technician" value={formData.technician} onChange={handleChange}>
                <option>Any available</option>
                <option>Naurelle</option>
                <option>Assistant</option>
              </select>
            </label>
            <fieldset className="add-ons">
              <legend>Add-ons</legend>
              <label>
                <input type="checkbox" checked={formData.addOns.includes('Lash tint')} onChange={() => handleAddOnToggle('Lash tint')} />
                Lash tint (+GHS 20)
              </label>
              <label>
                <input type="checkbox" checked={formData.addOns.includes('Nail art')} onChange={() => handleAddOnToggle('Nail art')} />
                Nail art (+GHS 15)
              </label>
            </fieldset>
            <label>
              Full name
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Your name" />
            </label>
            <label>
              Phone number
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="0551234567" />
            </label>
            <label>
              Email
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
            </label>
            <label>
              Instagram handle (optional)
              <input name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@yourhandle" />
            </label>
            <label>
              Special notes
              <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Share your preferred style or any details" />
            </label>
            <button className="button primary" type="submit">
              Proceed to deposit
            </button>
          </form>

          <aside className="confirmation-card">
            <h3>Booking summary</h3>
            <p>
              Your appointment request will be checked for availability first. Once approved, a deposit is required before the booking is confirmed.
            </p>
            {availabilityMessage ? <p className="confirmation">{availabilityMessage}</p> : null}
            {confirmation ? <p className="confirmation">{confirmation}</p> : null}
          </aside>
        </div>
      </section>
    </div>
  )
}

function ServicesPage() {
  return (
    <div className="page">
      <div className="page-topbar">
        <Link className="back-link" to="/">
          ← Back home
        </Link>
      </div>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Services</p>
          <h2>Signature treatments for every mood and moment.</h2>
          <p className="hero-text">
            Discover elevated salon care with polished finishes, restorative detail, and a calm studio atmosphere.
          </p>
        </div>
        <div className="card-grid">
          {services.map((service) => (
            <article className="service-card" key={service.name}>
              <div className="service-card-top">
                <span className="pill">Signature</span>
                <p className="price">{service.price}</p>
              </div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function GalleryPage() {
  return (
    <div className="page">
      <div className="page-topbar">
        <Link className="back-link" to="/">
          ← Back home
        </Link>
      </div>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Gallery</p>
          <h2>Signature looks that speak to soft luxury.</h2>
          <p className="hero-text">
            A look at the sculpted finishes and polished details that define the Naurélle experience.
          </p>
        </div>
        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <article className={`gallery-card ${index === 1 ? 'gallery-card--featured' : ''}`} key={item.title}>
              <img src={item.image} alt={item.title} className="gallery-image" />
              <div className="gallery-card-body">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function PoliciesPage() {
  return (
    <div className="page">
      <div className="page-topbar">
        <Link className="back-link" to="/">
          ← Back home
        </Link>
      </div>
      <section className="section split">
        <div className="policy-intro">
          <p className="eyebrow">Policies</p>
          <h2>Everything you need before your appointment.</h2>
          <p className="hero-text">
            We keep your booking experience simple, transparent, and beautifully organised.
          </p>
        </div>
        <div className="policy-stack">
          <div className="mini-card">
            <h3>Booking essentials</h3>
            <ul className="policy-list">
              <li>Deposit is required to secure your booking.</li>
              <li>Late arrivals may require a shortened service.</li>
              <li>Cancellation with 24 hours notice is eligible for deposit transfer.</li>
            </ul>
          </div>
          <div className="mini-card">
            <h3>Studio notes</h3>
            <ul className="policy-list">
              <li>All services are provided in a clean, professional environment.</li>
              <li>Bring inspiration photos for a more tailored finish.</li>
              <li>We’ll guide your prep and aftercare with care.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const closeMenu = () => setMenuOpen(false)

  return (
    <div>
      <nav className="top-nav">
        <Link to="/" className="brand-mark" onClick={closeMenu}>
          <img src="/hero.png" alt="logo" />
          <span>Naurélle Beauty</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/bookings" onClick={closeMenu} className={location.pathname === '/bookings' ? 'active' : ''}>
            Bookings
          </Link>
          <Link to="/services" onClick={closeMenu} className={location.pathname === '/services' ? 'active' : ''}>
            Services
          </Link>
          <Link to="/gallery" onClick={closeMenu} className={location.pathname === '/gallery' ? 'active' : ''}>
            Gallery
          </Link>
          <Link to="/policies" onClick={closeMenu} className={location.pathname === '/policies' ? 'active' : ''}>
            Policies
          </Link>
          <Link className="button nav-cta" to="/bookings" onClick={closeMenu}>
            Book now
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/bookings" element={<BookingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/policies" element={<PoliciesPage />} />
      </Routes>
    </div>
  )
}

export default App
