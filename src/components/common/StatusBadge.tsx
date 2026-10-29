import React from 'react'
import { IncidentStatus } from '../../types'
import { Clock, CheckCircle2, ShieldAlert, UserCheck, XCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: IncidentStatus
  size?: 'sm' | 'md' | 'lg'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'SUBMITTED':
        return {
          label: 'SUBMITTED',
          icon: Clock,
          bg: '#fef3c7',
          color: '#92400e',
          borderColor: '#fcd34d',
        }
      case 'ACKNOWLEDGED':
        return {
          label: 'ACKNOWLEDGED',
          icon: ShieldAlert,
          bg: '#e0f2fe',
          color: '#0369a1',
          borderColor: '#7dd3fc',
        }
      case 'ASSIGNED':
        return {
          label: 'ASSIGNED',
          icon: UserCheck,
          bg: '#ede9fe',
          color: '#6d28d9',
          borderColor: '#c4b5fd',
        }
      case 'RESOLVED':
        return {
          label: 'RESOLVED',
          icon: CheckCircle2,
          bg: '#dcfce7',
          color: '#15803d',
          borderColor: '#86efac',
        }
      case 'CANCELLED':
        return {
          label: 'CANCELLED',
          icon: XCircle,
          bg: '#f1f5f9',
          color: '#475569',
          borderColor: '#cbd5e1',
        }
      default:
        return {
          label: status,
          icon: Clock,
          bg: '#f1f5f9',
          color: '#475569',
          borderColor: '#cbd5e1',
        }
    }
  }

  const { label, icon: Icon, bg, color, borderColor } = getBadgeConfig()

  const fontSizes = {
    sm: '0.75rem',
    md: '0.8125rem',
    lg: '0.9375rem',
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }

  const paddings = {
    sm: '2px 8px',
    md: '4px 10px',
    lg: '6px 14px',
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${borderColor}`,
        borderRadius: '9999px',
        padding: paddings[size],
        fontSize: fontSizes[size],
        fontWeight: 600,
        letterSpacing: '0.02em',
        lineHeight: 1.2,
      }}
    >
      <Icon size={iconSizes[size]} />
      {label}
    </span>
  )
}
