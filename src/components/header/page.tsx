'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChefHat, Moon, Sun, User, Settings, LogOut, ChevronDown, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { useTheme } from '@/context/ThemeContext'
import logo from '@/public/images/logo.png'

// Animation variants for better performance
const mobileMenuVariants = {
   closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 1,
      ease: "easeInOut"
    }
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 1,
      ease: "easeInOut"
    }
  }
}

const dropdownVariants = {
  closed: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
}

export default function Header() {
  const { data: session, status } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  // Keyboard navigation support
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsDropdownOpen(false)
      setIsMobileMenuOpen(false)
    }
  }, [])

  const handleDropdownClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDropdownOpen(prev => !prev)
  }, [])

  const handleMenuItemClick = useCallback(() => {
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: '/login' })
    handleMenuItemClick()
  }, [handleMenuItemClick])

  const isLoading = status === 'loading'

  return (
    <motion.header 
      className="bg-white-primary dark:bg-dark-card shadow-md transition-colors duration-300 fixed top-0 left-0 right-0 z-50"
      onKeyDown={handleKeyDown}
      role="banner"
      aria-label="Main navigation"
      initial={{ y: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        duration: 0.3,
        ease: "easeInOut"
      }}
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between" role="navigation">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link 
              href="/" 
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 rounded-lg transition-all duration-200"
              aria-label="Go to homepage"
            >
              <div className="relative w-20 h-12 sm:w-24 sm:h-16 flex items-center justify-center">
                <Image 
                  src={logo} 
                  alt="FoodAI Logo" 
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 80px, 96px"
                />
              </div>
            </Link>
          </motion.div>
          
          {/* Desktop Menu */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center space-x-6 lg:space-x-8"
          >
            <Link 
              href="/" 
              className="text-brown-primary dark:text-dark-text hover:text-orange-primary dark:hover:text-orange-primary transition-colors font-semibold duration-300 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 rounded px-2 py-1"
              aria-label="Go to homepage"
            >
              Trang chủ
            </Link>
            <Link 
              href="/replie" 
              className="text-brown-primary dark:text-dark-text hover:text-orange-primary dark:hover:text-orange-primary transition-colors font-semibold duration-300 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 rounded px-2 py-1"
              aria-label="Explore food recommendations"
            >
              Khám phá
            </Link>
            <Link 
              href="/forus" 
              className="text-brown-primary dark:text-dark-text hover:text-orange-primary dark:hover:text-orange-primary transition-colors font-semibold duration-300 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 rounded px-2 py-1"
              aria-label="About us"
            >
              Về chúng tôi
            </Link>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-dark-text" />
              ) : (
                <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-brown-primary" />
              )}
            </button>
            
            {/* User Menu */}
            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleDropdownClick}
                  className="flex items-center space-x-2 bg-white dark:bg-dark-card p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2"
                  aria-label="User menu"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
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
                      <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <span className="text-brown-primary dark:text-dark-text font-medium hidden lg:block">
                    {session.user?.name}
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 text-brown-primary dark:text-dark-text transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-brown-primary dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors duration-300 focus:outline-none focus:bg-gray-100 dark:focus:bg-dark-bg"
                        onClick={handleMenuItemClick}
                        role="menuitem"
                      >
                        <User className="w-4 h-4" />
                        <span>Cập nhật hồ sơ</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-brown-primary dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors duration-300 focus:outline-none focus:bg-gray-100 dark:focus:bg-dark-bg"
                        onClick={handleMenuItemClick}
                        role="menuitem"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Cập nhật mật khẩu</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors duration-300 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-100"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-green-primary dark:bg-green-primary text-white-primary px-4 sm:px-6 py-2 rounded-full hover:bg-green-primary/90 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-primary focus:ring-offset-2 font-semibold"
                aria-label="Sign in to your account"
              >
                Đăng nhập
              </Link>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-dark-text" />
              ) : (
                <Moon className="w-5 h-5 text-brown-primary" />
              )}
            </button>
            
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-brown-primary dark:text-dark-text" />
              ) : (
                <Menu className="w-5 h-5 text-brown-primary dark:text-dark-text" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col space-y-3 pt-4">
                <Link 
                  href="/" 
                  className="text-brown-primary dark:text-dark-text hover:text-orange-primary dark:hover:text-orange-primary transition-colors font-semibold duration-300 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 rounded px-2 py-1"
                  onClick={handleMenuItemClick}
                  aria-label="Go to homepage"
                >
                  Trang chủ
                </Link>
                <Link 
                  href="/profile" 
                  className="text-brown-primary dark:text-dark-text hover:text-orange-primary dark:hover:text-orange-primary transition-colors font-semibold duration-300 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 rounded px-2 py-1"
                  onClick={handleMenuItemClick}
                  aria-label="Explore food recommendations"
                >
                  Khám phá
                </Link>
                <Link 
                  href="/forus" 
                  className="text-brown-primary dark:text-dark-text hover:text-orange-primary dark:hover:text-orange-primary transition-colors font-semibold duration-300 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 rounded px-2 py-1"
                  onClick={handleMenuItemClick}
                  aria-label="About us"
                >
                  Về chúng tôi
                </Link>
                
                {isLoading ? (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                ) : session ? (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
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
                          <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                      <span className="text-brown-primary dark:text-dark-text font-medium">
                        {session.user?.name}
                      </span>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 py-2 text-brown-primary dark:text-dark-text hover:text-orange-primary dark:hover:text-orange-primary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 rounded px-2"
                      onClick={handleMenuItemClick}
                      aria-label="Update profile"
                    >
                      <User className="w-4 h-4" />
                      <span>Cập nhật hồ sơ</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center space-x-2 py-2 text-brown-primary dark:text-dark-text hover:text-orange-primary dark:hover:text-orange-primary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 rounded px-2"
                      onClick={handleMenuItemClick}
                      aria-label="Update password"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Cập nhật mật khẩu</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 w-full py-2 text-red-500 hover:text-red-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2"
                      aria-label="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className="bg-green-primary dark:bg-green-primary text-white-primary px-6 py-3 rounded-full hover:bg-green-primary/90 transition-all duration-300 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-green-primary focus:ring-offset-2"
                    onClick={handleMenuItemClick}
                    aria-label="Sign in to your account"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
