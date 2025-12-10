# Database Setup for Students

This directory contains SQL migration files for setting up the students database table.

## Setup Instructions

### Step 1: Open Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Run the Migration

1. Open the file `create_students_table.sql` in this directory
2. Copy the entire SQL script
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Step 3: Verify the Table

1. Go to **"Table Editor"** in the Supabase Dashboard
2. You should see a new table called `students`
3. Verify that all columns are created correctly:
   - `id` (bigint, primary key)
   - `student_name` (varchar)
   - `father_name` (varchar)
   - `mobile_no` (varchar)
   - `address` (text)
   - `class` (varchar)
   - `session` (varchar)
   - `admission_no` (varchar, unique)
   - `blood_group` (varchar)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

### Step 4: Test the Form

1. Start your development server: `npm run dev`
2. Navigate to the "Add Student" page
3. Fill out the form and submit
4. Check the Supabase Dashboard > Table Editor > students table
5. You should see your new student record!

## Table Structure

The `students` table has the following structure:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-incrementing ID |
| student_name | VARCHAR(255) | NOT NULL | Student's full name |
| father_name | VARCHAR(255) | NOT NULL | Father's name |
| mobile_no | VARCHAR(20) | NOT NULL | Contact number |
| address | TEXT | NOT NULL | Student's address |
| class | VARCHAR(50) | NOT NULL | Class/grade |
| session | VARCHAR(50) | NOT NULL | Academic session |
| admission_no | VARCHAR(100) | NOT NULL, UNIQUE | Unique admission number |
| blood_group | VARCHAR(10) | NOT NULL | Blood group |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

## Features

- **Unique Constraint**: `admission_no` must be unique (prevents duplicate admissions)
- **Indexes**: Created on `admission_no`, `mobile_no`, and `created_at` for faster queries
- **Auto-update**: `updated_at` automatically updates when a record is modified
- **Row Level Security**: Enabled with a policy (adjust based on your needs)

## Troubleshooting

### Error: "relation students does not exist"
- Make sure you've run the SQL migration script
- Check that you're connected to the correct Supabase project

### Error: "duplicate key value violates unique constraint"
- The `admission_no` you're trying to insert already exists
- Use a different admission number

### Error: "permission denied for table students"
- Check your Row Level Security policies
- Make sure the policy allows INSERT operations
- If using service_role key, RLS should be bypassed

### Data not appearing after submission
- Check browser console for errors
- Check Supabase Dashboard > Logs for API errors
- Verify your environment variables are set correctly

