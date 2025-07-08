// app/page.js (hoặc pages/index.js nếu dùng Pages Router)
'use client'; // Chỉ định đây là Client Component nếu dùng App Router

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from '@/components/chat/ChatWindow';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import ChatSidebar from '@/components/chat/ChatSidebar';
import QuickQuestions from '@/components/chat/QuickQuestions';
import AIStatus from '@/components/chat/AIStatus';
import Header from '@/components/header/page';
import { useAI } from '@/hooks/useAI';
import { Sparkles } from 'lucide-react';
import axios from 'axios';
import PreferenceModal from '@/components/chat/PreferenceModal';

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



// Hàm xác định buổi trong ngày theo giờ local (nếu muốn dùng)
function getTimeOfDay(): 'sáng' | 'trưa' | 'chiều' | 'tối' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'sáng';
  if (hour >= 11 && hour < 14) return 'trưa';
  if (hour >= 14 && hour < 18) return 'chiều';
  return 'tối';
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { sendMessage, isLoading: aiLoading, error: aiError, clearError } = useAI();
  
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay? 😊", isUser: false, timestamp: new Date().toISOString() },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // State for unified modal
  const [preferencePrompt, setPreferencePrompt] = useState<null | {
    emotionPrompt?: { prompt: string; emotions: string[] };
    cookingMethodPrompt?: { prompt: string; methods: string[] };
  }>();
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);

  // Thêm lại state sessionId
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
  }, [status, router]);

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

  // Auto-save chat when messages change (with debounce)
  useEffect(() => {
    if (!autoSave || messages.length <= 1) return; // Không lưu nếu chỉ có tin nhắn chào mừng

    // Clear previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      saveChatToDatabase(messages);
    }, 2000); // Lưu sau 2 giây không có thay đổi

    setSaveTimeout(timeout);

    // Cleanup timeout on unmount
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [messages, autoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  // Debug cookingMethodPrompt
  useEffect(() => {
    if (preferencePrompt?.cookingMethodPrompt) {
      console.log('cookingMethodPrompt:', preferencePrompt.cookingMethodPrompt);
    }
  }, [preferencePrompt]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream-primary dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-primary border-t-transparent mx-auto mb-6"></div>
          <p className="text-brown-primary dark:text-dark-text text-lg font-medium">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Don't render the page if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  // Replace old multi-turn logic with unified modal logic
  const sendFirstQuestion = async (question: string) => {
    setPreferencePrompt(null);
    setShowPreferenceModal(false);
    setSessionId(null);
    setSelectedEmotion('');
    setSelectedMethods([]);

    try {
      const response = await fetch('/api/ai/langgraph/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, session_id: sessionId }),
      });
      const data = await response.json();
      // Nếu backend trả về prompt cảm xúc hoặc phương pháp nấu
      if (data.backendData?.emotion_prompt || data.backendData?.cooking_method_prompt) {
        setPreferencePrompt({
          emotionPrompt: data.backendData?.emotion_prompt,
          cookingMethodPrompt: data.backendData?.cooking_method_prompt,
        });
        setSessionId(data.backendData.session_id);
        setShowPreferenceModal(true);
        return;
      }
      // Nếu không, trả về kết quả luôn
      const aiResponse = data.response || data.backendData?.result || data.backendData;
      let responseText;
      if (typeof aiResponse === 'string') {
        responseText = aiResponse;
      } else if (aiResponse && typeof aiResponse.message === 'string') {
        responseText = aiResponse.message;
      } else if (aiResponse) {
        responseText = JSON.stringify(aiResponse, null, 2);
      } else {
        responseText = 'Không nhận được phản hồi.';
      }
      const newAiMessage = {
        id: Date.now(),
        text: responseText,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newAiMessage]);
      setShowPreferenceModal(false);
    } catch (error) {
      console.error('Error sending first question:', error);
      const newAiMessage = {
        id: Date.now(),
        text: 'Có lỗi xảy ra khi gửi câu hỏi. Vui lòng thử lại.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newAiMessage]);
      setShowPreferenceModal(false);
    }
  };

  const handlePreferenceConfirm = async (emotion: string, methods: string[]) => {
    if (!sessionId) return;
    setShowPreferenceModal(false);
    setSelectedEmotion(emotion);
    setSelectedMethods(methods);
    try {
      // Gửi cảm xúc trước (nếu có prompt cảm xúc)
      if (preferencePrompt?.emotionPrompt) {
        const res = await fetch('/api/ai/langgraph/process-emotion-cooking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emotion, session_id: sessionId, cooking_methods: methods }),
        });
    

        const data = await res.json();
        const aiResponse = data.result || data;
        let responseText;
        if (typeof aiResponse === 'string') {
          responseText = aiResponse;
        } else if (aiResponse && typeof aiResponse.message === 'string') {
          responseText = aiResponse.message;
        } else if (aiResponse) {
          responseText = JSON.stringify(aiResponse, null, 2);
        } else {
          responseText = 'Không nhận được phản hồi.';
        }
        const newAiMessage = {
          id: Date.now(),
          text: responseText,
          isUser: false,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, newAiMessage]);
      }
    } catch (error) {
      console.error('Error sending preferences:', error);
      const newAiMessage = {
        id: Date.now(),
        text: 'Có lỗi xảy ra khi gửi thông tin cá nhân. Vui lòng thử lại.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newAiMessage]);
    }
  };

  const saveChatToDatabase = async (chatMessages: any[]) => {
    if (!session?.user?.email) {
      console.log('No session, skipping save');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Saving chat with messages:', chatMessages.length, 'messages');
      console.log('Current chat ID:', currentChatId);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: currentChatId,
          messages: chatMessages,
          title: chatMessages.length > 1 ? chatMessages[1]?.text?.substring(0, 50) + '...' : 'Cuộc trò chuyện mới'
        }),
      });

      console.log('Save chat response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Save chat response data:', data);
        if (!currentChatId && data.chat?._id) {
          setCurrentChatId(data.chat._id);
          console.log('New chat ID set:', data.chat._id);
        }
        setLastSaved(new Date());
        console.log('✅ Chat saved successfully');
      } else {
        const errorData = await response.json();
        console.error('❌ Save chat error:', errorData);
      }
    } catch (error) {
      console.error('❌ Error saving chat:', error);
    } finally {
      setIsSaving(false);
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
      { id: 1, text: "Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn hôm nay? 😊", isUser: false, timestamp: new Date().toISOString() },
    ]);
    setShowQuickQuestions(true);
    setSidebarOpen(false);
  };

  // Sửa lại handleSendMessage (bị xóa nhầm do refactor)
  const handleSendMessage = async (text: string) => {
    setShowQuickQuestions(false);
    const newUserMessage = {
      id: Date.now(),
      text: text,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);
    await sendFirstQuestion(text);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-cream-primary dark:bg-dark-bg">
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
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 bg-white-primary/80 dark:bg-dark-card/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-brown-primary dark:text-dark-text hover:text-orange-primary dark:hover:text-orange-primary transition-colors rounded-lg hover:bg-orange-primary/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-primary to-green-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-brown-primary dark:text-dark-text">TastyMind</h1>
                <p className="text-sm text-brown-primary/70 dark:text-dark-text-secondary">Sẵn sàng hỗ trợ bạn</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => saveChatToDatabase(messages)}
              disabled={isSaving || messages.length <= 1}
              className="px-3 py-1 text-xs bg-orange-primary text-white-primary rounded-lg hover:bg-orange-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu chat'}
            </button> */}
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Online</span>
            {isSaving && (
              <div className="flex items-center gap-1 text-orange-primary">
                <div className="w-3 h-3 border-2 border-orange-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Đang lưu...</span>
              </div>
            )}
            {lastSaved && !isSaving && (
              <div className="flex items-center gap-1 text-brown-primary/60 dark:text-dark-text-secondary">
                <span className="text-xs">Đã lưu {lastSaved.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Chat window */}
        <div className="flex-1 bg-gradient-to-b from-white-primary/50 to-cream-primary/30 dark:from-dark-card/50 dark:to-dark-bg/30">
          <ChatWindow>
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MessageBubble message={msg.text} isUser={msg.isUser} />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
              >
                <div className="flex flex-row items-end gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-primary to-green-primary text-white-primary shadow-lg flex items-center justify-center text-sm font-bold">
                    AI
                  </div>
                  <div className="px-6 py-4 rounded-2xl bg-white-primary dark:bg-dark-card border border-gray-200 dark:border-gray-700 shadow-lg max-w-sm">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-orange-primary rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-orange-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-3 bg-orange-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <QuickQuestions 
              onSelectQuestion={handleQuickQuestion} 
              isVisible={showQuickQuestions && messages.length === 1} 
            />
          </ChatWindow>
        </div>

        {/* Chat input */}
        <div className='bg-white-primary/80 dark:bg-dark-card/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700'>
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>

      {/* AI Status */}
      <AIStatus 
        isLoading={aiLoading} 
        error={aiError} 
        onClearError={clearError} 
      />

      {/* Modals */}
      <AnimatePresence>
        {showPreferenceModal && preferencePrompt && (
          <PreferenceModal
            open={showPreferenceModal}
            emotions={preferencePrompt.emotionPrompt?.emotions || [
              'Vui vẻ', 'Buồn bã', 'Bình thường', 'Tức giận', 'Mệt mỏi', 'Hạnh phúc', 'Trầm cảm']}
            methods={preferencePrompt.cookingMethodPrompt?.methods || [
              'Gỏi', 'Luộc', 'Súp', 'Nướng', 'Hấp', 'Chiên', 'Xào']}
            onConfirm={handlePreferenceConfirm}
            onCancel={() => setShowPreferenceModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}