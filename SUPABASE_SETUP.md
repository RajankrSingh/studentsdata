# Supabase Setup Guide - Step by Step

This guide will walk you through connecting Supabase and setting up file storage.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign in"** if you already have an account
3. Click **"New Project"**
4. Fill in:
   - **Name**: Give your project a name (e.g., "file-upload-system")
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is fine for testing
5. Click **"Create new project"**
6. Wait 2-3 minutes for the project to initialize

## Step 2: Create Storage Bucket

1. In your Supabase Dashboard, click **"Storage"** in the left sidebar
2. Click **"New bucket"** button
3. Fill in:
   - **Name**: `uploads` (must be exactly this name)
   - **Public bucket**: 
     - ✅ **Check this** if you want public access (easier for downloads)
     - ❌ **Uncheck** if you want private files (more secure, uses signed URLs)
   - For this project, either works - signed URLs will be generated anyway
4. Click **"Create bucket"**

### ⚠️ IMPORTANT: Disable RLS on Storage Bucket

After creating the bucket, you need to disable Row Level Security (RLS) to allow uploads:

1. In Supabase Dashboard, go to **Storage** → Click on your `uploads` bucket
2. Click on the **"Policies"** tab (or look for "RLS" settings)
3. You'll see storage policies - these control who can upload/download
4. **Option A (Easiest - for development/testing):**
   - Click **"New Policy"** → **"Create policy from scratch"**
   - **Policy name**: `Allow all operations`
   - **Allowed operation**: Select **ALL** (INSERT, SELECT, UPDATE, DELETE)
   - **Policy definition**: Use this SQL:
     ```sql
     true
     ```
   - Click **"Review"** → **"Save policy"**
   
5. **Option B (Alternative - Disable RLS entirely):**
   - Go to **Storage** → **Policies** tab
   - Look for a toggle or setting to disable RLS for this bucket
   - If available, disable it

✅ Your bucket is now ready!

## Step 3: Get Your Credentials

1. In Supabase Dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under Project Settings
3. You'll see two important values:

   ### a) Project URL
   - Look for **"Project URL"** or **"URL"**
   - It looks like: `https://xxxxxxxxxxxxx.supabase.co`
   - Copy this entire URL

   ### b) Service Role Key (IMPORTANT!)
   - Scroll down to find **"Project API keys"**
   - Look for **"service_role"** key (NOT the "anon" key)
   - Click the eye icon to reveal it, then copy it
   - ⚠️ **WARNING**: This key has admin privileges. Never expose it in client-side code!

## Step 4: Configure Environment Variables

1. In your project root (`D:\studentsdata`), create a file named `.env.local`
2. Add these two lines (replace with YOUR actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcmVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0MjU2NzIwMCwiZXhwIjoxOTU4MTQzMjAwfQ.your-actual-key-here
```

3. Save the file

## Step 5: Restart Your Dev Server

After creating `.env.local`:

1. Stop your dev server (Ctrl+C if running)
2. Start it again:
   ```bash
   npm run dev
   ```

Environment variables are loaded when the server starts, so you need to restart.

## How It Works in the Code

### Server-Side Supabase Client (`lib/supabaseClient.js`)

```javascript
// This creates a Supabase client that runs ONLY on the server
// It uses the service_role key for admin operations
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  return createClient(supabaseUrl, supabaseServiceKey)
}
```

### Uploading Files (`app/api/upload/route.js`)

```javascript
// 1. Get file from form
const file = formData.get('file')

// 2. Create unique filename with timestamp
const uniqueFileName = `originalName-${Date.now()}.ext`

// 3. Convert to buffer
const buffer = Buffer.from(await file.arrayBuffer())

// 4. Upload to Supabase Storage
const supabase = createServerClient()
const { data, error } = await supabase.storage
  .from('uploads')  // Your bucket name
  .upload(uniqueFileName, buffer, {
    contentType: file.type
  })
```

### Listing Files (`app/files/page.js`)

```javascript
// 1. List all files in bucket
const { data } = await supabase.storage
  .from('uploads')
  .list('')

// 2. Generate download URL for each file
const { data: urlData } = await supabase.storage
  .from('uploads')
  .createSignedUrl(fileName, 3600) // Valid for 1 hour
```

## Testing the Connection

1. Start your dev server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Try uploading a test Excel/CSV file
4. Check Supabase Dashboard > Storage > uploads bucket
5. You should see your uploaded file there!

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists in the project root
- Check that variable names are exactly correct (case-sensitive)
- Restart your dev server after creating/modifying `.env.local`

### "Failed to upload file" or "row-level security policy" error
- **This is the most common issue!** You need to configure Storage policies:
  1. Go to Supabase Dashboard → **Storage** → Click `uploads` bucket
  2. Go to **"Policies"** tab
  3. Create a new policy:
     - Name: `Allow all operations`
     - Operation: **ALL**
     - Policy: `true`
     - Save the policy
- Verify the bucket name is exactly `uploads`
- Check that your `SUPABASE_SERVICE_ROLE_KEY` is correct (service_role, not anon)
- Look at Supabase Dashboard > Logs for detailed error messages

### "Bucket not found"
- Make sure you created the bucket named `uploads`
- Check Storage section in Supabase Dashboard

### Files not showing up
- Check browser console for errors
- Verify the bucket exists and has files
- Make sure you're using the service_role key (not anon key)

## Security Best Practices

✅ **DO:**
- Use `SUPABASE_SERVICE_ROLE_KEY` only in server-side code (API routes, server components)
- Keep `.env.local` in `.gitignore` (already done)
- Use signed URLs for file downloads

❌ **DON'T:**
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Never commit `.env.local` to git
- Don't use the anon key for storage operations (it has limited permissions)

## Next Steps

Once everything is set up:
1. Upload a test file at `/`
2. View files at `/files`
3. Download files using the download links

Your file upload system is now connected to Supabase! 🎉

