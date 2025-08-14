import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BirthdateCalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  className?: string;
}

export function BirthdateCalendar({ selected, onSelect, className }: BirthdateCalendarProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  // Default to 8 years ago for a reasonable starting point for children
  const defaultYear = currentYear - 8;
  const defaultMonth = 5; // June (0-indexed)
  
  const [displayMonth, setDisplayMonth] = useState(
    selected ? selected.getMonth() : defaultMonth
  );
  const [displayYear, setDisplayYear] = useState(
    selected ? selected.getFullYear() : defaultYear
  );

  // Generate year options (from 20 years ago to current year)
  const yearOptions = [];
  for (let year = currentYear; year >= currentYear - 20; year--) {
    yearOptions.push(year);
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handleYearChange = (year: string) => {
    setDisplayYear(parseInt(year));
  };

  const handleMonthChange = (month: string) => {
    setDisplayMonth(parseInt(month));
  };

  const handlePreviousMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const displayDate = new Date(displayYear, displayMonth, 1);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Year and Month selectors */}
      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <Select value={displayYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-20 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={displayMonth.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={displayDate}
        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
        className={cn("p-3 pointer-events-auto")}
        // Disable the default navigation since we handle it above
        showOutsideDays={false}
        fixedWeeks
      />
    </div>
  );
}