'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/header/page'
import zxcvbn from 'zxcvbn'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [passwordScore, setPasswordScore] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const router = useRouter();

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get('currentPassword')
    const newPassword = formData.get('newPassword')
    const confirmPassword = formData.get('confirmPassword')

    // Kiểm tra độ dài mật khẩu mới
    if (!newPassword || newPassword.toString().length < 6 || newPassword.toString().length > 60) {
      setMessage('Mật khẩu mới phải có từ 6 đến 60 ký tự')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu mới không khớp')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })
      const data = await response.json();
      if (data.status === 200) {
        setMessage(data.message || 'Cập nhật mật khẩu thành công!');
        router.push('/');
      } else {
        setMessage(data.message || 'Cập nhật mật khẩu thất bại!');
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra khi cập nhật mật khẩu');
    } finally {
      setLoading(false);
    }
  }

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    const result = zxcvbn(value);
    setPasswordScore(result.score);
    setPasswordFeedback(result.feedback.suggestions[0] || '');
  };

  return (
    <div className="min-h-screen bg-cream-primary dark:bg-dark-bg">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-brown-primary dark:text-dark-text mb-8">
          Cài đặt tài khoản
        </h1>

        {message && (
          <div className={`p-4 mb-6 rounded-lg ${
            message.includes('thành công') 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-200' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-brown-primary dark:text-dark-text mb-4">
            Đổi mật khẩu
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                required
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-card text-brown-primary dark:text-dark-text focus:ring-2 focus:ring-brown-primary dark:focus:ring-dark-primary"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                required
                minLength={6}
                value={newPassword}
                onChange={handleNewPasswordChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-card text-brown-primary dark:text-dark-text focus:ring-2 focus:ring-brown-primary dark:focus:ring-dark-primary"
              />
            </div>

            <div className="mt-1">
              {newPassword && (
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brown-primary dark:text-dark-text mb-2">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                minLength={6}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-card text-brown-primary dark:text-dark-text focus:ring-2 focus:ring-brown-primary dark:focus:ring-dark-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brown-primary hover:bg-brown-primary/90 dark:bg-dark-primary dark:hover:bg-dark-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-primary dark:focus:ring-dark-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}