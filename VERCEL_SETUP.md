# Vercel Deployment Setup Guide

This guide will help you configure your Supabase environment variables in Vercel to fix the "Missing Supabase environment variables" error.

## Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **service_role key** (click the eye icon to reveal it)

⚠️ **Important**: Use the `service_role` key, NOT the `anon` key. The service role key has admin privileges needed for file storage operations.

## Step 2: Add Environment Variables in Vercel

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project name
3. Go to **Settings** → **Environment Variables**
4. Add the following two environment variables:

### Variable 1:
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Your Supabase project URL (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
- **Environments**: Select all (Production, Preview, Development)

### Variable 2:
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Your Supabase service_role key
- **Environments**: Select all (Production, Preview, Development)

5. Click **Save** after adding each variable

## Step 3: Redeploy Your Application

After adding the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **"..."** menu on your latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger a new deployment

The environment variables will be available in your next deployment.

## Step 4: Verify the Setup

After redeploying:

1. Check the build logs - you should no longer see "Missing Supabase environment variables" error
2. Try uploading a file at your deployed URL
3. Check the `/files` page to see if files are listed correctly

## Troubleshooting

### Still seeing the error after adding variables?

1. **Make sure variable names are exact** (case-sensitive):
   - `NEXT_PUBLIC_SUPABASE_URL` (not `NEXT_PUBLIC_SUPABASE_URLS` or similar)
   - `SUPABASE_SERVICE_ROLE_KEY` (not `SUPABASE_SERVICE_KEY` or similar)

2. **Redeploy after adding variables** - Environment variables are only available after a new deployment

3. **Check all environments** - Make sure you selected Production, Preview, and Development when adding the variables

4. **Verify the values** - Double-check that you copied the complete URL and key without extra spaces

### Using the wrong key?

- Make sure you're using the **service_role** key, not the **anon** key
- The service_role key is longer and starts with `eyJ...`
- You can find it in Supabase Dashboard → Settings → API → Project API keys → service_role

### Build succeeds but runtime errors?

- Check Vercel function logs for detailed error messages
- Verify your Supabase storage bucket is named `uploads`
- Ensure storage policies are configured (see `SUPABASE_SETUP.md`)

## Security Notes

✅ **DO:**
- Use environment variables in Vercel (never commit secrets to git)
- Use the service_role key only in server-side code (API routes)
- Keep your service_role key secret

❌ **DON'T:**
- Commit `.env.local` to git (it's already in `.gitignore`)
- Expose the service_role key in client-side code
- Share your service_role key publicly

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- See `SUPABASE_SETUP.md` for local development setup

