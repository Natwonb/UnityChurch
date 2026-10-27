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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emptyForm = { name: "", email: "", phone: "", role: "member", status: "active", department_ids: [] };

export default function MemberEditDialog({ open, onOpenChange, member, onSaved }) {
  const { church, identity, departments } = useChurch();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !member) return;
    setError("");
    setForm({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      role: member.role || "member",
      status: member.status || "active",
      department_ids: member.department_ids || [],
    });
  }, [open, member]);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleDepartment = (id, checked) => {
    setForm((prev) => ({
      ...prev,
      department_ids: checked
        ? [...prev.department_ids, id]
        : prev.department_ids.filter((value) => value !== id),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Every member needs a name.");
      return;
    }
    setSaving(true);
    try {
      const response = await base44.functions.invoke("updateMember", {
        church_id: church.id,
        caller_key: identity?.member_key,
        membership_id: member.id,
        updates: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
          status: form.status,
          department_ids: form.department_ids,
        },
      });
      onSaved(response.data?.membership);
      onOpenChange(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Could not save this member.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Member details</DialogTitle>
          <DialogDescription>
            Leaders can post in the departments you assign them. Church admins can post everywhere.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-name">Name *</Label>
            <Input id="member-name" value={form.name} onChange={(event) => set("name")(event.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                value={form.email}
                onChange={(event) => set("email")(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-phone">Phone</Label>
              <Input id="member-phone" value={form.phone} onChange={(event) => set("phone")(event.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={set("role")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="leader">Department Leader</SelectItem>
                  <SelectItem value="admin">Church Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Awaiting approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Departments</Label>
            <div className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
              {departments.map((department) => (
                <label key={department.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.department_ids.includes(department.id)}
                    onCheckedChange={(checked) => toggleDepartment(department.id, checked === true)}
                  />
                  {department.name}
                </label>
              ))}
            </div>
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
              Save member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}