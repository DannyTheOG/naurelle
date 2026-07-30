import { CheckCircle, AlertCircle, X } from 'lucide-react'

type ToastProps = {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  return (
    <div className="toast-container">
      <div
        className="toast"
        style={{
          borderLeftColor: type === 'error' ? '#E57373' : 'var(--color-gold)'
        }}
      >
        {type === 'error' ? (
          <AlertCircle size={20} style={{ color: '#E57373' }} />
        ) : (
          <CheckCircle size={20} style={{ color: 'var(--color-gold)' }} />
        )}
        <span>{message}</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', marginLeft: '12px', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
