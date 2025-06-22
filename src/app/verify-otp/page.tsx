'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/header/page';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState(() => searchParams.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('otp_token') || '' : ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, token }),
      });
      const data = await res.json();
      if (res.ok) {
        // Lưu token xác thực để đổi mật khẩu
        if (typeof window !== 'undefined') localStorage.setItem('otp_token', token);
        router.push('/reset-password');
      } else {
        setError(data.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
      }
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-primary dark:bg-dark-bg">
      <Header />
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-brown-primary dark:text-dark-text">
              Xác thực OTP
            </h2>
            <p className="mt-2 text-center text-sm text-brown-primary/70 dark:text-dark-text-secondary">
              Nhập mã OTP đã gửi về email của bạn
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="otp" className="sr-only">Mã OTP</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-green-primary dark:bg-dark-card dark:text-dark-text dark:ring-gray-700 text-center tracking-widest text-lg"
                  placeholder="Nhập mã OTP"
                />
              </div>
            </div>
            {error && (
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20 text-center">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-green-primary px-3 py-2 text-sm font-semibold text-white hover:bg-green-primary/90 focus:outline-none focus:ring-2 focus:ring-green-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xác thực...' : 'Xác nhận mã OTP'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 