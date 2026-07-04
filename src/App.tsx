import { useState } from 'react'
import { Link, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import './App.css'

type Service = {
  name: string
  price: string
  description: string
}

type BookingForm = {
  name: string
  email: string
  service: string
  date: string
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
  name: '',
  email: '',
  service: 'Classic Lash Lift',
  date: '',
  notes: '',
}

function MainPage() {
  const [formData, setFormData] = useState<BookingForm>(initialForm)
  const [confirmation, setConfirmation] = useState('')
  const navigate = useNavigate()

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.name || !formData.email || !formData.date) {
      setConfirmation('Please complete your name, email, and preferred date to reserve your appointment.')
      return
    }

    try {
      const response = await fetch('http://localhost:4000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      setConfirmation(`Thank you, ${formData.name}. Your ${formData.service} request has been received. A deposit will be confirmed by email shortly.`)
      setFormData(initialForm)
      navigate('/policies')
    } catch {
      setConfirmation('Your booking could not be sent right now. Please email hello@naurellebeauty.com directly.')
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">NAURÉLLE Beauty • Lashes & Nails</p>
          <h1>Soft luxury beauty, crafted for your glow.</h1>
          <p className="hero-text">
            Discover a refined beauty experience with polished nails, lifted lashes, and calm,
            professional care designed around your style.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/services">
              Explore services
            </Link>
            <Link className="button secondary" to="/gallery">
              View gallery
            </Link>
          </div>
        </div>

        <aside className="hero-card">
          <img src="/hero-illustration.svg" alt="Naurélle Beauty illustration" className="hero-image" />
          <span className="pill">Signature glow</span>
          <h2>Elegant, feminine, and beautifully minimal.</h2>
          <p>
            Every visit is designed to feel indulgent, clean, and effortless, from the first
            consultation to your final reveal.
          </p>
          <ul>
            <li>Premium-quality products</li>
            <li>Clean, professional studio experience</li>
            <li>Tailored colour and finish matching</li>
          </ul>
        </aside>
      </header>

      <main>
        <section className="section" id="services">
          <div className="section-heading">
            <p className="eyebrow">Services</p>
            <h2>Lash and nail rituals designed to feel elevated.</h2>
          </div>

          <div className="card-grid">
            {services.map((service) => (
              <article className="service-card" key={service.name}>
                <h3>{service.name}</h3>
                <p className="price">{service.price}</p>
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
            <form className="booking-form" onSubmit={handleSubmit}>
              <label>
                Full name
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Your name" />
              </label>
              <label>
                Email
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
              </label>
              <label>
                Service
                <select name="service" value={formData.service} onChange={handleChange}>
                  <option>Classic Lash Lift</option>
                  <option>Gel Manicure</option>
                  <option>Hybrid Fill</option>
                </select>
              </label>
              <label>
                Preferred date
                <input name="date" type="date" value={formData.date} onChange={handleChange} />
              </label>
              <label>
                Notes
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Share your preferred style or any details" />
              </label>
              <button className="button primary" type="submit">
                Reserve now
              </button>
            </form>

            <aside className="confirmation-card">
              <h3>What to expect</h3>
              <p>
                A required deposit will be taken to secure your booking, and you will receive a
                confirmation once your request is received.
              </p>
              {confirmation ? <p className="confirmation">{confirmation}</p> : null}
            </aside>
          </div>
        </section>
      </main>
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
          <h2>Luxurious treatments tailored to your style.</h2>
        </div>
        <div className="card-grid">
          {services.map((service) => (
            <article className="service-card" key={service.name}>
              <h3>{service.name}</h3>
              <p className="price">{service.price}</p>
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
        </div>
        <div className="card-grid">
          {galleryItems.map((item) => (
            <article className="gallery-card" key={item.title}>
              <img src={item.image} alt={item.title} className="gallery-image" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
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
        <div>
          <p className="eyebrow">Policies</p>
          <h2>Everything you need before your appointment.</h2>
        </div>
        <ul className="policy-list">
          <li>Deposit is required to secure your booking.</li>
          <li>Late arrivals may require a shortened service.</li>
          <li>Cancellation with 24 hours notice is eligible for deposit transfer.</li>
          <li>All services are provided in a clean, professional environment.</li>
        </ul>
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
          <img src="/logo.svg" alt="Naurélle Beauty logo" />
          <span>NAURÉLLE Beauty</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/services" onClick={closeMenu} className={location.pathname === '/services' ? 'active' : ''}>
            Services
          </Link>
          <Link to="/gallery" onClick={closeMenu} className={location.pathname === '/gallery' ? 'active' : ''}>
            Gallery
          </Link>
          <Link to="/policies" onClick={closeMenu} className={location.pathname === '/policies' ? 'active' : ''}>
            Policies
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/policies" element={<PoliciesPage />} />
      </Routes>
    </div>
  )
}

export default App
