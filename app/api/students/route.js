import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const batch = searchParams.get('batch')

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch parameter is required' },
        { status: 400 }
      )
    }

    // Read the JSON file
    const filePath = path.join(process.cwd(), 'data', 'students.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const studentsData = JSON.parse(fileContents)

    // Get students for the selected batch
    const batchStudents = studentsData[batch] || []

    return NextResponse.json({
      success: true,
      data: batchStudents,
      count: batchStudents.length
    })
  } catch (error) {
    console.error('Error reading students data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students data' },
      { status: 500 }
    )
  }
}

