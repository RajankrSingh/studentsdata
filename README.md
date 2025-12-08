# File Upload & Download System

A simple file upload and download system built with Next.js 14 and Supabase Storage.

## Features

- Upload Excel/CSV files via web form
- View all uploaded files in a list
- Download files directly from Supabase Storage
- No authentication required

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- Supabase JavaScript client

### 2. Supabase Setup

#### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized

#### Step 2: Create Storage Bucket

1. In your Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name it: `uploads`
4. Set it to **Public** (or keep it private - signed URLs will work either way)
5. Click **Create bucket**

#### Step 3: Get Your Credentials

1. Go to **Settings** > **API**
2. Copy your **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
3. Copy your **service_role** key (this is your `SUPABASE_SERVICE_ROLE_KEY`)
   - ⚠️ **Important**: Use the `service_role` key, NOT the `anon` key
   - The service_role key has admin privileges and should NEVER be exposed on the client side

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── page.js              # Upload page (/)
│   ├── files/
│   │   └── page.js          # Files list page (/files)
│   ├── api/
│   │   └── upload/
│   │       └── route.js     # Upload API endpoint
│   └── layout.js            # Root layout
├── lib/
│   └── supabaseClient.js    # Supabase client helper
├── .env.local               # Environment variables (create this)
└── package.json
```

## Routes

- **`/`** - Upload page with file input form
- **`/files`** - List of all uploaded files with download links
- **`/api/upload`** - POST endpoint for file uploads

## How It Works

### File Upload Flow

1. User selects an Excel/CSV file on the upload page
2. Form submits to `/api/upload` via POST
3. Server validates file type and creates unique filename with timestamp
4. File is uploaded to Supabase Storage bucket `uploads`
5. Success message is displayed

### File Listing Flow

1. `/files` page fetches all files from Supabase Storage
2. For each file, a signed download URL is generated (valid for 1 hour)
3. Files are displayed in a table with download links

## Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` is only used on the server side (in API routes and server components)
- Never expose the service role key in client-side code
- File uploads are validated to only accept Excel/CSV files
- Each uploaded file gets a unique name with timestamp to prevent overwrites

## Production Deployment

### Vercel Deployment

For detailed Vercel setup instructions, see **[VERCEL_SETUP.md](./VERCEL_SETUP.md)**

Quick steps:
1. Add environment variables in Vercel Dashboard → Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Redeploy your application
3. Verify the build completes successfully

### Other Platforms

1. Set environment variables in your hosting platform:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Build the project: `npm run build`
3. Start the server: `npm start`

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and contains both variables
- Restart your dev server after adding environment variables

### "Failed to upload file"
- Check that the `uploads` bucket exists in Supabase
- Verify your `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check Supabase dashboard logs for detailed errors

### "Error generating URL"
- Ensure the bucket exists and files are accessible
- Check that your service role key has proper permissions

