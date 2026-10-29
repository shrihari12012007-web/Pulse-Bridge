import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Activity, 
  MapPin, 
  AlertCircle, 
  Heart, 
  Send, 
  Info, 
  Check, 
  PhoneCall,
  Loader2,
  Lock
} from 'lucide-react'
import { IncidentType, IncidentPriority } from '../types'
import { useIncidents } from '../context/IncidentContext'
import { useAuth } from '../context/AuthContext'
import { getCurrentCoordinates } from '../services/locationService'
import { getLocalMedicalProfile, getLocalEmergencyContacts } from '../services/medicalService'

export const CreateIncident: React.FC = () => {
  const navigate = useNavigate()
  const { createIncident, isOffline } = useIncidents()
  const { user } = useAuth()

  // Form State
  const [incidentType, setIncidentType] = useState<IncidentType>('medical_emergency')
  const [priority, setPriority] = useState<IncidentPriority>('CRITICAL')
  const [description, setDescription] = useState('')
  const [manualLocation, setManualLocation] = useState('')

  // Geolocation state
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null; accuracy: number | null }>({
    lat: null,
    lng: null,
    accuracy: null,
  })
  const [isLocating, setIsLocating] = useState(false)
  const [locationStatus, setLocationStatus] = useState<string>('Click "Detect GPS Location" to query device sensors.')
  const [locationError, setLocationError] = useState<string | null>(null)

  // Medical & Contacts consent
  const [includeMedical, setIncludeMedical] = useState(true)
  const [includeContacts, setIncludeContacts] = useState(true)

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const medicalProfile = getLocalMedicalProfile()
  const emergencyContacts = getLocalEmergencyContacts()

  const handleAcquireLocation = async () => {
    setIsLocating(true)
    setLocationError(null)
    setLocationStatus('Requesting browser geolocation sensor...')

    const res = await getCurrentCoordinates()
    setIsLocating(false)

    if (res.success && res.data.latitude && res.data.longitude) {
      setCoords({
        lat: res.data.latitude,
        lng: res.data.longitude,
        accuracy: res.data.accuracy,
      })
      setLocationStatus(`GPS Locked: ${res.data.latitude.toFixed(5)}, ${res.data.longitude.toFixed(5)} (±${res.data.accuracy}m)`)
    } else {
      setLocationError(res.error || 'Failed to obtain GPS fix.')
      setLocationStatus('GPS failed or unavailable. Please fill the manual landmark description below.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent duplicate submissions
    if (isSubmitting || hasSubmitted) return

    // Validation: At least one location source must be present
    if (!coords.lat && !manualLocation.trim()) {
      setSubmissionError('Please provide a manual location description or detect GPS coordinates.')
      return
    }

    setIsSubmitting(true)
    setSubmissionError(null)

    try {
      const res = await createIncident({
        incident_type: incidentType,
        priority: priority,
        description: description.trim() || undefined,
        latitude: coords.lat,
        longitude: coords.lng,
        location_accuracy: coords.accuracy,
        location_description: manualLocation.trim() || (coords.lat ? `GPS: ${coords.lat.toFixed(5)}, ${coords.lng?.toFixed(5)}` : 'Manual location not specified'),
        consented_medical_summary: includeMedical && medicalProfile.share_in_emergencies ? {
          blood_group: medicalProfile.blood_group,
          allergies: medicalProfile.allergies,
          medications: medicalProfile.medications,
          medical_notes: medicalProfile.medical_notes,
          display_name: medicalProfile.display_name,
        } : undefined,
        emergency_contact_summary: includeContacts ? emergencyContacts : [],
        created_by: user?.id,
      })

      setHasSubmitted(true)

      if (res.incident) {
        navigate(`/tracking/${res.incident.id}`)
      } else if (res.isOfflineDraft) {
        navigate('/tracking')
      }
    } catch (err: any) {
      setSubmissionError(err.message || 'Submission failed. Please check network or dial 112 directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '1.5rem 1rem 3rem', minHeight: '85vh' }}>
      <div className="container-narrow">
        
        {/* Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Report Emergency Incident
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Submit essential triage details to the PulseBridge authorized responder center.
          </p>
        </div>

        {/* 112 Banner reminder */}
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontSize: '0.8125rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>For immediate cardiac arrest, massive hemorrhage, or severe trauma, call 112 without delay.</span>
          </div>
          <a
            href="tel:112"
            style={{
              padding: '6px 12px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            Call 112
          </a>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Incident Type */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Incident Type <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              {[
                { type: 'medical_emergency', label: 'Medical Emergency' },
                { type: 'injury', label: 'Physical Injury' },
                { type: 'accident', label: 'Road / Vehicle' },
                { type: 'other', label: 'Other Incident' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setIncidentType(item.type as IncidentType)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `2px solid ${incidentType === item.type ? '#0284c7' : '#e2e8f0'}`,
                    backgroundColor: incidentType === item.type ? '#f0f9ff' : '#ffffff',
                    color: incidentType === item.type ? '#0369a1' : '#334155',
                    fontWeight: incidentType === item.type ? 700 : 500,
                    fontSize: '0.8125rem',
                    textAlign: 'center',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Urgency Priority
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['CRITICAL', 'HIGH', 'MEDIUM'] as IncidentPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: `1px solid ${priority === p ? (p === 'CRITICAL' ? '#dc2626' : p === 'HIGH' ? '#ea580c' : '#0284c7') : '#cbd5e1'}`,
                    backgroundColor: priority === p ? (p === 'CRITICAL' ? '#fee2e2' : p === 'HIGH' ? '#ffedd5' : '#e0f2fe') : '#ffffff',
                    color: priority === p ? (p === 'CRITICAL' ? '#991b1b' : p === 'HIGH' ? '#9a3412' : '#0369a1') : '#475569',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Description (Optional) */}
          <div>
            <label htmlFor="description" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Brief Description <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b' }}>(Optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Shortness of breath, collapsed near cafeteria, conscious but disoriented..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Geolocation Section */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#0284c7" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                  GPS Coordinates Telemetry
                </span>
              </div>
              <button
                type="button"
                onClick={handleAcquireLocation}
                disabled={isLocating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {isLocating ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                <span>{isLocating ? 'Detecting...' : 'Detect GPS Location'}</span>
              </button>
            </div>

            <div style={{ fontSize: '0.8125rem', color: coords.lat ? '#15803d' : '#64748b' }}>
              {locationStatus}
            </div>

            {locationError && (
              <div style={{ fontSize: '0.75rem', color: '#dc2626', backgroundColor: '#fef2f2', padding: '6px 10px', borderRadius: '6px' }}>
                {locationError}
              </div>
            )}
          </div>

          {/* Manual Location Fallback */}
          <div>
            <label htmlFor="manualLocation" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Landmark / Room Description <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="manualLocation"
              type="text"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder="e.g., Block B, 3rd Floor Seminar Hall 304, Near water cooler"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
              }}
            />
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
              Crucial for responders to locate the room or floor indoors where GPS satellite signals fade.
            </div>
          </div>

          {/* Consented Medical Snapshot Toggle */}
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={18} color="#16a34a" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#166534' }}>
                  Share Consented Medical Info
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeMedical}
                onChange={(e) => setIncludeMedical(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#16a34a' }}
              />
            </div>
            {includeMedical && (
              <div style={{ fontSize: '0.8125rem', color: '#15803d' }}>
                Will attach: Blood Group ({medicalProfile.blood_group}), Allergies ({medicalProfile.allergies || 'None'}), Medications ({medicalProfile.medications || 'None'}).
              </div>
            )}
          </div>

          {/* Error Banner */}
          {submissionError && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#991b1b',
                fontSize: '0.8125rem',
              }}
            >
              {submissionError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || hasSubmitted}
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              padding: '14px 20px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.25)',
              marginTop: '8px',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Broadcasting to Response Center...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Submit Emergency Incident</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  )
}
