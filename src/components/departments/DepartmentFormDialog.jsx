import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COLOR_OPTIONS, ICON_OPTIONS, getDepartmentColor, getDepartmentIcon } from "@/lib/constants";
import { cn } from "@/lib/utils";

const emptyForm = {
  name: "",
  description: "",
  meeting_schedule: "",
  icon: "users",
  color: "violet",
};

export default function DepartmentFormDialog({ open, onOpenChange, department, onSaved }) {
  const { church, departments } = useChurch();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      department
        ? {
            name: department.name || "",
            description: department.description || "",
            meeting_schedule: department.meeting_schedule || "",
            icon: department.icon || "users",
            color: department.color || "violet",
          }
        : emptyForm,
    );
  }, [open, department]);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Give the department a name.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        church_id: church.id,
        name: form.name.trim(),
        description: form.description.trim(),
        meeting_schedule: form.meeting_schedule.trim(),
        icon: form.icon,
        color: form.color,
      };
      const saved = department
        ? await base44.entities.Department.update(department.id, payload)
        : await base44.entities.Department.create({ ...payload, sort_order: departments.length });
      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Could not save the department.");
    } finally {
      setSaving(false);
    }
  };

  const PreviewIcon = getDepartmentIcon(form.icon);
  const previewColor = getDepartmentColor(form.color);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {department ? "Edit department" : "Add a department"}
          </DialogTitle>
          <DialogDescription>
            Departments give each ministry its own feed, events, and leaders.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="department-name">Department name *</Label>
            <Input
              id="department-name"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder="Ushers, Media, Women's Ministry…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department-description">What this department does</Label>
            <Textarea
              id="department-description"
              rows={3}
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder="Serve the congregation by welcoming every guest."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department-schedule">Meeting or rehearsal time</Label>
            <Input
              id="department-schedule"
              value={form.meeting_schedule}
              onChange={(e) => set("meeting_schedule")(e.target.value)}
              placeholder="Rehearsals — Thursdays, 7:00 PM"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-1.5">
                {ICON_OPTIONS.map((option) => {
                  const Icon = getDepartmentIcon(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      title={option.label}
                      onClick={() => set("icon")(option.value)}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg border",
                        form.icon === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_OPTIONS.map((value) => {
                  const color = getDepartmentColor(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      title={value}
                      onClick={() => set("color")(value)}
                      className={cn(
                        "h-9 w-9 rounded-lg border-2",
                        color.solid,
                        form.color === value ? "border-foreground" : "border-transparent",
                      )}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className={cn("flex items-center gap-3 rounded-lg p-3", previewColor.soft)}>
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-card", previewColor.text)}>
              <PreviewIcon className="h-4 w-4" />
            </span>
            <p className={cn("text-sm font-medium", previewColor.text)}>{form.name || "Department preview"}</p>
          </div>

          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {department ? "Save changes" : "Add department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}