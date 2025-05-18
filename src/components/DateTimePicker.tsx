"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label?: string;
}

export function DateTimePicker({ date, setDate, label }: DateTimePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState(
    date ? format(date, "HH:mm") : ""
  );

  // Update the date when time changes
  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (date && time) {
      const [hours, minutes] = time.split(":");
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      setDate(newDate);
    }
  };

  // Update the time when date changes
  React.useEffect(() => {
    if (date) {
      setSelectedTime(format(date, "HH:mm"));
    }
  }, [date]);

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  // Preserve the existing time if there is one
                  if (selectedTime) {
                    const [hours, minutes] = selectedTime.split(":");
                    newDate.setHours(
                      parseInt(hours, 10),
                      parseInt(minutes, 10)
                    );
                  }
                  setDate(newDate);
                } else {
                  setDate(undefined);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          value={selectedTime}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="w-[120px]"
        />
      </div>
    </div>
  );
}
