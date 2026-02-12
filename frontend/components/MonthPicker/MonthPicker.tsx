import { CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { MonthPicker } from "../ui/monthpicker";
import { cn } from "@/lib/utils";
import React from "react";

interface MonthPickerButtonProps {
  onMonthChange?: (month: number, year: number) => void;
  selectedMonth?: number;
  selectedYear?: number;
}

export default function MonthPickerButton({
  onMonthChange,
  selectedMonth,
  selectedYear,
}: MonthPickerButtonProps) {
  const currentMonth = selectedMonth || new Date().getMonth() + 1;
  const currentYear = selectedYear || new Date().getFullYear();

  const [date, setDate] = React.useState<Date>(
    new Date(currentYear, currentMonth - 1),
  );

  React.useEffect(() => {
    setDate(new Date(currentYear, currentMonth - 1));
  }, [currentMonth, currentYear]);

  const handleMonthSelect = (newDate: Date) => {
    setDate(newDate);
    if (onMonthChange) {
      const month = newDate.getMonth() + 1; // Convert to 1-based month
      const year = newDate.getFullYear();
      onMonthChange(month, year);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-40 justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMM yyyy") : <span>Pick a month</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <MonthPicker onMonthSelect={handleMonthSelect} selectedMonth={date} />
      </PopoverContent>
    </Popover>
  );
}
