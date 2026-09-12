export type ServiceLengthOption = {
  id: string
  name: string
  magnets?: number
  price: number
  displayPrice: string
}

export type ServiceItem = {
  id: string
  name: string
  category: 'gel-x' | 'builder-gel' | 'acrylic' | 'refill' | 'soak-off' | 'toes'
  basePrice: number
  displayPrice: string
  description: string
  hasLengths: boolean
  lengthOptions?: ServiceLengthOption[]
}

export type ToeServiceItem = {
  id: string
  name: string
  price: number
  displayPrice: string
  description?: string
}

export type GalleryCategory = 'all' | 'minimalist' | 'nail-art' | 'gel-x' | 'builder-gel' | 'acrylic' | 'toes'

export type GalleryItem = {
  id: string
  title: string
  category: GalleryCategory
  categoryLabel: string
  image: string
  alt: string
}

export type DayHours = {
  day: string
  hours: string
  isClosed?: boolean
}

export type StudioConfig = {
  name: string
  tagline: string
  heroHeadline: string
  heroSupportingText: string
  brandStatementHeadline: string
  brandStatementBody: string
  address: {
    line1: string
    area: string
    city: string
    fullDisplay: string
    googleMapsLink: string
    embedMapUrl: string
  }
  contact: {
    whatsappNumber: string
    whatsappDisplay: string
    whatsappDefaultMessage: string
    phoneDisplay: string
    email: string
    instagramHandle: string
    instagramUrl: string
  }
  hours: DayHours[]
  services: ServiceItem[]
  toeServices: ToeServiceItem[]
  availableTimes: string[]
}

export type BookingSelection = {
  serviceId: string
  serviceName: string
  lengthId?: string
  lengthName?: string
  toeServiceId?: string
  toeServiceName?: string
  date: string
  time: string
  price: number
  clientName: string
  clientPhone: string
  clientEmail: string
  notes: string
}
