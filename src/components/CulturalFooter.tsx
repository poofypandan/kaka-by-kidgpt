import { Heart, Star, Sparkles } from 'lucide-react';

interface CulturalFooterProps {
  message?: string;
  icons?: string[];
}

export default function CulturalFooter({ 
  message = "Belajar budaya Indonesia dengan gembira",
  icons = ["🇮🇩", "🏛️", "🎭", "🎪", "🎨", "📚", "🌟"]
}: CulturalFooterProps) {
  return (
    <div className="text-center py-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl">
      {/* Cultural icons */}
      <div className="flex justify-center items-center space-x-4 text-3xl mb-4 animate-bounce-gentle">
        {icons.map((icon, index) => (
          <span 
            key={index} 
            className="transform transition-transform hover:scale-125"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {icon}
          </span>
        ))}
      </div>
      
      {/* Message */}
      <div className="flex justify-center items-center gap-2 mb-2">
        <Star className="h-5 w-5 text-yellow-500" />
        <h3 className="text-xl font-bold text-gray-800">{message}</h3>
        <Star className="h-5 w-5 text-yellow-500" />
      </div>
      
      {/* Sub-message */}
      <div className="flex justify-center items-center gap-2 text-gray-600">
        <Heart className="h-4 w-4 text-red-500" />
        <p>Mengenal keragaman dan kekayaan Nusantara</p>
        <Sparkles className="h-4 w-4 text-purple-500" />
      </div>

      {/* Decorative border */}
      <div className="mt-4 mx-auto w-32 h-1 bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 rounded-full"></div>
    </div>
  );
}