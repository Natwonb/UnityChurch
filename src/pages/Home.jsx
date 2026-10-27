import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Gift,
  Megaphone,
  Newspaper,
  ScanLine,
  UserCheck,
  Users,
} from "lucide-react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";
import EventRow from "@/components/events/EventRow";
import PostCard from "@/components/departments/PostCard";
import NewsCard from "@/components/news/NewsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { money, todayISO } from "@/lib/format";

const greeting = () => {
  const hour = moment().hour();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export default function Home() {
  const { church, membership, identity, isAdmin, canPublish, departmentName } = useChurch();
  const [data, setData] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const load = useCallback(async () => {
    if (!church || !identity) return;
    const today = todayISO();
    const [upcoming, latest, events, posts, news, myTotals, memberTotal] = await Promise.all([
      base44.entities.Announcement.filter(
        { church_id: church.id, status: "published", event_date: { $gte: today } },
        { sort: "event_date", limit: 3 },
      ),
      base44.entities.Announcement.filter(
        { church_id: church.id, status: "published" },
        { sort: "-created_date", limit: 4 },
      ),
      base44.entities.Event.filter({ church_id: church.id, date: { $gte: today } }, { sort: "date", limit: 4 }),
      base44.entities.Post.filter({ church_id: church.id }, { sort: "-created_date", limit: 2 }),
      base44.entities.MemberPost.filter({ church_id: church.id }, { sort: "-created_date", limit: 2 }),
      base44.entities.Giving.aggregate({
        query: { church_id: church.id, member_key: identity.member_key },
        sum: ["amount"],
      }),
      base44.entities.Membership.count({ church_id: church.id, status: "active" }),
    ]);
    setData({
      upcoming: upcoming.items || [],
      latest: latest.items || [],
      events: events.items || [],
      posts: posts.items || [],
      news: news.items || [],
      myGiving: myTotals.rows?.[0]?.sum_amount || 0,
      memberTotal,
    });
  }, [church?.id, identity?.member_key]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isAdmin || !church) return;
    base44.entities.Membership.count({ church_id: church.id, status: "pending" }).then(setPendingCount);
  }, [isAdmin, church?.id, data]);

  const firstName = (membership?.name || identity?.name || "").split(" ")[0];

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/85 px-6 py-7 text-primary-foreground">
        <p className="text-xs uppercase tracking-widest text-primary-foreground/70">
          {moment().format("dddd, MMMM D")}
        </p>
        <h1 className="mt-2 font-heading text-2xl md:text-3xl">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-primary-foreground/85">
          {church.welcome_message ||
            `${church.name} — announcements, departments, rehearsals, and giving, all in one place.`}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {canPublish ? (
            <Button variant="secondary" size="sm" asChild>
              <Link to="/announcements?scan=1">
                <ScanLine className="h-4 w-4" />
                Scan a flyer
              </Link>
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            asChild
          >
            <Link to="/calendar">
              <CalendarDays className="h-4 w-4" />
              See the calendar
            </Link>
          </Button>
        </div>
      </div>

      {isAdmin && pendingCount > 0 ? (
        <Card className="border-accent/40 bg-accent/10">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <p className="text-sm">
              <UserCheck className="mr-2 inline h-4 w-4" />
              {pendingCount} member {pendingCount === 1 ? "request is" : "requests are"} waiting for your
              approval.
            </p>
            <Button size="sm" asChild>
              <Link to="/members">Review requests</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={CalendarDays}
          label="Coming up"
          value={data ? data.events.length : "—"}
          hint="rehearsals & services"
        />
        <StatCard icon={Users} label="Members" value={data ? data.memberTotal : "—"} hint="in your church space" />
        <StatCard
          icon={Gift}
          label="My giving"
          value={data ? money(data.myGiving) : "—"}
          hint="recorded in your history"
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-xl">Upcoming announcements</h2>
          <Link to="/announcements" className="text-sm text-primary underline">
            View all
          </Link>
        </div>
        {!data ? (
          <div className="h-32 animate-pulse rounded-xl bg-secondary" />
        ) : data.upcoming.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="Nothing on the calendar yet"
            description="When leaders publish announcements, they'll show up here for the whole church."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.upcoming.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} showActions={false} />
            ))}
          </div>
        )}
      </section>

      {data && data.latest.filter((item) => !data.upcoming.some((up) => up.id === item.id)).length ? (
        <section>
          <h2 className="mb-3 font-heading text-xl">Latest from leadership</h2>
          <div className="space-y-3">
            {data.latest
              .filter((item) => !data.upcoming.some((up) => up.id === item.id))
              .slice(0, 2)
              .map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} showActions={false} />
              ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-xl">Rehearsals & events</h2>
          <Link to="/calendar" className="text-sm text-primary underline">
            Open calendar
          </Link>
        </div>
        {data && data.events.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No events scheduled"
            description="Department leaders can add rehearsals, services, and meetings to the church calendar."
          />
        ) : (
          <div className="space-y-3">
            {(data?.events || []).map((event) => (
              <EventRow key={event.id} event={event} departmentName={departmentName(event.department_id)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-xl">Latest from your departments</h2>
          <Link to="/departments" className="text-sm text-primary underline">
            All departments
          </Link>
        </div>
        {data && data.posts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No department updates yet"
            description="Department leaders can post news, notes, and rehearsal reminders to their feed."
          />
        ) : (
          <div className="space-y-3">
            {(data?.posts || []).map((post) => (
              <PostCard key={post.id} post={post} onDeleted={() => load()} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-xl">Member news</h2>
          <Link to="/news" className="text-sm text-primary underline">
            Open the board
          </Link>
        </div>
        {data && data.news.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="The news board is quiet"
            description="Share a birthday, a new baby, a prayer request, or a praise report with the church family."
          >
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">
              Any member can post here
            </Badge>
          </EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(data?.news || []).map((post) => (
              <NewsCard key={post.id} post={post} onDeleted={() => load()} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}