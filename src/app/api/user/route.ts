import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import User from '@/models/User'
import dbConnect from '@/lib/dbConnect'
import { differenceInDays } from 'date-fns'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect()
    
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Convert dateOfBirth to string for response
    const responseUser = {
      ...user.toObject(),
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : null
    }

    return NextResponse.json({ user: responseUser })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Convert dateOfBirth string to Date object if provided
    let dateOfBirth = null
    if (data.dateOfBirth) {
      dateOfBirth = new Date(data.dateOfBirth)
      if (isNaN(dateOfBirth.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
      }
    }

    const updateData = {
      ...data,
      dateOfBirth,
      updatedAt: new Date()
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Convert dateOfBirth back to string for response
    const responseUser = {
      ...updatedUser.toObject(),
      dateOfBirth: updatedUser.dateOfBirth ? updatedUser.dateOfBirth.toISOString().split('T')[0] : null
    }

    return NextResponse.json({ user: responseUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 