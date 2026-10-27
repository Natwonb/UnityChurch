import React, { useCallback, useEffect, useState } from "react";
import { Newspaper, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import NewsCard from "@/components/news/NewsCard";
import NewsFormDialog from "@/components/news/NewsFormDialog";
import { Button } from "@/components/ui/button";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function News() {
  const { church } = useChurch();
  const [posts, setPosts] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [comments, setComments] = useState([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    if (!church) return;
    setLoading(true);
    const query = { church_id: church.id };
    if (category !== "all") query.category = category;
    const page = await base44.entities.MemberPost.filter(query, { sort: "-created_date", limit: 30 });
    const items = page.items || [];
    setPosts(items);
    const ids = items.map((post) => post.id);
    if (ids.length) {
      const [reactionPage, commentPage] = await Promise.all([
        base44.entities.Reaction.filter({ church_id: church.id, post_id: { $in: ids } }, { limit: 500 }),
        base44.entities.Comment.filter({ church_id: church.id, post_id: { $in: ids } }, { limit: 500 }),
      ]);
      setReactions(reactionPage.items || []);
      setComments(commentPage.items || []);
    } else {
      setReactions([]);
      setComments([]);
    }
    setLoading(false);
  }, [church?.id, category]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member news"
        subtitle="Birthdays, new babies, weddings, graduations, prayer requests, and praise reports — share them with the church family."
      >
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Share news
        </Button>
      </PageHeader>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={cn(
            "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs",
            category === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
          )}
        >
          Everything
        </button>
        {NEWS_CATEGORIES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setCategory(item.value)}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs",
              category === item.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="Nothing on the board yet"
          description="Any member of the church can share news here — a birthday, a new arrival, a prayer request."
        >
          <Button onClick={openNew}>Share news</Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <NewsCard
              key={post.id}
              post={post}
              reactions={reactions.filter((reaction) => reaction.post_id === post.id)}
              comments={comments.filter((comment) => comment.post_id === post.id)}
              onDeleted={(id) => {
                setPosts((prev) => prev.filter((item) => item.id !== id));
                setReactions((prev) => prev.filter((reaction) => reaction.post_id !== id));
                setComments((prev) => prev.filter((comment) => comment.post_id !== id));
              }}
            />
          ))}
        </div>
      )}

      <NewsFormDialog open={formOpen} onOpenChange={setFormOpen} post={editing} onSaved={() => load()} />
    </div>
  );
}