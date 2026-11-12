import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/HomePage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { AuthProvider } from './context/AuthContext'
import './App.css'

export function App() {
  return (
    <AuthProvider>
      <div className="app-wrapper">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
