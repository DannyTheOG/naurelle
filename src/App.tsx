import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/HomePage'
import './App.css'

export function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <HomePage />
      <Footer />
    </div>
  )
}

export default App
