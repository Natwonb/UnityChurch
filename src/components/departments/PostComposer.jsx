import React, { useRef, useState } from "react";
import { ImagePlus, Loader2, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { uploadImage } from "@/lib/upload";

export default function PostComposer({ department, onPosted }) {
  const { church, identity, membership } = useChurch();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const pickImage = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      setImageUrl(await uploadImage(file));
    } catch (err) {
      setError(err.message || "Could not upload that photo.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!body.trim()) {
      setError("Write something to post.");
      return;
    }
    setSaving(true);
    try {
      const created = await base44.entities.Post.create({
        church_id: church.id,
        department_id: department.id,
        title: title.trim(),
        body: body.trim(),
        image_url: imageUrl,
        author_key: identity.member_key,
        author_name: membership?.name || identity.name,
      });
      setTitle("");
      setBody("");
      setImageUrl("");
      onPosted(created);
    } catch (err) {
      setError(err.message || "Could not publish your post.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="font-heading text-lg">Post to {department.name}</p>
        <form onSubmit={submit} className="mt-3 space-y-3">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Headline (optional)"
            aria-label="Post headline"
          />
          <Textarea
            rows={3}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={`Share news with the ${department.name}…`}
            aria-label="Post message"
          />
          {imageUrl ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">Photo attached</span>
              <button type="button" onClick={() => setImageUrl("")} className="underline">
                Remove
              </button>
            </div>
          ) : null}
          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2">
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
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}