import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Church as ChurchIcon,
  Gift,
  MapPin,
  Newspaper,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getIdentity } from "@/lib/identity";

const FEATURES = [
  {
    Icon: Camera,
    title: "Flyer to announcement",
    text: "Snap a photo of the paper flyer. ChurchHub reads it and drafts the announcement — title, date, time, and place.",
  },
  {
    Icon: Users,
    title: "Department feeds",
    text: "Choir, Brotherhood, Sisterhood, Youth, and Musicians each get a feed with their own leaders posting.",
  },
  {
    Icon: CalendarDays,
    title: "Rehearsal calendar",
    text: "Schedule rehearsals, services, and meetings. Every member sees what is coming and where to be.",
  },
  {
    Icon: Newspaper,
    title: "Member news",
    text: "Birthdays, new babies, weddings, graduations, prayer requests — the family news board for your church.",
  },
  {
    Icon: Gift,
    title: "Tithes and offerings",
    text: "Members record their giving and keep a private history. Church admins see the full giving record.",
  },
  {
    Icon: ChurchIcon,
    title: "Your own private space",
    text: "Every church gets its own space with its own members, departments, and announcements.",
  },
];

const STEPS = [
  { step: "1", title: "Register your church", text: "Create your church space with its name and address." },
  { step: "2", title: "Invite your congregation", text: "Share your join code so members can join in seconds." },
  { step: "3", title: "Post, schedule, and give", text: "Leaders publish, members react, everyone stays in step." },
];

export default function Landing() {
  const identity = getIdentity();
  const inChurch = Boolean(identity?.church_id);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ChurchIcon className="h-5 w-5" />
            </span>
            <span className="font-heading text-lg font-semibold">ChurchHub</span>
          </Link>
          <div className="flex items-center gap-2">
            {inChurch ? (
              <Button asChild>
                <Link to="/home">Open my church space</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link to="/join">Join a church</Link>
                </Button>
                <Button asChild>
                  <Link to="/register-church">Register your church</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border/70">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -right-16 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-2 md:items-center md:px-8 md:py-20">
          <div>
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">
              For churches of every size
            </Badge>
            <h1 className="mt-4 font-heading text-4xl leading-tight md:text-5xl">
              One home for your church family
            </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              Announcements, department life, rehearsal schedules, member news, and giving — gathered in
              one place instead of paper flyers and scattered group chats. Every church gets its own
              private space.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to={inChurch ? "/home" : "/register-church"}>
                  {inChurch ? "Open my church space" : "Register your church"}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/join">Join your church</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="rotate-[-4deg] rounded-2xl border border-border bg-card p-3 shadow-xl">
              <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/80 to-accent/70 p-4 text-center">
                <div>
                  <Camera className="mx-auto h-6 w-6 text-primary-foreground/90" />
                  <p className="mt-2 font-heading text-lg text-primary-foreground">
                    Choir Rehearsal
                  </p>
                  <p className="text-xs text-primary-foreground/80">Thursday · 7:00 PM · Fellowship Hall</p>
                </div>
              </div>
              <p className="mt-2 px-1 text-center text-xs text-muted-foreground">
                A photo of the flyer on the notice board
              </p>
            </div>
            <div className="absolute -bottom-6 -left-2 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-md">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Read and drafted in seconds</span>
            </div>
            <div className="ml-10 mt-12 rounded-2xl border border-border bg-card p-4 shadow-xl">
              <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">Choir</Badge>
              <p className="mt-2 font-heading text-lg">Choir Rehearsal</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                Tomorrow · 7:00 PM
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Fellowship Hall
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <h2 className="font-heading text-3xl">Built for the way your church already works</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Six pieces that replace the notice board, the group chat, and the paper pile.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }) => (
            <Card key={title}>
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-3 font-heading text-lg">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
          <h2 className="font-heading text-3xl">Getting started takes minutes</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ step, title, text }) => (
              <div key={step} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-primary-foreground">
                  {step}
                </span>
                <div>
                  <p className="font-heading text-lg">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/85 px-6 py-10 text-center md:px-12">
          <h2 className="font-heading text-3xl text-primary-foreground">
            Bring your church into one place
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/85">
            Register your church and share your join code with the congregation. Members join with their
            name and email — no paperwork.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register-church">Register your church</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <Link to="/join">Join a church</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/70 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <span className="flex items-center gap-2">
            <ChurchIcon className="h-4 w-4" />
            ChurchHub
          </span>
          <span>Each church keeps its own space, members, and records.</span>
        </div>
      </footer>
    </div>
  );
}