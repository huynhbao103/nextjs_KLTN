import React from 'react'
import { ChefHat } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

export default function footer() {
  const { data: session } = useSession()

  return (
    <div>
   {/* CTA Section */}
   <section className="relative z-20 px-6 py-20 bg-gradient-to-br from-brown-primary to-orange-primary dark:from-dark-card dark:to-orange-primary transition-all duration-500 ease-out">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-4xl md:text-5xl font-bold mb-8 text-white-primary opacity-0 animate-fadeInUp"
          >
            Sẵn Sàng Khám Phá?
          </h2>
          <p
            className="text-xl mb-12 text-white-primary/90 opacity-0 animate-fadeInUp animation-delay-200"
          >
            Để tìm kiếm những trải nghiệm ẩm thực tuyệt vời
          </p>
          <div
            className="opacity-0 animate-fadeInUp animation-delay-400 hover:scale-105 active:scale-95 transition-transform duration-300"
          >
            <Link 
              href={session ? "/chat" : "/login"}
              className="inline-block bg-white-primary text-brown-primary px-12 py-6 rounded-full text-xl font-bold hover:shadow-2xl transition-all duration-300"
          >
            Bắt Đầu Miễn Phí
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-20 px-6 py-12 bg-brown-primary dark:bg-dark-card text-white-primary">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
          <Link 
              href="/" 
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2 rounded-lg transition-all duration-200"
              aria-label="Go to homepage"
            >
              <div className="relative w-20 h-12 sm:w-24 sm:h-16 flex items-center justify-center">
                <Image 
                 src="/images/logo.png" 
                  alt="tastyMind Logo" 
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 80px, 96px"
                />
              </div>
            </Link>
          </div>
          <p className="text-white-primary/70 mb-8">
            Khám phá thế giới ẩm thực
          </p>
        </div>
      </footer>
    </div>
  )
}