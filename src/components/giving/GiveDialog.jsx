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
import { FUNDS, GIVING_METHODS } from "@/lib/constants";
import { todayISO } from "@/lib/format";

const emptyForm = {
  fund: "tithe",
  amount: "",
  method: "cash",
  date: todayISO(),
  note: "",
};

export default function GiveDialog({ open, onOpenChange, onSaved }) {
  const { church, identity, membership } = useChurch();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(emptyForm);
  }, [open]);

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      setError("Enter the amount you gave.");
      return;
    }
    setSaving(true);
    try {
      const created = await base44.entities.Giving.create({
        church_id: church.id,
        member_key: identity.member_key,
        member_name: membership?.name || identity.name,
        amount,
        fund: form.fund,
        method: form.method,
        date: form.date || todayISO(),
        note: form.note.trim(),
        status: "recorded",
      });
      onSaved(created);
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Could not record your gift.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">Record a gift</DialogTitle>
          <DialogDescription>
            "Bring ye all the tithes into the storehouse" — Malachi 3:10. Your giving history stays private to
            you and your church admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Fund</Label>
              <Select value={form.fund} onValueChange={set("fund")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUNDS.map((fund) => (
                    <SelectItem key={fund.value} value={fund.value}>
                      {fund.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="giving-amount">Amount *</Label>
              <Input
                id="giving-amount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.amount}
                onChange={(event) => set("amount")(event.target.value)}
                placeholder="50.00"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>How you gave</Label>
              <Select value={form.method} onValueChange={set("method")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GIVING_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="giving-date">Date</Label>
              <Input
                id="giving-date"
                type="date"
                value={form.date}
                onChange={(event) => set("date")(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="giving-note">Note (optional)</Label>
            <Textarea
              id="giving-note"
              rows={2}
              value={form.note}
              onChange={(event) => set("note")(event.target.value)}
              placeholder="In memory of…, building fund pledge, etc."
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
              Save to my giving
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}