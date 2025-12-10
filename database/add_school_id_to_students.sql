-- Add school_id/user_id to students table
-- Run this SQL in your Supabase Dashboard > SQL Editor if you already have the students table

ALTER TABLE students 
ADD COLUMN IF NOT EXISTS school_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS distributor VARCHAR(255);

-- Create index on school_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);

-- Add comments
COMMENT ON COLUMN students.school_id IS 'Reference to the user/school this student belongs to';
COMMENT ON COLUMN students.distributor IS 'Distributor name';

