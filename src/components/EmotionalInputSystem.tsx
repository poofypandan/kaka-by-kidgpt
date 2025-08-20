import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Send } from 'lucide-react';

interface EmotionalInputSystemProps {
  onInputChange: (value: string) => void;
  onSendMessage: (message: string) => void;
  childMood?: 'excited' | 'curious' | 'sad' | 'neutral';
  isVoiceMode?: boolean;
  kakaEncouragement?: boolean;
  onVoiceInput?: () => void;
  isRecording?: boolean;
}

export const EmotionalInputSystem = ({ 
  onInputChange, 
  onSendMessage,
  childMood = 'neutral', 
  isVoiceMode = false,
  kakaEncouragement = true,
  onVoiceInput,
  isRecording = false
}: EmotionalInputSystemProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emotionalContext, setEmotionalContext] = useState('neutral');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsTyping(value.length > 0);
    onInputChange(value);
    
    // Detect emotional context from input
    const text = value.toLowerCase();
    if (text.includes('sedih') || text.includes('marah')) {
      setEmotionalContext('support-needed');
    } else if (text.includes('senang') || text.includes('!')) {
      setEmotionalContext('excitement');
    } else if (text.includes('?')) {
      setEmotionalContext('curious');
    } else {
      setEmotionalContext('neutral');
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
      setIsTyping(false);
      setEmotionalContext('neutral');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getEncouragementMessage = () => {
    switch (emotionalContext) {
      case 'support-needed': return 'Kaka siap dengar kamu...';
      case 'excitement': return 'Wah, kamu semangat!';
      case 'curious': return 'Pertanyaan bagus!';
      default: return 'Kaka tunggu cerita kamu...';
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-white via-yellow-50 to-white border-t-2 border-yellow-200/50">
      
      {/* Emotional input container */}
      <div className="relative">
        
        {/* Dynamic background based on mood */}
        <div className={`absolute inset-0 rounded-2xl transition-all duration-1000 ${
          childMood === 'excited' ? 'bg-gradient-to-r from-orange-100 to-yellow-100 animate-[excitement-glow_3s_ease-in-out_infinite]' :
          childMood === 'curious' ? 'bg-gradient-to-r from-blue-100 to-purple-100 animate-[curiosity-shimmer_4s_ease-in-out_infinite]' :
          childMood === 'sad' ? 'bg-gradient-to-r from-purple-100 to-indigo-100 animate-[rest-pulse_6s_ease-in-out_infinite]' :
          'bg-gradient-to-r from-green-100 to-emerald-100 animate-[calm-breathe_8s_ease-in-out_infinite]'
        }`}></div>
        
        {/* Input field with emotional responsiveness */}
        <div className="relative flex items-center space-x-3 p-3">
          
          {/* Voice input with visual feedback */}
          {onVoiceInput && (
            <div className="relative">
              <button 
                onClick={onVoiceInput}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 ${
                  isRecording 
                    ? 'bg-gradient-to-br from-red-400 to-red-500 animate-[voice-pulse_2s_ease-in-out_infinite]' 
                    : 'bg-gradient-to-br from-blue-400 to-blue-500 hover:scale-105'
                }`}>
                <Mic className="w-5 h-5" />
              </button>
              
              {/* Voice activity visualization */}
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-red-300/30 animate-[voice-activity_1s_ease-in-out_infinite]"></div>
              )}
              
              {/* Kaka listening indicator */}
              {isRecording && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white rounded-lg px-2 py-1 text-xs text-gray-600 whitespace-nowrap border border-red-200 animate-[listening-prompt_2s_ease-in-out_infinite]">
                    Kaka dengar kamu! 👂
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Text input with emotional enhancement */}
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Tulis pesan untuk Kaka..."
              className={`w-full h-12 rounded-xl border-2 transition-all duration-500 focus:ring-2 focus:ring-yellow-300 ${
                emotionalContext === 'support-needed' ? 'border-blue-300 bg-blue-50/50 focus:border-blue-400' :
                emotionalContext === 'excitement' ? 'border-orange-300 bg-orange-50/50 focus:border-orange-400' :
                emotionalContext === 'curious' ? 'border-purple-300 bg-purple-50/50 focus:border-purple-400' :
                'border-yellow-300 bg-white focus:border-yellow-400'
              }`}
              disabled={isRecording}
            />
            
            {/* Typing encouragement from Kaka */}
            {isTyping && kakaEncouragement && (
              <div className="absolute -top-12 left-4 animate-[encouraging-appear_0.5s_ease-out]">
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-1 text-sm text-yellow-800 flex items-center space-x-2">
                  <div className="w-4 h-4 flex items-center justify-center animate-[mini-nod_2s_ease-in-out_infinite]">🐨</div>
                  <span>{getEncouragementMessage()}</span>
                </div>
              </div>
            )}
            
            {/* Emotional input suggestions */}
            {inputValue.length === 0 && !isRecording && (
              <div className="absolute top-full left-0 mt-2 flex space-x-2 opacity-60">
                {['😊', '🤔', '😮', '💪', '📚'].map((emoji, index) => (
                  <button key={index}
                          onClick={() => {
                            const newValue = inputValue + emoji;
                            setInputValue(newValue);
                            onInputChange(newValue);
                            setIsTyping(true);
                          }}
                          className="w-8 h-8 rounded-full bg-white border border-yellow-200 flex items-center justify-center hover:bg-yellow-50 hover:scale-110 transition-all duration-300"
                          style={{ animationDelay: `${index * 200}ms` }}>
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            
          </div>
          
          {/* Send button with emotional feedback */}
          <Button 
            onClick={handleSendMessage}
            disabled={inputValue.trim().length === 0}
            className={`w-12 h-12 rounded-xl transition-all duration-300 ${
              inputValue.trim().length > 0 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 scale-100 animate-[ready-to-send_2s_ease-in-out_infinite]' 
                : 'bg-gray-200 scale-95'
            }`}>
            <Send className={`w-5 h-5 transition-transform duration-300 ${
              inputValue.trim().length > 0 ? 'text-white translate-x-0' : 'text-gray-400 -translate-x-1'
            }`} />
          </Button>
          
        </div>
        
        {/* Emotional context indicator */}
        <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
          emotionalContext !== 'neutral' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            emotionalContext === 'support-needed' ? 'bg-blue-400 animate-[support-pulse_2s_ease-in-out_infinite]' :
            emotionalContext === 'excitement' ? 'bg-orange-400 animate-[excitement-burst_1s_ease-out_infinite]' :
            emotionalContext === 'curious' ? 'bg-purple-400 animate-[curiosity-twinkle_3s_ease-in-out_infinite]' :
            'bg-green-400'
          }`}></div>
        </div>
        
      </div>
      
    </div>
  );
};