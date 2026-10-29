import '@testing-library/jest-dom'
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock Geolocation API for test environment
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
}

Object.defineProperty(globalThis.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
})
