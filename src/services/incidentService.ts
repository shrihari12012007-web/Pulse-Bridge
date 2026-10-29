import { 
  Incident, 
  IncidentStatus, 
  IncidentType, 
  IncidentEvent,
  ConsentedMedicalSnapshot,
  EmergencyContact,
  IncidentPriority,
  CreateIncidentPayload
} from '../types'
import { getSupabaseClient, isSupabaseConfigured } from './supabase'
import { INITIAL_DEMO_INCIDENTS } from './demoData'

const LOCAL_STORAGE_INCIDENTS_KEY = 'pulsebridge_incidents_store'
const LOCAL_STORAGE_DRAFTS_KEY = 'pulsebridge_offline_drafts'
const SIMULATED_OFFLINE_KEY = 'pulsebridge_simulate_offline'

// Valid status transitions
const ALLOWED_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  SUBMITTED: ['ACKNOWLEDGED', 'ASSIGNED', 'CANCELLED'],
  ACKNOWLEDGED: ['ASSIGNED', 'RESOLVED', 'CANCELLED'],
  ASSIGNED: ['RESOLVED', 'CANCELLED'],
  RESOLVED: [], // Terminal
  CANCELLED: [], // Terminal
}

export function isValidTransition(from: IncidentStatus, to: IncidentStatus): boolean {
  if (from === to) return true
  const allowed = ALLOWED_TRANSITIONS[from] || []
  return allowed.includes(to)
}

function generateReferenceCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `PB-${result}`
}

function loadLocalIncidents(): Incident[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INCIDENTS_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.warn('Failed to load local incidents, falling back to initial demo dataset', e)
  }
  return [...INITIAL_DEMO_INCIDENTS]
}

function saveLocalIncidents(incidents: Incident[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_INCIDENTS_KEY, JSON.stringify(incidents))
    window.dispatchEvent(new CustomEvent('pulsebridge:incidents-updated', { detail: incidents }))
  } catch (e) {
    console.error('Failed to save incidents to localStorage', e)
  }
}

export function isSimulatedOffline(): boolean {
  return localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true'
}

export function setSimulatedOffline(offline: boolean): void {
  localStorage.setItem(SIMULATED_OFFLINE_KEY, offline ? 'true' : 'false')
  window.dispatchEvent(new CustomEvent('pulsebridge:network-changed', { detail: { offline } }))
}

export { type CreateIncidentPayload }

export class IncidentService {
  private static instance: IncidentService

  private constructor() {
    // If first load, seed localStorage if not already present
    if (!localStorage.getItem(LOCAL_STORAGE_INCIDENTS_KEY)) {
      saveLocalIncidents(INITIAL_DEMO_INCIDENTS)
    }
  }

  public static getInstance(): IncidentService {
    if (!IncidentService.instance) {
      IncidentService.instance = new IncidentService()
    }
    return IncidentService.instance
  }

