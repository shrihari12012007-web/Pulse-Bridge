import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { IncidentProvider } from './context/IncidentContext'
import { Header } from './components/common/Header'
import { Footer } from './components/common/Footer'
import { DemoBanner } from './components/common/DemoBanner'
import { EmergencyHome } from './pages/EmergencyHome'
import { CreateIncident } from './pages/CreateIncident'
import { IncidentTracking } from './pages/IncidentTracking'
import { ResponderDashboard } from './pages/ResponderDashboard'
import { MedicalProfilePage } from './pages/MedicalProfilePage'
import { SettingsHelpPage } from './pages/SettingsHelpPage'

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <IncidentProvider>
        <HashRouter>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <DemoBanner />
            <Header />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<EmergencyHome />} />
                <Route path="/report" element={<CreateIncident />} />
                <Route path="/tracking" element={<IncidentTracking />} />
                <Route path="/tracking/:id" element={<IncidentTracking />} />
                <Route path="/responder" element={<ResponderDashboard />} />
                <Route path="/medical-profile" element={<MedicalProfilePage />} />
                <Route path="/help" element={<SettingsHelpPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </IncidentProvider>
    </AuthProvider>
  )
}

export default App
