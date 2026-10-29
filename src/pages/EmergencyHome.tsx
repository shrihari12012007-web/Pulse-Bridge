import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  AlertCircle, 
  PhoneCall, 
  MapPin, 
  Heart, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  Wifi,
  WifiOff,
  Navigation,
  FileText
} from 'lucide-react'
import { useIncidents } from '../context/IncidentContext'
import { useAuth } from '../context/AuthContext'
import { checkLocationPermission, getCurrentCoordinates } from '../services/locationService'
import { getLocalMedicalProfile, getLocalEmergencyContacts } from '../services/medicalService'
import { SOSConfirmDialog } from '../components/incident/SOSConfirmDialog'

export const EmergencyHome: React.FC = () => {
  const navigate = useNavigate()
  const { createIncident, isOffline, activeIncident } = useIncidents()
  const { user } = useAuth()

  const [locationState, setLocationState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt')
  const [coordsSummary, setCoordsSummary] = useState<string>('Detecting location...')
  const [currentCoords, setCurrentCoords] = useState<{ lat: number | null; lng: number | null; accuracy: number | null }>({
    lat: null,
    lng: null,
    accuracy: null,
  })
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const medicalProfile = getLocalMedicalProfile()
  const emergencyContacts = getLocalEmergencyContacts()

  useEffect(() => {
    checkLocationPermission().then((state) => {
      setLocationState(state)
      if (state === 'granted') {
        fetchLocation()
      } else {
        setCoordsSummary('Permission needed for live GPS')
      }
    })
  }, [])

  const fetchLocation = async () => {
    setCoordsSummary('Acquiring high-accuracy GPS fix...')
    const res = await getCurrentCoordinates()
    if (res.success && res.data.latitude && res.data.longitude) {
      setCurrentCoords({
        lat: res.data.latitude,
        lng: res.data.longitude,
        accuracy: res.data.accuracy,
      })
      setLocationState('granted')
      setCoordsSummary(`Lat: ${res.data.latitude.toFixed(4)}, Lng: ${res.data.longitude.toFixed(4)} (±${res.data.accuracy}m)`)
    } else {
      setLocationState('denied')
      setCoordsSummary(res.error || 'Location unavailable. Manual entry fallback active.')
    }
  }

  const handleSOSClick = () => {
    if (locationState !== 'granted') {
      fetchLocation()
    }
    setIsConfirmOpen(true)
  }

  const handleConfirmSOS = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await createIncident({
        incident_type: 'medical_emergency',
        description: 'IMMEDIATE SOS BROADCAST triggered from PulseBridge mobile home screen.',
        priority: 'CRITICAL',
        latitude: currentCoords.lat,
        longitude: currentCoords.lng,
        location_accuracy: currentCoords.accuracy,
        location_description: currentCoords.lat 
          ? `GPS Coordinates: ${currentCoords.lat.toFixed(5)}, ${currentCoords.lng?.toFixed(5)}`
          : 'User triggered SOS without GPS fix. Please verify caller coordinates.',
        consented_medical_summary: medicalProfile.share_in_emergencies ? {
          blood_group: medicalProfile.blood_group,
          allergies: medicalProfile.allergies,
          medications: medicalProfile.medications,
          display_name: medicalProfile.display_name,
        } : undefined,
        emergency_contact_summary: emergencyContacts,
        created_by: user?.id,
      })

      setIsConfirmOpen(false)

      if (res.incident) {
        navigate(`/tracking/${res.incident.id}`)
      } else if (res.isOfflineDraft) {
        navigate('/tracking')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch SOS alert.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '1.5rem 1rem 3rem', minHeight: '80vh' }}>
      <div className="container-narrow" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* System & Telemetry Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            backgroundColor: '#ffffff',
            padding: '10px 16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontSize: '0.8125rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Connection Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isOffline ? (
              <>
                <WifiOff size={16} color="#dc2626" />
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi size={16} color="#16a34a" />
                <span style={{ color: '#16a34a', fontWeight: 600 }}>System Online</span>
              </>
            )}
          </div>

          {/* Location status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color={locationState === 'granted' ? '#0284c7' : '#d97706'} />
            <span style={{ color: '#475569' }}>
              {locationState === 'granted' ? 'GPS Active' : 'GPS Required'}
            </span>
            {locationState !== 'granted' && (
              <button
                onClick={fetchLocation}
                style={{
                  color: '#0284c7',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textDecoration: 'underline',
                  padding: '2px 4px',
                }}
              >
                Enable
              </button>
            )}
          </div>
        </div>

        {/* Active Incident Banner if tracking one */}
        {activeIncident && (
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} color="#0284c7" />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e3a8a' }}>
                  Active Emergency Tracked: {activeIncident.reference_code}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>
                  Current Status: <strong>{activeIncident.status}</strong>
                </div>
              </div>
            </div>
            <Link
              to={`/tracking/${activeIncident.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              Track Status <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              marginBottom: '8px',
            }}
          >
            Emergency Health Assistance
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#475569', maxWidth: '480px', margin: '0 auto' }}>
            Instant SOS coordination, verified dispatch triage, and consented health sharing during campus or venue emergencies.
          </p>
        </div>

        {/* Giant Central SOS Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '1rem 0' }}>
          <button
            onClick={handleSOSClick}
            aria-label="Activate Emergency SOS"
            className="animate-pulse-ring"
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sos)',
              border: '6px solid #ffffff',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '0.05em', lineHeight: 1 }}>
              SOS
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginTop: '6px', opacity: 0.9 }}>
              EMERGENCY
            </span>
          </button>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '12px' }}>
            Press to open emergency confirmation dialog with GPS telemetry
          </div>
        </div>

        {/* 112 India Direct Emergency Calling Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #ef4444',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PhoneCall size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
                  Direct Helpline: Dial 112
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Official Government Helpline • Free 24/7 Service
                </div>
              </div>
            </div>
            <a
              href="tel:112"
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)',
              }}
            >
              <PhoneCall size={18} />
              Call 112 Now
            </a>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
            Never wait for an app if someone is unconscious, bleeding profusely, or suffering severe trauma. 
            Calling 112 connects you directly to national emergency operators immediately without requiring login or internet.
          </p>
        </div>

        {/* Action Grid: Detailed Report & Medical Profile */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Detailed Incident Report */}
          <Link
            to="/report"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: 'var(--shadow-sm)',
              transition: 'border-color 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Navigation size={20} />
              </div>
              <ArrowRight size={18} color="#94a3b8" />
            </div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              Create Detailed Incident
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.4 }}>
              Specify incident category (injury, accident, medical), landmark fallback, and triage notes.
            </p>
          </Link>

          {/* Consented Medical Profile & Contacts */}
          <Link
            to="/medical-profile"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: 'var(--shadow-sm)',
              transition: 'border-color 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#fce7f3',
                  color: '#db2777',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart size={20} />
              </div>
              <ArrowRight size={18} color="#94a3b8" />
            </div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              Medical Profile & Contacts
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.4 }}>
              Blood group ({medicalProfile.blood_group}), allergies ({medicalProfile.allergies || 'None'}), and {emergencyContacts.length} trusted contacts.
            </p>
          </Link>
        </div>

        {/* Data Handling & Privacy Notice */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            fontSize: '0.8125rem',
            color: '#475569',
          }}
        >
          <ShieldCheck size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#0f172a' }}>How Emergency Data Is Handled:</strong> Location is only 
            acquired on demand when reporting an emergency or checking coordinates. Medical information is 
            strictly optional and shared only with verified emergency personnel responding to your specific incident.
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      <SOSConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSOS}
        isSubmitting={isSubmitting}
        locationSummary={coordsSummary}
        medicalSummary={medicalProfile.share_in_emergencies ? `${medicalProfile.blood_group} | ${medicalProfile.allergies || 'No allergies'}` : 'Profile sharing opted out'}
      />
    </div>
  )
}
