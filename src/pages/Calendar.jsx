import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarPlus, ListChecks } from "lucide-react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import { useChurch } from "@/lib/ChurchContext";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import CalendarMonth from "@/components/events/CalendarMonth";
import EventRow from "@/components/events/EventRow";
import EventFormDialog from "@/components/events/EventFormDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDayLabel, todayISO } from "@/lib/format";

export default function ChurchCalendar() {
  const { church, departments, departmentName, canPublish, isAdmin, myDepartments } = useChurch();
  const [month, setMonth] = useState(() => moment().startOf("month"));
  const [selected, setSelected] = useState(() => todayISO());
  const [events, setEvents] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [eventOpen, setEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const gridRange = useMemo(() => {
    const start = month.clone().startOf("month").startOf("week");
    const end = month.clone().endOf("month").endOf("week");
    return {
      startISO: start.format("YYYY-MM-DD"),
      endISO: end.format("YYYY-MM-DD"),
      weeks: (() => {
        const days = [];
        const cursor = start.clone();
        while (cursor.isSameOrBefore(end, "day")) {
          days.push(cursor.clone());
          cursor.add(1, "day");
        }
        const result = [];
        for (let index = 0; index < days.length; index += 7) {
          result.push(
            days.slice(index, index + 7).map((day) => ({
              iso: day.format("YYYY-MM-DD"),
              dayNumber: day.date(),
              inMonth: day.month() === month.month(),
              isToday: day.isSame(moment(), "day"),
            })),
          );
        }
        return result;
      })(),
    };
  }, [month]);

  const load = useCallback(async () => {
    if (!church) return;
    setLoading(true);
    const query = { church_id: church.id };
    if (departmentFilter !== "all") query.department_id = departmentFilter;
    const [monthPage, upcomingPage] = await Promise.all([
      base44.entities.Event.filter(
        { ...query, date: { $gte: gridRange.startISO, $lte: gridRange.endISO } },
        { sort: "date", limit: 200 },
      ),
      base44.entities.Event.filter({ ...query, date: { $gte: todayISO() } }, { sort: "date", limit: 10 }),
    ]);
    setEvents(monthPage.items || []);
    setUpcoming(upcomingPage.items || []);
    setLoading(false);
  }, [church?.id, departmentFilter, gridRange.startISO, gridRange.endISO]);

  useEffect(() => {
    load();
  }, [load]);

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      if (!event.date) return;
      map[event.date] = [...(map[event.date] || []), event];
    });
    return map;
  }, [events]);

  const selectedEvents = eventsByDay[selected] || [];

  const removeEvent = async (event) => {
    await base44.entities.Event.delete(event.id);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Church calendar"
        subtitle="Rehearsals, services, meetings, and outreach in one view."
      >
        {canPublish ? (
          <Button
            onClick={() => {
              setEditingEvent(null);
              setEventOpen(true);
            }}
          >
            <CalendarPlus className="h-4 w-4" />
            Schedule an event
          </Button>
        ) : null}
      </PageHeader>

      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
        <SelectTrigger className="w-[220px]">
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

      {loading ? (
        <div className="h-80 animate-pulse rounded-xl bg-secondary" />
      ) : (
        <CalendarMonth
          monthLabel={month.format("MMMM YYYY")}
          weeks={gridRange.weeks}
          eventsByDay={eventsByDay}
          selectedDate={selected}
          onSelectDate={setSelected}
          onPrev={() => setMonth((prev) => prev.clone().subtract(1, "month"))}
          onNext={() => setMonth((prev) => prev.clone().add(1, "month"))}
        />
      )}

      <section>
        <h2 className="mb-3 font-heading text-xl">{formatDayLabel(selected)}</h2>
        {selectedEvents.length === 0 ? (
          <EmptyState icon={ListChecks} title="Nothing scheduled that day" description="Pick another day or add an event." />
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                departmentName={departmentName(event.department_id)}
                canManage={canPublish}
                onDelete={removeEvent}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-heading text-xl">What's coming up</h2>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="No upcoming events"
            description="Department leaders can schedule rehearsals and services from here."
          />
        ) : (
          <div className="space-y-3">
            {upcoming.map((event) => (
              <EventRow key={event.id} event={event} departmentName={departmentName(event.department_id)} />
            ))}
          </div>
        )}
      </section>

      <EventFormDialog
        open={eventOpen}
        onOpenChange={setEventOpen}
        event={editingEvent}
        allowedDepartmentIds={isAdmin ? undefined : myDepartments}
        onSaved={() => load()}
      />
    </div>
  );
}