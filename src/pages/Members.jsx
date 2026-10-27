import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, RefreshCw, UserPlus, Users, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import MemberCard from "@/components/members/MemberCard";
import MemberEditDialog from "@/components/members/MemberEditDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { makeJoinCode } from "@/lib/identity";

export default function Members() {
  const { church, members, departments, isAdmin, identity, reload } = useChurch();
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  const pending = members.filter((member) => member.status === "pending");
  const active = [...members]
    .filter((member) => member.status !== "pending")
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  const copyCode = async () => {
    await navigator.clipboard.writeText(church.join_code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateCode = async () => {
    await base44.entities.Church.update(church.id, { join_code: makeJoinCode() });
    await reload();
  };

  const manageMember = (member, payload) =>
    base44.functions.invoke("updateMember", {
      church_id: church.id,
      caller_key: identity?.member_key,
      membership_id: member.id,
      ...payload,
    });

  const approve = async (member) => {
    await manageMember(member, { updates: { status: "active" } });
    await reload();
  };

  const removeMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} from ${church.name}?`)) return;
    await manageMember(member, { remove: true });
    await reload();
  };

  const openEdit = (member) => {
    setSelected(member);
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Members" subtitle={`The people in ${church.name}'s church space.`} />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div>
            <p className="font-heading text-lg">Invite your congregation</p>
            {isAdmin ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share this code and the join link. Members with the code are added straight away.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-lg bg-card px-3 py-1.5 font-mono text-lg tracking-widest">
                    {church.join_code || "—"}
                  </span>
                  <Button variant="outline" size="sm" onClick={copyCode}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy code"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={regenerateCode}>
                    <RefreshCw className="h-4 w-4" />
                    New code
                  </Button>
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Church admins manage the invite code. Ask an admin if someone needs to join.
              </p>
            )}
          </div>
          <Button variant="outline" asChild>
            <Link to="/join">
              <UserPlus className="h-4 w-4" />
              Open the join page
            </Link>
          </Button>
        </CardContent>
      </Card>

      {isAdmin && pending.length > 0 ? (
        <section>
          <h2 className="mb-3 font-heading text-xl">
            Waiting for approval <Badge className="ml-2 bg-accent text-accent-foreground hover:bg-accent">{pending.length}</Badge>
          </h2>
          <div className="space-y-3">
            {pending.map((member) => (
              <Card key={member.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.email || "No email"} · joined {member.joined_date || "recently"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approve(member)}>
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => removeMember(member)}>
                      <X className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 font-heading text-xl">Church directory</h2>
        {active.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No members yet"
            description="Share your join code so the congregation can join this church space."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                departments={departments}
                isAdmin={isAdmin}
                onEdit={openEdit}
                onRemove={removeMember}
              />
            ))}
          </div>
        )}
      </section>

      <MemberEditDialog open={editOpen} onOpenChange={setEditOpen} member={selected} onSaved={() => reload()} />
    </div>
  );
}