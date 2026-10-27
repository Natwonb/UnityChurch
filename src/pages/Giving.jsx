import React, { useCallback, useEffect, useState } from "react";
import { CircleDollarSign, Gift, History } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import GiveDialog from "@/components/giving/GiveDialog";
import GivingList from "@/components/giving/GivingList";
import ChurchGivingPanel from "@/components/giving/ChurchGivingPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { money } from "@/lib/format";

export default function Giving() {
  const { church, identity, isAdmin } = useChurch();
  const [gifts, setGifts] = useState([]);
  const [myTotal, setMyTotal] = useState(0);
  const [fundTotals, setFundTotals] = useState([]);
  const [churchGifts, setChurchGifts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    if (!church || !identity) return;
    const [myGifts, myTotals] = await Promise.all([
      base44.entities.Giving.filter(
        { church_id: church.id, member_key: identity.member_key },
        { sort: "-date", limit: 100 },
      ),
      base44.entities.Giving.aggregate({
        query: { church_id: church.id, member_key: identity.member_key },
        sum: ["amount"],
      }),
    ]);
    setGifts(myGifts.items || []);
    setMyTotal(myTotals.rows?.[0]?.sum_amount || 0);

    if (isAdmin) {
      const [totals, all] = await Promise.all([
        base44.entities.Giving.aggregate({
          query: { church_id: church.id },
          groupBy: "fund",
          sum: ["amount"],
        }),
        base44.entities.Giving.filter({ church_id: church.id }, { sort: "-date", limit: 50 }),
      ]);
      setFundTotals(totals.rows || []);
      setChurchGifts(all.items || []);
    }
  }, [church?.id, identity?.member_key, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const churchTotal = fundTotals.reduce((sum, row) => sum + (row.sum_amount || 0), 0);

  const removeGift = async (gift) => {
    await base44.entities.Giving.delete(gift.id);
    setGifts((prev) => prev.filter((item) => item.id !== gift.id));
    setMyTotal((prev) => Math.max(0, prev - (gift.amount || 0)));
    if (isAdmin) {
      setChurchGifts((prev) => prev.filter((item) => item.id !== gift.id));
      setFundTotals((prev) =>
        prev.map((row) =>
          row.fund === gift.fund
            ? {
                ...row,
                count: Math.max(0, row.count - 1),
                sum_amount: Math.max(0, (row.sum_amount || 0) - (gift.amount || 0)),
              }
            : row,
        ),
      );
    }
  };

  const handleGiftSaved = (created) => {
    setGifts((prev) => [created, ...prev]);
    setMyTotal((prev) => prev + (created.amount || 0));
    if (!isAdmin) return;
    setChurchGifts((prev) => [created, ...prev]);
    setFundTotals((prev) => {
      const existing = prev.find((row) => row.fund === created.fund);
      if (!existing) return [...prev, { fund: created.fund, count: 1, sum_amount: created.amount }];
      return prev.map((row) =>
        row.fund === created.fund
          ? { ...row, count: row.count + 1, sum_amount: (row.sum_amount || 0) + (created.amount || 0) }
          : row,
      );
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tithes & offerings"
        subtitle="Give faithfully, and keep your own record of every gift."
      >
        <Button onClick={() => setDialogOpen(true)}>
          <Gift className="h-4 w-4" />
          Record a gift
        </Button>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={CircleDollarSign} label="My giving" value={money(myTotal)} hint="all gifts recorded" />
        <StatCard icon={History} label="Gifts logged" value={gifts.length} hint="in your private history" />
        {isAdmin ? (
          <StatCard icon={Gift} label="Church giving" value={money(churchTotal)} hint="recorded by members" />
        ) : null}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">My giving history</CardTitle>
          <p className="text-sm text-muted-foreground">
            Only you and your church admin can see these records.
          </p>
        </CardHeader>
        <CardContent>
          <GivingList gifts={gifts} onDeleted={removeGift} />
        </CardContent>
      </Card>

      {isAdmin ? (
        <ChurchGivingPanel fundTotals={fundTotals} gifts={churchGifts} total={churchTotal} />
      ) : null}

      <GiveDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={handleGiftSaved} />
    </div>
  );
}