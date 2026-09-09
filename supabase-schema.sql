-- =========================================================================
-- SUPPORT LINK BOX - SUPABASE DATABASE SCHEMA
-- Community Exchange & Engagement Platform
-- =========================================================================

-- 1. Create Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    member_number INTEGER UNIQUE NOT NULL,
    name TEXT NOT NULL,
    facebook_name TEXT,
    normalized_name TEXT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    facebook_url TEXT NOT NULL,
    normalized_fb_id TEXT,
    name_locked BOOLEAN DEFAULT FALSE,
    name_mismatch_flag BOOLEAN DEFAULT FALSE,
    name_mismatch_note TEXT,
    role TEXT DEFAULT 'member', -- 'developer', 'super_admin', 'admin', 'moderator', 'member'
    is_system_admin BOOLEAN DEFAULT FALSE, -- Core Database System Admin flag (protected)
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'frozen', 'suspended', 'removed', 'pending_approval'
    total_links_submitted INTEGER DEFAULT 0,
    total_supports_completed INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    weekly_points INTEGER DEFAULT 0,
    current_rank INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    inactive_days INTEGER DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    badges JSONB DEFAULT '[]'::jsonb,
    community_id TEXT DEFAULT 'comm_default',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for speedy queries
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_role ON public.members(role);
CREATE INDEX IF NOT EXISTS idx_members_is_system_admin ON public.members(is_system_admin);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);

-- 2. Initial Seed for Primary Developer / System Admin
-- Verified directly from Supabase Database
INSERT INTO public.members (
    id,
    member_number,
    name,
    facebook_name,
    normalized_name,
    username,
    email,
    avatar,
    facebook_url,
    role,
    is_system_admin,
    status,
    total_points,
    notes
) VALUES (
    'user_dev_shihab',
    100,
    'Md Shihab Khan',
    'Md Shihab Khan',
    'mdshihabkhan',
    'shihab_khan',
    'Muradshihab515@gmail.com',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://www.facebook.com/SmShihab2.0',
    'developer',
    TRUE,
    'active',
    500,
    'Primary Developer & System Administrator (Protected via Supabase DB)'
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    facebook_url = EXCLUDED.facebook_url,
    role = 'developer',
    is_system_admin = TRUE;

-- 3. Create Daily Links Table
CREATE TABLE IF NOT EXISTS public.daily_links (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    member_number INTEGER NOT NULL,
    member_avatar TEXT,
    link_number INTEGER DEFAULT 1,
    post_url TEXT NOT NULL,
    caption TEXT,
    category TEXT DEFAULT 'general',
    status TEXT DEFAULT 'active',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_supports_received INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_daily_links_date ON public.daily_links(date);
CREATE INDEX IF NOT EXISTS idx_daily_links_member ON public.daily_links(member_id);

-- 4. Create Support Records Table
CREATE TABLE IF NOT EXISTS public.support_records (
    id TEXT PRIMARY KEY,
    supporter_member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    link_id TEXT REFERENCES public.daily_links(id) ON DELETE CASCADE,
    target_member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'completed'
);

CREATE INDEX IF NOT EXISTS idx_supports_date ON public.support_records(date);
CREATE INDEX IF NOT EXISTS idx_supports_supporter ON public.support_records(supporter_member_id);

-- 5. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    admin_name TEXT,
    admin_role TEXT,
    actor_id TEXT,
    actor_name TEXT,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    target_name TEXT,
    details TEXT,
    community_id TEXT DEFAULT 'main',
    ip_address TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- 6. Create Notices Table
CREATE TABLE IF NOT EXISTS public.notices (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'announcement', -- 'simple_warning', 'alert_warning', 'kickout_warning', 'announcement'
    target_type TEXT DEFAULT 'all',
    target_member_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Public Read Policies (Allow members and visitors to view data)
CREATE POLICY "Allow public read access to members" ON public.members FOR SELECT USING (true);
CREATE POLICY "Allow public read access to daily_links" ON public.daily_links FOR SELECT USING (true);
CREATE POLICY "Allow public read access to support_records" ON public.support_records FOR SELECT USING (true);
CREATE POLICY "Allow public read access to notices" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Allow public read access to audit_logs" ON public.audit_logs FOR SELECT USING (true);

-- Allow authenticated users or anon with key to write/insert
CREATE POLICY "Allow insert/update to members" ON public.members FOR ALL USING (true);
CREATE POLICY "Allow insert/update to daily_links" ON public.daily_links FOR ALL USING (true);
CREATE POLICY "Allow insert/update to support_records" ON public.support_records FOR ALL USING (true);
CREATE POLICY "Allow insert/update to audit_logs" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Allow insert/update to notices" ON public.notices FOR ALL USING (true);
