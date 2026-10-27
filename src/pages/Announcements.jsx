import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Megaphone, Plus, ScanLine } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import AnnouncementCard from "@/components/announcements/AnnouncementCard";
import AnnouncementFormDialog from "@/components/announcements/AnnouncementFormDialog";
import FlyerScanDialog from "@/components/announcements/FlyerScanDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { todayISO } from "@/lib/format";

export default function Announcements() {
  const { church, departments, canPublish } = useChurch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [range, setRange] = useState("upcoming");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);

  const load = useCallback(async () => {
    if (!church) return;
    setLoading(true);
    const query = { church_id: church.id };
    if (!canPublish) query.status = "published";
    if (departmentFilter !== "all") query.department_id = departmentFilter;
    if (range === "upcoming") query.event_date = { $gte: todayISO() };
    if (range === "past") query.event_date = { $lt: todayISO() };
    const page = await base44.entities.Announcement.filter(query, {
      sort: range === "past" ? "-event_date" : "event_date",
      limit: 50,
    });
    setAnnouncements(page.items || []);
    setLoading(false);
  }, [church?.id, canPublish, departmentFilter, range]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get("scan") === "1" && canPublish) {
      setScanOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, canPublish, setSearchParams]);

  const openNew = () => {
    setEditing(null);
    setInitialValues(null);
    setFormOpen(true);
  };

  const openEdit = (announcement) => {
    setEditing(announcement);
    setInitialValues(null);
    setFormOpen(true);
  };

  const handleFlyerDraft = (draft) => {
    setScanOpen(false);
    setEditing(null);
    setInitialValues(draft);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upcoming announcements"
        subtitle="Everything the church needs to know, in one feed."
      >
        {canPublish ? (
          <>
            <Button variant="outline" onClick={() => setScanOpen(true)}>
              <ScanLine className="h-4 w-4" />
              Scan a flyer
            </Button>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" />
              New announcement
            </Button>
          </>
        ) : null}
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="all">All announcements</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
          <div className="h-40 animate-pulse rounded-xl bg-secondary" />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements here yet"
          description={
            canPublish
              ? "Take a photo of the paper flyer on the notice board — we'll read it and draft the announcement for you."
              : "When church leadership posts announcements, they'll appear here."
          }
        >
          {canPublish ? (
            <Button onClick={() => setScanOpen(true)}>
              <ScanLine className="h-4 w-4" />
              Scan a flyer
            </Button>
          ) : null}
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onEdit={openEdit}
              onDeleted={(id) => setAnnouncements((prev) => prev.filter((item) => item.id !== id))}
            />
          ))}
        </div>
      )}

      <FlyerScanDialog open={scanOpen} onOpenChange={setScanOpen} onDraft={handleFlyerDraft} />

      <AnnouncementFormDialog
        open={formOpen}
        onOpenChange={(next) => {
          setFormOpen(next);
          if (!next) setInitialValues(null);
        }}
        announcement={editing}
        initialValues={initialValues}
        onSaved={() => load()}
      />
    </div>
  );
}