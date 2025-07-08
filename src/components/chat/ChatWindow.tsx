// components/ChatWindow.js
import React from 'react';

const ChatWindow = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-1 bg-gradient-to-b from-white-primary/30 to-cream-primary/20 dark:from-dark-card/30 dark:to-dark-bg/20 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(210,100,38,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      
      {/* Chat container - improved layout */}
      <div className="relative h-full overflow-y-auto scrollbar-thin scrollbar-thumb-orange-primary/30 scrollbar-track-transparent hover:scrollbar-thumb-orange-primary/50 transition-all duration-300">
        <div className="min-h-full flex flex-col justify-end p-6 md:p-8">
          <div className="space-y-4">
            {children}
          </div>
        </div>
      </div>
      
      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-cream-primary/80 dark:from-dark-bg/80 to-transparent pointer-events-none"></div>
      
      {/* Top fade effect */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-cream-primary/80 dark:from-dark-bg/80 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default ChatWindow;