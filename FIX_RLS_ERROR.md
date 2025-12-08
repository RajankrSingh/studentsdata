# Fix: "row-level security policy" Error

This error occurs because Supabase Storage buckets have Row Level Security (RLS) policies that block uploads by default.

## Quick Fix (5 minutes)

### Step 1: Open Storage Policies

1. Go to your **Supabase Dashboard**
2. Click **"Storage"** in the left sidebar
3. Click on your **`uploads`** bucket
4. Click on the **"Policies"** tab at the top

### Step 2: Create a Policy

1. Click **"New Policy"** button
2. Select **"Create policy from scratch"** (or "For full customization")
3. Fill in:
   - **Policy name**: `Allow all operations`
   - **Allowed operation**: Select **"ALL"** (or check all boxes: INSERT, SELECT, UPDATE, DELETE)
   - **Policy definition**: In the SQL editor, type:
     ```sql
     true
     ```
   - This allows all operations for everyone (since we're using service_role key server-side)
4. Click **"Review"** → **"Save policy"**

### Step 3: Test Again

1. Go back to your upload page: `http://localhost:3000`
2. Try uploading a file again
3. It should work now! ✅

## Alternative: Using SQL Editor

If you prefer using SQL:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New query"**
3. Paste this SQL:

```sql
-- Allow all operations on uploads bucket
CREATE POLICY "Allow all operations on uploads"
ON storage.objects
FOR ALL
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');
```

4. Click **"Run"**
5. Test your upload again

## Why This Happens

Supabase Storage uses Row Level Security (RLS) to control access. Even though you're using the `service_role` key (which has admin privileges), Storage buckets still need policies defined.

The `service_role` key bypasses RLS for database tables, but Storage buckets have their own policy system that needs to be configured.

## Security Note

Since you're using the `service_role` key server-side only (never exposed to clients), allowing all operations via a `true` policy is safe. The actual security is enforced by:
- Keeping the service_role key secret (server-side only)
- File validation in your code (only Excel/CSV)
- Server-side API routes (not direct client access)

## Still Having Issues?

1. **Double-check your bucket name**: Must be exactly `uploads`
2. **Verify environment variables**: Make sure `.env.local` has both variables
3. **Restart dev server**: After changing policies, restart: `npm run dev`
4. **Check Supabase logs**: Dashboard → Logs → Look for detailed error messages

