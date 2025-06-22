'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ChefHat, Brain, MapPin, Star, Clock, Users } from 'lucide-react'
import Header from '@/components/header/page'
import Home from '@/app/Home/page'
import Footer from '@/components/footer/page'
import SessionInfo from '@/components/auth/SessionInfo'

export default function HomePage() {
  const [showMouseTrail, setShowMouseTrail] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseXSpring = useSpring(mouseX, { stiffness: 500, damping: 100 });
  const mouseYSpring = useSpring(mouseY, { stiffness: 500, damping: 100 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  useEffect(() => {
    // Only enable mouse trail on desktop
    if (window.innerWidth > 768) {
      setShowMouseTrail(true);
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div className="min-h-screen bg-cream-primary">
      {/* Mouse Trail Effect - Only on desktop */}
      {showMouseTrail && (
        <motion.div
          className="mouse-trail"
          style={{
            left: mouseXSpring,
            top: mouseYSpring,
          }}
        />
      )}
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