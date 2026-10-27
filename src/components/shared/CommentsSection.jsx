import React, { useState } from "react";
import { Loader2, Send, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, timeAgo } from "@/lib/format";

export default function CommentsSection({ postId, postType = "department", comments }) {
  const { identity, membership, church, isAdmin } = useChurch();
  const [list, setList] = useState(comments || []);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const created = await base44.entities.Comment.create({
      church_id: church.id,
      post_id: postId,
      post_type: postType,
      author_key: identity.member_key,
      author_name: membership?.name || identity.name,
      body: body.trim(),
    });
    setList((prev) => [...prev, created]);
    setBody("");
    setSending(false);
  };

  const remove = async (id) => {
    await base44.entities.Comment.delete(id);
    setList((prev) => prev.filter((comment) => comment.id !== id));
  };

  return (
    <div className="space-y-3 border-t border-border pt-3">
      {list.length === 0 ? (
        <p className="text-xs text-muted-foreground">No comments yet — be the first to respond.</p>
      ) : (
        list.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                {initials(comment.author_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 rounded-lg bg-secondary/60 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium">{comment.author_name}</p>
                <span className="text-[11px] text-muted-foreground">{timeAgo(comment.created_date)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{comment.body}</p>
            </div>
            {isAdmin || comment.author_key === identity?.member_key ? (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(comment.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
        ))
      )}

      <form onSubmit={submit} className="flex items-center gap-2">
        <Input
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Add a comment…"
          aria-label="Add a comment"
        />
        <Button type="submit" size="icon" disabled={sending || !body.trim()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}