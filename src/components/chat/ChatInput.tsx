// components/ChatInput.js
import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

const ChatInput = ({ onSendMessage }: { onSendMessage: (text: string) => void }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="bg-white-primary/80 dark:bg-dark-card/80 border-t border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="p-4 md:p-6">
        <div className="flex items-center gap-3 bg-cream-primary/50 dark:bg-dark-bg/50 rounded-2xl p-3 border-2 border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-orange-primary focus-within:border-orange-primary transition-all duration-300 hover:border-orange-primary/50">
          {/* Attachment button */}
          <button
            type="button"
            className="p-2 text-brown-primary/60 dark:text-dark-text-secondary hover:text-orange-primary dark:hover:text-orange-primary transition-colors rounded-lg hover:bg-orange-primary/10"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          {/* Input field */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn của bạn..."
            className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-brown-primary dark:text-dark-text placeholder-brown-primary/50 dark:placeholder-dark-text-secondary text-sm font-medium"
          />
          
          {/* Emoji button */}
          <button
            type="button"
            className="p-2 text-brown-primary/60 dark:text-dark-text-secondary hover:text-orange-primary dark:hover:text-orange-primary transition-colors rounded-lg hover:bg-orange-primary/10"
          >
            <Smile className="w-5 h-5" />
          </button>
          
          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-orange-primary to-green-primary hover:from-orange-primary/90 hover:to-green-primary/90 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white-primary rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Gửi
          </button>
        </div>
        
        {/* Quick tips */}
        <div className="mt-3 text-center">
          <p className="text-xs text-brown-primary/50 dark:text-dark-text-secondary">
            💡 Bạn có thể hỏi về món ăn, quán ăn, hoặc chia sẻ cảm xúc của mình
          </p>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;