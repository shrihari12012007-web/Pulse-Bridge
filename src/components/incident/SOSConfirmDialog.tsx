import React, { useState, useEffect } from 'react'
import { AlertOctagon, X, Check, ShieldAlert, MapPin, Heart } from 'lucide-react'

interface SOSConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting?: boolean
  locationSummary?: string
  medicalSummary?: string
}

export const SOSConfirmDialog: React.FC<SOSConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  locationSummary,
  medicalSummary,
}) => {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3)
      return
    }
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, countdown])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-dialog-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '460px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          border: '2px solid #ef4444',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#fee2e2',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #fecaca',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <AlertOctagon size={22} />
            </div>
            <div>
              <h2 id="sos-dialog-title" style={{ fontSize: '1.125rem', fontWeight: 800, color: '#991b1b' }}>
                Confirm Emergency SOS
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>
                Accidental Activation Protection
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cancel emergency SOS"
            style={{
              padding: '6px',
              borderRadius: '6px',
              color: '#991b1b',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.9375rem', color: '#334155', lineHeight: 1.5 }}>
            Are you sure you want to broadcast an emergency distress signal? 
            Authorized emergency coordinators will be alerted with your coordinates.
          </p>

          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '0.875rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.8125rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7' }}>
              <MapPin size={16} />
              <span><strong>Location:</strong> {locationSummary || 'Acquiring GPS fix...'}</span>
            </div>
            {medicalSummary && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
                <Heart size={16} />
                <span><strong>Consented Medical:</strong> {medicalSummary}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
              <ShieldAlert size={16} />
              <span>Priority: <strong>CRITICAL</strong></span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: '#92400e',
            }}
          >
            This action registers an active alert in the responder system. Dial 112 directly if life-threatening.
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Cancel / False Alarm
          </button>

          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{
              padding: '10px 22px',
              borderRadius: '8px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
            }}
          >
            {isSubmitting ? (
              <span>Broadcasting Alert...</span>
            ) : (
              <>
                <Check size={18} />
                <span>{countdown > 0 ? `Confirm SOS (${countdown}s)` : 'Confirm Emergency SOS'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
