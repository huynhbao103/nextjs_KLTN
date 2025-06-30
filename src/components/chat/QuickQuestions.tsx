import React from 'react';

interface QuickQuestion {
  id: number;
  text: string;
  icon: string;
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
      icon: "🍜"
    },
    {
      id: 2,
      text: "Tôi đang bị đau bụng, gợi ý món ăn phù hợp?",
      icon: "🍲"
    },
    {
      id: 3,
      text: "Có món ăn chay nào phù hợp với tôi không",
      icon: "🍟"
    },
    {
      id: 4,
      text: "Món chay nào dễ làm tại nhà?",
      icon: "🥦"
    },
    {
      id: 5,
      text: "Có món ăn nào phù hợp với tôi không?",
      icon: "☕"
    },
    {
      id: 6,
      text: "Có món tráng miệng không?",
      icon: "🍹"
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Hoặc chọn một câu hỏi nhanh về món ăn:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {quickQuestions.map((question) => (
          <button
            key={question.id}
            onClick={() => onSelectQuestion(question.text)}
            className="group p-3 text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                {question.icon}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                {question.text}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickQuestions;