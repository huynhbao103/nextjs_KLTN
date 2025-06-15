import React from 'react'
import { ChefHat } from 'lucide-react'
import { motion } from 'framer-motion'

export default function footer() {
  return (
    <div>
   {/* CTA Section */}
   <section className="relative z-20 px-6 py-20 bg-gradient-to-br from-brown-primary to-orange-primary dark:from-dark-card dark:to-orange-primary transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-8 text-white-primary"
          >
            Sẵn Sàng Khám Phá?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-12 text-white-primary/90"
          >
            Để tìm kiếm những trải nghiệm ẩm thực tuyệt vời
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white-primary text-brown-primary  px-12 py-6 rounded-full text-xl font-bold hover:shadow-2xl transition-all duration-300"
          >
            Bắt Đầu Miễn Phí
          </motion.button>
        </div>
      </section>

      <footer className="relative z-20 px-6 py-12 bg-brown-primary dark:bg-dark-card text-white-primary">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="bg-orange-primary p-3 rounded-full">
              <ChefHat className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold">FoodAI</span>
          </div>
          <p className="text-white-primary/70 mb-8">
            Khám phá thế giới ẩm thực
          </p>
          <div className="flex items-center justify-center space-x-8">
            <a href="#" className="hover:text-orange-primary transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-orange-primary transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-orange-primary transition-colors">Liên hệ</a>
          </div>
        </div>
      </footer>
    </div>
  )
}