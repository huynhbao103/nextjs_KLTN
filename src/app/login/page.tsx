'use client';

import { useState } from 'react';
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/header/page";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/experience";
  const error = searchParams.get("error");
  const registered = searchParams.get("registered");

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setFormError('Email hoặc mật khẩu không đúng');
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      setFormError('Đã xảy ra lỗi, vui lòng thử lại');
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
              Đăng nhập vào tài khoản
            </h2>
            <p className="mt-2 text-center text-sm text-brown-primary/70 dark:text-dark-text-secondary">
              Hoặc{' '}
              <button
                onClick={() => router.push('/register')}
                className="font-medium text-green-primary hover:text-green-primary/80"
              >
                đăng ký tài khoản mới
              </button>
            </p>
          </div>

          {registered && (
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    Đăng ký thành công! Vui lòng đăng nhập.
                  </h3>
                </div>
              </div>
            </div>
          )}

          {(error || formError) && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {formError || 
                      (error === "OAuthSignin" && "Lỗi đăng nhập với GitHub") ||
                      (error === "OAuthCallback" && "Lỗi xác thực từ GitHub") ||
                      (error === "OAuthCreateAccount" && "Lỗi tạo tài khoản") ||
                      (error === "EmailCreateAccount" && "Lỗi tạo tài khoản email") ||
                      (error === "Callback" && "Lỗi callback") ||
                      (error === "OAuthAccountNotLinked" && "Email đã được sử dụng với phương thức đăng nhập khác") ||
                      (error === "EmailSignin" && "Lỗi gửi email đăng nhập") ||
                      (error === "CredentialsSignin" && "Thông tin đăng nhập không hợp lệ") ||
                      (error === "SessionRequired" && "Vui lòng đăng nhập để tiếp tục") ||
                      (error === "Default" && "Đã xảy ra lỗi, vui lòng thử lại")}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
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
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-green-primary dark:bg-dark-card dark:text-dark-text dark:ring-gray-700"
                  placeholder="Mật khẩu"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md bg-green-primary px-3 py-2 text-sm font-semibold text-white hover:bg-green-primary/90 focus:outline-none focus:ring-2 focus:ring-green-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-cream-primary dark:bg-dark-bg px-2 text-gray-500 dark:text-gray-400">
                Hoặc đăng nhập với
              </span>
            </div>
          </div>

          <div>
            <button
              onClick={() => signIn("github", { callbackUrl })}
              className="group relative flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </span>
              Đăng nhập với GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}