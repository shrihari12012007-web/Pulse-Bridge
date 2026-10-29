// ============================================================================
// PulseBridge Types and Interfaces
// ============================================================================

export type IncidentStatus = 
  | 'SUBMITTED' 
  | 'ACKNOWLEDGED' 
  | 'ASSIGNED' 
  | 'RESOLVED' 
  | 'CANCELLED';

export type IncidentType = 
  | 'medical_emergency' 
  | 'injury' 
  | 'accident' 
  | 'other';

export type IncidentPriority = 
  | 'CRITICAL' 
  | 'HIGH' 
  | 'MEDIUM' 
  | 'LOW';

export type UserRole = 
  | 'user' 
  | 'responder' 
  | 'admin';

export type BloodGroup = 
  | 'A+' | 'A-' 
  | 'B+' | 'B-' 
  | 'AB+' | 'AB-' 
  | 'O+' | 'O-' 
  | 'Unknown';

export interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  description: string;
  isManualFallback: boolean;
  acquiredAt?: string;
  error?: string;
}

export interface ConsentedMedicalSnapshot {
  blood_group?: BloodGroup;
  allergies?: string;
  medications?: string;
  medical_notes?: string;
  display_name?: string;
}

export interface EmergencyContact {
  id?: string;
  contact_name: string;
  phone: string;
  relationship: string;
  notify_on_sos?: boolean;
}

export interface IncidentEvent {
  id: string;
  incident_id: string;
  actor_name: string;
  actor_role: string;
  previous_status?: IncidentStatus | null;
  new_status: IncidentStatus;
  event_description: string;
  created_at: string;
}

export interface Incident {
  id: string;
  reference_code: string;
  created_by?: string | null;
  incident_type: IncidentType;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  
  // Location
  latitude: number | null;
  longitude: number | null;
  location_accuracy: number | null;
  location_description: string;
  
  // Consented snapshots
  consented_medical_summary?: ConsentedMedicalSnapshot;
  emergency_contact_summary?: EmergencyContact[];
  
  // Simulation / Integrity flags
  is_demo: boolean;
  backend_received: boolean;
  is_offline_draft?: boolean;
  
  // Responders
  assigned_to?: string | null;
  assigned_responder_name?: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  acknowledged_at?: string | null;
  assigned_at?: string | null;
  resolved_at?: string | null;
  cancelled_at?: string | null;
  
  // Audit events
  events?: IncidentEvent[];
}

export interface CreateIncidentPayload {
  incident_type: IncidentType;
  description?: string;
  priority?: IncidentPriority;
  latitude: number | null;
  longitude: number | null;
  location_accuracy: number | null;
  location_description: string;
  consented_medical_summary?: ConsentedMedicalSnapshot;
  emergency_contact_summary?: EmergencyContact[];
  created_by?: string | null;
}

export interface MedicalProfile {
  user_id?: string;
  display_name: string;
  blood_group: BloodGroup;
  allergies: string;
  medications: string;
  medical_notes: string;
  share_in_emergencies: boolean;
  updated_at?: string;
}

export interface UserSession {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  isDemoAccount?: boolean;
}

export interface IncidentFilters {
  status?: IncidentStatus | 'ALL';
  incidentType?: IncidentType | 'ALL';
  searchQuery?: string;
  onlyActive?: boolean;
}

export interface NetworkStatus {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  backendConfigured: boolean;
  isDemoMode: boolean;
}
