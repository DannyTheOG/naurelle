import { ServicesSection } from '../components/sections/ServicesSection'
import { PricingSection } from '../components/sections/PricingSection'
import { FaqSection } from '../components/sections/FaqSection'

export function ServicesPage() {
  return (
    <div className="page-wrapper">
      <ServicesSection />
      <PricingSection />
      <FaqSection />
    </div>
  )
}
