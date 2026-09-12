import type { StudioConfig, GalleryItem } from '../types'

/**
 * Naurèlle Beauty Studio Configuration
 * All business details, service pricing, lengths, studio hours, and contact channels are centralized here.
 * Note: Real contact numbers and hours should be edited here by the business owner.
 */
export const studioConfig: StudioConfig = {
  name: 'Naurèlle Beauty',
  tagline: 'Minimalist Nails & Nail Art',
  heroHeadline: 'Minimal nails.\nBeautifully done.',
  heroSupportingText:
    'Specializing in minimalist nails, nail art, builder gel overlays, Russian manicures, Gel X and acrylic services.',
  brandStatementHeadline: 'Nails, refined.',
  brandStatementBody:
    'Thoughtfully designed nail services for those who appreciate clean details, timeless style, and beautifully finished nails.',
  
  address: {
    line1: '[Studio Address Line — Editable]',
    area: 'East Legon',
    city: 'Accra',
    fullDisplay: 'East Legon, Accra [Studio Address — Editable in config]',
    googleMapsLink: 'https://maps.google.com/?q=East+Legon+Accra',
    embedMapUrl: 'https://www.google.com/maps?q=East%20Legon%20Accra&z=14&output=embed'
  },

  contact: {
    // Configurable WhatsApp connection — replace with actual studio number (e.g. 233XXXXXXXXX)
    whatsappNumber: '233550000000',
    whatsappDisplay: '+233 55 000 0000 [Editable]',
    whatsappDefaultMessage: 'Hello Naurèlle Beauty, I would like to enquire about an appointment / home service.',
    phoneDisplay: '+233 55 000 0000 [Editable]',
    email: 'hello@naurellebeauty.com [Editable]',
    instagramHandle: '@naurellebeauty',
    instagramUrl: 'https://instagram.com/naurellebeauty'
  },

  hours: [
    { day: 'Monday – Friday', hours: '09:00 — 18:00' },
    { day: 'Saturday', hours: '10:00 — 17:00' },
    { day: 'Sunday', hours: 'Closed', isClosed: true }
  ],

  services: [
    {
      id: 'soak-off',
      name: 'Soak Off',
      category: 'soak-off',
      basePrice: 50,
      displayPrice: '₵50',
      description: 'Gentle, non-damaging removal of previous gel or extensions, followed by nourishing cuticle treatment.',
      hasLengths: false
    },
    {
      id: 'gel-x',
      name: 'Gel X',
      category: 'gel-x',
      basePrice: 170,
      displayPrice: 'From ₵170',
      description: 'Full-cover soft gel tip extensions applied with builder gel for an impeccably sleek, natural look.',
      hasLengths: true,
      lengthOptions: [
        { id: 'gel-x-short', name: 'Short', magnets: 3, price: 170, displayPrice: '₵170' },
        { id: 'gel-x-medium', name: 'Medium', magnets: 6, price: 210, displayPrice: '₵210' },
        { id: 'gel-x-long', name: 'Long', magnets: 9, price: 260, displayPrice: '₵260' },
        { id: 'gel-x-xl', name: 'Extra Long', magnets: 12, price: 310, displayPrice: '₵310' }
      ]
    },
    {
      id: 'builder-gel',
      name: 'Builder Gel',
      category: 'builder-gel',
      basePrice: 210,
      displayPrice: '₵210',
      description: 'Strengthening overlay over natural nails creating a durable, pristine apex and high-gloss nude finish.',
      hasLengths: false
    },
    {
      id: 'acrylic',
      name: 'Acrylic',
      category: 'acrylic',
      basePrice: 180,
      displayPrice: 'From ₵180',
      description: 'Custom sculpted acrylic sets tailored to your preferred silhouette (almond, square, coffin, or squoval).',
      hasLengths: true,
      lengthOptions: [
        { id: 'acrylic-short', name: 'Short', price: 180, displayPrice: '₵180' },
        { id: 'acrylic-medium', name: 'Medium', price: 210, displayPrice: '₵210' },
        { id: 'acrylic-long', name: 'Long', price: 250, displayPrice: '₵250' },
        { id: 'acrylic-xl', name: 'Extra Long', price: 350, displayPrice: '₵350' }
      ]
    },
    {
      id: 'refill',
      name: 'Refill',
      category: 'refill',
      basePrice: 150,
      displayPrice: 'From ₵150',
      description: 'Precision infill for existing acrylic or gel sets, re-balancing the apex, re-shaping, and refreshing top coat.',
      hasLengths: true,
      lengthOptions: [
        { id: 'refill-short', name: 'Short', price: 150, displayPrice: '₵150' },
        { id: 'refill-medium', name: 'Medium', price: 180, displayPrice: '₵180' },
        { id: 'refill-long', name: 'Long', price: 220, displayPrice: '₵220' }
      ]
    }
  ],

  toeServices: [
    {
      id: 'toes-acrylic',
      name: 'Acrylic Toes',
      price: 140,
      displayPrice: '₵140',
      description: 'Clean sculpted acrylic application for toes with balanced natural proportion.'
    },
    {
      id: 'toes-builder-gel',
      name: 'Builder Gel Toes',
      price: 100,
      displayPrice: '₵100',
      description: 'Strengthening builder overlay protecting natural toenails with durable shine.'
    },
    {
      id: 'toes-gel-polish',
      name: 'Gel Polish Toes',
      price: 50,
      displayPrice: '₵50',
      description: 'Precision dry pedicure cuticle tidy and flawless chip-resistant gel polish coat.'
    },
    {
      id: 'toes-stick-on',
      name: 'Stick On Toes',
      price: 80,
      displayPrice: '₵80',
      description: 'Quick, refined press-on toe set styled with elegant minimalist finish.'
    }
  ],

  availableTimes: [
    '09:30 AM',
    '11:00 AM',
    '01:00 PM',
    '02:30 PM',
    '04:00 PM',
    '05:30 PM'
  ]
}

/**
 * Editorial Gallery items
 */
export const galleryItems: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Clean Minimalist Manicure',
    category: 'minimalist',
    categoryLabel: 'Minimalist Nails',
    image: '/naurelle-hero.jpg',
    alt: 'Minimalist Russian manicure on natural almond nails'
  },
  {
    id: 'gal-2',
    title: 'Soft Blush BIAB Overlay',
    category: 'builder-gel',
    categoryLabel: 'Builder Gel',
    image: '/builder-gel.png',
    alt: 'BIAB Builder gel overlay in sheer blush'
  },
  {
    id: 'gal-3',
    title: 'Sculpted Neutral Acrylic',
    category: 'acrylic',
    categoryLabel: 'Acrylic',
    image: '/acrylic-set.png',
    alt: 'Sculpted neutral square acrylic set'
  },
  {
    id: 'gal-4',
    title: 'Editorial Gel X Slender Almond',
    category: 'gel-x',
    categoryLabel: 'Gel X',
    image: '/gel-manicure.png',
    alt: 'Gel X almond set with glossy clear finish'
  },
  {
    id: 'gal-5',
    title: 'Refined Micro Nail Art',
    category: 'nail-art',
    categoryLabel: 'Nail Art',
    image: '/naurelle-art.jpg',
    alt: 'Minimalist micro nail art with delicate subtle gold line'
  },
  {
    id: 'gal-6',
    title: 'Minimalist Clean Toe Care',
    category: 'toes',
    categoryLabel: 'Toes',
    image: '/naurelle-toes.jpg',
    alt: 'Clean neutral tone gel polish pedicure'
  }
]
