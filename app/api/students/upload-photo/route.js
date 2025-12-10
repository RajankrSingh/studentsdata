import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured. Please set up environment variables.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const photo = formData.get('photo')
    const studentId = formData.get('studentId')

    if (!photo || !studentId) {
      return NextResponse.json(
        { error: 'Photo and student ID are required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!photo.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (photo.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createServerClient()

    // Check if student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, photo_url')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Generate unique filename
    const fileExt = photo.name.split('.').pop()
    const fileName = `student-${studentId}-${Date.now()}.${fileExt}`
    const filePath = `${studentId}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await photo.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('student-photos')
      .upload(filePath, buffer, {
        contentType: photo.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload photo', details: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('student-photos')
      .getPublicUrl(filePath)

    const photoUrl = urlData.publicUrl

    // Delete old photo if exists
    if (student.photo_url) {
      try {
        const oldPhotoPath = student.photo_url.split('/').pop()
        await supabase.storage
          .from('student-photos')
          .remove([`${studentId}/${oldPhotoPath}`])
      } catch (deleteError) {
        console.error('Error deleting old photo:', deleteError)
        // Continue even if old photo deletion fails
      }
    }

    // Update student record with photo URL and name
    const { data: updateData, error: updateError } = await supabase
      .from('students')
      .update({
        photo_url: photoUrl,
        photo_name: photo.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', studentId)
      .select()

    if (updateError) {
      console.error('Database update error:', updateError)
      // Try to delete the uploaded file if database update fails
      await supabase.storage
        .from('student-photos')
        .remove([filePath])
      
      return NextResponse.json(
        { error: 'Failed to update student record', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photoUrl: photoUrl,
        photoName: photo.name,
        studentId: studentId
      }
    })
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo', details: error.message },
      { status: 500 }
    )
  }
}

