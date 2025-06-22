'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header/page';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('otp_token') : '';
      const res = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, token }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        if (typeof window !== 'undefined') localStorage.removeItem('otp_token');
        setTimeout(() => router.push('/login'), 2000);
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
              Đặt lại mật khẩu mới
            </h2>
            <p className="mt-2 text-center text-sm text-brown-primary/70 dark:text-dark-text-secondary">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>
          {success ? (
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20 text-center">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...
              </h3>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <label htmlFor="password" className="sr-only">Mật khẩu mới</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-green-primary dark:bg-dark-card dark:text-dark-text dark:ring-gray-700"
                    placeholder="Mật khẩu mới"
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="sr-only">Xác nhận mật khẩu</label>
                  <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-green-primary dark:bg-dark-card dark:text-dark-text dark:ring-gray-700"
                    placeholder="Xác nhận mật khẩu"
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
                  {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 