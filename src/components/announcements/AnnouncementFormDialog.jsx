import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
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
import { Image } from "@/components/ui/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadImage } from "@/lib/upload";
import { todayISO } from "@/lib/format";

const emptyForm = {
  title: "",
  body: "",
  event_date: "",
  event_time: "",
  end_time: "",
  location: "",
  department_id: "",
  image_url: "",
  status: "published",
  source: "manual",
};

export default function AnnouncementFormDialog({
  open,
  onOpenChange,
  announcement,
  initialValues,
  onSaved,
}) {
  const { church, departments, identity, membership } = useChurch();
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (announcement) {
      setForm({
        title: announcement.title || "",
        body: announcement.body || "",
        event_date: announcement.event_date || "",
        event_time: announcement.event_time || "",
        end_time: announcement.end_time || "",
        location: announcement.location || "",
        department_id: announcement.department_id || "",
        image_url: announcement.image_url || "",
        status: announcement.status || "published",
        source: announcement.source || "manual",
      });
    } else {
      setForm({ ...emptyForm, ...(initialValues || {}) });
    }
  }, [open, announcement, initialValues]);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const pickImage = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      set("image_url")(await uploadImage(file));
    } catch (err) {
      setError(err.message || "Could not upload that photo.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Give the announcement a title.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        church_id: church.id,
        title: form.title.trim(),
        body: form.body.trim(),
        event_date: form.event_date || "",
        event_time: form.event_time || "",
        end_time: form.end_time || "",
        location: form.location.trim(),
        department_id: form.department_id || "",
        image_url: form.image_url || "",
        status: form.status,
        source: form.source || "manual",
        author_key: announcement?.author_key || identity.member_key,
        author_name: announcement?.author_name || membership?.name || identity.name,
      };
      const saved = announcement
        ? await base44.entities.Announcement.update(announcement.id, payload)
        : await base44.entities.Announcement.create(payload);
      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Could not save the announcement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {announcement ? "Edit announcement" : initialValues ? "Review the drafted announcement" : "New announcement"}
          </DialogTitle>
          <DialogDescription>
            {initialValues
              ? "We read your flyer. Check the details, fix anything that is off, then publish."
              : "Announcements appear at the top of everyone's home page."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {form.image_url ? (
            <Image
              src={form.image_url}
              alt="Flyer"
              className="h-40 w-full rounded-xl object-cover"
              fittingType="fill"
            />
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="announcement-title">Title *</Label>
            <Input
              id="announcement-title"
              value={form.title}
              onChange={(event) => set("title")(event.target.value)}
              placeholder="Choir rehearsal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcement-body">Details</Label>
            <Textarea
              id="announcement-body"
              rows={4}
              value={form.body}
              onChange={(event) => set("body")(event.target.value)}
              placeholder="What should the congregation know?"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="announcement-date">Event date</Label>
              <Input
                id="announcement-date"
                type="date"
                value={form.event_date}
                onChange={(event) => set("event_date")(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-location">Location</Label>
              <Input
                id="announcement-location"
                value={form.location}
                onChange={(event) => set("location")(event.target.value)}
                placeholder="Fellowship Hall"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="announcement-start">Start time</Label>
              <Input
                id="announcement-start"
                type="time"
                value={form.event_time}
                onChange={(event) => set("event_time")(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-end">End time</Label>
              <Input
                id="announcement-end"
                type="time"
                value={form.end_time}
                onChange={(event) => set("end_time")(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={form.department_id || "none"}
                onValueChange={(value) => set("department_id")(value === "none" ? "" : value)}
              >
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
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publish to everyone</SelectItem>
                  <SelectItem value="draft">Save as draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => pickImage(event.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {form.image_url ? "Replace flyer photo" : "Add a flyer photo"}
            </Button>
            {form.image_url ? (
              <button type="button" className="text-xs underline text-muted-foreground" onClick={() => set("image_url")("")}>
                Remove photo
              </button>
            ) : null}
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
              {form.status === "draft" ? "Save draft" : announcement ? "Save changes" : "Publish announcement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}