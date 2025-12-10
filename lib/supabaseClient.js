import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client
 * Uses service role key for admin operations (never expose this on client)
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    const missing = []
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}`)
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (urlError) {
    throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`)
  }

  // Validate service key format (should start with eyJ for JWT)
  if (!supabaseServiceKey.startsWith('eyJ')) {
    console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY does not appear to be a valid JWT token')
  }

  try {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  } catch (clientError) {
    throw new Error(`Failed to create Supabase client: ${clientError.message}`)
  }
}

