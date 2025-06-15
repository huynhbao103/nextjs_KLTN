'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header/page';
import zxcvbn from 'zxcvbn';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'password') {
      const result = zxcvbn(value);
      setPasswordScore(result.score);
      setPasswordFeedback(result.feedback.suggestions[0] || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Đăng ký thất bại');
      }

      // Đăng ký thành công, chuyển hướng đến trang đăng nhập
      router.push('/login?registered=true');
    } catch (error: any) {
      setError(error.message);
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
              Đăng ký tài khoản
            </h2>
            <p className="mt-2 text-center text-sm text-brown-primary/70 dark:text-dark-text-secondary">
              Hoặc{' '}
              <button
                onClick={() => router.push('/login')}
                className="font-medium text-green-primary hover:text-green-primary/80"
              >
                đăng nhập nếu đã có tài khoản
              </button>
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="name" className="sr-only">
                  Họ và tên
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-green-primary dark:bg-dark-card dark:text-dark-text dark:ring-gray-700"
                  placeholder="Họ và tên"
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-green-primary dark:bg-dark-card dark:text-dark-text dark:ring-gray-700"
                  placeholder="Email"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-green-primary dark:bg-dark-card dark:text-dark-text dark:ring-gray-700"
                  placeholder="Mật khẩu"
                />
              </div>
              <div className="mt-1">
                {formData.password && (
                  <div className="text-xs font-medium mt-1" style={{ color: [
                    '#dc2626', // 0 - yếu
                    '#f59e42', // 1 - yếu
                    '#eab308', // 2 - trung bình
                    '#22c55e', // 3 - khá
                    '#16a34a'  // 4 - mạnh
                  ][passwordScore] }}>
                    Độ mạnh mật khẩu: {['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][passwordScore]}
                    {passwordFeedback && <span className="block mt-1 text-gray-500 dark:text-gray-400">{passwordFeedback}</span>}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-green-primary dark:bg-dark-card dark:text-dark-text dark:ring-gray-700"
                  placeholder="Xác nhận mật khẩu"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-green-primary px-3 py-2 text-sm font-semibold text-white hover:bg-green-primary/90 focus:outline-none focus:ring-2 focus:ring-green-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 