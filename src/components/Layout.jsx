import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  CalendarDays,
  Church as ChurchIcon,
  Gift,
  Home,
  LogOut,
  Megaphone,
  MoreVertical,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";
import { ChurchProvider, useChurch } from "@/lib/ChurchContext";
import ChurchGate from "@/components/ChurchGate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

const MAIN_NAV = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/announcements", label: "Announcements", Icon: Megaphone },
  { to: "/departments", label: "Departments", Icon: Users },
  { to: "/calendar", label: "Calendar", Icon: CalendarDays },
  { to: "/giving", label: "Giving", Icon: Gift },
];

const ROLE_LABELS = { admin: "Church Admin", leader: "Department Leader", member: "Member" };

function ChurchIdentity() {
  const { church } = useChurch();
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 rounded-xl bg-accent">
        {church.logo_url ? <AvatarImage src={church.logo_url} alt={church.name} /> : null}
        <AvatarFallback className="rounded-xl bg-accent/90 font-heading text-accent-foreground">
          <ChurchIcon className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-heading text-sm font-semibold leading-tight">{church.name}</p>
        {church.city ? <p className="truncate text-xs opacity-70">{church.city}</p> : null}
      </div>
    </div>
  );
}

function Sidebar() {
  const { church, membership, departmentName, isAdmin, leaveChurch } = useChurch();
  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col bg-sidebar text-sidebar-foreground min-h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-sidebar-border">
        <ChurchIdentity />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {MAIN_NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
        <div className="pt-4 mt-4 border-t border-sidebar-border space-y-1">
          <NavLink
            to="/news"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )
            }
          >
            <Newspaper className="h-4 w-4" />
            Member News
          </NavLink>
          <NavLink
            to="/members"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )
            }
          >
            <Users className="h-4 w-4" />
            Members
          </NavLink>
          {isAdmin ? (
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )
              }
            >
              <Settings className="h-4 w-4" />
              Church Settings
            </NavLink>
          ) : null}
        </div>
      </nav>
      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        <div className="rounded-lg bg-sidebar-accent/50 px-3 py-2">
          <p className="truncate text-sm font-medium">{membership?.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <Badge variant="outline" className="border-sidebar-border text-sidebar-foreground">
              {ROLE_LABELS[membership?.role] || "Member"}
            </Badge>
          </div>
          {membership?.role === "leader" && (membership?.department_ids || []).length ? (
            <p className="mt-1 truncate text-xs opacity-70">
              Leads {membership.department_ids.map((id) => departmentName(id)).filter(Boolean).join(", ")}
            </p>
          ) : null}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={leaveChurch}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Leave {church.name}
        </Button>
      </div>
    </aside>
  );
}

function MobileHeader() {
  const { church, isAdmin, leaveChurch } = useChurch();
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 bg-sidebar px-4 py-3 text-sidebar-foreground">
      <ChurchIdentity />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>More</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link to="/news">
              <Newspaper className="h-4 w-4" />
              Member News
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/members">
              <Users className="h-4 w-4" />
              Members
            </Link>
          </DropdownMenuItem>
          {isAdmin ? (
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                Church Settings
              </Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={leaveChurch}>
            <LogOut className="h-4 w-4" />
            Leave {church.name}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 border-t border-border bg-card">
      {MAIN_NAV.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 py-2 text-[11px] font-medium",
              isActive ? "text-primary" : "text-muted-foreground",
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Shell() {
  const { loading, church, membership, identity } = useChurch();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-primary" />
      </div>
    );
  }

  if (!identity?.church_id || !church || !membership || membership.status === "pending") {
    return <ChurchGate />;
  }

  return (
    <div className="min-h-screen bg-background md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileHeader />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10 pb-24 md:pb-10">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <ChurchProvider>
      <Shell />
    </ChurchProvider>
  );
}