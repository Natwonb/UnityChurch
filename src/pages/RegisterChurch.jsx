import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Church as ChurchIcon, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_DEPARTMENTS, getDepartmentColor, getDepartmentIcon } from "@/lib/constants";
import { makeJoinCode, newMemberKey, saveIdentity } from "@/lib/identity";
import { todayISO } from "@/lib/format";

const EMPTY = {
  name: "",
  tagline: "",
  city: "",
  state: "",
  pastor_name: "",
  contact_email: "",
  welcome_message: "",
  admin_name: "",
  admin_email: "",
};

export default function RegisterChurch() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.admin_name.trim() || !form.admin_email.trim()) {
      setError("Church name, your name, and your email are required.");
      return;
    }
    setSaving(true);
    try {
      const memberKey = newMemberKey();
      const church = await base44.entities.Church.create({
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pastor_name: form.pastor_name.trim(),
        contact_email: form.contact_email.trim() || form.admin_email.trim(),
        welcome_message: form.welcome_message.trim(),
        join_code: makeJoinCode(),
      });

      const departments = await Promise.all(
        DEFAULT_DEPARTMENTS.map((department, index) =>
          base44.entities.Department.create({
            church_id: church.id,
            name: department.name,
            description: department.description,
            meeting_schedule: department.meeting_schedule,
            icon: department.icon,
            color: department.color,
            sort_order: index,
          }),
        ),
      );

      await base44.entities.Membership.create({
        church_id: church.id,
        member_key: memberKey,
        name: form.admin_name.trim(),
        email: form.admin_email.trim(),
        role: "admin",
        status: "active",
        department_ids: departments.map((department) => department.id),
        joined_date: todayISO(),
      });

      saveIdentity({
        member_key: memberKey,
        name: form.admin_name.trim(),
        email: form.admin_email.trim(),
        church_id: church.id,
        church_name: church.name,
      });
      navigate("/home");
    } catch (err) {
      setError(err.message || "Something went wrong creating your church. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to the home page
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Register your church</CardTitle>
              <p className="text-sm text-muted-foreground">
                This creates your church's private space and makes you the church admin.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Church name *</Label>
                  <Input id="name" value={form.name} onChange={set("name")} placeholder="Grace Chapel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={form.tagline}
                    onChange={set("tagline")}
                    placeholder="A family of faith in the heart of the city"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={form.city} onChange={set("city")} placeholder="Chicago" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={form.state} onChange={set("state")} placeholder="IL" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pastor_name">Pastor</Label>
                    <Input
                      id="pastor_name"
                      value={form.pastor_name}
                      onChange={set("pastor_name")}
                      placeholder="Pastor James Carter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Church email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={form.contact_email}
                      onChange={set("contact_email")}
                      placeholder="office@gracechapel.org"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome_message">Welcome message for members</Label>
                  <Textarea
                    id="welcome_message"
                    rows={3}
                    value={form.welcome_message}
                    onChange={set("welcome_message")}
                    placeholder="Welcome home! Check here for this week's announcements and rehearsals."
                  />
                </div>

                <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-4">
                  <p className="font-heading text-base">Your admin account</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="admin_name">Your name *</Label>
                      <Input
                        id="admin_name"
                        value={form.admin_name}
                        onChange={set("admin_name")}
                        placeholder="Ministerial leader's name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin_email">Your email *</Label>
                      <Input
                        id="admin_email"
                        type="email"
                        value={form.admin_email}
                        onChange={set("admin_email")}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                </div>

                {error ? (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
                ) : null}

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChurchIcon className="h-4 w-4" />}
                  {saving ? "Creating your church space…" : "Create our church space"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Departments we'll set up</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {DEFAULT_DEPARTMENTS.map((department) => {
                  const Icon = getDepartmentIcon(department.icon);
                  const color = getDepartmentColor(department.color);
                  return (
                    <div key={department.name} className="flex items-start gap-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${color.soft}`}>
                        <Icon className={`h-4 w-4 ${color.text}`} />
                      </span>
                      <div>
                        <p className="text-sm font-medium">{department.name}</p>
                        <p className="text-xs text-muted-foreground">{department.meeting_schedule}</p>
                      </div>
                    </div>
                  );
                })}
                <p className="pt-2 text-xs text-muted-foreground">
                  You can rename, remove, or add departments later from Church Settings.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                <p className="font-heading text-base text-foreground">What happens next</p>
                <p className="mt-2">
                  You'll get a six-character join code to share with your congregation. Members enter it
                  when they join, and you can approve them from the Members page.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}