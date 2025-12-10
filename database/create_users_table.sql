-- Create users table in Supabase
-- Run this SQL in your Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  distributor VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  mobile_no VARCHAR(20),
  address TEXT,
  user_school_code VARCHAR(100) UNIQUE,
  photo_url TEXT,
  photo_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_school_code ON users(user_school_code);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations
CREATE POLICY "Allow all operations" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at_column();

-- Add comments to columns for documentation
COMMENT ON TABLE users IS 'Stores user/school information';
COMMENT ON COLUMN users.id IS 'Primary key, auto-incrementing';
COMMENT ON COLUMN users.distributor IS 'Distributor name';
COMMENT ON COLUMN users.name IS 'User/School name';
COMMENT ON COLUMN users.email IS 'Unique email address';
COMMENT ON COLUMN users.password IS 'Hashed password';
COMMENT ON COLUMN users.mobile_no IS 'Contact mobile number';
COMMENT ON COLUMN users.address IS 'User/School address';
COMMENT ON COLUMN users.user_school_code IS 'Unique user/school code';
COMMENT ON COLUMN users.photo_url IS 'URL of the user photo stored in Supabase Storage';
COMMENT ON COLUMN users.photo_name IS 'Original filename of the uploaded photo';
COMMENT ON COLUMN users.status IS 'User status (Active/Inactive)';
COMMENT ON COLUMN users.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN users.updated_at IS 'Record last update timestamp';

