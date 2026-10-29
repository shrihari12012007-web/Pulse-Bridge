import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Incident, IncidentStatus, CreateIncidentPayload } from '../types'
import { 
  incidentService, 
  isSimulatedOffline, 
  setSimulatedOffline as setOfflineHelper 
} from '../services/incidentService'
import { isSupabaseConfigured, getSupabaseClient } from '../services/supabase'

interface IncidentContextType {
  incidents: Incident[]
  activeIncident: Incident | null
  activeIncidentId: string | null
  isLoading: boolean
  isOffline: boolean
  isSimulatedOffline: boolean
  isDemoMode: boolean
  setActiveIncidentId: (id: string | null) => void
  refreshIncidents: () => Promise<void>
  createIncident: (payload: CreateIncidentPayload) => Promise<{
    success: boolean
    incident?: Incident
    error?: string
    isOfflineDraft?: boolean
  }>
  updateStatus: (
    incidentId: string,
    status: IncidentStatus,
    actorName: string,
    actorRole: string,
    extra?: { assignedTo?: string; assignedResponderName?: string; notes?: string }
  ) => Promise<{ success: boolean; incident?: Incident; error?: string }>
  toggleSimulatedOffline: () => void
  resetDemoData: () => void
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined)

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(() => {
    return localStorage.getItem('pulsebridge_active_incident_id')
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [simulatedOffline, setSimulatedOfflineState] = useState<boolean>(isSimulatedOffline())
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  const isDemoMode = !isSupabaseConfigured

  const refreshIncidents = useCallback(async () => {
    try {
      const data = await incidentService.getIncidents()
      setIncidents(data)
    } catch (err) {
      console.error('Failed to refresh incidents', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshIncidents()

    // Listen for custom events for reactive update
    const handleUpdate = () => {
      refreshIncidents()
    }
    const handleNetwork = (e: any) => {
      setSimulatedOfflineState(e.detail?.offline ?? isSimulatedOffline())
    }

    const handleBrowserOnline = () => setIsOnline(true)
    const handleBrowserOffline = () => setIsOnline(false)

    window.addEventListener('pulsebridge:incidents-updated', handleUpdate)
    window.addEventListener('pulsebridge:network-changed', handleNetwork)
    window.addEventListener('online', handleBrowserOnline)
    window.addEventListener('offline', handleBrowserOffline)

    // Setup Supabase Realtime channel if live backend is enabled
    let channel: any = null
    const client = getSupabaseClient()
    if (isSupabaseConfigured && client) {
      channel = client
        .channel('public:incidents_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'incidents' },
          () => {
            refreshIncidents()
          }
        )
        .subscribe()
    }

    return () => {
      window.removeEventListener('pulsebridge:incidents-updated', handleUpdate)
      window.removeEventListener('pulsebridge:network-changed', handleNetwork)
      window.removeEventListener('online', handleBrowserOnline)
      window.removeEventListener('offline', handleBrowserOffline)
      if (channel && client) {
        client.removeChannel(channel)
      }
    }
  }, [refreshIncidents])

  useEffect(() => {
    if (activeIncidentId) {
      localStorage.setItem('pulsebridge_active_incident_id', activeIncidentId)
    } else {
      localStorage.removeItem('pulsebridge_active_incident_id')
    }
  }, [activeIncidentId])

  const activeIncident = incidents.find(
    (i) => i.id === activeIncidentId || i.reference_code === activeIncidentId
  ) || null

  const createIncident = async (payload: CreateIncidentPayload) => {
    const res = await incidentService.createIncident(payload)
    if (res.incident) {
      setActiveIncidentId(res.incident.id)
    }
    await refreshIncidents()
    return res
  }

  const updateStatus = async (
    incidentId: string,
    status: IncidentStatus,
    actorName: string,
    actorRole: string,
    extra?: { assignedTo?: string; assignedResponderName?: string; notes?: string }
  ) => {
    const res = await incidentService.updateIncidentStatus(
      incidentId,
      status,
      actorName,
      actorRole,
      extra
    )
    await refreshIncidents()
    return res
  }

  const toggleSimulatedOffline = () => {
    const next = !simulatedOffline
    setSimulatedOfflineState(next)
    setOfflineHelper(next)
  }

  const resetDemoData = () => {
    incidentService.resetDemoData()
    refreshIncidents()
  }

  const effectiveOffline = !isOnline || simulatedOffline

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        activeIncident,
        activeIncidentId,
        isLoading,
        isOffline: effectiveOffline,
        isSimulatedOffline: simulatedOffline,
        isDemoMode,
        setActiveIncidentId,
        refreshIncidents,
        createIncident,
        updateStatus,
        toggleSimulatedOffline,
        resetDemoData,
      }}
    >
      {children}
    </IncidentContext.Provider>
  )
}

export function useIncidents(): IncidentContextType {
  const context = useContext(IncidentContext)
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider')
  }
  return context
}
