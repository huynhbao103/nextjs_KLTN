'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ChefHat, Brain, MapPin, Star, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import Header from '@/components/header/page'
import Footer from '@/components/footer/page'
import SessionInfo from '@/components/auth/SessionInfo'

export default function HomePage() {
  const [showMouseTrail, setShowMouseTrail] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { data: session, status } = useSession();
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

  const features = [
    {
      icon: Brain,
      title: 'AI Thông Minh',
      description: 'Sử dụng trí tuệ nhân tạo để phân tích sở thích và đưa ra gợi ý phù hợp nhất'
    },
    {
      icon: MapPin,
      title: 'Tìm Quán Gần',
      description: 'Tự động tìm kiếm các quán ăn ngon gần vị trí của bạn'
    },
    {
      icon: Clock,
      title: 'Tiết Kiệm Thời Gian',
      description: 'Không còn phải suy nghĩ "hôm nay ăn gì" nữa'
    }
  ]

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
          <div className="bg-cream-primary dark:bg-dark-bg transition-colors duration-300">
            <section className="relative z-20 px-6 py-20">
              <div className="max-w-7xl mx-auto text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-6xl md:text-8xl font-bold mb-8"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <span className="gradient-text dark:from-dark-text dark:via-orange-primary dark:to-green-primary">Khám Phá</span>
                  <br />
                  <span className="text-brown-primary dark:text-dark-text">Món Ngon</span>
                  <br />
                  <span className="text-green-primary dark:text-green-primary">Với AI</span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl md:text-2xl text-brown-primary/80 dark:text-dark-text-secondary mb-12 max-w-3xl mx-auto"
                >
                  Để chúng tôi giúp bạn tìm ra món ăn và quán ăn hoàn hảo 
                  phù hợp với bạn
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                  <Link 
                    href={status === 'authenticated' ? "/experience" : "/login"} 
                    className="btn-primary text-lg dark:bg-orange-primary dark:hover:bg-orange-primary/90"
                  >
                    Bắt Đầu Khám Phá
                  </Link>
                </motion.div>
              </div>
            </section>

            <section className="relative z-20 px-6 py-20 bg-white-primary/50 dark:bg-dark-card/50 transition-colors duration-300">
              <div className="max-w-7xl mx-auto">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl font-bold text-center mb-16 text-brown-primary dark:text-dark-text"
                >
                  Tại Sao Chọn TastyMind?
                </motion.h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, rotateY: 5 }}
                      className="bg-white-primary dark:bg-dark-card p-8 rounded-2xl shadow-lg text-center perspective-1000 transition-colors duration-300"
                    >
                      <div className="bg-orange-primary/10 dark:bg-orange-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <feature.icon className="w-8 h-8 text-orange-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4 text-brown-primary dark:text-dark-text">{feature.title}</h3>
                      <p className="text-brown-primary/70 dark:text-dark-text-secondary">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </div>
          {/* <SessionInfo /> */}
        </main>
        <Footer />
      </div>
    </div>
  )
} 