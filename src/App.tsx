import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/HomePage'
import { AuthProvider } from './context/AuthContext'
import './App.css'

export function App() {
  return (
    <AuthProvider>
      <div className="app-wrapper">
        <Navbar />
        <HomePage />
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
