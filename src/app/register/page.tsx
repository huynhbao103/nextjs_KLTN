'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ChefHat, CheckCircle } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Kiểm tra độ dài mật khẩu
    if (formData.password.length < 6 || formData.password.length > 60) {
      setError('Mật khẩu phải có từ 6 đến 60 ký tự');
      setLoading(false);
      return;
    }

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

  const getPasswordStrengthColor = (score: number) => {
    const colors = [
      'text-red-500', // 0 - yếu
      'text-orange-500', // 1 - yếu
      'text-yellow-500', // 2 - trung bình
      'text-green-primary', // 3 - khá
      'text-green-600'  // 4 - mạnh
    ];
    return colors[score];
  };

  const getPasswordStrengthText = (score: number) => {
    const texts = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
    return texts[score];
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
                Tạo tài khoản mới
              </motion.h2>
              <motion.p 
                className="text-brown-primary/70 dark:text-dark-text-secondary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Hoặc{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="font-semibold text-orange-primary hover:text-orange-primary/80 transition-colors"
                >
                  đăng nhập nếu đã có tài khoản
                </button>
              </motion.p>
            </div>

            {/* Error Message */}
            {error && (
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
                      {error}
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
                {/* Name Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-brown-primary/50 dark:text-dark-text-secondary" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-orange-primary/20 dark:border-orange-primary/10 rounded-xl bg-white-primary/50 dark:bg-dark-bg/50 text-brown-primary dark:text-dark-text placeholder-brown-primary/50 dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent transition-all duration-300"
                    placeholder="Họ và tên"
                  />
                </div>

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
                    autoComplete="new-password"
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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <motion.div 
                    className="mt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs font-medium ${getPasswordStrengthColor(passwordScore)}`}>
                        Độ mạnh mật khẩu: {getPasswordStrengthText(passwordScore)}
                      </span>
                      <div className="flex space-x-1">
                        {[0, 1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 w-8 rounded-full transition-all duration-300 ${
                              level <= passwordScore
                                ? getPasswordStrengthColor(passwordScore).replace('text-', 'bg-')
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {passwordFeedback && (
                      <p className="text-xs text-brown-primary/60 dark:text-dark-text-secondary">
                        💡 {passwordFeedback}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Confirm Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-brown-primary/50 dark:text-dark-text-secondary" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3 border border-orange-primary/20 dark:border-orange-primary/10 rounded-xl bg-white-primary/50 dark:bg-dark-bg/50 text-brown-primary dark:text-dark-text placeholder-brown-primary/50 dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent transition-all duration-300"
                    placeholder="Xác nhận mật khẩu"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-brown-primary/50 dark:text-dark-text-secondary hover:text-brown-primary dark:hover:text-dark-text transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-brown-primary/50 dark:text-dark-text-secondary hover:text-brown-primary dark:hover:text-dark-text transition-colors" />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <motion.div 
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-primary" />
                        <span className="text-xs text-green-primary font-medium">Mật khẩu khớp</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 border-2 border-red-500 rounded-full"></div>
                        <span className="text-xs text-red-500 font-medium">Mật khẩu không khớp</span>
                      </>
                    )}
                  </motion.div>
                )}
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
                  'Đăng ký'
                )}
              </motion.button>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 