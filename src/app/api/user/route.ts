import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'
import { differenceInDays } from 'date-fns'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const user = await User.findOne({ email: session.user.email })
      .select('-password')
      .lean()

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
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
    await connectDB()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }



    // Cập nhật thông tin người dùng
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name: data.name,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          weight: data.weight,
          height: data.height,
          activityLevel: data.activityLevel,
          medicalConditions: data.medicalConditions,
          lastUpdateDate: new Date()
        }
      },
      { new: true }
    ).select('-password')

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 