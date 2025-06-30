// app/page.js (hoặc pages/index.js nếu dùng Pages Router)
'use client'; // Chỉ định đây là Client Component nếu dùng App Router

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/chat/ChatWindow';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import ChatSidebar from '@/components/chat/ChatSidebar';
import QuickQuestions from '@/components/chat/QuickQuestions';
import AIStatus from '@/components/chat/AIStatus';
import Header from '@/components/header/page';
import { useAI } from '@/hooks/useAI';

interface ChatHistoryItem {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: number;
    text: string;
    isUser: boolean;
    timestamp: string;
  }>;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { sendMessage, isLoading: aiLoading, error: aiError, clearError } = useAI();
  
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn hôm nay? 😊", isUser: false },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Don't render the page if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  const handleSendMessage = async (text: string) => {
    // Hide quick questions after first message
    setShowQuickQuestions(false);
    
    // Add user message
    const newUserMessage = { id: messages.length + 1, text, isUser: true };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    // Show typing indicator
    setIsTyping(true);

    try {
      console.log('Sending message to AI:', text);
      // Gọi AI thực tế
      const aiResponse = await sendMessage(text);
      console.log('AI Response received:', aiResponse);
      
      setIsTyping(false);
      
      const aiMessage = {
        id: messages.length + 2,
        text: aiResponse,
        isUser: false,
      };
      
      console.log('AI Message object:', aiMessage);
      
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      // Save to database if user is logged in
      if (session?.user?.email && autoSave) {
        console.log('Saving chat to database...');
        await saveChatToDatabase(finalMessages);
        console.log('Chat saved successfully');
      }
    } catch (error) {
      setIsTyping(false);
      console.error('Error getting AI response:', error);
      
      // Fallback response
      const fallbackMessage = {
        id: messages.length + 2,
        text: "Xin lỗi, tôi gặp một số vấn đề kỹ thuật. Vui lòng thử lại sau hoặc kiểm tra kết nối mạng của bạn.",
        isUser: false,
      };
      
      const finalMessages = [...updatedMessages, fallbackMessage];
      setMessages(finalMessages);
      
      if (session?.user?.email && autoSave) {
        await saveChatToDatabase(finalMessages);
      }
    }
  };

  const saveChatToDatabase = async (chatMessages: any[]) => {
    try {
      console.log('Saving chat with messages:', chatMessages);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: currentChatId,
          messages: chatMessages,
        }),
      });

      console.log('Save chat response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Save chat response data:', data);
        if (!currentChatId) {
          setCurrentChatId(data.chat._id);
          console.log('New chat ID set:', data.chat._id);
        }
      } else {
        const errorData = await response.json();
        console.error('Save chat error:', errorData);
      }
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleSelectChat = (chat: ChatHistoryItem) => {
    setCurrentChatId(chat._id);
    setMessages(chat.messages);
    setShowQuickQuestions(false);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setCurrentChatId(undefined);
    setMessages([
      { id: 1, text: "Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn hôm nay? 😊", isUser: false },
    ]);
    setShowQuickQuestions(true);
    setSidebarOpen(false);
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    const chatContainer = document.querySelector('.overflow-y-auto');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  // Show error notification if AI error occurs
  useEffect(() => {
    if (aiError) {
      console.error('AI Error:', aiError);
    }
  }, [aiError]);

  return (
    <div className="flex flex-col h-screen font-sans bg-dark dark:bg-dark">
      {/* Header */}
      <Header />
      
      {/* Sidebar - Fixed */}
      <ChatSidebar
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        currentChatId={currentChatId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area - with margin for fixed sidebar */}
      <div className="flex-1 flex flex-col lg:ml-80">
        {/* Chat header with menu button */}
        <div className="flex items-center p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Chat window */}
        <ChatWindow>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg.text} isUser={msg.isUser} />
          ))}
          {isTyping && (
            <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <div className="flex flex-row items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-300 shadow-md flex items-center justify-center text-sm font-medium">
                  AI
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <QuickQuestions 
            onSelectQuestion={handleQuickQuestion} 
            isVisible={showQuickQuestions && messages.length === 1} 
          />
        </ChatWindow>

        {/* Chat input */}
        <div className='bg-dark dark:bg-dark'>
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>

      {/* AI Status */}
      <AIStatus 
        isLoading={aiLoading} 
        error={aiError} 
        onClearError={clearError} 
      />
    </div>
  );
}