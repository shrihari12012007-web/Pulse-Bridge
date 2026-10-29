import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { StatusBadge } from '../components/common/StatusBadge'
import { EmergencyHome } from '../pages/EmergencyHome'
import { AuthProvider } from '../context/AuthContext'
import { IncidentProvider } from '../context/IncidentContext'

describe('PulseBridge UI Component Suite', () => {
  it('renders StatusBadges with correct text labels', () => {
    const { rerender } = render(<StatusBadge status="SUBMITTED" />)
    expect(screen.getByText('SUBMITTED')).toBeInTheDocument()

    rerender(<StatusBadge status="ACKNOWLEDGED" />)
    expect(screen.getByText('ACKNOWLEDGED')).toBeInTheDocument()

    rerender(<StatusBadge status="ASSIGNED" />)
    expect(screen.getByText('ASSIGNED')).toBeInTheDocument()

    rerender(<StatusBadge status="RESOLVED" />)
    expect(screen.getByText('RESOLVED')).toBeInTheDocument()
  })

  it('renders Emergency Home with prominent SOS button and 112 hotline links', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <IncidentProvider>
            <HashRouter>
              <EmergencyHome />
            </HashRouter>
          </IncidentProvider>
        </AuthProvider>
      )
    })

    // SOS button exists
    expect(screen.getByRole('button', { name: /activate emergency sos/i })).toBeInTheDocument()

    // 112 Call link exists and points directly to tel:112 without login requirement
    const call112Links = screen.getAllByRole('link', { name: /112/i })
    expect(call112Links.length).toBeGreaterThanOrEqual(1)
    expect(call112Links[0]).toHaveAttribute('href', 'tel:112')

    // Triage heading exists
    expect(screen.getByText(/emergency health assistance/i)).toBeInTheDocument()
  })
})
