import React from 'react'
import { IncidentEvent } from '../../types'
import { Clock, ShieldCheck, UserCheck, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

interface IncidentTimelineProps {
  events?: IncidentEvent[]
  createdAt: string
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ events = [], createdAt }) => {
  const getIconForStatus = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return { icon: Clock, color: '#d97706', bg: '#fef3c7' }
      case 'ACKNOWLEDGED':
        return { icon: ShieldCheck, color: '#0284c7', bg: '#e0f2fe' }
      case 'ASSIGNED':
        return { icon: UserCheck, color: '#7c3aed', bg: '#ede9fe' }
      case 'RESOLVED':
        return { icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7' }
      case 'CANCELLED':
        return { icon: XCircle, color: '#64748b', bg: '#f1f5f9' }
      default:
        return { icon: AlertCircle, color: '#64748b', bg: '#f1f5f9' }
    }
  }

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
        ' (' + d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')'
    } catch {
      return iso
    }
  }

  if (events.length === 0) {
    return (
      <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
        Created on {formatTimestamp(createdAt)}. No further status updates recorded.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
      {events.map((evt, idx) => {
        const { icon: Icon, color, bg } = getIconForStatus(evt.new_status)
        const isLast = idx === events.length - 1

        return (
          <div
            key={evt.id || idx}
            style={{
              display: 'flex',
              gap: '14px',
              position: 'relative',
              paddingBottom: isLast ? '0' : '20px',
            }}
          >
            {/* Vertical connector line */}
            {!isLast && (
              <div
                style={{
                  position: 'absolute',
                  left: '17px',
                  top: '34px',
                  bottom: '0',
                  width: '2px',
                  backgroundColor: '#e2e8f0',
                }}
              />
            )}

            {/* Icon Bubble */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: bg,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                zIndex: 1,
                border: `2px solid ${color}`,
              }}
            >
              <Icon size={18} />
            </div>

            {/* Content Details */}
            <div style={{ flex: 1, paddingTop: '2px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {evt.new_status}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatTimestamp(evt.created_at)}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                {evt.event_description}
              </p>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Recorded by: <strong>{evt.actor_name}</strong> ({evt.actor_role})
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
