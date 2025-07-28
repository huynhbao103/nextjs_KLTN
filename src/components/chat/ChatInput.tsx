// components/ChatInput.js
import React, { useState } from 'react';
import { Send, Paperclip, Smile, Mic, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatInput = ({ onSendMessage }: { onSendMessage: (text: string) => void }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const quickPrompts = [
    "Tôi muốn ăn món gì đó cay",
    "Gợi ý món ăn cho bữa tối",
    "Quán ăn ngon gần đây",
    "Món ăn phù hợp cho người ăn chay"
  ];

  return (
    <div className="bg-white-primary/90 dark:bg-dark-card/90 border-t border-orange-primary/20 dark:border-orange-primary/10 shadow-xl backdrop-blur-md">
      <form onSubmit={handleSubmit} className="p-4 md:p-6">
        {/* Quick prompts */}
        {!isFocused && input.length === 0 && (
          <motion.div 
            className="mb-4 flex flex-wrap gap-2 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {quickPrompts.map((prompt, index) => (
              <motion.button
                key={index}
                type="button"
                onClick={() => setInput(prompt)}
                className="px-3 py-2 bg-gradient-to-r from-orange-primary/10 to-green-primary/10 hover:from-orange-primary/20 hover:to-green-primary/20 border border-orange-primary/20 dark:border-orange-primary/10 rounded-full text-xs text-brown-primary dark:text-dark-text hover:text-orange-primary transition-all duration-300 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {prompt}
              </motion.button>
            ))}
          </motion.div>
        )}

        <div className={`flex items-center gap-3 bg-gradient-to-r from-cream-primary/30 to-white-primary/50 dark:from-dark-bg/30 dark:to-dark-card/50 rounded-2xl p-3 border-2 transition-all duration-300 ${
          isFocused 
            ? 'border-orange-primary shadow-lg shadow-orange-primary/20' 
            : 'border-orange-primary/20 dark:border-orange-primary/10 hover:border-orange-primary/50'
        }`}>
          {/* Attachment button */}
          <motion.button
            type="button"
            className="p-2 text-brown-primary/60 dark:text-dark-text-secondary hover:text-orange-primary dark:hover:text-orange-primary transition-colors rounded-lg hover:bg-orange-primary/10 dark:hover:bg-orange-primary/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>
          
          {/* Input field */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Nhập tin nhắn của bạn..."
            className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-brown-primary dark:text-dark-text placeholder-brown-primary/50 dark:placeholder-dark-text-secondary text-sm font-medium"
          />
          
          {/* Voice button */}
          <motion.button
            type="button"
            className="p-2 text-brown-primary/60 dark:text-dark-text-secondary hover:text-orange-primary dark:hover:text-orange-primary transition-colors rounded-lg hover:bg-orange-primary/10 dark:hover:bg-orange-primary/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Mic className="w-5 h-5" />
          </motion.button>
          
          {/* Emoji button */}
          <motion.button
            type="button"
            className="p-2 text-brown-primary/60 dark:text-dark-text-secondary hover:text-orange-primary dark:hover:text-orange-primary transition-colors rounded-lg hover:bg-orange-primary/10 dark:hover:bg-orange-primary/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Smile className="w-5 h-5" />
          </motion.button>
          
          {/* Send button */}
          <motion.button
            type="submit"
            disabled={!input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-orange-primary to-green-primary hover:from-orange-primary/90 hover:to-green-primary/90 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white-primary rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 flex items-center gap-2"
            whileHover={{ scale: input.trim() ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
          >
            {input.trim() ? (
              <>
                <Send className="w-4 h-4" />
                Gửi
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI
              </>
            )}
          </motion.button>
        </div>
        
        {/* Quick tips */}
        <motion.div 
          className="mt-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-brown-primary/50 dark:text-dark-text-secondary flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Bạn có thể hỏi về món ăn, quán ăn, hoặc chia sẻ cảm xúc của mình
          </p>
        </motion.div>
      </form>
    </div>
  );
};

export default ChatInput;