'use client';
import { useState } from 'react';
import Header from '@/components/header/page';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const tokenRef = useRef<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        tokenRef.current = data.token;
      } else {
        setError(data.message || 'Đã xảy ra lỗi, vui lòng thử lại.');
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
              Quên mật khẩu
            </h2>
            <p className="mt-2 text-center text-sm text-brown-primary/70 dark:text-dark-text-secondary">
              Nhập email để nhận mã xác thực OTP
            </p>
          </div>
          {success ? (
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20 text-center">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Đã gửi mã OTP về email! Vui lòng kiểm tra hộp thư.
              </h3>
              <button
                className="mt-4 px-4 py-2 rounded bg-orange-primary text-white font-semibold hover:bg-orange-primary/90 transition"
                onClick={() => {
                  if (typeof window !== 'undefined' && tokenRef.current) {
                    localStorage.setItem('otp_token', tokenRef.current);
                  }
                  router.push('/verify-otp');
                }}
              >
                Nhập mã OTP
              </button>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-green-primary dark:bg-dark-card dark:text-dark-text dark:ring-gray-700"
                    placeholder="Email"
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
                  {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 