import React from 'react';
import { WavingKoala } from '@/components/KoalaCharacters';

interface EmotionalTypingIndicatorProps {
  childMood?: 'excited' | 'sad' | 'curious' | 'neutral';
  conversationHistory?: string[];
  timeWaiting?: number;
}

export const EmotionalTypingIndicator = ({ 
  childMood = 'neutral', 
  conversationHistory = [], 
  timeWaiting = 0 
}: EmotionalTypingIndicatorProps) => {
  const getWaitingMessage = () => {
    if (timeWaiting < 2000) return 'Kaka sedang berpikir...';
    if (timeWaiting < 5000) return 'Kaka mau kasih jawaban yang baik...';
    return 'Kaka sedang siapkan sesuatu yang spesial...';
  };

  const getContextIcon = () => {
    const history = conversationHistory.join(' ').toLowerCase();
    if (history.includes('homework') || history.includes('belajar')) return '📚';
    if (history.includes('game') || history.includes('main')) return '🎮';
    if (history.includes('story') || history.includes('cerita')) return '📖';
    if (history.includes('safety') || history.includes('aman')) return '🛡️';
    return null;
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3">
        
        {/* Kaka avatar with contextual thinking animation */}
        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center border-2 border-yellow-600 shadow-lg">
          
          {/* Thinking pose with micro-expressions */}
          <div className="animate-[thinking-process_3s_ease-in-out_infinite]">
            <div className="relative">
              {/* Eyes moving as if reading/thinking */}
              <div className="animate-[eye-scan_2s_ease-in-out_infinite]">
                <WavingKoala className="w-8 h-8" />
              </div>
              
              {/* Thought process indicator */}
              <div className="absolute -top-6 -right-2 animate-[thought-bubble_4s_ease-in-out_infinite]">
                <div className="w-4 h-4 bg-white rounded-full opacity-80 flex items-center justify-center text-xs">
                  💭
                </div>
              </div>
            </div>
          </div>
          
          {/* Processing emotion indicator */}
          <div className="absolute inset-0 rounded-full transition-all duration-1000">
            <div className={`absolute inset-0 rounded-full animate-[processing-glow_2s_ease-in-out_infinite] ${
              childMood === 'excited' ? 'bg-orange-300/30' :
              childMood === 'sad' ? 'bg-blue-300/30' :
              childMood === 'curious' ? 'bg-purple-300/30' :
              'bg-green-300/20'
            }`}></div>
          </div>
          
        </div>
        
        {/* Emotional typing bubble */}
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-4 rounded-2xl shadow-lg max-w-xs">
          
          {/* Contextual typing messages */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm opacity-90">
              {getWaitingMessage()}
            </span>
          </div>
          
          {/* Animated typing dots with personality */}
          <div className="flex space-x-1 items-center">
            <div className="flex space-x-1">
              {/* Breathing dots instead of mechanical bouncing */}
              <div className="w-2 h-2 bg-white rounded-full animate-[breath-dot_1.8s_ease-in-out_infinite]"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-[breath-dot_1.8s_ease-in-out_infinite] animate-delay-600"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-[breath-dot_1.8s_ease-in-out_infinite] animate-delay-1200"></div>
            </div>
            
            {/* Emotional context indicator */}
            {getContextIcon() && (
              <div className="ml-3 animate-[context-pulse_3s_ease-in-out_infinite]">
                {getContextIcon()}
              </div>
            )}
          </div>
          
          {/* Anticipation builder */}
          {timeWaiting > 3000 && (
            <div className="mt-2 text-xs opacity-75 animate-[anticipation-build_2s_ease-in-out]">
              <div className="flex items-center space-x-1">
                <span>Kaka punya ide bagus!</span>
                <div className="animate-[excitement-sparkle_1s_ease-out_infinite]">✨</div>
              </div>
            </div>
          )}
          
        </div>
        
      </div>
    </div>
  );
};