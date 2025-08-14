import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface IndonesianCardProps {
  children: ReactNode;
  className?: string;
  pattern?: 'batik' | 'weaving' | 'solid';
  culturalIcon?: string;
}

export default function IndonesianCard({ 
  children, 
  className = "", 
  pattern = 'solid',
  culturalIcon 
}: IndonesianCardProps) {
  const getPatternClass = () => {
    switch (pattern) {
      case 'batik':
        return 'bg-batik-pattern';
      case 'weaving':
        return 'bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <Card className={`${getPatternClass()} border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${className}`}>
      {culturalIcon && (
        <div className="absolute top-2 right-2 text-2xl opacity-20">
          {culturalIcon}
        </div>
      )}
      {children}
    </Card>
  );
}