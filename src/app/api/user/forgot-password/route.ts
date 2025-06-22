import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';

const JWT_SECRET = process.env.JWT_SECRET || 'otp_secret_key';
const OTP_EXPIRE_SECONDS = 60; // 1 phút

function generateOTP(length = 6) {
  return Math.floor(10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1)).toString();
}

async function sendOtpEmail(email: string, otp: string) {
  // Cấu hình transporter (dùng mailtrap, gmail, ...)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Mã OTP đặt lại mật khẩu',
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #ddd; border-radius: 10px; background-color: #ffffff;">
  <p style="font-size: 18px; text-align: center; color: #555;">Yêu cầu đặt lại mật khẩu của bạn đã được tiếp nhận.</p>
  <p style="text-align: center; margin-top: 20px;">Mã OTP của bạn là:</p>
  <p style="font-size: 36px; font-weight: bold; color: #28a745; text-align: center; margin: 25px 0; letter-spacing: 2px;">${otp}</p>
  <p style="font-size: 13px; text-align: center; color: #777;">Mã này có hiệu lực trong <b>1 phút</b> và chỉ dùng cho một lần. Vui lòng không chia sẻ.</p>
  <p style="font-size: 13px; text-align: center; color: #777; margin-top: 20px;">Nếu bạn không phải là người yêu cầu hành động này, vui lòng bỏ qua email này.</p>
  <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0 15px 0;">
  <p style="font-size: 12px; text-align: center; color: #999;">Trân trọng,<br>[Tên công ty/ứng dụng của bạn]</p>
</div>`,
  });
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: 'Email là bắt buộc.' }, { status: 400 });
    }
    // Không tiết lộ email có tồn tại hay không
    const user = await User.findOne({ email });
    if (!user) {
      // Trả về thành công giả lập (bảo mật)
      return NextResponse.json({ token: '' });
    }
    const otp = generateOTP();
    const expires = Math.floor(Date.now() / 1000) + OTP_EXPIRE_SECONDS;
    const token = jwt.sign({ email, otp, exp: expires }, JWT_SECRET);
    await sendOtpEmail(email, otp);
    return NextResponse.json({ token });
  } catch (error) {
    console.error(error); 
    return NextResponse.json({ message: 'Lỗi server, vui lòng thử lại.' }, { status: 500 });
  }
} 