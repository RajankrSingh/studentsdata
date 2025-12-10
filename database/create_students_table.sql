-- Create students table in Supabase
-- Run this SQL in your Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  father_name VARCHAR(255) NOT NULL,
  mobile_no VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  class VARCHAR(50) NOT NULL,
  session VARCHAR(50) NOT NULL,
  admission_no VARCHAR(100) NOT NULL UNIQUE,
  blood_group VARCHAR(10) NOT NULL,
  photo_url TEXT,
  photo_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on admission_no for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_admission_no ON students(admission_no);

-- Create an index on mobile_no for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_mobile_no ON students(mobile_no);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
-- Adjust this policy based on your authentication requirements
CREATE POLICY "Allow all operations for authenticated users" ON students
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: If you want to allow public inserts (for testing)
-- CREATE POLICY "Allow public inserts" ON students
--   FOR INSERT
--   WITH CHECK (true);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to columns for documentation
COMMENT ON TABLE students IS 'Stores student information';
COMMENT ON COLUMN students.id IS 'Primary key, auto-incrementing';
COMMENT ON COLUMN students.student_name IS 'Full name of the student';
COMMENT ON COLUMN students.father_name IS 'Name of the student''s father';
COMMENT ON COLUMN students.mobile_no IS 'Contact mobile number';
COMMENT ON COLUMN students.address IS 'Student''s address';
COMMENT ON COLUMN students.class IS 'Student''s class/grade';
COMMENT ON COLUMN students.session IS 'Academic session';
COMMENT ON COLUMN students.admission_no IS 'Unique admission number';
COMMENT ON COLUMN students.blood_group IS 'Student''s blood group';
COMMENT ON COLUMN students.photo_url IS 'URL of the student photo stored in Supabase Storage';
COMMENT ON COLUMN students.photo_name IS 'Original filename of the uploaded photo';
COMMENT ON COLUMN students.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN students.updated_at IS 'Record last update timestamp';

