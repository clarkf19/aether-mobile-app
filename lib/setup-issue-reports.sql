-- Create issue_reports table
CREATE TABLE IF NOT EXISTS issue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_email VARCHAR(255) NOT NULL,
  student_name VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  image_base64 TEXT,
  severity VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Disable RLS for anonymous access
ALTER TABLE issue_reports DISABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_issue_reports_student_email ON issue_reports(student_email);
CREATE INDEX IF NOT EXISTS idx_issue_reports_status ON issue_reports(status);
CREATE INDEX IF NOT EXISTS idx_issue_reports_created_at ON issue_reports(created_at DESC);

-- Insert sample issue reports for testing
INSERT INTO issue_reports (student_email, student_name, category, description, location, severity, status)
VALUES
  ('student1@example.com', 'Raj Patel', 'plumbing', 'Water leak in bathroom', 'Block C', 'high', 'open'),
  ('student2@example.com', 'Priya Singh', 'network', 'WiFi not working', 'Library', 'medium', 'in-progress'),
  ('student3@example.com', 'Amit Verma', 'electrical', 'Light switch broken', 'Lab A-203', 'low', 'open'),
  ('student4@example.com', 'Neha Sharma', 'furniture', 'Chair is broken', 'Classroom 201', 'low', 'resolved'),
  ('student5@example.com', 'Rohan Gupta', 'other', 'Door hinge loose', 'Block A', 'medium', 'open');
