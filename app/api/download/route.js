import { createServerClient } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase environment variables not configured' },
        { status: 500 }
      )
    }

    const { fileName } = await request.json()

    if (!fileName) {
      return NextResponse.json(
        { error: 'No file name provided' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Generate signed URL for download (valid for 1 hour from request time)
    const { data, error } = await supabase.storage
      .from('uploads')
      .createSignedUrl(fileName, 3600)

    if (error) {
      console.error('Error creating signed URL:', error)
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      signedUrl: data?.signedUrl
    })

  } catch (error) {
    console.error('Download URL generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}
