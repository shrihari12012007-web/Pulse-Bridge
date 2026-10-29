-- ============================================================================
-- PulseBridge Database Schema Migration
-- Hackathon: BUILDATHON 2.0, KNEW-2K26 | Problem H4: Emergency Health Assistance
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE
-- Links to Supabase auth.users, holds user role and display name
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'responder', 'admin')) DEFAULT 'user',
    badge_number TEXT,
    organization TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for role lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. MEDICAL PROFILES TABLE
-- Optional, consented user health profile for emergency responders
CREATE TABLE IF NOT EXISTS public.medical_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown')) DEFAULT 'Unknown',
    allergies TEXT,
    medications TEXT,
    medical_notes TEXT,
    share_in_emergencies BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_medical_profiles_user ON public.medical_profiles(user_id);

-- 4. EMERGENCY CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT,
    notify_on_sos BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON public.emergency_contacts(user_id);

-- 5. INCIDENTS TABLE
-- Core emergency incident record
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    incident_type TEXT NOT NULL CHECK (incident_type IN ('medical_emergency', 'injury', 'accident', 'other')),
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'RESOLVED', 'CANCELLED')) DEFAULT 'SUBMITTED',
    priority TEXT NOT NULL CHECK (priority IN ('HIGH', 'CRITICAL', 'MEDIUM', 'LOW')) DEFAULT 'CRITICAL',
    
    -- Location details
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_accuracy DOUBLE PRECISION,
    location_description TEXT,
    
    -- Consented health snapshot at incident creation time
    consented_medical_summary JSONB DEFAULT '{}'::jsonb,
    emergency_contact_summary JSONB DEFAULT '[]'::jsonb,
    
    -- Verification and simulation flags
    is_demo BOOLEAN NOT NULL DEFAULT false,
    backend_received BOOLEAN NOT NULL DEFAULT true,
    
    -- Responder assignment
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_responder_name TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    acknowledged_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_by ON public.incidents(created_by);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_reference_code ON public.incidents(reference_code);

-- 6. INCIDENT EVENTS (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.incident_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL DEFAULT 'System',
    actor_role TEXT NOT NULL DEFAULT 'system',
    previous_status TEXT,
    new_status TEXT NOT NULL,
    event_description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_incident_events_incident ON public.incident_events(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_events_created_at ON public.incident_events(created_at ASC);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_events ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an authorized responder or admin
CREATE OR REPLACE FUNCTION public.is_responder_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('responder', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_responder_or_admin());

CREATE POLICY "Users can update own profile display name"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Medical Profiles Policies (Strict user isolation; responders only view via consented incident snapshots)
CREATE POLICY "Users can view own medical profile"
    ON public.medical_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical profile"
    ON public.medical_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical profile"
    ON public.medical_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Emergency Contacts Policies
CREATE POLICY "Users can view own emergency contacts"
    ON public.emergency_contacts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts"
    ON public.emergency_contacts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update/delete own contacts"
    ON public.emergency_contacts FOR ALL
    USING (auth.uid() = user_id);

-- Incidents Policies
-- Anyone (including unauthenticated emergency guests) can insert an incident
CREATE POLICY "Anyone can report an emergency incident"
    ON public.incidents FOR INSERT
    WITH CHECK (true);

-- Users can view their own incidents; responders/admins can view all incidents
CREATE POLICY "View incidents policy"
    ON public.incidents FOR SELECT
    USING (
        auth.uid() = created_by
        OR public.is_responder_or_admin()
        OR created_by IS NULL -- guest-created incidents can be tracked via reference_code
    );

-- Only responders/admins or the creator (for cancellation) can update status
CREATE POLICY "Responders can update incident status and assignment"
    ON public.incidents FOR UPDATE
    USING (
        public.is_responder_or_admin()
        OR (auth.uid() = created_by AND status = 'SUBMITTED')
    );

-- Incident Events Policies
CREATE POLICY "View incident events policy"
    ON public.incident_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.incidents i
            WHERE i.id = incident_id
              AND (i.created_by = auth.uid() OR public.is_responder_or_admin() OR i.created_by IS NULL)
        )
    );

CREATE POLICY "Insert incident events"
    ON public.incident_events FOR INSERT
    WITH CHECK (true);

-- 8. REALTIME REPLICATION ENABLEMENT
-- Allows Supabase real-time subscriptions for incidents and events
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_events;
