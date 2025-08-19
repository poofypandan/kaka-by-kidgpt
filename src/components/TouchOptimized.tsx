import { cn } from "@/lib/utils";

interface TouchOptimizedProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  touchTarget?: boolean;
  swipeEnabled?: boolean;
}

export function TouchOptimized({ 
  children, 
  className, 
  touchTarget = true,
  swipeEnabled = false,
  ...props 
}: TouchOptimizedProps) {
  return (
    <div
      className={cn(
        // Base mobile optimizations
        "touch-manipulation select-none",
        // Touch target size (minimum 48px)
        touchTarget && "min-h-[48px] min-w-[48px]",
        // Swipe gestures
        swipeEnabled && "overscroll-none",
        className
      )}
      style={{
        // Prevent iOS zoom on input focus
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        // Improve touch responsiveness
        touchAction: swipeEnabled ? 'pan-x pan-y' : 'manipulation',
      }}
      {...props}
    >
      {children}
    </div>
  );
}