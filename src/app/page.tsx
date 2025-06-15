'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ChefHat, Brain, MapPin, Star, Clock, Users } from 'lucide-react'
import Header from '@/components/header/page'
import Home from '@/app/Home/page'
import Footer from '@/components/footer/page'
import SessionInfo from '@/components/auth/SessionInfo'

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springConfig = { damping: 25, stiffness: 150 }
  const mouseXSpring = useSpring(mouseX, springConfig)
  const mouseYSpring = useSpring(mouseY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      setMousePosition({ x: clientX, y: clientY })
      mouseX.set(clientX)
      mouseY.set(clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div className="min-h-screen bg-cream-primary">
      {/* Mouse Trail Effect */}
      <motion.div
        className="mouse-trail"
        style={{
          left: mouseXSpring,
          top: mouseYSpring,
        }}
      />
      <div className="relative">
        <Header />
        <main className="relative z-10">
          <Home />
          {/* <SessionInfo /> */}
        </main>
        <Footer />
      </div>
    </div>
  )
} 