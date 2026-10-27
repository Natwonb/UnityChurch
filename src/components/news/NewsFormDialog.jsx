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
import { NEWS_CATEGORIES } from "@/lib/constants";
import { uploadImage } from "@/lib/upload";

const emptyForm = { category: "prayer", title: "", body: "", image_url: "" };

export default function NewsFormDialog({ open, onOpenChange, post, onSaved }) {
  const { church, identity, membership } = useChurch();
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      post
        ? {
            category: post.category || "other",
            title: post.title || "",
            body: post.body || "",
            image_url: post.image_url || "",
          }
        : emptyForm,
    );
  }, [open, post]);

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
      setError("Add a headline for your news.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        church_id: church.id,
        category: form.category,
        title: form.title.trim(),
        body: form.body.trim(),
        image_url: form.image_url || "",
        author_key: post?.author_key || identity.member_key,
        author_name: post?.author_name || membership?.name || identity.name,
      };
      const saved = post
        ? await base44.entities.MemberPost.update(post.id, payload)
        : await base44.entities.MemberPost.create(payload);
      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Could not share your news.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{post ? "Edit news" : "Share news with the church"}</DialogTitle>
          <DialogDescription>
            Birthdays, new babies, weddings, graduations, prayer requests, and condolences.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>What kind of news?</Label>
            <Select value={form.category} onValueChange={set("category")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NEWS_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-title">Headline *</Label>
            <Input
              id="news-title"
              value={form.title}
              onChange={(event) => set("title")(event.target.value)}
              placeholder="Happy 80th birthday, Mother Lewis!"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-body">Tell us more</Label>
            <Textarea
              id="news-body"
              rows={4}
              value={form.body}
              onChange={(event) => set("body")(event.target.value)}
              placeholder="We celebrate with the family on Sunday after service."
            />
          </div>
          {form.image_url ? (
            <Image src={form.image_url} alt="News photo" className="h-40 w-full rounded-xl object-cover" />
          ) : null}
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
              Add a photo
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
              {post ? "Save changes" : "Share news"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}