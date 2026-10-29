import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Activity, 
  PhoneCall, 
  ShieldAlert, 
  UserCheck, 
  FileText, 
  HelpCircle, 
  Menu, 
  X, 
  Heart,
  ChevronDown
} from 'lucide-react'
import { useAuth, DEMO_PERSONAS } from '../../context/AuthContext'
import { useIncidents } from '../../context/IncidentContext'

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { role, activePersona, switchPersona, isDemoUser } = useAuth()
  const { isOffline, isSimulatedOffline } = useIncidents()

  const isResponderRoute = location.pathname.startsWith('/responder')

  const navLinks = [
    { to: '/', label: 'Emergency Home', icon: ShieldAlert },
    { to: '/report', label: 'Report Incident', icon: Activity },
    { to: '/tracking', label: 'Incident Tracking', icon: FileText },
    { to: '/responder', label: 'Responder Center', icon: UserCheck },
    { to: '/medical-profile', label: 'Medical Profile', icon: Heart },
    { to: '/help', label: 'Help & Privacy', icon: HelpCircle },
  ]

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <header
      style={{
        backgroundColor: isResponderRoute ? '#091124' : '#ffffff',
        borderBottom: `1px solid ${isResponderRoute ? '#1e293b' : '#e2e8f0'}`,
        color: isResponderRoute ? '#f8fafc' : '#0f172a',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background-color 0.2s ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
            }}
          >
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: isResponderRoute ? '#ffffff' : '#0f172a' }}>
                PulseBridge
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: isResponderRoute ? '#0284c7' : '#e0f2fe',
                  color: isResponderRoute ? '#ffffff' : '#0369a1',
                }}
              >
                H4
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: isResponderRoute ? '#94a3b8' : '#64748b' }}>
              Emergency Response Coordination
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '6px',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const active = isActive(link.to)
            const Icon = link.icon
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: active ? 600 : 500,
                  color: active
                    ? (isResponderRoute ? '#38bdf8' : '#0284c7')
                    : (isResponderRoute ? '#94a3b8' : '#475569'),
                  backgroundColor: active
                    ? (isResponderRoute ? '#1e293b' : '#f0f9ff')
                    : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Action Controls & Emergency 112 Dial */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Official India 112 Call Button */}
          <a
            href="tel:112"
            title="Immediate direct phone call to India Emergency Services 112"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)',
              minHeight: '44px',
            }}
          >
            <PhoneCall size={18} />
            <span>Call 112</span>
          </a>

          {/* Persona Switcher for Hackathon Testing */}
          {isDemoUser && (
            <div
              style={{
                position: 'relative',
                display: 'inline-block',
              }}
            >
              <select
                aria-label="Demo Persona Switcher"
                value={activePersona.id}
                onChange={(e) => switchPersona(e.target.value)}
                style={{
                  padding: '7px 24px 7px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: isResponderRoute ? '#1e293b' : '#f1f5f9',
                  color: isResponderRoute ? '#f8fafc' : '#334155',
                  border: `1px solid ${isResponderRoute ? '#334155' : '#cbd5e1'}`,
                  cursor: 'pointer',
                  appearance: 'none',
                }}
              >
                {DEMO_PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role.toUpperCase()})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: isResponderRoute ? '#94a3b8' : '#64748b',
                }}
              />
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="touch-target mobile-menu-btn"
            style={{
              padding: '8px',
              borderRadius: '8px',
              color: isResponderRoute ? '#ffffff' : '#0f172a',
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: isResponderRoute ? '#0f172a' : '#ffffff',
            borderTop: `1px solid ${isResponderRoute ? '#1e293b' : '#e2e8f0'}`,
            padding: '1rem',
          }}
          className="mobile-drawer"
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navLinks.map((link) => {
              const active = isActive(link.to)
              const Icon = link.icon
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    fontWeight: active ? 600 : 500,
                    color: active
                      ? (isResponderRoute ? '#38bdf8' : '#0284c7')
                      : (isResponderRoute ? '#94a3b8' : '#334155'),
                    backgroundColor: active
                      ? (isResponderRoute ? '#1e293b' : '#f0f9ff')
                      : 'transparent',
                  }}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  )
}
