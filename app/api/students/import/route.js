import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'
import * as XLSX from 'xlsx'

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
    const file = formData.get('file')
    const schoolId = formData.get('schoolId')
    const distributor = formData.get('distributor')

    if (!file || !schoolId || !distributor) {
      return NextResponse.json(
        { error: 'File, School ID, and Distributor are required' },
        { status: 400 }
      )
    }

    // Determine file type
    const fileName = file.name.toLowerCase()
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
    const isCSV = fileName.endsWith('.csv')

    if (!isExcel && !isCSV) {
      return NextResponse.json(
        { error: 'Only CSV and Excel files (.csv, .xlsx, .xls) are supported' },
        { status: 400 }
      )
    }

    let rows = []

    if (isExcel) {
      // Parse Excel file
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
      
      if (rows.length < 2) {
        return NextResponse.json(
          { error: 'Excel file must have at least a header row and one data row' },
          { status: 400 }
        )
      }
    } else {
      // Parse CSV file
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        return NextResponse.json(
          { error: 'CSV file must have at least a header row and one data row' },
          { status: 400 }
        )
      }

      rows = lines.map(line => {
        // Handle CSV with quoted values
        const values = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        values.push(current.trim())
        return values
      })
    }

    // Parse header
    const headers = rows[0].map(h => String(h).trim())
    
    // Expected headers
    const expectedHeaders = ['Student Name', 'Father Name', 'Mobile No', 'Address', 'Class', 'Session', 'Admission No', 'Blood Group']
    const headerMap = {}
    
    for (const expectedHeader of expectedHeaders) {
      const index = headers.findIndex(h => String(h).toLowerCase() === expectedHeader.toLowerCase())
      if (index === -1) {
        return NextResponse.json(
          { error: `Missing required column: ${expectedHeader}` },
          { status: 400 }
        )
      }
      headerMap[expectedHeader] = index
    }

    // Parse data rows
    const students = []
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].map(v => String(v).trim())
      
      if (values.length < expectedHeaders.length) continue
      
      // Skip empty rows
      if (values.every(v => !v || v === '')) continue
      
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
        { error: 'No valid student data found in file' },
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

