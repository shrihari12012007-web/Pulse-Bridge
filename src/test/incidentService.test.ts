import { describe, it, expect, beforeEach } from 'vitest'
import { incidentService, setSimulatedOffline } from '../services/incidentService'

describe('IncidentService Core Logic & Persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    incidentService.resetDemoData()
    setSimulatedOffline(false)
  })

  it('loads initial demo dataset properly', async () => {
    const list = await incidentService.getIncidents()
    expect(list.length).toBeGreaterThanOrEqual(4)
    expect(list[0].reference_code).toBeDefined()
  })

  it('creates an incident and creates initial audit event', async () => {
    const result = await incidentService.createIncident({
      incident_type: 'medical_emergency',
      description: 'Test emergency asthma trigger',
      priority: 'CRITICAL',
      latitude: 12.9716,
      longitude: 77.5946,
      location_accuracy: 10,
      location_description: 'Lab 2, 1st floor',
      consented_medical_summary: {
        blood_group: 'O+',
        allergies: 'None',
      },
    })

    expect(result.success).toBe(true)
    expect(result.incident).toBeDefined()
    expect(result.incident?.status).toBe('SUBMITTED')
    expect(result.incident?.reference_code.startsWith('PB-')).toBe(true)
    expect(result.incident?.events?.length).toBe(1)
    expect(result.incident?.events?.[0].new_status).toBe('SUBMITTED')
  })

  it('executes valid status transitions and updates audit events', async () => {
    const createRes = await incidentService.createIncident({
      incident_type: 'injury',
      latitude: 12.97,
      longitude: 77.59,
      location_accuracy: 5,
      location_description: 'Campus grounds',
    })
    const id = createRes.incident!.id

    // 1. Acknowledge
    const ackRes = await incidentService.updateIncidentStatus(
      id,
      'ACKNOWLEDGED',
      'Dispatcher Sarah',
      'responder'
    )
    expect(ackRes.success).toBe(true)
    expect(ackRes.incident?.status).toBe('ACKNOWLEDGED')
    expect(ackRes.incident?.acknowledged_at).toBeDefined()

    // 2. Assign
    const assignRes = await incidentService.updateIncidentStatus(
      id,
      'ASSIGNED',
      'Dispatcher Sarah',
      'responder',
      { assignedResponderName: 'Unit Alpha' }
    )
    expect(assignRes.success).toBe(true)
    expect(assignRes.incident?.status).toBe('ASSIGNED')
    expect(assignRes.incident?.assigned_responder_name).toBe('Unit Alpha')

    // 3. Resolve
    const resRes = await incidentService.updateIncidentStatus(
      id,
      'RESOLVED',
      'Unit Alpha Paramedic',
      'responder',
      { notes: 'Patient stabilized' }
    )
    expect(resRes.success).toBe(true)
    expect(resRes.incident?.status).toBe('RESOLVED')
    expect(resRes.incident?.resolved_at).toBeDefined()
    expect(resRes.incident?.events?.length).toBe(4) // create + ack + assign + resolve
  })

  it('rejects illegal status transition and returns descriptive error', async () => {
    const createRes = await incidentService.createIncident({
      incident_type: 'accident',
      latitude: 12.97,
      longitude: 77.59,
      location_accuracy: 5,
      location_description: 'Road cross',
    })
    const id = createRes.incident!.id

    // Attempt illegal transition from SUBMITTED directly to RESOLVED
    const badRes = await incidentService.updateIncidentStatus(
      id,
      'RESOLVED',
      'Hacker',
      'user'
    )
    expect(badRes.success).toBe(false)
    expect(badRes.error).toContain('Illegal state transition')
  })

  it('truthfully saves offline draft when simulated network failure occurs', async () => {
    setSimulatedOffline(true)

    const result = await incidentService.createIncident({
      incident_type: 'medical_emergency',
      latitude: null,
      longitude: null,
      location_accuracy: null,
      location_description: 'Basement parking lot',
    })

    expect(result.success).toBe(false)
    expect(result.isOfflineDraft).toBe(true)
    expect(result.incident?.backend_received).toBe(false)
    expect(result.error).toContain('Network unavailable')
  })
})
