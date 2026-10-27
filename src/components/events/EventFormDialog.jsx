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
import { EVENT_TYPES } from "@/lib/constants";
import { todayISO } from "@/lib/format";

const emptyForm = (departmentId) => ({
  title: "",
  date: todayISO(),
  start_time: "19:00",
  end_time: "",
  location: "",
  type: "rehearsal",
  description: "",
  department_id: departmentId || "",
});

export default function EventFormDialog({ open, onOpenChange, event, defaultDepartmentId, allowedDepartmentIds, onSaved }) {
  const { church, departments: allDepartments, identity, membership } = useChurch();
  const departments = allowedDepartmentIds?.length
    ? allDepartments.filter((department) => allowedDepartmentIds.includes(department.id))
    : allDepartments;
  const [form, setForm] = useState(emptyForm(defaultDepartmentId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      event
        ? {
            title: event.title || "",
            date: event.date || todayISO(),
            start_time: event.start_time || "",
            end_time: event.end_time || "",
            location: event.location || "",
            type: event.type || "rehearsal",
            description: event.description || "",
            department_id: event.department_id || defaultDepartmentId || "",
          }
        : emptyForm(defaultDepartmentId),
    );
  }, [open, event, defaultDepartmentId]);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!form.title.trim()) {
      setError("Give the event a title.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        church_id: church.id,
        title: form.title.trim(),
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        location: form.location.trim(),
        type: form.type,
        description: form.description.trim(),
        department_id: form.department_id || "",
        author_key: identity.member_key,
        author_name: membership?.name || identity.name,
      };
      const saved = event
        ? await base44.entities.Event.update(event.id, payload)
        : await base44.entities.Event.create(payload);
      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Could not save the event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{event ? "Edit event" : "Schedule an event"}</DialogTitle>
          <DialogDescription>
            Rehearsals, services, and meetings show up on everyone's calendar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Event title *</Label>
            <Input
              id="event-title"
              value={form.title}
              onChange={(e) => set("title")(e.target.value)}
              placeholder="Choir rehearsal"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-date">Date *</Label>
              <Input id="event-date" type="date" value={form.date} onChange={(e) => set("date")(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={set("type")}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-start">Start time</Label>
              <Input
                id="event-start"
                type="time"
                value={form.start_time}
                onChange={(e) => set("start_time")(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-end">End time</Label>
              <Input
                id="event-end"
                type="time"
                value={form.end_time}
                onChange={(e) => set("end_time")(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                value={form.location}
                onChange={(e) => set("location")(e.target.value)}
                placeholder="Fellowship Hall"
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department_id || "none"} onValueChange={(value) => set("department_id")(value === "none" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Whole church" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Whole church</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-description">Details</Label>
            <Textarea
              id="event-description"
              rows={3}
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              placeholder="What should members bring or prepare?"
            />
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
              {event ? "Save changes" : "Add to calendar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}