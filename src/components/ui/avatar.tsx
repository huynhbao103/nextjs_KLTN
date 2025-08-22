'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  email?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
}

export default function Avatar({ 
  src, 
  alt, 
  name, 
  email, 
  size = 'md',
  className = ''
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const getInitials = () => {
    if (name) return name[0].toUpperCase()
    if (email) return email[0].toUpperCase()
    return 'U'
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  // If no image or image failed to load, show initials
  if (!src || imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-orange-primary to-green-primary flex items-center justify-center text-white-primary font-bold ${className}`}>
        {getInitials()}
      </div>
    )
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <Image
        src={src}
        alt={alt || `Avatar of ${name || email || 'user'}`}
        fill
        className={`rounded-full object-cover transition-opacity duration-200 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        sizes={size === 'sm' ? '32px' : size === 'md' ? '40px' : size === 'lg' ? '48px' : '64px'}
      />
      {/* Loading state */}
      {!imageLoaded && !imageError && (
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-br from-orange-primary/20 to-green-primary/20 animate-pulse`} />
      )}
    </div>
  )
}
