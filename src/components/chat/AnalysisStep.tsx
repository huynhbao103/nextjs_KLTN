import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, BarChart, Heart, Cpu, Soup, Salad, Flame, Droplets, EggFried, Drumstick, ChefHat } from 'lucide-react';

interface AnalysisStepProps {
  step: string;
  message: string;
}

const stepIcons: Record<string, { icon: JSX.Element; color: string; title: string }> = {
  'bmi_analysis': { icon: <BarChart />, color: 'text-blue-500', title: 'Phân tích BMI' },
  'disease_analysis': { icon: <Heart />, color: 'text-red-500', title: 'Phân tích Bệnh lý' },
  'cooking_method_filter_disease': { icon: <ChefHat />, color: 'text-green-500', title: 'Lọc phương pháp nấu' },
  'default': { icon: <CheckCircle />, color: 'text-gray-500', title: 'Phân tích chung' }
};

const AnalysisStep: React.FC<AnalysisStepProps> = ({ step, message }) => {
  const { icon, color, title } = stepIcons[step] || stepIcons.default;
  const messageWithoutPrefix = message.replace(`[${step.toUpperCase()}] `, '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-4 p-4 mb-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className={`mt-1 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        {React.cloneElement(icon, { className: `w-5 h-5 ${color}` })}
      </div>
      <div className="flex-grow">
        <h4 className={`font-semibold text-lg ${color}`}>{title}</h4>
        <p className="text-brown-primary dark:text-dark-text-secondary whitespace-pre-wrap break-words">
          {messageWithoutPrefix}
        </p>
      </div>
    </motion.div>
  );
};

export default AnalysisStep; 