import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ArrowLeft, CalendarPlus, UserRound } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import PostComposer from "@/components/departments/PostComposer";
import PostCard from "@/components/departments/PostCard";
import EventRow from "@/components/events/EventRow";
import EventFormDialog from "@/components/events/EventFormDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDepartmentColor, getDepartmentIcon } from "@/lib/constants";
import { todayISO } from "@/lib/format";

const EMPTY = [];

export default function DepartmentDetail() {
  const { departmentId } = useParams();
  const { church, departments, members, isLeaderOf, departmentName, loading: churchLoading } = useChurch();
  const department = departments.find((item) => item.id === departmentId);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventOpen, setEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const load = useCallback(async () => {
    if (!church || !departmentId) return;
    setLoading(true);
    const [postPage, eventPage] = await Promise.all([
      base44.entities.Post.filter(
        { church_id: church.id, department_id: departmentId },
        { sort: "-created_date", limit: 30 },
      ),
      base44.entities.Event.filter(
        { church_id: church.id, department_id: departmentId, date: { $gte: todayISO() } },
        { sort: "date", limit: 30 },
      ),
    ]);
    const items = postPage.items || [];
    setPosts(items);
    setEvents(eventPage.items || []);
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
  }, [church?.id, departmentId]);

  useEffect(() => {
    load();
  }, [load]);

  if (churchLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-secondary" />;
  }

  if (!department) {
    return (
      <EmptyState
        title="We couldn't find that department"
        description="It may have been renamed or removed by a church admin."
      >
        <Button asChild>
          <Link to="/departments">Back to departments</Link>
        </Button>
      </EmptyState>
    );
  }

  const Icon = getDepartmentIcon(department.icon);
  const color = getDepartmentColor(department.color);
  const canPost = isLeaderOf(department.id);
  const departmentMembers = members.filter((member) =>
    (member.department_ids || []).includes(department.id),
  );
  const leaders = departmentMembers.filter((member) => member.role === "leader" || member.role === "admin");

  const removeEvent = async (event) => {
    await base44.entities.Event.delete(event.id);
    load();
  };

  return (
    <div className="space-y-6">
      <Link to="/departments" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        All departments
      </Link>

      <div className={`rounded-2xl border ${color.border} ${color.soft} px-6 py-6`}>
        <div className="flex items-start gap-4">
          <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-card ${color.text}`}>
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-2xl md:text-3xl">{department.name}</h1>
            {department.description ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{department.description}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {department.meeting_schedule ? (
                <Badge className={color.badge}>{department.meeting_schedule}</Badge>
              ) : null}
              <Badge variant="outline" className="border-border bg-card text-muted-foreground">
                <UserRound className="mr-1 h-3 w-3" />
                {departmentMembers.length} members
              </Badge>
              {leaders.map((leader) => (
                <Badge key={leader.id} variant="outline" className="border-border bg-card text-muted-foreground">
                  {leader.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="feed">
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4 pt-4">
          {canPost ? (
            <PostComposer department={department} onPosted={(created) => setPosts((prev) => [created, ...prev])} />
          ) : null}
          {loading ? (
            <div className="h-32 animate-pulse rounded-xl bg-secondary" />
          ) : posts.length === 0 ? (
            <EmptyState
              title="No posts in this feed yet"
              description={
                canPost
                  ? "Share the first update with your department."
                  : "Only department leaders and church admins can post here."
              }
            />
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                reactions={reactions.filter((reaction) => reaction.post_id === post.id)}
                comments={comments.filter((comment) => comment.post_id === post.id) || EMPTY}
                onDeleted={(id) => {
                  setPosts((prev) => prev.filter((item) => item.id !== id));
                  setReactions((prev) => prev.filter((reaction) => reaction.post_id !== id));
                  setComments((prev) => prev.filter((comment) => comment.post_id !== id));
                }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4 pt-4">
          {canPost ? (
            <Button
              onClick={() => {
                setEditingEvent(null);
                setEventOpen(true);
              }}
            >
              <CalendarPlus className="h-4 w-4" />
              Schedule a rehearsal or event
            </Button>
          ) : null}
          {events.length === 0 ? (
            <EmptyState
              title="Nothing scheduled"
              description={
                canPost
                  ? "Add rehearsal dates, meeting times, and locations so everyone knows where to be."
                  : "Upcoming rehearsals and meetings for this department will appear here."
              }
            />
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  departmentName={departmentName(event.department_id)}
                  canManage={canPost}
                  onDelete={removeEvent}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EventFormDialog
        open={eventOpen}
        onOpenChange={setEventOpen}
        event={editingEvent}
        defaultDepartmentId={department.id}
        onSaved={() => load()}
      />
    </div>
  );
}