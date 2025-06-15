'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChefHat, Moon, Sun, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { useTheme } from '@/context/ThemeContext'
import router from 'next/router'

export default function Header() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleMenuItemClick = () => {
    setIsDropdownOpen(false)
  }

  return (
    <div className="bg-white-primary dark:bg-dark-card shadow-md transition-colors duration-300">
      <header className="relative z-20 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="bg-orange-primary p-3 rounded-full">
              <ChefHat className="w-8 h-8 text-white-primary" />
            </div>
            <span className="text-2xl font-bold text-brown-primary dark:text-dark-text transition-colors duration-300">FoodAI</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center space-x-8"
          >
            <Link href="/" className="text-brown-primary dark:text-dark-text hover:text-orange-primary transition-colors duration-300">Trang chủ</Link>
            <Link href="/experience" className="text-brown-primary dark:text-dark-text hover:text-orange-primary transition-colors duration-300">Khám phá</Link>
            <Link href="/forus" className="text-brown-primary dark:text-dark-text hover:text-orange-primary transition-colors duration-300">Về chúng tôi</Link>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg transition-colors duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-6 h-6 text-dark-text" />
              ) : (
                <Moon className="w-6 h-6 text-brown-primary" />
              )}
            </button>
            
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleDropdownClick}
                  className="flex items-center space-x-2 bg-white dark:bg-dark-card p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg transition-all duration-300"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User avatar'}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <span className="text-brown-primary dark:text-dark-text font-medium">
                    {session.user?.name}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-brown-primary dark:text-dark-text transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg py-2 z-50"
                  >
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-brown-primary dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors duration-300"
                      onClick={handleMenuItemClick}
                    >
                      <User className="w-5 h-5" />
                      <span>Cập nhật hồ sơ</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center space-x-2 px-4 py-2 text-brown-primary dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors duration-300"
                      onClick={handleMenuItemClick}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Cập nhật mật khẩu</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: '/login' })
                        handleMenuItemClick()
                      
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors duration-300"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Đăng xuất</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-green-primary dark:bg-green-primary text-white-primary px-6 py-2 rounded-full hover:bg-green-primary/90 transition-all duration-300 hover:scale-105"
              >
                Đăng nhập
              </Link>
            )}
          </motion.div>
        </nav>
      </header>
    </div>
  )
}
