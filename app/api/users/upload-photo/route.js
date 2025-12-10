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
    const userId = formData.get('userId')

    if (!photo || !userId) {
      return NextResponse.json(
        { error: 'Photo and user ID are required' },
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

    // Validate file size (max 500KB)
    const maxSize = 500 * 1024 // 500KB
    if (photo.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 500KB' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createServerClient()

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, photo_url')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate unique filename
    const fileExt = photo.name.split('.').pop()
    const fileName = `user-${userId}-${Date.now()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await photo.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-photos')
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
      .from('user-photos')
      .getPublicUrl(filePath)

    const photoUrl = urlData.publicUrl

    // Delete old photo if exists
    if (user.photo_url) {
      try {
        const oldPhotoPath = user.photo_url.split('/').pop()
        await supabase.storage
          .from('user-photos')
          .remove([`${userId}/${oldPhotoPath}`])
      } catch (deleteError) {
        console.error('Error deleting old photo:', deleteError)
        // Continue even if old photo deletion fails
      }
    }

    // Update user record with photo URL and name
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({
        photo_url: photoUrl,
        photo_name: photo.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    if (updateError) {
      console.error('Database update error:', updateError)
      // Try to delete the uploaded file if database update fails
      await supabase.storage
        .from('user-photos')
        .remove([filePath])
      
      return NextResponse.json(
        { error: 'Failed to update user record', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        photoUrl: photoUrl,
        photoName: photo.name,
        userId: userId
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

