-- Create assignments table (for teacher-created assignments)
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP NOT NULL,
  priority VARCHAR(50) DEFAULT 'medium',
  teacher_email VARCHAR(255) NOT NULL,
  division VARCHAR(10),
  attachment_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email VARCHAR(255),
  division VARCHAR(10),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(50) DEFAULT 'normal',
  read BOOLEAN DEFAULT false,
  source VARCHAR(50),
  related_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create student_timetable table (links students to specific classes)
CREATE TABLE IF NOT EXISTS student_timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email VARCHAR(255) NOT NULL,
  division VARCHAR(10) NOT NULL,
  schedule_id INTEGER NOT NULL REFERENCES room_schedule(id),
  day_of_week VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disable RLS for anonymous access
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_timetable DISABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_email ON assignments(teacher_email);
CREATE INDEX IF NOT EXISTS idx_assignments_division ON assignments(division);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_notifications_student_email ON notifications(student_email);
CREATE INDEX IF NOT EXISTS idx_notifications_division ON notifications(division);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_timetable_email ON student_timetable(student_email);
CREATE INDEX IF NOT EXISTS idx_student_timetable_division ON student_timetable(division);

-- Insert sample assignments (created by teacher@gmail.com) - only if not already present
DELETE FROM assignments WHERE teacher_email = 'teacher@gmail.com' AND division = 'C';
INSERT INTO assignments (course_code, title, description, due_date, priority, teacher_email, division)
VALUES
  ('CS-320', 'DBMS Lab Report 4', 'Complete the lab report on normalization', NOW() + INTERVAL '1 day', 'high', 'teacher@gmail.com', 'C'),
  ('CS-201', 'OS Scheduling Quiz', 'Quiz on CPU scheduling algorithms', NOW() + INTERVAL '3 days', 'medium', 'teacher@gmail.com', 'C'),
  ('MATH-102', 'Discrete Math PS-7', 'Problem set on graph theory', NOW() + INTERVAL '5 days', 'medium', 'teacher@gmail.com', 'C'),
  ('CS-301', 'Web Development Project', 'Build a full-stack web application', NOW() + INTERVAL '7 days', 'high', 'teacher@gmail.com', 'C');

-- Insert sample notifications - only if not already present
DELETE FROM notifications WHERE student_email = 'student@example.com' AND division = 'C';
INSERT INTO notifications (student_email, division, title, description, type, priority, source)
VALUES
  ('student@example.com', 'C', 'Assignment Deadline', 'DBMS Lab Report 4 due in 2 hours', 'assignment', 'urgent', 'assignment'),
  ('student@example.com', 'C', 'Room Changed', 'Your class has been moved to B-204 instead of B-202', 'room_change', 'info', 'room'),
  ('student@example.com', 'C', 'Hackathon Starts Today', 'Register by 5 PM for the annual hackathon', 'event', 'normal', 'event'),
  ('student@example.com', 'C', 'WiFi Upgrade', 'Lab A WiFi upgrade in progress', 'maintenance', 'low', 'maintenance');

-- Insert sample student timetable (for C division using existing room_schedule)
-- Delete old entries first to avoid duplicates
DELETE FROM student_timetable WHERE student_email = 'student@example.com' AND division = 'C';
-- This maps all room_schedule entries to a student in C division
INSERT INTO student_timetable (student_email, division, schedule_id, day_of_week)
SELECT 'student@example.com', 'C', rs.id, rs.day_of_week
FROM room_schedule rs
WHERE rs.day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');
