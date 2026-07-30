import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ScrollToTop } from './components/ScrollToTop'

import { HomePage } from './pages/HomePage'
import { BookingPage } from './pages/BookingPage'
import { ServicesPage } from './pages/ServicesPage'
import { GalleryPage } from './pages/GalleryPage'
import { PoliciesPage } from './pages/PoliciesPage'
import { ContactPage } from './pages/ContactPage'

import './App.css'

export function App() {
  return (
    <div className="app-container">
      <ScrollToTop />
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bookings" element={<BookingPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
