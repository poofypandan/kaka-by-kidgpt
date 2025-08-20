import React from 'react';
import { FloatingKoala } from '@/components/KoalaCharacters';

interface FloatingEmotionalKakaProps {
  primaryAction?: 'companion' | 'encouragement' | 'safety-check' | 'learning-time' | 'help-available' | 'achievement-ready' | 'safety-alert' | 'celebration';
  childEngagement?: 'excited' | 'tired' | 'focused' | 'active' | 'happy' | 'learning';
  screenTime?: 'moderate' | 'high' | 'low';
  parentalSettings?: 'standard' | 'strict' | 'relaxed';
}

export const FloatingEmotionalKaka = ({ 
  primaryAction = 'companion', 
  childEngagement = 'active',
  screenTime = 'moderate',
  parentalSettings = 'standard'
}: FloatingEmotionalKakaProps) => {
  
  const triggerFloatingKakaAction = (action: string) => {
    // Handle floating Kaka interactions
    console.log('Kaka action triggered:', action);
  };

  const getActionMessage = () => {
    switch (primaryAction) {
      case 'companion': return 'Kaka di sini kalau butuh bantuan!';
      case 'encouragement': return 'Kamu hebat! Terus semangat!';
      case 'safety-check': return 'Kaka pastikan kamu aman!';
      case 'learning-time': return 'Yuk belajar bareng Kaka!';
      default: return 'Ada yang bisa Kaka bantu?';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      
      {/* Main floating Kaka with breathing life */}
      <div className="relative pointer-events-auto">
        <div className="animate-[gentle-float_6s_ease-in-out_infinite]">
          
          {/* Contextual Kaka poses */}
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-400 flex items-center justify-center shadow-2xl transition-all duration-500 cursor-pointer hover:scale-110 hover:shadow-yellow-300/50 ${
            primaryAction === 'encouragement' ? 'animate-[celebration-bounce_2s_ease-out_infinite]' :
            primaryAction === 'safety-check' ? 'animate-[protective-pulse_3s_ease-in-out_infinite]' :
            primaryAction === 'learning-time' ? 'animate-[knowledge-glow_4s_ease-in-out_infinite]' :
            'animate-[friendly-presence_8s_ease-in-out_infinite]'
          }`}>
            
            {/* Emotional Kaka character */}
            <div className="relative text-2xl animate-[micro-expressions_5s_ease-in-out_infinite]">
              <FloatingKoala className="w-12 h-12" />
              
              {/* Dynamic expression overlay */}
              <div className="absolute inset-0 transition-opacity duration-1000">
                {childEngagement === 'excited' && (
                  <div className="animate-[sparkle-eyes_2s_ease-out_infinite]">✨</div>
                )}
                {childEngagement === 'tired' && (
                  <div className="animate-[caring-concern_3s_ease-in-out_infinite] opacity-70">😌</div>
                )}
                {childEngagement === 'focused' && (
                  <div className="animate-[proud-approval_4s_ease-in-out_infinite]">📚</div>
                )}
              </div>
            </div>
            
          </div>
          
          {/* Contextual action indicators */}
          <div className="absolute -top-2 -right-2 transition-all duration-500">
            {primaryAction === 'help-available' && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-[help-pulse_2s_ease-in-out_infinite]">
                <div className="text-white text-xs">?</div>
              </div>
            )}
            
            {primaryAction === 'achievement-ready' && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-[achievement-sparkle_1.5s_ease-out_infinite]">
                <div className="text-white text-xs">🏆</div>
              </div>
            )}
            
            {primaryAction === 'safety-alert' && (
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-[safety-attention_1s_ease-in-out_infinite]">
                <div className="text-white text-xs">🛡️</div>
              </div>
            )}
          </div>
          
          {/* Emotional aura system */}
          <div className="absolute inset-0 rounded-full -z-10 transition-all duration-2000">
            <div className={`absolute inset-0 rounded-full blur-lg opacity-30 ${
              childEngagement === 'happy' ? 'bg-yellow-300 animate-[joy-aura_4s_ease-in-out_infinite]' :
              childEngagement === 'learning' ? 'bg-blue-300 animate-[focus-aura_6s_ease-in-out_infinite]' :
              childEngagement === 'tired' ? 'bg-purple-300 animate-[rest-aura_8s_ease-in-out_infinite]' :
              'bg-green-300 animate-[calm-aura_10s_ease-in-out_infinite]'
            }`}></div>
          </div>
          
        </div>
        
        {/* Interactive speech bubble */}
        <div className="absolute -top-12 -left-20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-white rounded-lg shadow-lg p-3 text-sm text-gray-700 whitespace-nowrap border-2 border-yellow-200">
            <div className="animate-[gentle-appear_0.5s_ease-out]">
              {getActionMessage()}
            </div>
            {/* Speech bubble tail */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
          </div>
        </div>
        
        {/* Micro-interaction zones */}
        <div className="absolute inset-0 rounded-full hover:bg-yellow-200/20 transition-colors duration-300 cursor-pointer"
             onClick={() => triggerFloatingKakaAction(primaryAction)}>
          {/* Invisible interaction enhancer */}
        </div>
        
      </div>
      
      {/* Particle effects for special moments */}
      {primaryAction === 'celebration' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-[confetti-burst_3s_ease-out]">
            {Array.from({length: 12}).map((_, i) => (
              <div key={i} 
                   className={`absolute w-2 h-2 rounded-full animate-[particle-float_3s_ease-out] ${
                     i % 4 === 0 ? 'bg-yellow-400' :
                     i % 4 === 1 ? 'bg-orange-400' :
                     i % 4 === 2 ? 'bg-red-400' :
                     'bg-pink-400'
                   }`}
                   style={{
                     left: `${Math.random() * 100}%`,
                     top: `${Math.random() * 100}%`,
                     animationDelay: `${Math.random() * 2}s`
                   }}>
              </div>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};