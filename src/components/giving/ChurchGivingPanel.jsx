import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fundLabel, methodLabel } from "@/lib/constants";
import { formatDate, money } from "@/lib/format";

export default function ChurchGivingPanel({ fundTotals, gifts, total }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">Church giving record</CardTitle>
          <p className="text-sm text-muted-foreground">
            Everything members have recorded — {money(total)} across {gifts.length} recent gifts.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {fundTotals.map((row) => (
              <div key={row.fund} className="rounded-xl bg-secondary/60 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{fundLabel(row.fund)}</p>
                <p className="font-heading text-lg">{money(row.sum_amount)}</p>
                <p className="text-xs text-muted-foreground">{row.count} gifts</p>
              </div>
            ))}
            {fundTotals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No gifts recorded yet.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">Recent gifts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {gifts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No gifts recorded yet.</p>
          ) : (
            gifts.map((gift) => (
              <div
                key={gift.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{gift.member_name || "Member"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(gift.date)} · {methodLabel(gift.method)}
                    {gift.note ? ` · ${gift.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">
                    {fundLabel(gift.fund)}
                  </Badge>
                  <p className="font-medium">{money(gift.amount)}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}