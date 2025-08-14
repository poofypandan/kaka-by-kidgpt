import { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface BirthdateCalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  className?: string;
}

/**
 * Stable calendar:
 * - Uses DayPicker's built-in year/month dropdowns.
 * - Limits years to current..current-20 (tweakable).
 * - Default month = 8 years ago (reasonable for SD).
 * - Disables future dates and anything before 1900-01-01.
 */
export function BirthdateCalendar({ selected, onSelect, className }: BirthdateCalendarProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const defaultMonth = useMemo(() => {
    const y = currentYear - 8; // start ~8y ago for convenience
    // June (5) so parents can quickly pick around mid-year
    return new Date(y, 5, 1);
  }, [currentYear]);

  return (
    <div className={cn('space-y-2', className)}>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        defaultMonth={selected ?? defaultMonth}
        /** DayPicker props forwarded by our Calendar wrapper */
        captionLayout="dropdown-buttons"
        fromYear={currentYear - 20}
        toYear={currentYear}
        showOutsideDays={false}
        disabled={(date) => date > today || date < new Date('1900-01-01')}
        className="p-3 pointer-events-auto"
      />
    </div>
  );
}