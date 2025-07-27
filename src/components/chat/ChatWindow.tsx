// components/ChatWindow.js
import React from 'react';
import { motion } from 'framer-motion';

const ChatWindow = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="chat-window flex-1 bg-gradient-to-br from-cream-primary/30 via-white-primary/20 to-orange-primary/10 dark:from-dark-bg/30 dark:via-dark-card/20 dark:to-orange-primary/5 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(210,100,38,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      
      {/* Floating elements for visual appeal */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-primary/5 to-green-primary/5 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-green-primary/5 to-orange-primary/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-brown-primary/5 to-orange-primary/5 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Chat container - improved layout */}
      <div className="relative h-full overflow-y-auto scrollbar-thin scrollbar-thumb-orange-primary/30 scrollbar-track-transparent hover:scrollbar-thumb-orange-primary/50 transition-all duration-300">
        <div className="min-h-full flex flex-col justify-end p-6 md:p-8">
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
      
      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-cream-primary/90 dark:from-dark-bg/90 to-transparent pointer-events-none"></div>
      
      {/* Top fade effect */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-cream-primary/90 dark:from-dark-bg/90 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default ChatWindow;