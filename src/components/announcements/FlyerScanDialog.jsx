import React, { useRef, useState } from "react";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Image } from "@/components/ui/image";
import { uploadImage } from "@/lib/upload";
import { useChurch } from "@/lib/ChurchContext";

export default function FlyerScanDialog({ open, onOpenChange, onDraft }) {
  const { church, identity } = useChurch();
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const reset = () => {
    setPreview("");
    setFile(null);
    setFileName("");
    setError("");
  };

  const handleFile = (selected) => {
    if (!selected) return;
    setFile(selected);
    setFileName(selected.name);
    setPreview(URL.createObjectURL(selected));
    setError("");
  };

  const scan = async () => {
    if (!file) return;
    setScanning(true);
    setError("");
    try {
      const fileUrl = await uploadImage(file);
      const response = await base44.functions.invoke("extractFlyer", {
        file_url: fileUrl,
        church_id: church?.id,
        member_key: identity?.member_key,
      });
      const draft = response.data?.draft;
      if (!draft || !draft.title) {
        throw new Error(response.data?.error || "We couldn't read the flyer. Try a clearer photo.");
      }
      onDraft({ ...draft, image_url: fileUrl, source: "flyer" });
      reset();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "We couldn't read the flyer. Try a clearer photo with the whole flyer in view.",
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Turn a flyer into an announcement</DialogTitle>
          <DialogDescription>
            Photograph the flyer from the notice board. We'll read the date, time, and place and draft the
            announcement for you to check before it goes out.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />

          {preview ? (
            <Image src={preview} alt="Selected flyer" className="h-56 w-full rounded-xl object-cover" fittingType="fill" />
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-56 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/40 text-muted-foreground hover:border-primary/40"
            >
              <Camera className="h-7 w-7" />
              <span className="text-sm font-medium">Take a photo or choose an image</span>
              <span className="text-xs">JPG or PNG of the printed flyer</span>
            </button>
          )}

          {preview ? (
            <div className="flex items-center justify-between">
              <p className="truncate text-xs text-muted-foreground">{fileName}</p>
              <button type="button" className="text-xs underline text-muted-foreground" onClick={() => fileRef.current?.click()}>
                Choose a different photo
              </button>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="flex items-start gap-2 rounded-lg bg-accent/10 px-3 py-2 text-xs text-muted-foreground">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-foreground" />
            You review and edit every detail before publishing, so nothing goes out by mistake.
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={scan} disabled={!file || scanning}>
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {scanning ? "Reading the flyer…" : "Read the flyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}