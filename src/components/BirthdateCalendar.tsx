"use client";

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
 * - Default month ≈ 8 years ago
 * - Disables future dates and pre-1900
 */
export function BirthdateCalendar({ selected, onSelect, className }: BirthdateCalendarProps) {
  const today = new Date();
  const currentYear = today.getUTCFullYear();

  const defaultMonth = useMemo(() => {
    // Start ~8 years back (June) for convenience
    return new Date(Date.UTC(currentYear - 8, 5, 1));
  }, [currentYear]);

  // Disable future dates and anything before 1900-01-01 UTC
  const minDate = useMemo(() => new Date(Date.UTC(1900, 0, 1)), []);
  const isDisabled = (date: Date) => date.getTime() > today.getTime() || date.getTime() < minDate.getTime();

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
        disabled={isDisabled}
        className="p-3 pointer-events-auto"
      />
    </div>
  );
}