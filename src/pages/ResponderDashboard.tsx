import React, { useState, useMemo } from 'react'
import { 
  ShieldAlert, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  Search, 
  Filter, 
  MapPin, 
  RefreshCw, 
  Check, 
  ArrowRight,
  AlertOctagon,
  Phone,
  Heart,
  ChevronRight,
  WifiOff,
  UserPlus,
  X
} from 'lucide-react'
import { useIncidents } from '../context/IncidentContext'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/common/StatusBadge'
import { IncidentTimeline } from '../components/incident/IncidentTimeline'
import { IncidentMap } from '../components/map/IncidentMap'
import { Incident, IncidentStatus, IncidentType } from '../types'

export const ResponderDashboard: React.FC = () => {
  const { incidents, isLoading, isOffline, updateStatus, refreshIncidents } = useIncidents()
  const { user, role } = useAuth()

  // State
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')

  // Action Modals & Form states
  const [assigneeInput, setAssigneeInput] = useState('Paramedic Team Beta (Unit 2)')
  const [isAssigning, setIsAssigning] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Metrics (computed from actual loaded database/store records)
  const metrics = useMemo(() => {
    const totalActive = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CANCELLED').length
    const unacknowledged = incidents.filter((i) => i.status === 'SUBMITTED').length
    const assigned = incidents.filter((i) => i.status === 'ASSIGNED').length
    const resolved = incidents.filter((i) => i.status === 'RESOLVED').length
    return { totalActive, unacknowledged, assigned, resolved }
  }, [incidents])

  // Filtered list
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false
      if (typeFilter !== 'ALL' && inc.incident_type !== typeFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchCode = inc.reference_code.toLowerCase().includes(q)
        const matchDesc = inc.description.toLowerCase().includes(q)
        const matchLoc = inc.location_description.toLowerCase().includes(q)
        if (!matchCode && !matchDesc && !matchLoc) return false
      }
      return true
    })
  }, [incidents, statusFilter, typeFilter, searchQuery])

  const selectedIncident = useMemo(() => {
    if (!selectedIncidentId && filteredIncidents.length > 0) {
      return filteredIncidents[0]
    }
    return incidents.find((i) => i.id === selectedIncidentId) || null
  }, [selectedIncidentId, filteredIncidents, incidents])

  const handleAcknowledge = async () => {
    if (!selectedIncident) return
    setActionError(null)
    setActionSuccess(null)

    const actorName = user?.display_name || 'Authorized Dispatcher'
    const res = await updateStatus(selectedIncident.id, 'ACKNOWLEDGED', actorName, 'responder')
    if (res.success) {
      setActionSuccess('Incident acknowledged. Dispatch timer logged.')
    } else {
      setActionError(res.error || 'Failed to acknowledge incident.')
    }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIncident || !assigneeInput.trim()) return
    setActionError(null)
    setActionSuccess(null)

    const actorName = user?.display_name || 'Lead Dispatcher'
    const res = await updateStatus(
      selectedIncident.id,
      'ASSIGNED',
      actorName,
      'responder',
      {
        assignedResponderName: assigneeInput.trim(),
        assignedTo: 'resp-unit-custom',
      }
    )
    if (res.success) {
      setActionSuccess(`Assigned to ${assigneeInput.trim()}.`)
      setIsAssigning(false)
    } else {
      setActionError(res.error || 'Assignment failed.')
    }
  }

  const handleResolve = async () => {
    if (!selectedIncident) return
    const notes = window.prompt('Enter resolution summary / medical handover notes:')
    if (notes === null) return

    setActionError(null)
    setActionSuccess(null)
    const actorName = user?.display_name || 'Field Officer'
    const res = await updateStatus(selectedIncident.id, 'RESOLVED', actorName, 'responder', { notes })
    if (res.success) {
      setActionSuccess('Incident marked as RESOLVED.')
    } else {
      setActionError(res.error || 'Failed to resolve incident.')
    }
  }

  return (
    <div className="responder-theme" style={{ minHeight: '90vh', padding: '1.5rem 1rem 3rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="container" style={{ maxWidth: '1360px' }}>

        {/* Dashboard Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldAlert size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  Responder Dispatch Center
                </h1>
                <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  BUILDATHON 2.0 • Tactical Triage & CAD Coordination Console
                </div>
              </div>
            </div>
          </div>

          {/* Right Status Pill & Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isOffline && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#450a0a',
                  color: '#f87171',
                  border: '1px solid #7f1d1d',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <WifiOff size={14} /> Connection Offline
              </div>
            )}
            <button
              onClick={() => refreshIncidents()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: '#38bdf8',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid var(--border-light)',
              }}
            >
              <RefreshCw size={14} /> Refresh CAD
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Incidents
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>
              {metrics.totalActive}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '2px' }}>
              Pending triage, acknowledgement, or field resolution
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid #f59e0b' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Unacknowledged (Action Req.)
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fbbf24', marginTop: '4px' }}>
              {metrics.unacknowledged}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#fcd34d', marginTop: '2px' }}>
              Awaiting dispatcher initial triage
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Assigned to Units
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#d8b4fe', marginTop: '4px' }}>
              {metrics.assigned}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '2px' }}>
              First responder or medic dispatched on-site
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Resolved Incidents
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#86efac', marginTop: '4px' }}>
              {metrics.resolved}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '2px' }}>
              Handover or on-site treatment stabilized
            </div>
          </div>
        </div>

        {/* Global Incident Interactive Map */}
        <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff' }}>
              <MapPin size={18} color="#38bdf8" /> Live Incident Map & Geographic Distribution
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Click any incident marker to inspect details
            </div>
          </div>
          <IncidentMap
            incidents={incidents}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncidentId(inc.id)}
            height="320px"
            zoomLevel={13}
          />
        </div>

        {/* Action feedback banners */}
        {actionSuccess && (
          <div style={{ backgroundColor: '#064e3b', color: '#6ee7b7', border: '1px solid #059669', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8125rem' }}>
            {actionSuccess}
          </div>
        )}
        {actionError && (
          <div style={{ backgroundColor: '#450a0a', color: '#fca5a5', border: '1px solid #b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8125rem' }}>
            {actionError}
          </div>
        )}

        {/* Main Work Area: Incident List & Details Panel */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Filter & Incident Table/Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Search & Filter Toolbar */}
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search by code, description, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 34px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    color: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.75rem',
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    color: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.75rem',
                  }}
                >
                  <option value="ALL">All Incident Types</option>
                  <option value="medical_emergency">Medical Emergency</option>
                  <option value="injury">Physical Injury</option>
                  <option value="accident">Accident / Road</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* List of Incidents */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredIncidents.length === 0 ? (
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '2rem', textAlign: 'center', borderRadius: '12px', border: '1px solid var(--border-light)', color: '#64748b' }}>
                  No incidents match the selected filters.
                </div>
              ) : (
                filteredIncidents.map((inc) => {
                  const isSelected = selectedIncident?.id === inc.id
                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncidentId(inc.id)}
                      style={{
                        backgroundColor: isSelected ? '#1e293b' : 'var(--bg-surface)',
                        border: `1px solid ${isSelected ? '#38bdf8' : 'var(--border-light)'}`,
                        borderRadius: '10px',
                        padding: '12px 14px',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#ffffff' }}>
                            {inc.reference_code}
                          </span>
                          {inc.is_demo && (
                            <span style={{ fontSize: '0.625rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: '#3b2505', color: '#fbbf24', border: '1px solid #78350f' }}>
                              DEMO
                            </span>
                          )}
                        </div>
                        <StatusBadge status={inc.status} size="sm" />
                      </div>

                      <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.3 }}>
                        {inc.description || 'Emergency assistance requested.'}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem', color: '#64748b', marginTop: '2px' }}>
                        <span>
                          <MapPin size={10} style={{ display: 'inline', marginRight: '2px' }} />
                          {inc.location_description.slice(0, 32)}...
                        </span>
                        <span>{new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

          </div>

          {/* Right Column: Detailed CAD Inspector & Dispatch Actions */}
          {selectedIncident && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '14px',
                border: '1px solid var(--border-light)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#ffffff' }}>
                      {selectedIncident.reference_code}
                    </h2>
                    <StatusBadge status={selectedIncident.status} size="md" />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                    Received at {new Date(selectedIncident.created_at).toLocaleString()} • Priority: <strong style={{ color: '#ef4444' }}>{selectedIncident.priority}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <a
                    href="tel:112"
                    style={{
                      padding: '6px 10px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    112 Direct
                  </a>
                </div>
              </div>

              {/* Action Toolbar */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  border: '1px solid var(--border-light)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                  Authorized Tactical Actions
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {/* Acknowledge Button */}
                  {selectedIncident.status === 'SUBMITTED' && (
                    <button
                      onClick={handleAcknowledge}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Check size={16} /> Acknowledge Incident
                    </button>
                  )}

                  {/* Assign Responder Button */}
                  {(selectedIncident.status === 'SUBMITTED' || selectedIncident.status === 'ACKNOWLEDGED') && (
                    <button
                      onClick={() => setIsAssigning(!isAssigning)}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#7c3aed',
                        color: '#ffffff',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <UserPlus size={16} /> Assign Dispatch Unit
                    </button>
                  )}

                  {/* Resolve Button */}
                  {(selectedIncident.status === 'ASSIGNED' || selectedIncident.status === 'ACKNOWLEDGED') && (
                    <button
                      onClick={handleResolve}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle2 size={16} /> Mark as Resolved
                    </button>
                  )}
                </div>

                {/* Inline Assignment Form */}
                {isAssigning && (
                  <form onSubmit={handleAssign} style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={assigneeInput}
                      onChange={(e) => setAssigneeInput(e.target.value)}
                      placeholder="e.g. Paramedic Team Alpha (Unit 1)"
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-light)',
                        backgroundColor: 'var(--bg-primary)',
                        color: '#ffffff',
                        fontSize: '0.8125rem',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#7c3aed',
                        color: '#ffffff',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      Dispatch
                    </button>
                  </form>
                )}
              </div>

              {/* Incident Details & Location */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                <div>
                  <strong style={{ color: '#94a3b8' }}>Description:</strong>{' '}
                  <span style={{ color: '#f8fafc' }}>{selectedIncident.description || 'No description provided'}</span>
                </div>
                <div>
                  <strong style={{ color: '#94a3b8' }}>Location Landmark:</strong>{' '}
                  <span style={{ color: '#f8fafc' }}>{selectedIncident.location_description}</span>
                </div>
                {selectedIncident.latitude && (
                  <div>
                    <strong style={{ color: '#94a3b8' }}>GPS Fix:</strong>{' '}
                    <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                      {selectedIncident.latitude.toFixed(5)}, {selectedIncident.longitude?.toFixed(5)} (±{selectedIncident.location_accuracy}m)
                    </span>
                  </div>
                )}
                {selectedIncident.assigned_responder_name && (
                  <div>
                    <strong style={{ color: '#94a3b8' }}>Assigned Unit:</strong>{' '}
                    <span style={{ color: '#c084fc', fontWeight: 600 }}>{selectedIncident.assigned_responder_name}</span>
                  </div>
                )}
              </div>

              {/* Consented Medical Snapshot */}
              {selectedIncident.consented_medical_summary && (
                <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '6px' }}>
                    <Heart size={14} /> Consented Medical Profile Snapshot
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                    <div>Blood Group: <strong style={{ color: '#ffffff' }}>{selectedIncident.consented_medical_summary.blood_group || 'Unknown'}</strong></div>
                    <div>Allergies: <strong style={{ color: '#ffffff' }}>{selectedIncident.consented_medical_summary.allergies || 'None'}</strong></div>
                    <div>Medications: <strong style={{ color: '#ffffff' }}>{selectedIncident.consented_medical_summary.medications || 'None'}</strong></div>
                  </div>
                </div>
              )}

              {/* Activity History */}
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                  CAD Event History & Triage Milestones
                </div>
                <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                  <IncidentTimeline
                    events={selectedIncident.events}
                    createdAt={selectedIncident.created_at}
                  />
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  )
}
