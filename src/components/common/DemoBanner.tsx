import React from 'react'
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useIncidents } from '../../context/IncidentContext'

export const DemoBanner: React.FC = () => {
  const { isDemoMode, isSimulatedOffline, toggleSimulatedOffline, resetDemoData } = useIncidents()

  return (
    <aside
      role="region"
      aria-label="Simulation Status and Demo Banner"
      style={{
        backgroundColor: '#fffbeb',
        borderBottom: '1px solid #fde68a',
        padding: '8px 16px',
        fontSize: '0.8125rem',
        color: '#92400e',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <AlertTriangle size={16} color="#d97706" />
          <span>
            {isDemoMode
              ? 'DEMO MODE — NOT A LIVE EMERGENCY SERVICE (BUILDATHON 2.0)'
              : 'LIVE BACKEND CONNECTED (Supabase PostgreSQL & Real-time)'}
          </span>
          <span style={{ fontWeight: 400, color: '#78350f', marginLeft: '4px' }}>
            In a real life-threatening emergency in India, always dial 112 directly.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleSimulatedOffline}
            title={isSimulatedOffline ? 'Restore Network Connection' : 'Simulate Network Outage to Test Offline Fallbacks'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: isSimulatedOffline ? '#fee2e2' : '#f1f5f9',
              color: isSimulatedOffline ? '#991b1b' : '#334155',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: `1px solid ${isSimulatedOffline ? '#fca5a5' : '#cbd5e1'}`,
            }}
          >
            {isSimulatedOffline ? (
              <>
                <WifiOff size={14} color="#dc2626" />
                <span>Simulated Offline: ACTIVE (Click to Restore)</span>
              </>
            ) : (
              <>
                <Wifi size={14} color="#059669" />
                <span>Simulate Offline Drop</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset demo incidents to initial clean state?')) {
                resetDemoData()
              }
            }}
            title="Reset sample incidents"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontSize: '0.75rem',
              fontWeight: 500,
              border: '1px solid #cbd5e1',
            }}
          >
            <RefreshCw size={12} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
