import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import User from '@/models/User'
import dbConnect from '@/lib/dbConnect'
import bcrypt from 'bcryptjs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized', success: false }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Thiếu thông tin', success: false }, { status: 400 })
    }

    // Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 6 || newPassword.length > 60) {
      return NextResponse.json({ message: 'Mật khẩu mới phải có từ 6 đến 60 ký tự', success: false }, { status: 400 })
    }

    await dbConnect()
    const user = await User.findOne({ email: session.user.email })
    if (!user || !user.password) {
      return NextResponse.json({ message: 'Không tìm thấy người dùng hoặc tài khoản không có mật khẩu' }, { status: 404 })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return NextResponse.json({ message: 'Mật khẩu hiện tại không đúng', success: false }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    return NextResponse.json({ message: 'Đổi mật khẩu thành công!', success: true }, { status: 200 })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ message: 'Lỗi máy chủ', success: false }, { status: 500 })
  }
} 