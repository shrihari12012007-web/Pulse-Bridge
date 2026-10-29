import React from 'react'
import { Shield, AlertCircle, Phone } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        borderTop: '1px solid #1e293b',
        padding: '2.5rem 1rem 2rem',
        fontSize: '0.875rem',
        marginTop: 'auto',
      }}
    >
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>
              <Shield size={20} color="#0ea5e9" />
              <span>PulseBridge — BUILDATHON 2.0</span>
            </div>
            <p style={{ lineHeight: 1.6, fontSize: '0.8125rem', color: '#94a3b8' }}>
              Emergency Response Coordination platform developed for KNEW-2K26 Problem Statement H4: 
              Emergency Health Assistance. Theme: Building intelligent solutions for a smarter, sustainable and secure tomorrow.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>
              <AlertCircle size={20} color="#f59e0b" />
              <span>Mandatory Prototype Disclosure</span>
            </div>
            <p style={{ lineHeight: 1.6, fontSize: '0.8125rem', color: '#94a3b8' }}>
              PulseBridge is an academic hackathon engineering prototype. It is <strong>NOT</strong> an official government emergency dispatch service.
              Submissions here coordinate local authorized campus/event responders and do not automatically dispatch municipal ambulances or police.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>
              <Phone size={20} color="#ef4444" />
              <span>Official Emergency Helplines (India)</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>112</strong> — National Emergency All-in-One Helpline</li>
              <li><strong>108 / 102</strong> — Emergency Medical & Ambulance Services</li>
              <li><strong>100</strong> — Police Emergency</li>
              <li><strong>101</strong> — Fire & Rescue</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} PulseBridge Coordination. Privacy by Design. Consented Data Only.
          </div>
          <div>
            Designed with React, TypeScript, Leaflet, and Supabase.
          </div>
        </div>
      </div>
    </footer>
  )
}
