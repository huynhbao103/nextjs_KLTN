import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import User from '@/models/User'
import dbConnect from '@/lib/dbConnect'
import { differenceInDays } from 'date-fns'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const user = await User.findOne({ email: session.user.email })
      .select('-password')
      .lean()

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Convert dateOfBirth to string format for frontend
    const responseUser = {
      ...user,
      dateOfBirth: (user as any).dateOfBirth ? (user as any).dateOfBirth.toISOString().split('T')[0] : null
    }

    console.log('GET API response user:', responseUser) // Debug log
    return NextResponse.json(responseUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    console.log('Received data:', data) // Debug log
    
    await dbConnect()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Convert dateOfBirth to Date object if it exists
    let dateOfBirth = null
    if (data.dateOfBirth) {
      try {
        dateOfBirth = new Date(data.dateOfBirth)
        console.log('Converted dateOfBirth:', dateOfBirth) // Debug log
      } catch (error) {
        console.error('Error converting dateOfBirth:', error)
        return NextResponse.json({ message: 'Invalid date format' }, { status: 400 })
      }
    }

    // Cập nhật thông tin người dùng
    const updateData = {
      name: data.name,
      phone: data.phone,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      activityLevel: data.activityLevel,
      medicalConditions: data.medicalConditions,
      lastUpdateDate: new Date().toISOString(), // Use ISO string to avoid timezone issues
      ...(dateOfBirth && { dateOfBirth })
    }

    console.log('Update data:', updateData) // Debug log
    console.log('Current time:', new Date().toISOString()) // Debug current time

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true }
    ).select('-password')

    console.log('Updated user:', updatedUser) // Debug log
    
    // Convert dateOfBirth back to string format for frontend
    const responseUser = {
      ...updatedUser.toObject(),
      dateOfBirth: updatedUser.dateOfBirth ? updatedUser.dateOfBirth.toISOString().split('T')[0] : null
    }
    
    console.log('Response user with string dateOfBirth:', responseUser) // Debug log
    return NextResponse.json(responseUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 