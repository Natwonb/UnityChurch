import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import { REACTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ReactionBar({ postId, postType, reactions: loaded }) {
  const { identity, membership, church } = useChurch();
  const [reactions, setReactions] = useState(loaded || []);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setReactions(loaded || []);
  }, [loaded]);

  const mine = reactions.find((reaction) => reaction.member_key === identity?.member_key);

  const toggle = async (value) => {
    if (busy || !identity?.member_key) return;
    setBusy(true);
    if (mine && mine.reaction === value) {
      await base44.entities.Reaction.delete(mine.id);
      setReactions((prev) => prev.filter((reaction) => reaction.id !== mine.id));
    } else if (mine) {
      const updated = await base44.entities.Reaction.update(mine.id, { reaction: value });
      setReactions((prev) => prev.map((reaction) => (reaction.id === mine.id ? updated : reaction)));
    } else {
      const created = await base44.entities.Reaction.create({
        church_id: church.id,
        post_id: postId,
        post_type: postType,
        member_key: identity.member_key,
        member_name: membership?.name || identity.name,
        reaction: value,
      });
      setReactions((prev) => [...prev, created]);
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {REACTIONS.map((reaction) => {
        const count = reactions.filter((item) => item.reaction === reaction.value).length;
        const active = mine?.reaction === reaction.value;
        return (
          <button
            key={reaction.value}
            type="button"
            onClick={() => toggle(reaction.value)}
            title={reaction.label}
            className={cn(
              "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
              active
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/30",
            )}
          >
            <span aria-hidden>{reaction.emoji}</span>
            <span>{reaction.label}</span>
            {count > 0 ? <span className="font-medium">{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}