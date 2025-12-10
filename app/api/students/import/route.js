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
    const csvFile = formData.get('csv')
    const schoolId = formData.get('schoolId')
    const distributor = formData.get('distributor')

    if (!csvFile || !schoolId || !distributor) {
      return NextResponse.json(
        { error: 'CSV file, School ID, and Distributor are required' },
        { status: 400 }
      )
    }

    // Read CSV file
    const text = await csvFile.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must have at least a header row and one data row' },
        { status: 400 }
      )
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim())
    
    // Expected headers
    const expectedHeaders = ['Student Name', 'Father Name', 'Mobile No', 'Address', 'Class', 'Session', 'Admission No', 'Blood Group']
    const headerMap = {}
    
    expectedHeaders.forEach(expectedHeader => {
      const index = headers.findIndex(h => h.toLowerCase() === expectedHeader.toLowerCase())
      if (index === -1) {
        return NextResponse.json(
          { error: `Missing required column: ${expectedHeader}` },
          { status: 400 }
        )
      }
      headerMap[expectedHeader] = index
    })

    // Parse data rows
    const students = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      
      if (values.length < expectedHeaders.length) continue
      
      // Convert schoolId to number for consistency
      const schoolIdNum = parseInt(schoolId, 10)
      
      students.push({
        student_name: values[headerMap['Student Name']] || '',
        father_name: values[headerMap['Father Name']] || '',
        mobile_no: values[headerMap['Mobile No']] || '',
        address: values[headerMap['Address']] || '',
        class: values[headerMap['Class']] || '',
        session: values[headerMap['Session']] || '',
        admission_no: values[headerMap['Admission No']] || '',
        blood_group: values[headerMap['Blood Group']] || '',
        school_id: (!isNaN(schoolIdNum) && schoolIdNum > 0) ? schoolIdNum : null,
        distributor: distributor || null,
        created_at: new Date().toISOString()
      })
    }

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No valid student data found in CSV file' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createServerClient()

    // Insert students in batches
    const batchSize = 100
    let imported = 0
    let errors = []

    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('students')
        .insert(batch)
        .select()

      if (error) {
        console.error('Batch insert error:', error)
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`)
      } else {
        imported += data?.length || 0
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${imported} students successfully`,
      imported: imported,
      total: students.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error importing students:', error)
    return NextResponse.json(
      { error: 'Failed to import students', details: error.message },
      { status: 500 }
    )
  }
}

