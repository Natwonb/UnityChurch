import React, { useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Image } from "@/components/ui/image";
import ReactionBar from "@/components/shared/ReactionBar";
import CommentsSection from "@/components/shared/CommentsSection";
import { newsCategory } from "@/lib/constants";
import { initials, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function NewsCard({ post, reactions, comments, onDeleted }) {
  const { identity, isAdmin } = useChurch();
  const [showComments, setShowComments] = useState(false);
  const category = newsCategory(post.category);
  const CategoryIcon = category.icon;
  const canManage = isAdmin || post.author_key === identity?.member_key;

  const remove = async () => {
    await base44.entities.Comment.deleteMany({ church_id: post.church_id, post_id: post.id });
    await base44.entities.Reaction.deleteMany({ church_id: post.church_id, post_id: post.id });
    await base44.entities.MemberPost.delete(post.id);
    onDeleted?.(post.id);
  };

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col pt-5">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", category.className)}>
            <CategoryIcon className="h-3.5 w-3.5" />
            {category.label}
          </span>
          {canManage ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={remove} aria-label="Delete post">
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <p className="mt-3 font-heading text-lg leading-snug">{post.title}</p>
        {post.body ? <p className="mt-2 flex-1 whitespace-pre-wrap text-sm text-muted-foreground">{post.body}</p> : null}

        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.title}
            className="mt-3 h-48 w-full rounded-xl object-cover"
            fittingType="fill"
          />
        ) : null}

        <div className="mt-3 flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-secondary text-[10px]">{initials(post.author_name)}</AvatarFallback>
          </Avatar>
          <p className="text-xs text-muted-foreground">
            {post.author_name} · {timeAgo(post.created_date)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <ReactionBar postId={post.id} postType="news" reactions={reactions || []} />
          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {(comments || []).length}
          </button>
        </div>

        {showComments ? (
          <div className="mt-3">
            <CommentsSection postId={post.id} postType="news" comments={comments || []} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}