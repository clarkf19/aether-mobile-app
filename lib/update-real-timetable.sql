-- Update room_schedule with REAL timetable from College (SE-Com C - Semester IV)
-- Academic Year: 2025-2026, Term: II

-- Delete from dependent tables first (due to foreign key constraints)
DELETE FROM student_timetable WHERE day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');

-- Clear existing schedule for C division
DELETE FROM room_schedule WHERE day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');

-- Insert REAL timetable for SE-Com C Division
INSERT INTO room_schedule (room_id, day_of_week, start_time, end_time, course) VALUES

-- MONDAY
('classroom-201', 'Monday', '09:00', '10:00', 'OS/B/SK/606-5'),
('lab-101a', 'Monday', '10:00', '11:00', 'MDM - Lab'),
('lab-101b', 'Monday', '11:15', '12:15', 'DAA/PBB/508'),
('classroom-202', 'Monday', '12:15', '13:15', 'CCN/AVS/508'),
('classroom-203', 'Monday', '13:15', '14:15', 'PCS/D/SD/505'),
('lab-101a', 'Monday', '14:15', '15:15', 'MDM Theory'),
('lab-101b', 'Monday', '15:15', '16:15', 'MDM - Lab'),

-- TUESDAY
('classroom-201', 'Tuesday', '09:00', '10:00', 'DAA/PBB/508'),
('lab-101a', 'Tuesday', '10:00', '11:00', 'MDM - Lab'),
('lab-101b', 'Tuesday', '11:15', '12:15', 'OS/A/SK/603-7'),
('classroom-202', 'Tuesday', '12:15', '13:15', 'DAA/B/PBB/702-C'),
('classroom-203', 'Tuesday', '13:15', '14:15', 'CCN/C/AVS/703-A'),
('lab-101a', 'Tuesday', '14:15', '15:15', 'MDM I Theory'),
('lab-101b', 'Tuesday', '15:15', '16:15', 'OS/SK/508'),

-- WEDNESDAY
('classroom-201', 'Wednesday', '09:00', '10:00', 'OS/B/SK/606-5'),
('lab-101a', 'Wednesday', '10:00', '11:00', 'DAA/C/PBB/702-C'),
('lab-101b', 'Wednesday', '11:15', '12:15', 'CCN/AVS/508'),
('classroom-202', 'Wednesday', '12:15', '13:15', 'DAA/PBB/508'),
('classroom-203', 'Wednesday', '13:15', '14:15', 'PCS/D/SD/505'),
('lab-101a', 'Wednesday', '14:15', '15:15', 'FOM - II/AsT/207'),
('lab-101b', 'Wednesday', '15:15', '16:15', 'HISS'),

-- THURSDAY
('classroom-201', 'Thursday', '09:00', '10:00', 'OS/SD/508'),
('lab-101a', 'Thursday', '10:00', '11:00', 'PCS/D/SD/505'),
('lab-101b', 'Thursday', '11:15', '12:15', 'OS/C/SK/608'),
('classroom-202', 'Thursday', '12:15', '13:15', 'DAA/D/NR/603-2'),
('classroom-203', 'Thursday', '13:15', '14:15', 'PCS/B/DN/505'),
('lab-101a', 'Thursday', '14:15', '15:15', 'FOM - II/AsT/207'),
('lab-101b', 'Thursday', '15:15', '16:15', 'HISS'),

-- FRIDAY
('classroom-201', 'Friday', '09:00', '10:00', 'CCN/AVS/508'),
('lab-101a', 'Friday', '10:00', '11:00', 'FOM - II/AsT/207'),
('lab-101b', 'Friday', '11:15', '12:15', 'SMCS/TP/508'),
('classroom-202', 'Friday', '12:15', '13:15', 'OS/SK/508'),
('classroom-203', 'Friday', '13:15', '14:15', 'SMCS/CRG/202'),
('lab-101a', 'Friday', '14:15', '15:15', 'OS/SK/508'),
('lab-101b', 'Friday', '15:15', '16:15', 'MDM - Lab');

-- Re-insert student timetable mappings (for C division)
INSERT INTO student_timetable (student_email, division, schedule_id, day_of_week)
SELECT 'student@example.com', 'C', rs.id, rs.day_of_week
FROM room_schedule rs
WHERE rs.day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');
