/**
 * Supabase Schema Setup & Verification
 * 
 * Run the SQL below in Supabase SQL Editor to ensure all tables are properly created
 * https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql/new
 */

-- ============================================
-- 1. CREATE ISSUE_REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS issue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email TEXT NOT NULL,
  student_name TEXT,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  image_base64 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE issue_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert
CREATE POLICY "Allow insert" ON issue_reports FOR INSERT WITH CHECK (true);
-- Allow anyone to view
CREATE POLICY "Allow select" ON issue_reports FOR SELECT USING (true);

-- ============================================
-- 2. CREATE CERTIFICATE_REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS certificate_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email TEXT NOT NULL,
  student_name TEXT,
  student_id TEXT,
  certificate_type TEXT NOT NULL,
  purpose TEXT,
  date_required TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  hod_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE certificate_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert
CREATE POLICY "Allow insert" ON certificate_requests FOR INSERT WITH CHECK (true);
-- Allow anyone to view
CREATE POLICY "Allow select" ON certificate_requests FOR SELECT USING (true);
-- Allow anyone to update
CREATE POLICY "Allow update" ON certificate_requests FOR UPDATE USING (true);

-- ============================================
-- 3. CREATE ROOM_BOOKING_REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS room_booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email TEXT NOT NULL,
  student_name TEXT,
  room_id TEXT NOT NULL,
  room_name TEXT,
  booking_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  purpose TEXT,
  expected_attendees INTEGER,
  status TEXT DEFAULT 'pending',
  hod_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE room_booking_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert
CREATE POLICY "Allow insert" ON room_booking_requests FOR INSERT WITH CHECK (true);
-- Allow anyone to view
CREATE POLICY "Allow select" ON room_booking_requests FOR SELECT USING (true);
-- Allow anyone to update
CREATE POLICY "Allow update" ON room_booking_requests FOR UPDATE USING (true);

-- ============================================
-- 4. CREATE LEAVE_REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email TEXT NOT NULL,
  student_name TEXT,
  leave_type TEXT NOT NULL,
  reason TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  image_url TEXT,
  hod_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert
CREATE POLICY "Allow insert" ON leave_requests FOR INSERT WITH CHECK (true);
-- Allow anyone to view
CREATE POLICY "Allow select" ON leave_requests FOR SELECT USING (true);
-- Allow anyone to update
CREATE POLICY "Allow update" ON leave_requests FOR UPDATE USING (true);

-- ============================================
-- 5. CREATE STORAGE BUCKET FOR LEAVE ATTACHMENTS
-- ============================================
-- Run this in Supabase Storage settings:
-- 1. Go to Storage > Buckets
-- 2. Create new bucket named: leave-attachments
-- 3. Make it public
-- 4. Allow authenticated users to upload

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables exist:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check columns in issue_reports:
SELECT * FROM information_schema.columns WHERE table_name = 'issue_reports';

-- Check RLS policies:
SELECT * FROM pg_policies WHERE tablename = 'issue_reports';
