# Student Photo Storage Setup Guide

This guide will help you set up Supabase Storage for student photos.

## Step 1: Create Storage Bucket

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on **"Storage"** in the left sidebar
4. Click **"New bucket"** button
5. Fill in:
   - **Name**: `student-photos` (must be exactly this name)
   - **Public bucket**: 
     - ✅ **Check this** if you want public access (easier for viewing photos)
     - ❌ **Uncheck** if you want private files (more secure, uses signed URLs)
   - For this project, **checking public** is recommended for easier photo viewing
6. Click **"Create bucket"**

## Step 2: Configure Storage Policies

After creating the bucket, you need to set up policies to allow uploads:

1. In Supabase Dashboard, go to **Storage** → Click on your `student-photos` bucket
2. Click on the **"Policies"** tab
3. Click **"New Policy"** → **"Create policy from scratch"**
4. Configure the policy:
   - **Policy name**: `Allow all operations`
   - **Allowed operation**: Select **ALL** (INSERT, SELECT, UPDATE, DELETE)
   - **Policy definition**: Use this SQL:
     ```sql
     true
     ```
   - Click **"Review"** → **"Save policy"**

✅ Your storage bucket is now ready!

## Step 3: Add Photo Fields to Database

If you haven't already added the photo fields to your `students` table, run this SQL:

```sql
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS photo_name VARCHAR(255);
```

Or run the migration file: `database/add_photo_fields.sql`

## Step 4: Test Photo Upload

1. Start your development server: `npm run dev`
2. Navigate to the student list page
3. Select a batch and search for students
4. Click "Upload Photo" on any student
5. Select an image file
6. The photo should upload and be saved to the database

## How It Works

### Photo Upload Flow:
1. User selects a photo file
2. File is uploaded to Supabase Storage bucket `student-photos`
3. File is stored in path: `{studentId}/{filename}`
4. Public URL is generated
5. Database record is updated with `photo_url` and `photo_name`

### Photo Storage Structure:
```
student-photos/
  ├── 1/
  │   ├── student-1-1234567890.jpg
  │   └── student-1-1234567891.png
  ├── 2/
  │   └── student-2-1234567892.jpg
  └── ...
```

### Database Fields:
- `photo_url`: Full URL to the photo in Supabase Storage
- `photo_name`: Original filename of the uploaded photo

## Troubleshooting

### "Bucket not found" error
- Make sure the bucket is named exactly `student-photos`
- Check that the bucket exists in Storage section

### "Permission denied" or "row-level security policy" error
- Go to Storage → Policies tab
- Make sure you have a policy that allows INSERT operations
- The policy should use `true` as the condition

### Photos not displaying
- Check that the bucket is set to **Public**
- Verify the `photo_url` in the database is correct
- Check browser console for CORS or permission errors

### File size errors
- Maximum file size is 5MB
- Compress images before uploading if needed

## Security Notes

- If using public bucket: Photos are accessible to anyone with the URL
- If using private bucket: You'll need to generate signed URLs for viewing
- Consider adding file type validation (currently accepts any image type)
- Consider adding file size limits (currently 5MB max)

## Next Steps

- Implement photo deletion when student is deleted (already implemented)
- Add photo preview/thumbnail generation
- Add photo editing/cropping functionality
- Implement photo compression before upload

