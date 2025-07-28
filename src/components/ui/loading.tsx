import { motion } from 'framer-motion';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', text, className = '' }: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div 
      className={`flex flex-col items-center justify-center ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`loading-spinner ${sizeClasses[size]} mb-2`}></div>
      {text && (
        <p className="text-brown-primary/70 dark:text-dark-text-secondary text-sm">
          {text}
        </p>
      )}
    </motion.div>
  );
};

export const LoadingPage = ({ text = 'Đang tải...' }: { text?: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-cream-primary via-white-primary to-orange-primary/10 dark:from-dark-bg dark:via-dark-card dark:to-orange-primary/5 flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const LoadingCard = ({ text = 'Đang tải...' }: { text?: string }) => (
  <div className="card-glass p-8 flex items-center justify-center">
    <LoadingSpinner size="md" text={text} />
  </div>
);

export default LoadingSpinner; 