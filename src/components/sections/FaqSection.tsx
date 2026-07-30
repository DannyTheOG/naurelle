import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import type { FAQItem } from '../../types'

const faqData: FAQItem[] = [
  {
    question: 'How long does a lash lift ritual last?',
    answer: 'A Classic Lash Lift typically lasts 6 to 8 weeks depending on your natural lash growth cycle. We include an aftercare keratin guide to maximize longevity.',
    category: 'Lashes'
  },
  {
    question: 'Why is a deposit required for bookings?',
    answer: 'Deposits (GHS 50 for Classic Lash Lift & GHS 75 for other services) secure your dedicated appointment slot in our private studio space. Deposits are deducted from your final total upon arrival.',
    category: 'Booking'
  },
  {
    question: 'Can I reschedule my appointment?',
    answer: 'Yes! You can reschedule up to 24 hours prior to your scheduled time without forfeiting your deposit by contacting us directly.',
    category: 'Policies'
  },
  {
    question: 'How should I prepare before my visit?',
    answer: 'We kindly request arriving with clean eyelashes and hands free of heavy oils or waterproof makeup. Avoid extra guests to maintain our tranquil studio atmosphere.',
    category: 'Etiquette'
  }
]

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section className="section" style={{ padding: '48px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <span>Questions & Answers</span>
        </div>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle" style={{ margin: '0 auto' }}>
          Everything you need to know about booking, studio etiquette, and treatment aftercare.
        </p>
      </div>

      <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {faqData.map((faq, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              className="glass-card"
              key={idx}
              style={{ overflow: 'hidden', border: isOpen ? '1px solid var(--color-pink-accent)' : '1px solid var(--color-border-subtle)' }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  color: 'var(--color-charcoal)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <HelpCircle size={18} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                  <span>{faq.question}</span>
                </div>
                <ChevronDown
                  size={18}
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                    color: 'var(--color-pink-accent-dark)'
                  }}
                />
              </button>

              {isOpen && (
                <div style={{ padding: '0 24px 20px 54px', color: 'var(--color-charcoal-muted)', fontSize: '0.94rem', lineHeight: 1.6, animation: 'fadeIn 0.2s ease' }}>
                  {faq.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
