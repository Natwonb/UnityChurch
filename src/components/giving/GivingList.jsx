import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fundLabel, methodLabel } from "@/lib/constants";
import { formatDate, money } from "@/lib/format";

export default function GivingList({ gifts, onDeleted }) {
  if (!gifts.length) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        No gifts recorded yet. When you give, record it here so your history stays complete.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card">
      {gifts.map((gift) => (
        <div key={gift.id} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{fundLabel(gift.fund)}</p>
              <Badge variant="outline" className="border-border text-muted-foreground">
                {methodLabel(gift.method)}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDate(gift.date)}
              {gift.note ? ` · ${gift.note}` : ""}
            </p>
          </div>
          <p className="font-heading text-lg">{money(gift.amount)}</p>
          {onDeleted ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDeleted(gift)} aria-label="Delete gift">
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}