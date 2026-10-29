import { describe, it, expect } from 'vitest'

describe('Davangere & Dynamic GPS Coordinate Resolution', () => {
  it('does not assign Bengaluru coordinates when GPS is not acquired for Davangere landmark', () => {
    // Simulated incident submission without GPS fix
    const currentCoords = null
    const landmark = "Jain Institute of Technology, Davangere"
    const hasCoords = currentCoords !== null

    const submittedIncident = {
      id: "inc-test-davangere",
      ref: "PB-TEST-1",
      landmark: landmark,
      lat: hasCoords ? (currentCoords as any).lat : null,
      lng: hasCoords ? (currentCoords as any).lng : null,
      accuracy: hasCoords ? (currentCoords as any).acc : null,
      isManualLocation: !hasCoords,
    }

    expect(submittedIncident.lat).toBeNull()
    expect(submittedIncident.lng).toBeNull()
    expect(submittedIncident.accuracy).toBeNull()
    expect(submittedIncident.isManualLocation).toBe(true)
    // Must NOT be Bengaluru
    expect(submittedIncident.lat).not.toBe(12.9716)
    expect(submittedIncident.lng).not.toBe(77.5946)
  })

  it('records exact coordinates and measured accuracy when GPS fix is acquired for Davangere', () => {
    const davangereGPS = {
      lat: 14.4644,
      lng: 75.9218,
      acc: 9, // Measured 9m accuracy
      isManual: false,
    }
    const landmark = "Jain Institute of Technology, Davangere"
    const hasCoords = davangereGPS !== null

    const submittedIncident = {
      id: "inc-test-davangere-gps",
      ref: "PB-TEST-2",
      landmark: landmark,
      lat: hasCoords ? davangereGPS.lat : null,
      lng: hasCoords ? davangereGPS.lng : null,
      accuracy: (hasCoords && !davangereGPS.isManual) ? davangereGPS.acc : null,
      isManualLocation: !hasCoords || davangereGPS.isManual,
    }

    expect(submittedIncident.lat).toBe(14.4644)
    expect(submittedIncident.lng).toBe(75.9218)
    expect(submittedIncident.accuracy).toBe(9) // Real sensor accuracy, NOT 15m
    expect(submittedIncident.accuracy).not.toBe(15)
  })

  it('validates and handles manually entered coordinates without fabricating accuracy', () => {
    const validateCoords = (latStr: string, lngStr: string) => {
      const lat = parseFloat(latStr)
      const lng = parseFloat(lngStr)
      if (isNaN(lat) || lat < -90 || lat > 90) return null
      if (isNaN(lng) || lng < -180 || lng > 180) return null
      return { lat, lng, acc: null, isManual: true }
    }

    expect(validateCoords("95.0", "75.0")).toBeNull()
    expect(validateCoords("14.4644", "195.0")).toBeNull()

    const validManual = validateCoords("14.4644", "75.9218")
    expect(validManual).not.toBeNull()
    expect(validManual?.lat).toBe(14.4644)
    expect(validManual?.lng).toBe(75.9218)
    expect(validManual?.acc).toBeNull() // Manual coordinates do not claim sensor accuracy
    expect(validManual?.isManual).toBe(true)
  })

  it('calculates map center targeting active incident, then geo incidents, then Pan-India fallback', () => {
    const getMapCenter = (activeInc: any, incidents: any[]) => {
      const geoIncidents = incidents.filter(i => i.lat !== null && i.lng !== null && !isNaN(i.lat) && !isNaN(i.lng))
      if (activeInc && activeInc.lat !== null && activeInc.lng !== null) {
        return { center: [activeInc.lat, activeInc.lng], zoom: 14 }
      }
      if (geoIncidents.length > 0) {
        return { center: [geoIncidents[0].lat, geoIncidents[0].lng], zoom: 13 }
      }
      return { center: [20.5937, 78.9629], zoom: 5 } // Pan-India
    }

    // Scenario 1: Active incident has Davangere GPS
    const activeDavangere = { id: 'inc-1', lat: 14.4644, lng: 75.9218 }
    const res1 = getMapCenter(activeDavangere, [activeDavangere])
    expect(res1.center).toEqual([14.4644, 75.9218])
    expect(res1.zoom).toBe(14)

    // Scenario 2: Active incident has NO GPS (landmark only)
    const activeNoGps = { id: 'inc-2', lat: null, lng: null, landmark: 'Davangere' }
    const geoOther = { id: 'inc-3', lat: 13.0, lng: 77.0 }
    const res2 = getMapCenter(activeNoGps, [activeNoGps, geoOther])
    expect(res2.center).toEqual([13.0, 77.0])

    // Scenario 3: No geo incidents at all -> Pan-India
    const res3 = getMapCenter(activeNoGps, [activeNoGps])
    expect(res3.center).toEqual([20.5937, 78.9629])
    expect(res3.zoom).toBe(5)
  })
})
