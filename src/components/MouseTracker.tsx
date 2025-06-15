'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface MouseTrackerProps {
  foodImages: string[]
  isActive: boolean
}

export default function MouseTracker({ foodImages, isActive }: MouseTrackerProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    if (isActive) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <>
      {/* Mouse Trail Effect */}
      <motion.div
        className="fixed pointer-events-none z-50 w-8 h-8 rounded-full bg-orange-primary/30 blur-sm"
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
        }}
      />

      {/* Floating Food Images */}
      {foodImages.map((image, index) => (
        <motion.div
          key={index}
          className="fixed pointer-events-none z-40"
          style={{
            left: mousePosition.x + (index - 2) * 80 - 30,
            top: mousePosition.y + Math.sin(Date.now() * 0.003 + index) * 40 - 30,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        >
          <img
            src={image}
            alt={`Food ${index}`}
            className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-white"
            style={{
              filter: 'brightness(1.1) contrast(1.1)',
            }}
          />
        </motion.div>
      ))}
    </>
  )
} 