import React, { useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Image } from "@/components/ui/image";
import ReactionBar from "@/components/shared/ReactionBar";
import CommentsSection from "@/components/shared/CommentsSection";
import { initials, timeAgo } from "@/lib/format";

export default function PostCard({ post, reactions, comments, onDeleted }) {
  const { identity, isAdmin, departmentName } = useChurch();
  const [showComments, setShowComments] = useState(false);

  const canManage = isAdmin || post.author_key === identity?.member_key;

  const remove = async () => {
    await base44.entities.Comment.deleteMany({ church_id: post.church_id, post_id: post.id });
    await base44.entities.Reaction.deleteMany({ church_id: post.church_id, post_id: post.id });
    await base44.entities.Post.delete(post.id);
    onDeleted?.(post.id);
  };

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {initials(post.author_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{post.author_name}</p>
              <span className="text-xs text-muted-foreground">{timeAgo(post.created_date)}</span>
              <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">
                {departmentName(post.department_id) || "Department"}
              </Badge>
            </div>
            {post.title ? <p className="mt-2 font-heading text-lg">{post.title}</p> : null}
            <p className="mt-1 whitespace-pre-wrap text-sm">{post.body}</p>
          </div>
          {canManage ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={remove} aria-label="Delete post">
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.title || "Department photo"}
            className="mt-3 h-64 w-full rounded-xl object-cover"
          />
        ) : null}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <ReactionBar postId={post.id} postType="department" reactions={reactions || []} />
          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {(comments || []).length} {showComments ? "Hide" : "Comment"}
          </button>
        </div>

        {showComments ? (
          <div className="mt-3">
            <CommentsSection postId={post.id} postType="department" comments={comments || []} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}