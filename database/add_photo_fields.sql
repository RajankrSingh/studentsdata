-- Add photo fields to students table
-- Run this SQL in your Supabase Dashboard > SQL Editor if you already have the students table

ALTER TABLE students 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS photo_name VARCHAR(255);

-- Add comments
COMMENT ON COLUMN students.photo_url IS 'URL of the student photo stored in Supabase Storage';
COMMENT ON COLUMN students.photo_name IS 'Original filename of the uploaded photo';

