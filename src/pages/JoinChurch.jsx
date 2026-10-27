import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Church as ChurchIcon, Loader2, MapPin, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { saveIdentity } from "@/lib/identity";

export default function JoinChurch() {
  const navigate = useNavigate();
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", code: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [existing] = useState(() => {
    try {
      const raw = localStorage.getItem("churchhub_identity");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const loadChurches = async (searchTerm) => {
    setLoading(true);
    const page = await base44.entities.Church.filter(
      searchTerm ? { name: { $regex: searchTerm } } : {},
      { sort: "name", limit: 20 },
    );
    setChurches(page.items || []);
    setLoading(false);
  };

  useEffect(() => {
    loadChurches("");
  }, []);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submitSearch = (event) => {
    event.preventDefault();
    loadChurches(query.trim());
  };

  const joinChurch = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("Your name and email are required.");
      return;
    }
    setSaving(true);
    try {
      const response = await base44.functions.invoke("joinChurch", {
        church_id: selected.id,
        join_code: form.code.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      const membership = response.data?.membership;
      if (!membership) {
        throw new Error("We couldn't complete your request. Please try again.");
      }
      saveIdentity({
        member_key: membership.member_key,
        name: membership.name,
        email: membership.email,
        church_id: membership.church_id,
        church_name: selected.name,
      });
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "We couldn't complete your request. Please try again.");
      setSaving(false);
    }
  };

  if (existing?.church_id) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 md:px-8">
        <div className="mx-auto max-w-lg">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to the home page
          </Link>
          <Card className="mt-6">
            <CardContent className="pt-8 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ChurchIcon className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-heading text-2xl">You're already part of {existing.church_name}</h1>
              <p className="text-sm text-muted-foreground">
                This device is signed into that church space. Leave it first if you want to join a
                different church here.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link to="/home">Open {existing.church_name}</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem("churchhub_identity");
                    setSelected(null);
                    loadChurches("");
                    navigate("/join");
                  }}
                >
                  Leave and join another church
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to the home page
        </Link>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl">Join your church</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Find your church below, then tell us who you are.
            </p>
          </div>
          <Link to="/register-church" className={cn(buttonVariants({ variant: "outline" }))}>
            My church isn't here yet
          </Link>
        </div>

        {!selected ? (
          <div className="mt-8 space-y-4">
            <form onSubmit={submitSearch} className="flex gap-2">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by church name"
                aria-label="Search churches"
              />
              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </form>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : churches.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="font-heading text-lg">No church found with that name</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a different search, or register your church to start its space.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link to="/register-church">Register your church</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {churches.map((church) => (
                  <Card key={church.id}>
                    <CardContent className="flex items-start gap-3 pt-5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <ChurchIcon className="h-5 w-5 text-primary" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-lg leading-tight">{church.name}</p>
                        {church.city || church.state ? (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {[church.city, church.state].filter(Boolean).join(", ")}
                          </p>
                        ) : null}
                        {church.tagline ? (
                          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{church.tagline}</p>
                        ) : null}
                        <Button
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            setSelected(church);
                            setError("");
                          }}
                        >
                          Join this church
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <ChurchIcon className="h-5 w-5 text-primary" />
                  </span>
                  <div>
                    <p className="font-heading text-lg leading-tight">{selected.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[selected.city, selected.state].filter(Boolean).join(", ") || "Church space"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                  Choose another church
                </Button>
              </div>

              <form onSubmit={joinChurch} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="member-name">Your name *</Label>
                    <Input id="member-name" value={form.name} onChange={set("name")} placeholder="Mary Johnson" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-email">Your email *</Label>
                    <Input
                      id="member-email"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="member-phone">Phone</Label>
                    <Input id="member-phone" value={form.phone} onChange={set("phone")} placeholder="(555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-code">Church join code</Label>
                    <Input
                      id="member-code"
                      value={form.code}
                      onChange={set("code")}
                      placeholder="Ask your church admin"
                      className="uppercase"
                    />
                    <p className="text-xs text-muted-foreground">
                      Without the code, your request goes to the church admin for approval.
                    </p>
                  </div>
                </div>

                {error ? (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
                ) : null}

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? "Joining…" : `Join ${selected.name}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}