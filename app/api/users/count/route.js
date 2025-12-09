import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // For now, return a mock count. Later this can be replaced with actual users.json file
    // or database query
    const filePath = path.join(process.cwd(), 'data', 'users.json')
    
    let totalCount = 0
    try {
      if (fs.existsSync(filePath)) {
        const fileContents = fs.readFileSync(filePath, 'utf8')
        const usersData = JSON.parse(fileContents)
        
        // If it's an array
        if (Array.isArray(usersData)) {
          totalCount = usersData.length
        } 
        // If it's an object with batches or categories
        else if (typeof usersData === 'object') {
          for (const key in usersData) {
            if (Array.isArray(usersData[key])) {
              totalCount += usersData[key].length
            }
          }
        }
      } else {
        // Return mock count if file doesn't exist
        totalCount = 6
      }
    } catch (error) {
      // Return mock count on error
      totalCount = 6
    }

    return NextResponse.json({
      success: true,
      count: totalCount
    })
  } catch (error) {
    console.error('Error reading users data for count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch total users count' },
      { status: 500 }
    )
  }
}

