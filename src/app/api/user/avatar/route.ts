import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import User from '@/models/User'
import dbConnect from '@/lib/dbConnect'
import cloudinary from '@/lib/cloudinary'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const formData = await request.formData()
    const file = formData.get('image') as File
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'File size too large' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Convert buffer to base64
    const base64String = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64String}`

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: 'avatars',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
    })

    // Update user's avatar in MongoDB
    const imageUrl = (result as any).secure_url
    await User.findOneAndUpdate(
      { email: session.user.email },
      { image: imageUrl }
    )

    return NextResponse.json(
      { message: 'Avatar updated successfully', imageUrl },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { message: 'Error uploading avatar' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Get current user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // If user has an avatar, delete it from Cloudinary
    if (user.image) {
      // Extract public_id from Cloudinary URL
      const publicId = user.image.split('/').slice(-1)[0].split('.')[0]
      await cloudinary.uploader.destroy(`avatars/${publicId}`)
    }

    // Update user in MongoDB
    await User.findOneAndUpdate(
      { email: session.user.email },
      { image: null }
    )

    return NextResponse.json(
      { message: 'Avatar deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting avatar:', error)
    return NextResponse.json(
      { message: 'Error deleting avatar' },
      { status: 500 }
    )
  }
} 