import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Incident } from '../../types'
import { StatusBadge } from '../common/StatusBadge'
import { Navigation, MapPin } from 'lucide-react'

// Custom SVG-based Leaflet DivIcons to prevent missing asset issues
function createCustomPin(color: string, label: string) {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        color: #ffffff;
        font-weight: 700;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 9999px;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        border: 2px solid #ffffff;
        transform: translate(-50%, -100%);
      ">
        <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#fff;"></span>
        ${label}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [0, 0],
    popupAnchor: [0, -32],
  })
}

// Map center adjuster component
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

interface IncidentMapProps {
  incidents: Incident[]
  selectedIncident?: Incident | null
  onSelectIncident?: (incident: Incident) => void
  centerCoords?: [number, number]
  zoomLevel?: number
  height?: string
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  centerCoords,
  zoomLevel = 13,
  height = '420px',
}) => {
  // Default center if no incidents or specified coords exist
  const defaultCoords: [number, number] = centerCoords || [20.5937, 78.9629]

  // Filter incidents that have valid lat/lng
  const incidentsWithGeo = incidents.filter(
    (inc) => inc.latitude !== null && inc.longitude !== null && !isNaN(inc.latitude) && !isNaN(inc.longitude)
  )

  const activeCenter: [number, number] =
    selectedIncident?.latitude && selectedIncident?.longitude
      ? [selectedIncident.latitude, selectedIncident.longitude]
      : incidentsWithGeo.length > 0 && !centerCoords
      ? [incidentsWithGeo[0].latitude!, incidentsWithGeo[0].longitude!]
      : defaultCoords

  const getColorForStatus = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return '#d97706' // amber/red
      case 'ACKNOWLEDGED':
        return '#0284c7' // blue
      case 'ASSIGNED':
        return '#7c3aed' // purple
      case 'RESOLVED':
        return '#16a34a' // green
      case 'CANCELLED':
        return '#64748b' // grey
      default:
        return '#dc2626'
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: height,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        position: 'relative',
        backgroundColor: '#e2e8f0',
      }}
    >
      {incidentsWithGeo.length === 0 ? (
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#64748b',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <MapPin size={36} color="#94a3b8" />
          <div style={{ fontWeight: 600 }}>No GPS Coordinates Available</div>
          <div style={{ fontSize: '0.8125rem' }}>
            Current incidents rely on manual landmark descriptions.
          </div>
        </div>
      ) : (
        <MapContainer
          center={activeCenter}
          zoom={zoomLevel}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          <MapController center={activeCenter} zoom={zoomLevel} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {incidentsWithGeo.map((inc) => {
            const color = getColorForStatus(inc.status)
            const icon = createCustomPin(color, inc.reference_code)
            return (
              <Marker
                key={inc.id}
                position={[inc.latitude!, inc.longitude!]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    if (onSelectIncident) {
                      onSelectIncident(inc)
                    }
                  },
                }}
              >
                <Popup>
                  <div style={{ minWidth: '200px', padding: '4px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '0.875rem' }}>{inc.reference_code}</strong>
                      <StatusBadge status={inc.status} size="sm" />
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '6px' }}>
                      {inc.description || 'No description provided'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                      <Navigation size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {inc.location_description || `${inc.latitude?.toFixed(4)}, ${inc.longitude?.toFixed(4)}`}
                    </div>
                    {onSelectIncident && (
                      <button
                        onClick={() => onSelectIncident(inc)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textAlign: 'center',
                        }}
                      >
                        Inspect Incident
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      )}
    </div>
  )
}
