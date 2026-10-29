import React, { useState, useEffect } from 'react'
import { 
  Heart, 
  Users, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle, 
  Lock,
  PhoneCall
} from 'lucide-react'
import { BloodGroup, EmergencyContact, MedicalProfile } from '../types'
import { 
  getLocalMedicalProfile, 
  saveLocalMedicalProfile, 
  getLocalEmergencyContacts, 
  saveLocalEmergencyContacts 
} from '../services/medicalService'

export const MedicalProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<MedicalProfile>(getLocalMedicalProfile())
  const [contacts, setContacts] = useState<EmergencyContact[]>(getLocalEmergencyContacts())
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  // New Contact form
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactRelation, setNewContactRelation] = useState('')

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    saveLocalMedicalProfile(profile)
    setSaveStatus('Medical profile saved successfully.')
    setTimeout(() => setSaveStatus(null), 3000)
  }

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContactName.trim() || !newContactPhone.trim()) return

    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      contact_name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: newContactRelation.trim() || 'Contact',
      notify_on_sos: true,
    }

    const updated = [...contacts, newContact]
    setContacts(updated)
    saveLocalEmergencyContacts(updated)
    setNewContactName('')
    setNewContactPhone('')
    setNewContactRelation('')
  }

  const handleDeleteContact = (id?: string) => {
    const updated = contacts.filter((c) => c.id !== id)
    setContacts(updated)
    saveLocalEmergencyContacts(updated)
  }

  return (
    <div style={{ padding: '1.5rem 1rem 3.5rem', minHeight: '85vh' }}>
      <div className="container-narrow">

        {/* Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#fce7f3',
                color: '#db2777',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Emergency Medical Profile
              </h1>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                User-Controlled • Consented Health Data • Never Auto-Diagnosed
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Clinical Non-Prescription Notice */}
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '0.8125rem',
            color: '#1e40af',
          }}
        >
          <Lock size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Strict Privacy & Safety Protocol:</strong> This medical record is entirely optional.
            PulseBridge does <strong>not</strong> provide automated clinical diagnoses or recommend medications.
            Information entered here is only provided to verified human responders handling your specific emergency.
          </div>
        </div>

        {saveStatus && (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '1rem',
              color: '#065f46',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            {saveStatus}
          </div>
        )}

        {/* Profile Edit Form */}
        <form
          onSubmit={handleSaveProfile}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Display Name */}
          <div>
            <label htmlFor="displayName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Preferred Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              placeholder="e.g. Aditya Sharma"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Blood Group */}
          <div>
            <label htmlFor="bloodGroup" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Blood Group
            </label>
            <select
              id="bloodGroup"
              value={profile.blood_group}
              onChange={(e) => setProfile({ ...profile, blood_group: e.target.value as BloodGroup })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="Unknown">Unknown / Not Tested</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* Known Allergies */}
          <div>
            <label htmlFor="allergies" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Known Allergies (Food, Drug, Environmental)
            </label>
            <input
              id="allergies"
              type="text"
              value={profile.allergies}
              onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
              placeholder="e.g. Penicillin, Peanuts, Sulfa drugs (or 'None')"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Current Medications */}
          <div>
            <label htmlFor="medications" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Current Regular Medications
            </label>
            <input
              id="medications"
              type="text"
              value={profile.medications}
              onChange={(e) => setProfile({ ...profile, medications: e.target.value })}
              placeholder="e.g. Inhaler (Salbutamol), Insulin, Metformin"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Medical Notes */}
          <div>
            <label htmlFor="medicalNotes" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Critical Medical Notes / Conditions
            </label>
            <textarea
              id="medicalNotes"
              rows={3}
              value={profile.medical_notes}
              onChange={(e) => setProfile({ ...profile, medical_notes: e.target.value })}
              placeholder="e.g. Diabetic Type 1; Epilepsy history; Carries EpiPen in backpack"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Consent Checkbox */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                Consent to Attach in Emergencies
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                When checked, these details are securely transmitted to responders upon SOS dispatch.
              </div>
            </div>
            <input
              type="checkbox"
              checked={profile.share_in_emergencies}
              onChange={(e) => setProfile({ ...profile, share_in_emergencies: e.target.checked })}
              style={{ width: '20px', height: '20px', accentColor: '#0284c7' }}
            />
          </div>

          <button
            type="submit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: 700,
            }}
          >
            <Save size={18} /> Save Medical Profile
          </button>
        </form>

        {/* Emergency Contacts Section */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#0284c7" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Trusted Emergency Contacts
            </h2>
          </div>

          {/* Contact List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {contacts.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                No trusted contacts added yet. Add family members, friends, or campus guardians below.
              </div>
            ) : (
              contacts.map((c) => (
                <div
                  key={c.id || c.phone}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                      {c.contact_name} ({c.relationship})
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#0284c7', marginTop: '2px' }}>
                      <a href={`tel:${c.phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {c.phone}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    title="Remove contact"
                    style={{
                      padding: '6px',
                      color: '#94a3b8',
                      borderRadius: '6px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Contact Form */}
          <form
            onSubmit={handleAddContact}
            style={{
              borderTop: '1px solid #f1f5f9',
              paddingTop: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr)) 80px',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Name"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
              }}
            />
            <input
              type="tel"
              placeholder="Phone (e.g. +91 98765...)"
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
              }}
            />
            <input
              type="text"
              placeholder="Relationship"
              value={newContactRelation}
              onChange={(e) => setNewContactRelation(e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 12px',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              <Plus size={14} /> Add
            </button>
          </form>

        </div>

      </div>
    </div>
  )
}
