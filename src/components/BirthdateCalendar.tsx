import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface BirthdateCalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  className?: string;
}

/**
 * Birthdate calendar with fast year/month selection.
 * - Uses DayPicker dropdown caption via our Calendar wrapper
 * - Limits years to current..current-20
 * - Default month = ~8y ago for convenience
 * - Disables future dates and pre-1900
 */
export function BirthdateCalendar({ selected, onSelect, className }: BirthdateCalendarProps) {
  const today = new Date();
  const currentYear = today.getFullYear();

  const defaultMonth = useMemo(() => {
    const y = currentYear - 8;
    return new Date(y, 5, 1); // June
  }, [currentYear]);

  return (
    <div className={cn("space-y-2", className)}>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        defaultMonth={selected ?? defaultMonth}
        captionLayout="dropdown"
        fromYear={currentYear - 20}
        toYear={currentYear}
        showOutsideDays={false}
        disabled={(date) => date > today || date < new Date("1900-01-01")}
        className="p-3 pointer-events-auto"
      />
    </div>
  );
}