import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarMonth({ monthLabel, weeks, eventsByDay, selectedDate, onSelectDate, onPrev, onNext }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="font-heading text-lg">{monthLabel}</p>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={onPrev} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNext} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-muted-foreground">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-1 space-y-1">
        {weeks.map((week, index) => (
          <div key={index} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const dayEvents = eventsByDay[day.iso] || [];
              const isSelected = selectedDate === day.iso;
              return (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => onSelectDate(day.iso)}
                  className={cn(
                    "flex min-h-[64px] flex-col items-start gap-1 rounded-lg border p-1.5 text-left transition-colors",
                    day.inMonth ? "bg-background" : "bg-muted/40",
                    isSelected ? "border-primary ring-1 ring-primary/40" : "border-border hover:border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      day.inMonth ? "text-foreground" : "text-muted-foreground",
                      day.isToday && "rounded-full bg-accent px-1.5 text-accent-foreground",
                    )}
                  >
                    {day.dayNumber}
                  </span>
                  {dayEvents.slice(0, 2).map((event) => (
                    <span
                      key={event.id}
                      className="w-full truncate rounded bg-primary/10 px-1 text-[10px] leading-4 text-primary"
                    >
                      {event.title}
                    </span>
                  ))}
                  {dayEvents.length > 2 ? (
                    <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}