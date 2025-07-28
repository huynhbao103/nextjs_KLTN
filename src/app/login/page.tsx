'use client';

import { useState } from 'react';
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ChefHat } from 'lucide-react';
import Header from "@/components/header/page";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const error = searchParams.get("error");
  const registered = searchParams.get("registered");

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-cream-primary via-white-primary to-orange-primary/10 dark:from-dark-bg dark:via-dark-card dark:to-orange-primary/5">
      <Header />
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Card Container */}
          <div className="bg-white-primary/80 dark:bg-dark-card/80 backdrop-blur-md rounded-2xl shadow-2xl border border-orange-primary/20 dark:border-orange-primary/10 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-br from-orange-primary to-green-primary rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <ChefHat className="w-8 h-8 text-white-primary" />
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold text-brown-primary dark:text-dark-text mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Chào mừng trở lại
              </motion.h2>
              <motion.p 
                className="text-brown-primary/70 dark:text-dark-text-secondary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Đăng nhập để khám phá ẩm thực tuyệt vời
              </motion.p>
            </div>

            {/* Success Message */}
            {registered && (
              <motion.div 
                className="rounded-xl bg-gradient-to-r from-green-primary/10 to-green-primary/5 border border-green-primary/20 p-4 mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-green-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white-primary rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-primary dark:text-green-400">
                      Đăng ký thành công! Vui lòng đăng nhập.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {(error || formError) && (
              <motion.div 
                className="rounded-xl bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 p-4 mb-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white-primary rounded-full"></div>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
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
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <motion.form 
              className="space-y-6" 
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-brown-primary/50 dark:text-dark-text-secondary" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-orange-primary/20 dark:border-orange-primary/10 rounded-xl bg-white-primary/50 dark:bg-dark-bg/50 text-brown-primary dark:text-dark-text placeholder-brown-primary/50 dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent transition-all duration-300"
                    placeholder="Email"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-brown-primary/50 dark:text-dark-text-secondary" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3 border border-orange-primary/20 dark:border-orange-primary/10 rounded-xl bg-white-primary/50 dark:bg-dark-bg/50 text-brown-primary dark:text-dark-text placeholder-brown-primary/50 dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent transition-all duration-300"
                    placeholder="Mật khẩu"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-brown-primary/50 dark:text-dark-text-secondary hover:text-brown-primary dark:hover:text-dark-text transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-brown-primary/50 dark:text-dark-text-secondary hover:text-brown-primary dark:hover:text-dark-text transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-orange-primary to-green-primary px-4 py-3 text-sm font-semibold text-white-primary hover:from-orange-primary/90 hover:to-green-primary/90 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white-primary mr-2"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  'Đăng nhập'
                )}
              </motion.button>
            </motion.form>

            {/* Links */}
            <motion.div 
              className="mt-6 space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-center text-sm text-brown-primary/70 dark:text-dark-text-secondary">
                Chưa có tài khoản?{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="font-semibold text-orange-primary hover:text-orange-primary/80 transition-colors"
                >
                  Đăng ký ngay
                </button>
              </p>
              <p className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-green-primary hover:text-green-primary/80 transition-colors font-medium"
                >
                  Quên mật khẩu?
                </button>
              </p>
            </motion.div>

            {/* Divider */}
            <motion.div 
              className="relative my-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-orange-primary/20 dark:border-orange-primary/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white-primary/80 dark:bg-dark-card/80 px-2 text-brown-primary/50 dark:text-dark-text-secondary">
                  Hoặc đăng nhập với
                </span>
              </div>
            </motion.div>

            {/* Social Login */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <button
                onClick={() => signIn("github", { callbackUrl })}
                className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 text-sm font-semibold text-white-primary hover:from-gray-700 hover:to-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </span>
                Đăng nhập với GitHub
              </button>

              <button
                onClick={() => signIn("google", { callbackUrl })}
                className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-white-primary to-gray-50 dark:from-gray-800 dark:to-gray-700 px-4 py-3 text-sm font-semibold text-brown-primary dark:text-dark-text ring-1 ring-inset ring-orange-primary/20 dark:ring-orange-primary/10 hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </span>
                Đăng nhập với Google
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}