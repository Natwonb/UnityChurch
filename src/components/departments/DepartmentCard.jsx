import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDepartmentColor, getDepartmentIcon } from "@/lib/constants";

export default function DepartmentCard({ department, leaders, isAdmin, onEdit, onDelete }) {
  const Icon = getDepartmentIcon(department.icon);
  const color = getDepartmentColor(department.color);

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col pt-6">
        <div className="flex items-start gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color.soft}`}>
            <Icon className={`h-5 w-5 ${color.text}`} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-lg leading-tight">{department.name}</p>
            {department.meeting_schedule ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                {department.meeting_schedule}
              </p>
            ) : null}
          </div>
        </div>

        {department.description ? (
          <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{department.description}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {leaders && leaders.length ? (
            <Badge variant="outline" className="border-border text-muted-foreground">
              <UserRound className="mr-1 h-3 w-3" />
              {leaders.join(", ")}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-border text-muted-foreground">
              <UserRound className="mr-1 h-3 w-3" />
              No leader assigned yet
            </Badge>
          )}
          {isAdmin ? (
            <>
              {onEdit ? (
                <button
                  type="button"
                  onClick={() => onEdit(department)}
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                >
                  Edit
                </button>
              ) : null}
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(department)}
                  className="text-xs text-muted-foreground underline hover:text-destructive"
                >
                  Delete
                </button>
              ) : null}
            </>
          ) : null}
        </div>

        <Link
          to={`/departments/${department.id}`}
          className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${color.text}`}
        >
          Open {department.name}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}