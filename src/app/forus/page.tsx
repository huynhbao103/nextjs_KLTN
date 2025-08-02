'use client'

import React from 'react'
import Header from '@/components/header/page'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import Footer from '@/components/footer/page'
import { 
  Users, 
  Target, 
  Shield, 
  Brain, 
  MessageSquare, 
  Bot, 
} from 'lucide-react'

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Đề xuất thông minh",
    description: "Nhận đề xuất món ăn cá nhân hóa dựa trên sở thích, tình trạng sức khỏe, thời tiết và tâm trạng."
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "Chatbot ẩm thực",
    description: "Hệ thống chatbot ẩm thực AI hỗ trợ theo thời gian thực."
  },
]

// const futureFeatures = [



// ]

const values = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Cá nhân hóa tối đa",
    description: "Mỗi người là một cá thể duy nhất, vì thế mỗi gợi ý món ăn đều được tùy chỉnh cho riêng bạn."
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Dễ sử dụng và thân thiện",
    description: "Giao diện đơn giản, đẹp mắt, thân thiện với mọi lứa tuổi."
  },
  // {
  //   icon: <MessageSquare className="w-6 h-6" />,
  //   title: "Hỗ trợ cộng đồng",
  //   description: "Xây dựng một cộng đồng người yêu ẩm thực, nơi bạn có thể chia sẻ công thức và kinh nghiệm."
  // },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Tôn trọng dữ liệu",
    description: "Mọi thông tin bạn cung cấp đều được bảo mật tuyệt đối và chỉ dùng để cải thiện trải nghiệm."
  }
]

const Forus = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
        
            <h1 className="text-lg font-bold text-muted-foreground max-w-3xl mx-auto dark:text-gray-300">
              Chào mừng bạn đến với TastyMind – nền tảng gợi ý món ăn thông minh tại Việt Nam.
            </h1>
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <Card className="border-border bg-card dark:bg-dark-card dark:border-neutral-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4 dark:text-white">
                  Sứ Mệnh Của Chúng Tôi
                </h2>
                <p className="text-muted-foreground flex flex-col dark:text-gray-300 text-center">
                  Chúng tôi là một đội ngũ gồm các nhà phát triển phần mềm, chuyên gia dinh dưỡng
                và những người đam mê ẩm thực, với mong muốn giải quyết một câu hỏi 
                  đơn giản nhưng phổ biến:
                  <span className="font-bold  text-orange-primary text-center"> "Hôm nay ăn gì?"</span>
                </p>
               
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center dark:text-white">
              Tính Năng Nổi Bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 * index }}
                >
                  <Card className="h-full border-border bg-card hover:shadow-lg transition-shadow dark:bg-dark-card dark:border-neutral-700">
                    <CardContent className="p-6">
                      <div className="text-primary mb-4 dark:text-orange-primary">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground dark:text-gray-300">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center dark:text-white">
              Giá Trị Cốt Lõi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 * index }}
                >
                  <Card className="h-full border-border bg-card hover:shadow-lg transition-shadow dark:bg-dark-card dark:border-neutral-700">
                    <CardContent className="p-6">
                      <div className="text-primary mb-4 dark:text-orange-primary">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2 dark:text-white">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground dark:text-gray-300">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Future Features */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center dark:text-white">
              Tầm Nhìn Tương Lai
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {futureFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 * index }}
                >
                  <Card className="h-full border-border bg-card hover:shadow-lg transition-shadow dark:bg-dark-card dark:border-neutral-700">
                    <CardContent className="p-6">
                      <div className="text-primary mb-4 dark:text-orange-primary">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground dark:text-gray-300">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div> */}

          {/* Closing Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="text-center"
          >
            <Card className="border-border bg-card dark:bg-dark-card dark:border-neutral-700">
              <CardContent className="p-8">
                <p className="text-muted-foreground dark:text-gray-300">
                  Cảm ơn bạn đã tin tưởng và đồng hành cùng chúng tôi. Hãy để TastyMind là người bạn 
                  đồng hành đáng tin cậy trong hành trình khám phá và tận hưởng ẩm thực mỗi ngày của bạn.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Forus