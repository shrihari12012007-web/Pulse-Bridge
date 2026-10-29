import React from 'react'
import { 
  ShieldCheck, 
  MapPin, 
  Wifi, 
  PhoneCall, 
  Database, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  Server,
  Lock,
  Layers
} from 'lucide-react'
import { getBackendStatus } from '../services/supabase'
import { useIncidents } from '../context/IncidentContext'

export const SettingsHelpPage: React.FC = () => {
  const backend = getBackendStatus()
  const { isSimulatedOffline, toggleSimulatedOffline, resetDemoData } = useIncidents()

  return (
    <div style={{ padding: '1.5rem 1rem 3.5rem', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '880px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Settings, Help & Technical Disclosures
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            BUILDATHON 2.0 • Problem Statement H4: Emergency Health Assistance
          </p>
        </div>

        {/* Backend & Environment Telemetry Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Server size={22} color={backend.configured ? '#16a34a' : '#d97706'} />
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
                  Supabase Cloud Backend Integration
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  PostgreSQL Database • Row-Level Security • Realtime Replication
                </div>
              </div>
            </div>
            <span
              style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: backend.configured ? '#dcfce7' : '#fef3c7',
                color: backend.configured ? '#166534' : '#92400e',
                border: `1px solid ${backend.configured ? '#86efac' : '#fde68a'}`,
              }}
            >
              {backend.configured ? 'CONNECTED (LIVE)' : 'DEMO MODE ACTIVE'}
            </span>
          </div>

          <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
            {backend.configured ? (
              <>
                Successfully connected to Supabase project at <code>{backend.url}</code>. 
                Incidents and audit events synchronize in real-time with remote PostgreSQL tables.
              </>
            ) : (
              <>
                PulseBridge is operating in high-fidelity <strong>Demo Mode</strong> with mock data and local storage persistence.
                To connect your live Supabase database, set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your <code>.env.local</code> file.
              </>
            )}
          </p>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={toggleSimulatedOffline}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: isSimulatedOffline ? '#fee2e2' : '#f1f5f9',
                color: isSimulatedOffline ? '#991b1b' : '#334155',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
              }}
            >
              {isSimulatedOffline ? 'Restore Network Connection' : 'Simulate Network Outage'}
            </button>
            <button
              onClick={() => {
                resetDemoData()
                alert('Demo incidents restored to initial sample state.')
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
              }}
            >
              Reset Fictional Incidents
            </button>
          </div>
        </div>

        {/* Location Permissions & Privacy */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={22} color="#0284c7" />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
              Location Permissions & Privacy Policy
            </h3>
          </div>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6 }}>
            <li>
              <strong>On-Demand Querying:</strong> PulseBridge requests device geolocation only when an emergency is created or coordinates are explicitly checked.
            </li>
            <li>
              <strong>No Background Tracking:</strong> No background location tracking or continuous battery-draining GPS monitoring is performed.
            </li>
            <li>
              <strong>Manual Fallback:</strong> If GPS is denied or blocked indoors, the manual landmark description input guarantees responders still receive room/floor location data.
            </li>
            <li>
              <strong>Accuracy Verification:</strong> GPS accuracy radius (in meters) is logged alongside latitude/longitude to assist responders in assessing fix confidence.
            </li>
          </ul>
        </div>

        {/* Network & Alert Limitations (Truthful Disclosures) */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={22} color="#d97706" />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
              Network & Alert Delivery Disclosures
            </h3>
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p>
              In accordance with hackathon competition guidelines, we disclose which alert channels are functional vs. simulated:
            </p>
            <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div><strong>Functional Features:</strong> In-browser emergency incident creation, Leaflet GPS interactive mapping, CAD responder status transitions (SUBMITTED &rarr; ACKNOWLEDGED &rarr; ASSIGNED &rarr; RESOLVED), offline draft preservation, and direct 112 telephony shortcut.</div>
              <div style={{ marginTop: '6px' }}><strong>Simulated Features:</strong> Automated SMS / WhatsApp push notifications and external municipal 911/112 dispatch center integrations are demonstrated structurally but require verified telecom gateway credentials.</div>
            </div>
          </div>
        </div>

        {/* Official India Emergency Helplines */}
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PhoneCall size={22} color="#dc2626" />
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#991b1b' }}>
              Official National Emergency Helplines (India)
            </h3>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#7f1d1d', margin: 0, lineHeight: 1.5 }}>
            PulseBridge provides a coordination layer for events, college campuses, and industrial facilities.
            In any critical emergency, immediately dial the following toll-free numbers:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '6px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#b91c1c' }}>112</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>National All-in-One Helpline</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#b91c1c' }}>108 / 102</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Emergency Medical & Ambulance</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#b91c1c' }}>100</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Police Emergency Control Room</div>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 900, color: '#b91c1c' }}>101</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Fire & Rescue Services</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
