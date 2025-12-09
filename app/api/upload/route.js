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

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (Excel/CSV/ZIP only)
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv',
      'application/zip',
      'application/x-zip-compressed'
    ]
    
    const fileExtension = file.name.split('.').pop().toLowerCase()
    const allowedExtensions = ['xls', 'xlsx', 'csv', 'zip']
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Only Excel (.xls, .xlsx), CSV (.csv), and ZIP (.zip) files are allowed' },
        { status: 400 }
      )
    }

    // Create unique filename with timestamp
    const timestamp = Date.now()
    const originalName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
    const extension = file.name.split('.').pop()
    const uniqueFileName = `${originalName}-${timestamp}.${extension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const supabase = createServerClient()
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(uniqueFileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json(
        { error: 'Failed to upload file: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      fileName: uniqueFileName,
      message: 'File uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

