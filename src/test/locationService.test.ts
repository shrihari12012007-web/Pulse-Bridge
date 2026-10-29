import { describe, it, expect, vi } from 'vitest'
import { getCurrentCoordinates } from '../services/locationService'

describe('LocationService GPS Handling & Fallbacks', () => {
  it('returns GPS coordinates when browser geolocation succeeds', async () => {
    const mockSuccessPosition = {
      coords: {
        latitude: 12.971598,
        longitude: 77.594562,
        accuracy: 12.4,
      },
    }

    vi.spyOn(navigator.geolocation, 'getCurrentPosition').mockImplementationOnce((success: any) => {
      success(mockSuccessPosition)
    })

    const result = await getCurrentCoordinates()
    expect(result.success).toBe(true)
    expect(result.data.latitude).toBe(12.971598)
    expect(result.data.longitude).toBe(77.594562)
    expect(result.data.accuracy).toBe(12)
    expect(result.data.isManualFallback).toBe(false)
  })

  it('gracefully handles PERMISSION_DENIED error with clear fallback prompt', async () => {
    const mockError = {
      code: 1, // PERMISSION_DENIED
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    }

    vi.spyOn(navigator.geolocation, 'getCurrentPosition').mockImplementationOnce((_success: any, error: any) => {
      error(mockError)
    })

    const result = await getCurrentCoordinates()
    expect(result.success).toBe(false)
    expect(result.data.isManualFallback).toBe(true)
    expect(result.error).toContain('Location access was denied')
  })

  it('handles TIMEOUT error with retry instructions', async () => {
    const mockTimeoutError = {
      code: 3, // TIMEOUT
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    }

    vi.spyOn(navigator.geolocation, 'getCurrentPosition').mockImplementationOnce((_success: any, error: any) => {
      error(mockTimeoutError)
    })

    const result = await getCurrentCoordinates()
    expect(result.success).toBe(false)
    expect(result.error).toContain('timed out')
  })
})
