-- ============================================================================
-- PulseBridge Seed Data for Hackathon Demo
-- Fictional incident records clearly marked as DEMO SIMULATIONS
-- ============================================================================

-- Insert sample incidents (All clearly designated as fictional demo simulations)
INSERT INTO public.incidents (
    id,
    reference_code,
    incident_type,
    description,
    status,
    priority,
    latitude,
    longitude,
    location_accuracy,
    location_description,
    is_demo,
    backend_received,
    consented_medical_summary,
    emergency_contact_summary,
    created_at,
    updated_at,
    acknowledged_at,
    assigned_to,
    assigned_responder_name
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'DEMO-PB-901',
    'medical_emergency',
    '[DEMO SIMULATION] Severe asthma exacerbation reported in college campus library. Inhaler unavailable.',
    'SUBMITTED',
    'CRITICAL',
    12.9716,
    77.5946,
    8.5,
    'Central Library, 2nd Floor, Desk 42, Main Campus',
    true,
    true,
    '{"blood_group": "O+", "allergies": "Penicillin, Dust mites", "medications": "Salbutamol (inhaler)"}'::jsonb,
    '[{"name": "Ananya Sharma (Sibling)", "phone": "+91-98765-43210"}]'::jsonb,
    timezone('utc'::text, now() - INTERVAL '12 minutes'),
    timezone('utc'::text, now() - INTERVAL '12 minutes'),
    NULL,
    NULL,
    NULL
),
(
    '00000000-0000-0000-0000-000000000002',
    'DEMO-PB-902',
    'accident',
    '[DEMO SIMULATION] Two-wheeler skid near junction. Conscious, superficial abrasions and mild knee injury.',
    'ACKNOWLEDGED',
    'HIGH',
    12.9752,
    77.6012,
    14.2,
    'Near MG Road Metro Gate 2, Crossroad Junction',
    true,
    true,
    '{"blood_group": "B+", "allergies": "None recorded", "medications": "None"}'::jsonb,
    '[{"name": "Rohan Patel (Friend)", "phone": "+91-91234-56789"}]'::jsonb,
    timezone('utc'::text, now() - INTERVAL '25 minutes'),
    timezone('utc'::text, now() - INTERVAL '18 minutes'),
    timezone('utc'::text, now() - INTERVAL '18 minutes'),
    NULL,
    NULL
),
(
    '00000000-0000-0000-0000-000000000003',
    'DEMO-PB-903',
    'injury',
    '[DEMO SIMULATION] Heat exhaustion and sprain during university sports day marathon event.',
    'ASSIGNED',
    'MEDIUM',
    12.9680,
    77.5890,
    5.0,
    'Athletic Ground Track Area, North Gate Pavilion',
    true,
    true,
    '{"blood_group": "A+", "allergies": "Sulfa drugs", "medications": "Antihistamine"}'::jsonb,
    '[{"name": "Coach Murthy", "phone": "+91-94444-11223"}]'::jsonb,
    timezone('utc'::text, now() - INTERVAL '45 minutes'),
    timezone('utc'::text, now() - INTERVAL '20 minutes'),
    timezone('utc'::text, now() - INTERVAL '38 minutes'),
    NULL,
    'Paramedic Team Alpha (Unit 4)'
),
(
    '00000000-0000-0000-0000-000000000004',
    'DEMO-PB-904',
    'medical_emergency',
    '[DEMO SIMULATION] Diabetic hypoglycemia incident. First aid and glucose administered by on-site nurse.',
    'RESOLVED',
    'MEDIUM',
    12.9620,
    77.6100,
    12.0,
    'Auditorium Annex, Block C',
    true,
    true,
    '{"blood_group": "AB+", "allergies": "None", "medications": "Metformin"}'::jsonb,
    '[{"name": "Sunita Verma (Mother)", "phone": "+91-99887-76655"}]'::jsonb,
    timezone('utc'::text, now() - INTERVAL '2 hours'),
    timezone('utc'::text, now() - INTERVAL '30 minutes'),
    timezone('utc'::text, now() - INTERVAL '1 hour 50 minutes'),
    NULL,
    'Campus Medical Officer'
);

-- Seed timeline events for demonstration
INSERT INTO public.incident_events (
    incident_id,
    actor_name,
    actor_role,
    previous_status,
    new_status,
    event_description,
    created_at
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Citizen User',
    'citizen',
    NULL,
    'SUBMITTED',
    'Emergency incident created via PulseBridge mobile SOS portal.',
    timezone('utc'::text, now() - INTERVAL '12 minutes')
),
(
    '00000000-0000-0000-0000-000000000002',
    'Citizen User',
    'citizen',
    NULL,
    'SUBMITTED',
    'Accident assistance request submitted with GPS coordinates.',
    timezone('utc'::text, now() - INTERVAL '25 minutes')
),
(
    '00000000-0000-0000-0000-000000000002',
    'Dispatcher Sarah (Control 1)',
    'responder',
    'SUBMITTED',
    'ACKNOWLEDGED',
    'Incident verified by central dispatch. Station 3 notified.',
    timezone('utc'::text, now() - INTERVAL '18 minutes')
),
(
    '00000000-0000-0000-0000-000000000003',
    'Citizen User',
    'citizen',
    NULL,
    'SUBMITTED',
    'Sports ground medical assistance requested.',
    timezone('utc'::text, now() - INTERVAL '45 minutes')
),
(
    '00000000-0000-0000-0000-000000000003',
    'Lead Dispatcher Dave',
    'responder',
    'SUBMITTED',
    'ACKNOWLEDGED',
    'Triage completed. Priority classified as MEDIUM.',
    timezone('utc'::text, now() - INTERVAL '38 minutes')
),
(
    '00000000-0000-0000-0000-000000000003',
    'Lead Dispatcher Dave',
    'responder',
    'ACKNOWLEDGED',
    'ASSIGNED',
    'Dispatched Paramedic Team Alpha (Unit 4). ETA 4 minutes.',
    timezone('utc'::text, now() - INTERVAL '20 minutes')
);
