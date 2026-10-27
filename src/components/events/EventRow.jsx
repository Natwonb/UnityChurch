import React from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EVENT_TYPES } from "@/lib/constants";
import { formatDayLabel, formatTime } from "@/lib/format";

export default function EventRow({ event, departmentName, onDelete, canManage }) {
  const typeLabel = EVENT_TYPES.find((type) => type.value === event.type)?.label || "Event";
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
        <CalendarDays className="h-4 w-4" />
          <span className="mt-0.5 text-[11px] font-medium leading-none">{formatDayLabel(event.date)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{event.title}</p>
          <Badge variant="outline" className="border-border text-muted-foreground">
            {typeLabel}
          </Badge>
          {departmentName ? (
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">{departmentName}</Badge>
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatTime(event.start_time) || "Time TBD"}
            {event.end_time ? ` – ${formatTime(event.end_time)}` : ""}
          </span>
          {event.location ? (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </span>
          ) : null}
        </div>
        {event.description ? (
          <p className={cn("mt-2 whitespace-pre-wrap text-sm text-muted-foreground")}>{event.description}</p>
        ) : null}
      </div>
      {canManage && onDelete ? (
        <button
          type="button"
          onClick={() => onDelete(event)}
          className="text-xs text-muted-foreground underline hover:text-destructive"
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}