import React from "react";
import { CalendarDays, Camera, Clock, MapPin, Pencil, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image } from "@/components/ui/image";
import { formatDate, formatTime } from "@/lib/format";

export default function AnnouncementCard({ announcement, onEdit, onDeleted, showActions = true }) {
  const { identity, isAdmin, departmentName } = useChurch();
  const canManage = showActions && (isAdmin || announcement.author_key === identity?.member_key);
  const isDraft = announcement.status === "draft";

  const remove = async () => {
    await base44.entities.Announcement.delete(announcement.id);
    onDeleted?.(announcement.id);
  };

  return (
    <Card className="overflow-hidden">
      {announcement.image_url ? (
        <Image
          src={announcement.image_url}
          alt={announcement.title}
          className="h-52 w-full object-cover"
          fittingType="fill"
        />
      ) : null}
      <CardContent className="pt-5">
        <div className="flex flex-wrap items-center gap-2">
          {isDraft ? (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Draft — only leaders can see</Badge>
          ) : null}
          {announcement.source === "flyer" ? (
            <Badge variant="outline" className="border-border text-muted-foreground">
              <Camera className="mr-1 h-3 w-3" />
              From a flyer
            </Badge>
          ) : null}
          {announcement.department_id ? (
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">
              {departmentName(announcement.department_id)}
            </Badge>
          ) : null}
        </div>

        <p className="mt-2 font-heading text-xl leading-snug">{announcement.title}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {announcement.event_date ? (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(announcement.event_date)}
            </span>
          ) : null}
          {announcement.event_time ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(announcement.event_time)}
              {announcement.end_time ? ` – ${formatTime(announcement.end_time)}` : ""}
            </span>
          ) : null}
          {announcement.location ? (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {announcement.location}
            </span>
          ) : null}
        </div>

        {announcement.body ? (
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{announcement.body}</p>
        ) : null}

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">Posted by {announcement.author_name || "church leadership"}</p>
          {canManage ? (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit(announcement)}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={remove}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}