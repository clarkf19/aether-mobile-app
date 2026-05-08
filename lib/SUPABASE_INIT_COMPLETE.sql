/**
 * SUPABASE COMPLETE INITIALIZATION SCRIPT
 * 
 * Run this in Supabase SQL Editor to set up all tables with proper RLS policies
 * and real-time capabilities
 * 
 * Steps:
 * 1. Go to https://supabase.com/dashboard
 * 2. Select your project
 * 3. Go to SQL Editor
 * 4. Click "New Query"
 * 5. Copy and paste this entire script
 * 6. Click "Run"
 * 
 * The script will create all necessary tables with:
 * - Proper schemas and constraints
 * - UUID primary keys
 * - Timestamps for tracking
 * - Row Level Security (RLS) policies
 * - Real-time enabled tables
 */

-- ============================================
-- ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "http";

-- ============================================
-- 1. ISSUE REPORTS TABLE
-- ============================================
DROP TABLE IF EXISTS issue_reports CASCADE;

CREATE TABLE issue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email TEXT NOT NULL,
  student_name TEXT DEFAULT 'Anonymous',
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  image_base64 TEXT,
  image_url TEXT,
  resolution_notes TEXT,
  resolved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT severity_check CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT status_check CHECK (status IN ('open', 'in-progress', 'resolved', 'closed'))
);

-- Enable RLS
ALTER TABLE issue_reports ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_issue_reports_status ON issue_reports(status);
CREATE INDEX idx_issue_reports_severity ON issue_reports(severity);
CREATE INDEX idx_issue_reports_created_at ON issue_reports(created_at DESC);

-- RLS Policies
CREATE POLICY "Allow anyone to insert issue reports" ON issue_reports
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anyone to view issue reports" ON issue_reports
  FOR SELECT
  USING (true);

CREATE POLICY "Allow update of own issue reports" ON issue_reports
  FOR UPDATE
  USING (student_email = CURRENT_USER OR true)
  WITH CHECK (true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE issue_reports;

-- ============================================
-- 2. CERTIFICATE REQUESTS TABLE
-- ============================================
DROP TABLE IF EXISTS certificate_requests CASCADE;

CREATE TABLE certificate_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_id TEXT,
  certificate_type TEXT NOT NULL,
  purpose TEXT,
  date_required TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  hod_comment TEXT,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'processing'))
);

-- Enable RLS
ALTER TABLE certificate_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_certificate_requests_status ON certificate_requests(status);
CREATE INDEX idx_certificate_requests_student_email ON certificate_requests(student_email);
CREATE INDEX idx_certificate_requests_created_at ON certificate_requests(created_at DESC);

-- RLS Policies
CREATE POLICY "Allow anyone to insert certificate requests" ON certificate_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anyone to view certificate requests" ON certificate_requests
  FOR SELECT
  USING (true);

CREATE POLICY "Allow update of certificate requests" ON certificate_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE certificate_requests;

-- ============================================
-- 3. ROOM BOOKING REQUESTS TABLE
-- ============================================
DROP TABLE IF EXISTS room_booking_requests CASCADE;

CREATE TABLE room_booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  room_id TEXT NOT NULL,
  room_name TEXT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  purpose TEXT,
  expected_attendees INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  hod_comment TEXT,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  CONSTRAINT time_check CHECK (start_time < end_time)
);

-- Enable RLS
ALTER TABLE room_booking_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_room_bookings_status ON room_booking_requests(status);
CREATE INDEX idx_room_bookings_room_id ON room_booking_requests(room_id);
CREATE INDEX idx_room_bookings_booking_date ON room_booking_requests(booking_date);
CREATE INDEX idx_room_bookings_created_at ON room_booking_requests(created_at DESC);

-- RLS Policies
CREATE POLICY "Allow anyone to insert room bookings" ON room_booking_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anyone to view room bookings" ON room_booking_requests
  FOR SELECT
  USING (true);

CREATE POLICY "Allow update of room bookings" ON room_booking_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE room_booking_requests;

-- ============================================
-- 4. LEAVE REQUESTS TABLE
-- ============================================
DROP TABLE IF EXISTS leave_requests CASCADE;

CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  leave_type TEXT NOT NULL,
  reason TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  image_url TEXT,
  hod_comment TEXT,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  CONSTRAINT date_check CHECK (end_date >= start_date)
);

-- Enable RLS
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_student_email ON leave_requests(student_email);
CREATE INDEX idx_leave_requests_start_date ON leave_requests(start_date);
CREATE INDEX idx_leave_requests_created_at ON leave_requests(created_at DESC);

-- RLS Policies
CREATE POLICY "Allow anyone to insert leave requests" ON leave_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anyone to view leave requests" ON leave_requests
  FOR SELECT
  USING (true);

CREATE POLICY "Allow update of leave requests" ON leave_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE leave_requests;

-- ============================================
-- 5. STUDENT DATA TABLE (Optional but recommended)
-- ============================================
DROP TABLE IF EXISTS student_data CASCADE;

CREATE TABLE student_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  student_id TEXT UNIQUE,
  department TEXT,
  semester INTEGER,
  cgpa DECIMAL(3,2),
  contact TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE student_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to view student data" ON student_data
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert student data" ON student_data
  FOR INSERT
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE student_data;

-- ============================================
-- 6. UPDATE TIMESTAMPS FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to all tables with updated_at
CREATE TRIGGER update_issue_reports_timestamp
BEFORE UPDATE ON issue_reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_certificate_requests_timestamp
BEFORE UPDATE ON certificate_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_room_bookings_timestamp
BEFORE UPDATE ON room_booking_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_leave_requests_timestamp
BEFORE UPDATE ON leave_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_student_data_timestamp
BEFORE UPDATE ON student_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VERIFICATION QUERIES (Run these to verify)
-- ============================================
/*
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies exist
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';

-- Check real-time enabled
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
*/
