import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, Sparkles } from 'lucide-react'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>Naurélle Beauty</h3>
          <p>
            Soft luxury beauty studio specializing in sculpted lash lifts, natural hybrid fills, and glossy gel manicures tailored around your calm ritual.
          </p>
          <div className="pill-badge gold">
            <Sparkles size={14} />
            <span>Private Appointment Studio</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services Menu</Link></li>
            <li><Link to="/gallery">Gallery Showcase</Link></li>
            <li><Link to="/bookings">Book Appointment</Link></li>
            <li><Link to="/policies">Policies & Etiquette</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Studio Hours</h4>
          <ul>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: 'var(--color-gold)' }} />
              <span>Mon – Fri: 10:00 AM – 7:00 PM</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: 'var(--color-gold)' }} />
              <span>Saturday: 10:00 AM – 5:00 PM</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: '#E57373' }} />
              <span>Sunday: Closed</span>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact & Location</h4>
          <ul>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} style={{ color: 'var(--color-gold)' }} />
              <span>12A Abelenkpe Rd, East Legon, Accra</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} style={{ color: 'var(--color-gold)' }} />
              <span>+233 55 123 4567</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} style={{ color: 'var(--color-gold)' }} />
              <span>hello@naurellebeauty.com</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-baby-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              <a href="https://instagram.com/naurellebeauty" target="_blank" rel="noreferrer">@naurellebeauty</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Naurélle Beauty Studio. All rights reserved.</p>
        <p>Designed with soft luxury & elegance.</p>
      </div>
    </footer>
  )
}
