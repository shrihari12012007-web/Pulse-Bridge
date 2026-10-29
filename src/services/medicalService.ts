import { MedicalProfile, EmergencyContact } from '../types'
import { getSupabaseClient, isSupabaseConfigured } from './supabase'

const MEDICAL_PROFILE_STORAGE_KEY = 'pulsebridge_medical_profile'
const EMERGENCY_CONTACTS_STORAGE_KEY = 'pulsebridge_emergency_contacts'

const DEFAULT_PROFILE: MedicalProfile = {
  display_name: 'Aditya Sharma',
  blood_group: 'O+',
  allergies: 'Penicillin, Dust mites',
  medications: 'Salbutamol (as needed for asthma)',
  medical_notes: 'History of exercise-induced asthma. Keep inhaler within reach.',
  share_in_emergencies: true,
  updated_at: new Date().toISOString(),
}

const DEFAULT_CONTACTS: EmergencyContact[] = [
  {
    id: 'contact-01',
    contact_name: 'Ananya Sharma',
    phone: '+91-98765-43210',
    relationship: 'Sister',
    notify_on_sos: true,
  },
  {
    id: 'contact-02',
    contact_name: 'Dr. R. K. Patel',
    phone: '+91-91234-56780',
    relationship: 'Family Physician',
    notify_on_sos: false,
  },
]

export function getLocalMedicalProfile(): MedicalProfile {
  try {
    const raw = localStorage.getItem(MEDICAL_PROFILE_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Failed to read medical profile from storage', e)
  }
  return DEFAULT_PROFILE
}

export function saveLocalMedicalProfile(profile: MedicalProfile): void {
  try {
    const updated = { ...profile, updated_at: new Date().toISOString() }
    localStorage.setItem(MEDICAL_PROFILE_STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Failed to save medical profile', e)
  }
}

export function getLocalEmergencyContacts(): EmergencyContact[] {
  try {
    const raw = localStorage.getItem(EMERGENCY_CONTACTS_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Failed to read emergency contacts from storage', e)
  }
  return DEFAULT_CONTACTS
}

export function saveLocalEmergencyContacts(contacts: EmergencyContact[]): void {
  try {
    localStorage.setItem(EMERGENCY_CONTACTS_STORAGE_KEY, JSON.stringify(contacts))
  } catch (e) {
    console.error('Failed to save emergency contacts', e)
  }
}

export async function fetchRemoteMedicalProfile(userId: string): Promise<MedicalProfile | null> {
  const client = getSupabaseClient()
  if (!isSupabaseConfigured || !client) {
    return getLocalMedicalProfile()
  }

  try {
    const { data, error } = await client
      .from('medical_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.warn('Error fetching remote medical profile', error.message)
      return getLocalMedicalProfile()
    }
    if (data) {
      return {
        user_id: data.user_id,
        display_name: data.display_name || '',
        blood_group: data.blood_group,
        allergies: data.allergies || '',
        medications: data.medications || '',
        medical_notes: data.medical_notes || '',
        share_in_emergencies: data.share_in_emergencies ?? true,
        updated_at: data.updated_at,
      }
    }
  } catch (err) {
    console.error('Failed remote medical profile fetch', err)
  }
  return getLocalMedicalProfile()
}
