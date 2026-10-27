import React, { useState } from "react";
import { Plus, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import DepartmentCard from "@/components/departments/DepartmentCard";
import DepartmentFormDialog from "@/components/departments/DepartmentFormDialog";
import { Button } from "@/components/ui/button";

export default function Departments() {
  const { church, departments, members, isAdmin, reload } = useChurch();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const leadersFor = (departmentId) =>
    members
      .filter((member) => member.role === "leader" && (member.department_ids || []).includes(departmentId))
      .map((member) => member.name);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (department) => {
    setEditing(department);
    setFormOpen(true);
  };

  const removeDepartment = async (department) => {
    if (
      !window.confirm(
        `Delete ${department.name}? Its posts and events will be removed too.`,
      )
    ) {
      return;
    }
    await base44.entities.Post.deleteMany({ church_id: church.id, department_id: department.id });
    await base44.entities.Event.deleteMany({ church_id: church.id, department_id: department.id });
    await base44.entities.Department.delete(department.id);
    await reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Each ministry keeps its own feed, schedule, and leaders."
      >
        {isAdmin ? (
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Add department
          </Button>
        ) : null}
      </PageHeader>

      {isAdmin ? (
        <p className="rounded-xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
          To put someone in charge of a department, open the Members page, edit their details, and set
          their role to Department Leader with that department checked.
        </p>
      ) : null}

      {departments.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No departments yet"
          description="Departments give each ministry — Choir, Brotherhood, Sisterhood, Youth, Musicians — its own home."
        >
          {isAdmin ? <Button onClick={openNew}>Add department</Button> : null}
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              leaders={leadersFor(department.id)}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={removeDepartment}
            />
          ))}
        </div>
      )}

      <DepartmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        department={editing}
        onSaved={() => reload()}
      />
    </div>
  );
}