  public async getIncidents(): Promise<Incident[]> {
    if (isSimulatedOffline()) {
      return loadLocalIncidents()
    }

    const client = getSupabaseClient()
    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client
          .from('incidents')
          .select(`
            *,
            events:incident_events(*)
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('Supabase fetch failed, falling back to local dataset:', error.message)
          return loadLocalIncidents()
        }

        if (data && data.length > 0) {
          return data.map((item: any) => ({
            id: item.id,
            reference_code: item.reference_code,
            created_by: item.created_by,
            incident_type: item.incident_type,
            description: item.description || '',
            status: item.status,
            priority: item.priority || 'CRITICAL',
            latitude: item.latitude,
            longitude: item.longitude,
            location_accuracy: item.location_accuracy,
            location_description: item.location_description || '',
            consented_medical_summary: item.consented_medical_summary || {},
            emergency_contact_summary: item.emergency_contact_summary || [],
            is_demo: item.is_demo ?? false,
            backend_received: item.backend_received ?? true,
            assigned_to: item.assigned_to,
            assigned_responder_name: item.assigned_responder_name,
            created_at: item.created_at,
            updated_at: item.updated_at,
            acknowledged_at: item.acknowledged_at,
            assigned_at: item.assigned_at,
            resolved_at: item.resolved_at,
            cancelled_at: item.cancelled_at,
            events: (item.events || []).sort(
              (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            ),
          }))
        }
      } catch (err) {
        console.warn('Network / DB exception, returning local store', err)
      }
    }

    return loadLocalIncidents()
  }

  public async getIncidentById(idOrRef: string): Promise<Incident | null> {
    const list = await this.getIncidents()
    return list.find((i) => i.id === idOrRef || i.reference_code.toUpperCase() === idOrRef.toUpperCase()) || null
  }

  public async createIncident(payload: CreateIncidentPayload): Promise<{
    success: boolean
    incident?: Incident
    error?: string
    isOfflineDraft?: boolean
  }> {
    // 1. Simulated or actual network offline check
    const isOffline = isSimulatedOffline() || !navigator.onLine

    const newId = `inc-${Date.now()}`
    const refCode = generateReferenceCode()
    const nowIso = new Date().toISOString()

    const initialEvent: IncidentEvent = {
      id: `ev-${Date.now()}`,
      incident_id: newId,
      actor_name: payload.consented_medical_summary?.display_name || 'Citizen User',
      actor_role: 'user',
      previous_status: null,
      new_status: 'SUBMITTED',
      event_description: 'Emergency incident created via PulseBridge emergency portal.',
      created_at: nowIso,
    }

    const newIncident: Incident = {
      id: newId,
      reference_code: refCode,
      created_by: payload.created_by || null,
      incident_type: payload.incident_type,
      description: payload.description || '',
      status: 'SUBMITTED',
      priority: payload.priority || 'CRITICAL',
      latitude: payload.latitude,
      longitude: payload.longitude,
      location_accuracy: payload.location_accuracy,
      location_description: payload.location_description,
      consented_medical_summary: payload.consented_medical_summary,
      emergency_contact_summary: payload.emergency_contact_summary,
      is_demo: !isSupabaseConfigured,
      backend_received: !isOffline,
      is_offline_draft: isOffline,
      created_at: nowIso,
      updated_at: nowIso,
      events: [initialEvent],
    }

    if (isOffline) {
      // Truthful disclosure: Save draft locally and inform user
      try {
        const drafts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DRAFTS_KEY) || '[]')
        drafts.unshift(newIncident)
        localStorage.setItem(LOCAL_STORAGE_DRAFTS_KEY, JSON.stringify(drafts))
      } catch (e) {
        console.error('Draft storage failed', e)
      }

      return {
        success: false,
        incident: newIncident,
        isOfflineDraft: true,
        error: 'Network unavailable. Incident saved as an offline draft. Please dial official emergency 112 immediately.',
      }
    }

    // 2. If Supabase configured, attempt remote insertion
    const client = getSupabaseClient()
    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client
          .from('incidents')
          .insert({
            reference_code: refCode,
            created_by: payload.created_by || null,
            incident_type: payload.incident_type,
            description: payload.description,
            status: 'SUBMITTED',
            priority: payload.priority || 'CRITICAL',
            latitude: payload.latitude,
            longitude: payload.longitude,
            location_accuracy: payload.location_accuracy,
            location_description: payload.location_description,
            consented_medical_summary: payload.consented_medical_summary || {},
            emergency_contact_summary: payload.emergency_contact_summary || [],
            is_demo: false,
            backend_received: true,
          })
          .select()
          .single()

        if (error) {
          throw new Error(`Database error: ${error.message}`)
        }

        // Insert initial audit event
        await client.from('incident_events').insert({
          incident_id: data.id,
          actor_name: payload.consented_medical_summary?.display_name || 'Citizen User',
          actor_role: 'user',
          new_status: 'SUBMITTED',
          event_description: 'Emergency incident created via PulseBridge emergency portal.',
        })

        newIncident.id = data.id
        newIncident.reference_code = data.reference_code
      } catch (dbErr: any) {
        console.error('Remote save failed, falling back to demo store', dbErr)
        // Fallback to demo store if configured credentials failed network request
      }
    }

    // Update local store for instant reactive availability
    const localList = loadLocalIncidents()
    localList.unshift(newIncident)
    saveLocalIncidents(localList)

    return {
      success: true,
      incident: newIncident,
    }
  }

  public async updateIncidentStatus(
    incidentId: string,
    newStatus: IncidentStatus,
    actorName: string,
    actorRole: string,
    additionalData?: {
      assignedTo?: string
      assignedResponderName?: string
      notes?: string
    }
  ): Promise<{ success: boolean; incident?: Incident; error?: string }> {
    const incidents = loadLocalIncidents()
    const index = incidents.findIndex((i) => i.id === incidentId)

    if (index === -1) {
      return { success: false, error: 'Incident not found' }
    }

    const current = incidents[index]

    if (!isValidTransition(current.status, newStatus)) {
      return {
        success: false,
        error: `Illegal state transition from ${current.status} to ${newStatus}.`,
      }
    }

    const nowIso = new Date().toISOString()
    const updated: Incident = {
      ...current,
      status: newStatus,
      updated_at: nowIso,
    }

    let eventDesc = `Status transitioned from ${current.status} to ${newStatus}.`

    if (newStatus === 'ACKNOWLEDGED') {
      updated.acknowledged_at = nowIso
      eventDesc = `Incident acknowledged by authorized responder (${actorName}). Assistance dispatched.`
    } else if (newStatus === 'ASSIGNED') {
      updated.assigned_at = nowIso
      updated.assigned_to = additionalData?.assignedTo || 'resp-unit-1'
      updated.assigned_responder_name = additionalData?.assignedResponderName || actorName
      eventDesc = `Assigned to responder: ${updated.assigned_responder_name}.`
    } else if (newStatus === 'RESOLVED') {
      updated.resolved_at = nowIso
      eventDesc = additionalData?.notes 
        ? `Incident resolved: ${additionalData.notes}` 
        : `Incident marked as RESOLVED by ${actorName}.`
    } else if (newStatus === 'CANCELLED') {
      updated.cancelled_at = nowIso
      eventDesc = additionalData?.notes 
        ? `Incident cancelled: ${additionalData.notes}` 
        : `Incident cancelled by user/dispatcher.`
    }

    const newEvent: IncidentEvent = {
      id: `ev-${Date.now()}`,
      incident_id: current.id,
      actor_name: actorName,
      actor_role: actorRole,
      previous_status: current.status,
      new_status: newStatus,
      event_description: eventDesc,
      created_at: nowIso,
    }

    updated.events = [...(updated.events || []), newEvent]
    incidents[index] = updated
    saveLocalIncidents(incidents)

    // Sync to Supabase if live
    const client = getSupabaseClient()
    if (isSupabaseConfigured && client) {
      try {
        await client
          .from('incidents')
          .update({
            status: newStatus,
            updated_at: nowIso,
            acknowledged_at: updated.acknowledged_at,
            assigned_at: updated.assigned_at,
            assigned_to: updated.assigned_to,
            assigned_responder_name: updated.assigned_responder_name,
            resolved_at: updated.resolved_at,
            cancelled_at: updated.cancelled_at,
          })
          .eq('id', incidentId)

        await client.from('incident_events').insert({
          incident_id: incidentId,
          actor_name: actorName,
          actor_role: actorRole,
          previous_status: current.status,
          new_status: newStatus,
          event_description: eventDesc,
        })
      } catch (e) {
        console.warn('Could not sync status update to Supabase', e)
      }
    }

    return { success: true, incident: updated }
  }

  public resetDemoData(): void {
    saveLocalIncidents(INITIAL_DEMO_INCIDENTS)
  }
}

export const incidentService = IncidentService.getInstance()
