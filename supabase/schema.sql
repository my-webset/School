-- ==============================================================================
-- NALANDA INTERNATIONAL SCHOOL - SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================
-- Run this SQL in your Supabase Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. ADMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.admissions (
    id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT NOT NULL DEFAULT 'Male',
    class_applying TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    prev_school TEXT,
    prev_class TEXT,
    academics TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast status & search queries
CREATE INDEX IF NOT EXISTS idx_admissions_status ON public.admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_class ON public.admissions(class_applying);
CREATE INDEX IF NOT EXISTS idx_admissions_created_at ON public.admissions(created_at DESC);

-- 2. CUSTOM FORMS BUILDER TABLE
CREATE TABLE IF NOT EXISTS public.custom_forms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Published', 'Draft')),
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. FORM SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.form_submissions (
    id TEXT PRIMARY KEY,
    form_id TEXT NOT NULL REFERENCES public.custom_forms(id) ON DELETE CASCADE,
    form_name TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON public.form_submissions(form_id);

-- 4. NOTICES & CIRCULARS TABLE
CREATE TABLE IF NOT EXISTS public.notices (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('Academic', 'Event', 'Admission', 'Examination', 'General')),
    published BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notices_published ON public.notices(published);
CREATE INDEX IF NOT EXISTS idx_notices_date ON public.notices(date DESC);

-- 5. SCHOOL EVENTS CALENDAR TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date ASC);

-- 6. CAMPUS PHOTO GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Campus' CHECK (category IN ('Campus', 'Sports', 'Cultural', 'Academics', 'Events')),
    image_url TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SCHOOL INFORMATION & BRANDING TABLE
CREATE TABLE IF NOT EXISTS public.school_info (
    id INT PRIMARY KEY DEFAULT 1,
    name TEXT NOT NULL DEFAULT 'Nalanda International School',
    tagline TEXT NOT NULL DEFAULT 'Nurturing Excellence, Building Futures',
    established INT NOT NULL DEFAULT 1989,
    affiliation_no TEXT NOT NULL DEFAULT 'CBSE/AFF/2130124',
    board TEXT NOT NULL DEFAULT 'CBSE (Central Board of Secondary Education)',
    principal TEXT NOT NULL DEFAULT 'Dr. Priya Sharma',
    principal_message TEXT,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    website TEXT NOT NULL,
    about TEXT,
    socials JSONB NOT NULL DEFAULT '{"facebook":"","instagram":"","youtube":""}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- 8. AI GENERATED EXAM PAPERS TABLE
CREATE TABLE IF NOT EXISTS public.saved_papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    total_marks INT NOT NULL,
    duration TEXT NOT NULL,
    topics TEXT,
    difficulty TEXT NOT NULL DEFAULT 'Mixed',
    instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. WEBSITE & ADMIN SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1,
    admin_password_hash TEXT NOT NULL DEFAULT 'admin123',
    groq_api_key TEXT,
    gemini_api_key TEXT,
    openai_api_key TEXT,
    ai_provider TEXT NOT NULL DEFAULT 'groq',
    ai_usage_count INT NOT NULL DEFAULT 0,
    ai_credits_limit INT NOT NULL DEFAULT 500,
    theme_color TEXT NOT NULL DEFAULT '#1a3a6e',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_settings_row CHECK (id = 1)
);

-- ==============================================================================
-- INITIAL DEFAULT SEED DATA
-- ==============================================================================

-- Seed School Information
INSERT INTO public.school_info (
    id, name, tagline, established, affiliation_no, board, principal, principal_message, address, phone, email, website, about, socials
) VALUES (
    1,
    'Nalanda International School',
    'Nurturing Excellence, Building Futures',
    1989,
    'CBSE/AFF/2130124',
    'CBSE (Central Board of Secondary Education)',
    'Dr. Priya Sharma',
    'Education is the most powerful weapon you can use to change the world. At Nalanda, we believe every child carries unique potential. Our dedicated faculty and world-class infrastructure create an environment where curiosity flourishes and character is built.',
    '14, Vidya Vihar, Sector 21, Noida, Uttar Pradesh – 201301',
    '+91 98765 43210',
    'admissions@nalandainternational.edu.in',
    'www.nalandainternational.edu.in',
    'Nalanda International School has been a beacon of academic excellence in Noida for over three decades. We nurture young minds with a holistic curriculum blending modern pedagogy with Indian values, preparing students for a globally competitive world.',
    '{"facebook":"https://facebook.com/nalandainternational","instagram":"https://instagram.com/nalandainternational","youtube":"https://youtube.com/@nalandainternational"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Seed Settings
INSERT INTO public.site_settings (
    id, admin_password_hash, ai_usage_count, ai_credits_limit, theme_color
) VALUES (
    1, 'admin123', 0, 500, '#1a3a6e'
) ON CONFLICT (id) DO NOTHING;

-- Seed Initial Form
INSERT INTO public.custom_forms (
    id, name, description, status, fields
) VALUES (
    'form-scholarship-2026',
    'Merit & Sports Scholarship Application 2026',
    'Apply for financial assistance or athletic fee waiver.',
    'Published',
    '[
      {"id":"f1","type":"text","label":"Student Full Name","placeholder":"Enter student name","required":true},
      {"id":"f2","type":"select","label":"Applying Category","required":true,"options":["Academic Merit (Above 90%)","State/National Sports","Co-Curricular / Performing Arts"]},
      {"id":"f3","type":"tel","label":"Parent Contact Number","placeholder":"+91 XXXXX XXXXX","required":true},
      {"id":"f4","type":"textarea","label":"Achievements / Details","placeholder":"Summarize marks or sport honors...","required":true}
    ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Seed Initial Notices
INSERT INTO public.notices (id, title, date, category, published, description) VALUES
('not-1', 'Admissions Open for Academic Session 2026-27 (Nursery to Class IX)', CURRENT_DATE, 'Admission', true, 'Online application portal is now active for upcoming session admissions.'),
('not-2', 'Annual Sports Day & Athletics Meet Schedule', CURRENT_DATE - INTERVAL '2 days', 'Event', true, 'Annual sports meet will take place at the school sports complex.'),
('not-3', 'Half-Yearly Examination Timetable & Syllabus Guidelines', CURRENT_DATE - INTERVAL '5 days', 'Academic', true, 'Detailed subject syllabus and examination guidelines released for classes VI to XII.')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Events
INSERT INTO public.events (id, name, date, time, location, description, published) VALUES
('evt-1', 'Annual Science & Robotics Exhibition', CURRENT_DATE + INTERVAL '14 days', '09:30 AM', 'School Auditorium & Labs', 'Students from all classes showcase innovative scientific experiments and robotics prototypes.', true),
('evt-2', 'Inter-House Football & Basketball Championship', CURRENT_DATE + INTERVAL '21 days', '08:00 AM', 'Main Sports Complex', 'Championship matches among Tagore, Shivaji, Raman and Ashoka houses.', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Gallery Highlights
INSERT INTO public.gallery (id, title, category, image_url, date) VALUES
('gal-1', 'State-of-the-art Science Laboratory', 'Campus', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop', '2026-08-15'),
('gal-2', 'Annual Sports Meet Athletics & Track', 'Sports', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop', '2026-08-20'),
('gal-3', 'Modern Digital Library & Reading Zone', 'Campus', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop', '2026-08-25'),
('gal-4', 'Cultural Performing Arts Festival', 'Cultural', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop', '2026-09-01')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Enable RLS
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active public content
CREATE POLICY "Public can view published notices" ON public.notices FOR SELECT USING (published = true);
CREATE POLICY "Public can view published events" ON public.events FOR SELECT USING (published = true);
CREATE POLICY "Public can view gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Public can view school info" ON public.school_info FOR SELECT USING (true);
CREATE POLICY "Public can view published forms" ON public.custom_forms FOR SELECT USING (status = 'Published');

-- Allow public to submit admission forms & custom forms
CREATE POLICY "Public can submit admissions" ON public.admissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can lookup their admission status" ON public.admissions FOR SELECT USING (true);
CREATE POLICY "Public can submit custom form responses" ON public.form_submissions FOR INSERT WITH CHECK (true);

-- Allow full access to anon key / admin for management
CREATE POLICY "Admin full access admissions" ON public.admissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access custom_forms" ON public.custom_forms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access form_submissions" ON public.form_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access notices" ON public.notices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access gallery" ON public.gallery FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access school_info" ON public.school_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access saved_papers" ON public.saved_papers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
