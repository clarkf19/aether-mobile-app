-- Certificate Requests Table
CREATE TABLE IF NOT EXISTS certificate_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  student_id VARCHAR(50),
  certificate_type VARCHAR(100),
  purpose TEXT,
  date_required DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  hod_comment TEXT
);

-- Room Booking Requests Table
CREATE TABLE IF NOT EXISTS room_booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  room_id VARCHAR(100) NOT NULL,
  room_name VARCHAR(255),
  booking_date DATE,
  start_time TIME,
  end_time TIME,
  purpose TEXT,
  expected_attendees INTEGER,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  hod_comment TEXT
);

-- Required for exclusion constraints that combine equality and range checks
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Prevent overlapping pending/approved bookings for the same room and time range
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'room_booking_requests_no_overlap'
  ) THEN
    ALTER TABLE room_booking_requests
    ADD CONSTRAINT room_booking_requests_no_overlap
    EXCLUDE USING gist (
      room_id WITH =,
      tsrange(
        (booking_date + start_time)::timestamp,
        (booking_date + end_time)::timestamp,
        '[)'
      ) WITH &&
    )
    WHERE (status IN ('pending', 'approved'));
  END IF;
END $$;

-- Enable RLS
ALTER TABLE certificate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_booking_requests ENABLE ROW LEVEL SECURITY;

-- Disable RLS for anonymous access (for development)
ALTER TABLE certificate_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE room_booking_requests DISABLE ROW LEVEL SECURITY;
