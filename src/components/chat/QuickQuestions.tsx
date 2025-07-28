import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Heart, Leaf, Coffee, Cake, Soup } from 'lucide-react';

interface QuickQuestion {
  id: number;
  text: string;
  icon: JSX.Element;
  color: string;
}

interface QuickQuestionsProps {
  onSelectQuestion: (question: string) => void;
  isVisible: boolean;
}

const QuickQuestions: React.FC<QuickQuestionsProps> = ({ onSelectQuestion, isVisible }) => {
  const quickQuestions: QuickQuestion[] = [
    {
      id: 1,
      text: "Gợi ý món ăn trưa nhanh gọn lẹ?",
      icon: <Utensils className="w-5 h-5" />,
      color: "from-orange-400 to-orange-600"
    },
    {
      id: 2,
      text: "Gợi ý món ăn phù hợp?",
      icon: <Soup className="w-5 h-5" />,
      color: "from-green-400 to-green-600"
    },
    {
      id: 3,
      text: "Có món ăn chay nào phù hợp với tôi không",
      icon: <Leaf className="w-5 h-5" />,
      color: "from-emerald-400 to-emerald-600"
    },
  
    {
      id: 4,
      text: "Có món ăn nào phù hợp với tôi không?",
      icon: <Heart className="w-5 h-5" />,
      color: "from-pink-400 to-pink-600"
    },
   
  ];

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
    >
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-primary to-green-primary flex items-center justify-center mx-auto mb-3">
          <Utensils className="w-6 h-6 text-white-primary" />
        </div>
        <p className="text-sm text-brown-primary/70 dark:text-dark-text-secondary mb-3 font-medium">
          Hoặc chọn một câu hỏi nhanh về món ăn:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {quickQuestions.map((question, index) => (
          <motion.button
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectQuestion(question.text)}
            className="group p-4 text-left bg-white-primary dark:bg-dark-card rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-orange-primary/50 dark:hover:border-orange-primary/50 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${question.color} flex items-center justify-center text-white-primary shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {question.icon}
              </div>
              <span className="text-sm text-brown-primary dark:text-dark-text group-hover:text-orange-primary dark:group-hover:text-orange-primary transition-colors duration-300 font-medium leading-relaxed">
                {question.text}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickQuestions;