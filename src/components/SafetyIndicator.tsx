import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SafetyIndicatorProps {
  score: number;
  filtered?: boolean;
  categories?: string[];
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  showTooltip?: boolean;
}

export default function SafetyIndicator({ 
  score, 
  filtered = false, 
  categories = [], 
  size = 'md',
  showScore = true,
  showTooltip = true
}: SafetyIndicatorProps) {
  
  const getSafetyLevel = (score: number) => {
    if (score >= 90) return { level: 'excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 80) return { level: 'good', color: 'text-green-500', bg: 'bg-green-50' };
    if (score >= 60) return { level: 'moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 40) return { level: 'concerning', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'dangerous', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getIcon = (score: number, filtered: boolean) => {
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    
    if (filtered) return <XCircle className={`${iconSize} text-red-500`} />;
    if (score >= 80) return <CheckCircle className={`${iconSize} text-green-500`} />;
    if (score >= 60) return <AlertTriangle className={`${iconSize} text-yellow-500`} />;
    return <XCircle className={`${iconSize} text-red-500`} />;
  };

  const safety = getSafetyLevel(score);

  const formatCategories = (categories: string[]) => {
    return categories
      .map(cat => cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))
      .join(', ');
  };

  const getTooltipContent = () => {
    if (filtered) {
      return (
        <div className="space-y-1">
          <p className="font-medium text-red-600">Content Filtered</p>
          <p className="text-sm">This message was blocked for safety.</p>
          {categories.length > 0 && (
            <p className="text-xs">Categories: {formatCategories(categories)}</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <p className="font-medium">Safety Score: {score}%</p>
        <p className="text-sm capitalize">{safety.level} safety level</p>
        {categories.length > 0 && (
          <p className="text-xs">Detected: {formatCategories(categories)}</p>
        )}
        <div className="text-xs text-muted-foreground mt-2">
          <p>• 90-100%: Excellent (Safe for all ages)</p>
          <p>• 80-89%: Good (Generally appropriate)</p>
          <p>• 60-79%: Moderate (Needs attention)</p>
          <p>• Below 60%: Concerning (Filtered or flagged)</p>
        </div>
      </div>
    );
  };

  const indicator = (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${safety.bg}`}>
      {getIcon(score, filtered)}
      {showScore && (
        <span className={`text-xs font-medium ${safety.color}`}>
          {filtered ? 'Filtered' : `${score}%`}
        </span>
      )}
      {filtered && (
        <Badge variant="destructive" className="text-xs">
          Blocked
        </Badge>
      )}
    </div>
  );

  if (!showTooltip) {
    return indicator;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {indicator}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}