import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal lahir",
  disabled = false,
  className
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Calculate reasonable date range for children (3-18 years old)
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, "dd MMMM yyyy", { locale: id })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setIsOpen(false);
          }}
          disabled={(date) =>
            date > maxDate || date < minDate
          }
          initialFocus
          captionLayout="dropdown-buttons"
          fromYear={minDate.getFullYear()}
          toYear={maxDate.getFullYear()}
        />
      </PopoverContent>
    </Popover>
  );
}