import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  FileText, 
  MapPin, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  XCircle,
  PhoneCall,
  Activity,
  Heart
} from 'lucide-react'
import { useIncidents } from '../context/IncidentContext'
import { StatusBadge } from '../components/common/StatusBadge'
import { IncidentTimeline } from '../components/incident/IncidentTimeline'
import { IncidentMap } from '../components/map/IncidentMap'
import { Incident } from '../types'

export const IncidentTracking: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const { incidents, activeIncident, updateStatus } = useIncidents()

  const [searchCode, setSearchCode] = useState('')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (id) {
      const match = incidents.find(
        (i) => i.id === id || i.reference_code.toUpperCase() === id.toUpperCase()
      )
      if (match) {
        setSelectedIncident(match)
        return
      }
    }

    if (activeIncident) {
      setSelectedIncident(activeIncident)
    } else if (incidents.length > 0) {
      setSelectedIncident(incidents[0])
    }
  }, [id, incidents, activeIncident])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchCode.trim()) return

    const match = incidents.find(
      (i) => i.reference_code.toUpperCase() === searchCode.trim().toUpperCase() || i.id === searchCode.trim()
    )
    if (match) {
      setSelectedIncident(match)
    } else {
      alert(`No incident found matching reference code "${searchCode}".`)
    }
  }

  const handleUserCancel = async () => {
    if (!selectedIncident) return
    const confirmed = window.confirm('Are you sure you want to cancel this emergency incident request?')
    if (!confirmed) return

    setIsCancelling(true)
    await updateStatus(
      selectedIncident.id,
      'CANCELLED',
      'Citizen User',
      'user',
      { notes: cancelReason || 'Cancelled by requester' }
    )
    setIsCancelling(false)
  }

  return (
    <div style={{ padding: '1.5rem 1rem 3.5rem', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '960px' }}>

        {/* Page Header with Reference Code search */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Incident Live Tracking
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Real-time telemetry, response acknowledgement, and audit milestones.
            </p>
          </div>

          {/* Reference Search Input */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              placeholder="Search Ref Code (e.g. DEMO-PB-901)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
                minWidth: '220px',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 14px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Search size={14} /> Search
            </button>
          </form>
        </div>

        {/* Non-Government Emergency Dispatch Disclaimer */}
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '0.8125rem',
            color: '#92400e',
          }}
        >
          <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Notice:</strong> Submission to PulseBridge coordinates with authorized on-site / campus emergency teams.
            It does <strong>NOT</strong> dispatch a municipal ambulance or police officer directly. If life-threatening, 
            dial <strong>112</strong> immediately.
          </div>
        </div>

        {!selectedIncident ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            <FileText size={48} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
              No Active Incident Selected
            </h3>
            <p style={{ fontSize: '0.875rem', marginTop: '6px' }}>
              Search using a reference ID above or create a new emergency request.
            </p>
            <Link
              to="/report"
              style={{
                display: 'inline-block',
                marginTop: '16px',
                padding: '10px 20px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Report Emergency Incident
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Core Status Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedIncident.reference_code}
                    </h2>
                    <StatusBadge status={selectedIncident.status} size="lg" />
                    {selectedIncident.is_demo && (
                      <span
                        style={{
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                        }}
                      >
                        SIMULATION
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '4px' }}>
                    Submitted on {new Date(selectedIncident.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Direct 112 hotline shortcut */}
                <a
                  href="tel:112"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    border: '1px solid #fca5a5',
                  }}
                >
                  <PhoneCall size={16} /> Dial 112 Directly
                </a>
              </div>

              {/* Status & Backend Confirmation Indicators */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Backend Transmission</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontWeight: 700, fontSize: '0.875rem' }}>
                    {selectedIncident.backend_received ? (
                      <>
                        <CheckCircle2 size={16} color="#16a34a" />
                        <span style={{ color: '#16a34a' }}>Confirmed Received</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} color="#dc2626" />
                        <span style={{ color: '#dc2626' }}>Pending / Offline Draft</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Responder Acknowledgement</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontWeight: 700, fontSize: '0.875rem' }}>
                    {selectedIncident.acknowledged_at ? (
                      <>
                        <ShieldCheck size={16} color="#0284c7" />
                        <span style={{ color: '#0284c7' }}>
                          Acknowledged ({new Date(selectedIncident.acknowledged_at).toLocaleTimeString()})
                        </span>
                      </>
                    ) : (
                      <span style={{ color: '#d97706' }}>Awaiting Dispatch Review</span>
                    )}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned Responder Unit</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontWeight: 700, fontSize: '0.875rem' }}>
                    {selectedIncident.assigned_responder_name ? (
                      <>
                        <UserCheck size={16} color="#7c3aed" />
                        <span style={{ color: '#7c3aed' }}>{selectedIncident.assigned_responder_name}</span>
                      </>
                    ) : (
                      <span style={{ color: '#64748b' }}>Not yet assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description & Location */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                <div>
                  <strong style={{ color: '#0f172a' }}>Description:</strong>{' '}
                  <span style={{ color: '#334155' }}>{selectedIncident.description || 'No description provided.'}</span>
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Location Landmark:</strong>{' '}
                  <span style={{ color: '#334155' }}>{selectedIncident.location_description}</span>
                </div>
                {selectedIncident.latitude && selectedIncident.longitude && (
                  <div>
                    <strong style={{ color: '#0f172a' }}>GPS Coordinates:</strong>{' '}
                    <span style={{ color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                      {selectedIncident.latitude.toFixed(5)}, {selectedIncident.longitude.toFixed(5)} (±{selectedIncident.location_accuracy || 10}m)
                    </span>
                  </div>
                )}
              </div>

              {/* User cancellation if still in SUBMITTED state */}
              {selectedIncident.status === 'SUBMITTED' && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleUserCancel}
                    disabled={isCancelling}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      color: '#64748b',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                    }}
                  >
                    Cancel Incident / False Alarm
                  </button>
                </div>
              )}
            </div>

            {/* Map & Audit Timeline Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Interactive Map */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} color="#0284c7" /> Incident Location Telemetry
                </h3>
                <IncidentMap
                  incidents={[selectedIncident]}
                  selectedIncident={selectedIncident}
                  height="340px"
                  zoomLevel={15}
                />
              </div>

              {/* Audit Timeline */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#0284c7" /> Status & Activity History
                </h3>
                <IncidentTimeline
                  events={selectedIncident.events}
                  createdAt={selectedIncident.created_at}
                />
              </div>
            </div>

            {/* Consented Medical Snapshot (if present) */}
            {selectedIncident.consented_medical_summary && Object.keys(selectedIncident.consented_medical_summary).length > 0 && (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Heart size={18} color="#dc2626" /> Consented Medical Profile Snapshot
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.8125rem' }}>
                  <div>
                    <strong>Blood Group:</strong> {selectedIncident.consented_medical_summary.blood_group || 'Unknown'}
                  </div>
                  <div>
                    <strong>Allergies:</strong> {selectedIncident.consented_medical_summary.allergies || 'None reported'}
                  </div>
                  <div>
                    <strong>Medications:</strong> {selectedIncident.consented_medical_summary.medications || 'None'}
                  </div>
                  <div>
                    <strong>Notes:</strong> {selectedIncident.consented_medical_summary.medical_notes || 'None'}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}
