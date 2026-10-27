import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, Loader2, MapPin, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "@/components/ui/image";
import { uploadImage } from "@/lib/upload";

export default function ChurchSettings() {
  const { church, isAdmin, departments, reload } = useChurch();
  const [form, setForm] = useState(church);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (church) setForm(church);
  }, [church?.id]);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const pickLogo = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, logo_url: url }));
    } catch (err) {
      setError(err.message || "Could not upload that image.");
    } finally {
      setUploading(false);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.name?.trim()) {
      setError("Your church needs a name.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await base44.entities.Church.update(church.id, {
        name: form.name.trim(),
        tagline: form.tagline || "",
        description: form.description || "",
        pastor_name: form.pastor_name || "",
        address: form.address || "",
        city: form.city || "",
        state: form.state || "",
        zip: form.zip || "",
        phone: form.phone || "",
        contact_email: form.contact_email || "",
        welcome_message: form.welcome_message || "",
        logo_url: form.logo_url || "",
      });
      await reload();
      setMessage("Your church details are saved.");
    } catch (err) {
      setError(err.message || "Could not save your church details.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader title="Church settings" subtitle={`How ${church.name} appears to its members.`} />
        <Card>
          <CardContent className="space-y-3 pt-6 text-sm">
            <p className="font-heading text-lg">{church.name}</p>
            <p className="text-muted-foreground">{church.tagline}</p>
            <p className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {[church.address, church.city, church.state, church.zip].filter(Boolean).join(", ") ||
                "Address not set"}
            </p>
            <p className="text-muted-foreground">{church.description}</p>
            <p className="text-xs text-muted-foreground">
              Only church admins can update these details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Church settings" subtitle="Update how your church appears to its members." />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">Church profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="flex items-center gap-4">
              {form?.logo_url ? (
                <Image src={form.logo_url} alt={form.name} className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-secondary text-xs text-muted-foreground">
                  No logo
                </div>
              )}
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => pickLogo(event.target.files?.[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  {form?.logo_url ? "Replace logo" : "Upload a logo"}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="church-name">Church name *</Label>
                <Input id="church-name" value={form?.name || ""} onChange={set("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="church-tagline">Tagline</Label>
                <Input id="church-tagline" value={form?.tagline || ""} onChange={set("tagline")} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="church-pastor">Pastor</Label>
                <Input id="church-pastor" value={form?.pastor_name || ""} onChange={set("pastor_name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="church-phone">Phone</Label>
                <Input id="church-phone" value={form?.phone || ""} onChange={set("phone")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="church-email">Church email</Label>
              <Input id="church-email" type="email" value={form?.contact_email || ""} onChange={set("contact_email")} />
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="church-address">Street address</Label>
                <Input id="church-address" value={form?.address || ""} onChange={set("address")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="church-city">City</Label>
                <Input id="church-city" value={form?.city || ""} onChange={set("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="church-state">State / ZIP</Label>
                <div className="flex gap-2">
                  <Input id="church-state" value={form?.state || ""} onChange={set("state")} />
                  <Input value={form?.zip || ""} onChange={set("zip")} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="church-welcome">Welcome message</Label>
              <Textarea
                id="church-welcome"
                rows={3}
                value={form?.welcome_message || ""}
                onChange={set("welcome_message")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="church-description">About your church</Label>
              <Textarea
                id="church-description"
                rows={3}
                value={form?.description || ""}
                onChange={set("description")}
              />
            </div>

            {message ? <p className="rounded-lg bg-secondary px-3 py-2 text-sm">{message}</p> : null}
            {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save church details
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">Departments</CardTitle>
          <p className="text-sm text-muted-foreground">
            {departments.length} departments are set up for your church.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {departments.map((department) => (
              <span key={department.id} className="rounded-full bg-secondary px-3 py-1 text-xs">
                {department.name}
              </span>
            ))}
          </div>
          <Button variant="outline" asChild>
            <Link to="/departments">Manage departments</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}