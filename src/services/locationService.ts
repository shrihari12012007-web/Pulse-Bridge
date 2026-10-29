import { LocationData } from '../types'

export type LocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported'

export interface GetLocationResult {
  success: boolean
  data: LocationData
  error?: string
}

export async function checkLocationPermission(): Promise<LocationPermissionState> {
  if (!navigator.geolocation) {
    return 'unsupported'
  }
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      return status.state as LocationPermissionState
    } catch {
      return 'prompt'
    }
  }
  return 'prompt'
}

export function getCurrentCoordinates(options?: PositionOptions): Promise<GetLocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        data: {
          latitude: null,
          longitude: null,
          accuracy: null,
          description: '',
          isManualFallback: true,
          error: 'Geolocation is not supported by your browser.',
        },
        error: 'Geolocation is not supported by your browser.',
      })
      return
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options,
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = Math.round(position.coords.accuracy)
        const lat = parseFloat(position.coords.latitude.toFixed(6))
        const lng = parseFloat(position.coords.longitude.toFixed(6))

        resolve({
          success: true,
          data: {
            latitude: lat,
            longitude: lng,
            accuracy: accuracy,
            description: `GPS fix (±${accuracy}m accuracy)`,
            isManualFallback: false,
            acquiredAt: new Date().toISOString(),
          },
        })
      },
      (error) => {
        let message = 'Unable to retrieve location.'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access was denied. Please provide a manual landmark description.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location signal unavailable. Please provide a manual landmark description.'
            break
          case error.TIMEOUT:
            message = 'Location request timed out. Please enter manual details or retry.'
            break
        }
        resolve({
          success: false,
          data: {
            latitude: null,
            longitude: null,
            accuracy: null,
            description: '',
            isManualFallback: true,
            error: message,
          },
          error: message,
        })
      },
      defaultOptions
    )
  })
}
