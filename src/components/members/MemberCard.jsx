import React from "react";
import { Mail, Phone, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";

const ROLE_LABELS = { admin: "Church Admin", leader: "Department Leader", member: "Member" };

export default function MemberCard({ member, departments, isAdmin, onEdit, onRemove }) {
  const myDepartments = departments.filter((department) =>
    (member.department_ids || []).includes(department.id),
  );

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-primary/10 font-heading text-primary">
              {initials(member.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-lg leading-tight">{member.name}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {member.email || "No email on file"}
            </p>
            {member.phone ? (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {member.phone}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant={member.role === "member" ? "outline" : "default"} className={member.role === "member" ? "border-border text-muted-foreground" : ""}>
            <UserRound className="mr-1 h-3 w-3" />
            {ROLE_LABELS[member.role] || "Member"}
          </Badge>
          {member.status === "pending" ? (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Awaiting approval</Badge>
          ) : null}
          {myDepartments.map((department) => (
            <Badge key={department.id} className="bg-secondary text-secondary-foreground hover:bg-secondary">
              {department.name}
            </Badge>
          ))}
        </div>

        {isAdmin ? (
          <div className="mt-3 flex gap-1 border-t border-border pt-3">
            <Button variant="outline" size="sm" onClick={() => onEdit(member)}>
              Edit role & departments
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onRemove(member)}>
              Remove
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}