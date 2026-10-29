import { describe, it, expect } from 'vitest'
import { isValidTransition } from '../services/incidentService'

describe('Incident Status Transition Machine', () => {
  it('allows valid forward transitions from SUBMITTED', () => {
    expect(isValidTransition('SUBMITTED', 'ACKNOWLEDGED')).toBe(true)
    expect(isValidTransition('SUBMITTED', 'ASSIGNED')).toBe(true)
    expect(isValidTransition('SUBMITTED', 'CANCELLED')).toBe(true)
  })

  it('rejects direct illegal jump from SUBMITTED to RESOLVED without acknowledgement/assignment', () => {
    expect(isValidTransition('SUBMITTED', 'RESOLVED')).toBe(false)
  })

  it('allows valid transitions from ACKNOWLEDGED', () => {
    expect(isValidTransition('ACKNOWLEDGED', 'ASSIGNED')).toBe(true)
    expect(isValidTransition('ACKNOWLEDGED', 'RESOLVED')).toBe(true)
    expect(isValidTransition('ACKNOWLEDGED', 'CANCELLED')).toBe(true)
  })

  it('rejects backwards transition from ACKNOWLEDGED to SUBMITTED', () => {
    expect(isValidTransition('ACKNOWLEDGED', 'SUBMITTED')).toBe(false)
  })

  it('allows valid transitions from ASSIGNED to RESOLVED or CANCELLED', () => {
    expect(isValidTransition('ASSIGNED', 'RESOLVED')).toBe(true)
    expect(isValidTransition('ASSIGNED', 'CANCELLED')).toBe(true)
  })

  it('treats RESOLVED as a terminal state', () => {
    expect(isValidTransition('RESOLVED', 'SUBMITTED')).toBe(false)
    expect(isValidTransition('RESOLVED', 'ACKNOWLEDGED')).toBe(false)
    expect(isValidTransition('RESOLVED', 'ASSIGNED')).toBe(false)
    expect(isValidTransition('RESOLVED', 'CANCELLED')).toBe(false)
  })

  it('treats CANCELLED as a terminal state', () => {
    expect(isValidTransition('CANCELLED', 'SUBMITTED')).toBe(false)
    expect(isValidTransition('CANCELLED', 'RESOLVED')).toBe(false)
  })

  it('allows same-state idempotency', () => {
    expect(isValidTransition('SUBMITTED', 'SUBMITTED')).toBe(true)
    expect(isValidTransition('RESOLVED', 'RESOLVED')).toBe(true)
  })
})
