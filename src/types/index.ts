export type Service = {
  id: string
  name: string
  price: string
  priceValue: number
  duration: string
  category: 'lashes' | 'nails' | 'combo'
  description: string
  highlights: string[]
  image: string
  popular?: boolean
}

export type PricingItem = {
  name: string
  price: string
  category: string
  note: string
  features: string[]
  popular?: boolean
}

export type GalleryItem = {
  id: string
  title: string
  category: 'lashes' | 'nails' | 'studio'
  description: string
  image: string
  featured?: boolean
}

export type BookingForm = {
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

export type Testimonial = {
  name: string
  role: string
  rating: number
  comment: string
  treatment: string
  date: string
}

export type FAQItem = {
  question: string
  answer: string
  category: string
}
