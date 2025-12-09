import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Read the JSON file
    const filePath = path.join(process.cwd(), 'data', 'students.json')
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const studentsData = JSON.parse(fileContents)

    // Calculate total count across all batches
    let totalCount = 0
    Object.keys(studentsData).forEach(batch => {
      if (Array.isArray(studentsData[batch])) {
        totalCount += studentsData[batch].length
      }
    })

    return NextResponse.json({
      success: true,
      count: totalCount
    })
  } catch (error) {
    console.error('Error reading students data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students count', count: 0 },
      { status: 500 }
    )
  }
}

