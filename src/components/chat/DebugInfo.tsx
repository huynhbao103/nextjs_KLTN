import React, { useState } from 'react';
import { Bug, X, ChevronDown, ChevronUp } from 'lucide-react';

interface DebugInfoProps {
  sessionId?: string | null;
  intent?: string;
  lastError?: string;
  isVisible?: boolean;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ 
  sessionId, 
  intent, 
  lastError, 
  isVisible = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white-primary dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-orange-primary" />
            <span className="text-sm font-medium text-brown-primary dark:text-dark-text">
              Debug Info
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-brown-primary/60 hover:text-brown-primary dark:text-dark-text-secondary dark:hover:text-dark-text"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-brown-primary/60 dark:text-dark-text-secondary">Session ID:</span>
            <span className="text-brown-primary dark:text-dark-text font-mono">
              {sessionId ? `${sessionId.substring(0, 8)}...` : 'null'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-brown-primary/60 dark:text-dark-text-secondary">Intent:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              intent === 'dislike' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
              intent === 'like' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
              intent === 'select' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
              intent === 'question' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' :
              'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
            }`}>
              {intent || 'none'}
            </span>
          </div>

          {lastError && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <div className="text-red-700 dark:text-red-400 font-medium mb-1">Last Error:</div>
              <div className="text-red-600 dark:text-red-300 text-xs break-words">
                {lastError}
              </div>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-brown-primary/60 dark:text-dark-text-secondary">
              <div className="mb-2">
                <strong>Backend Endpoints:</strong>
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div>• /api/langgraph/classify-intent</div>
                <div>• /api/langgraph/process</div>
                <div>• /api/langgraph/process-with-session</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugInfo; 