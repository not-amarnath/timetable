import React from "react";
import { Assignment, ClassDemand, Timeslot, Teacher, Group, Topic } from "@shared/api";

interface Props {
  timeslots: Timeslot[];
  classes: ClassDemand[];
  assignments: Assignment[];
  teachers: Teacher[];
  groups: Group[];
  topics: Topic[];
}

export default function ScheduleGrid({ timeslots, classes, assignments, teachers, groups, topics }: Props) {
  const classesById = new Map((classes ?? []).map((c) => [c.id, c]));
  const teacherById = new Map((teachers ?? []).map((t) => [t.id, t]));
  const groupById = new Map((groups ?? []).map((g) => [g.id, g]));
  const topicById = new Map((topics ?? []).map((p) => [p.id, p]));
  const bySlot = new Map<string, { classId: string }[]>();
  for (const a of (assignments ?? [])) {
    if (!a) continue;
    const arr = bySlot.get(a.timeslotId) ?? [];
    arr.push({ classId: a.classId });
    bySlot.set(a.timeslotId, arr);
  }
  const days = Array.from(new Set((timeslots ?? []).map((t) => t.day)));
  const timesByDay = new Map<string, Timeslot[]>(
    days.map((d) => [d, (timeslots ?? []).filter((t) => t.day === d).sort((a, b) => a.label.localeCompare(b.label))]),
  );

  const maxRows = days.reduce((m, d) => Math.max(m, (timesByDay.get(d) ?? []).length), 0);

  return (
    <div className="w-full overflow-auto">
      <div className="min-w-[720px]">
        <div className="grid" style={{ gridTemplateColumns: `160px repeat(${days.length}, minmax(160px, 1fr))` }}>
          <div className="p-3 font-semibold text-muted-foreground border-b">Timeslot</div>
          {days.map((d) => (
            <div key={d} className="p-3 font-semibold text-muted-foreground border-b text-center">
              {d}
            </div>
          ))}
          {/* Rows */}
          {Array.from({ length: maxRows }).map((_, rowIndex) => {
            const labelSlot = days.map((d) => (timesByDay.get(d) ?? [])[rowIndex]).find(Boolean);
            const rowLabel = labelSlot?.label ?? `Slot ${rowIndex + 1}`;
            return (
              <React.Fragment key={`row-${rowIndex}`}>
                <div className="p-3 border-b bg-muted/40 text-sm">{rowLabel}</div>
                {days.map((d) => {
                  const slot = (timesByDay.get(d) ?? [])[rowIndex];
                  if (!slot) return <div key={`${d}-${rowIndex}`} className="border-b" />;
                  const items = bySlot.get(slot.id) ?? [];
                  return (
                    <div key={slot.id} className="border-b p-2">
                      {items.length === 0 ? (
                        <div className="text-xs text-muted-foreground italic">—</div>
                      ) : (
                        <div className="space-y-2">
                          {items.map((it) => {
                            const c = classesById.get(it.classId);
                            if (!c) return null;
                            return (
                              <div key={it.classId} className="rounded-md border bg-card p-2 text-xs">
                                <div className="font-semibold">{topicById.get(c.topicId)?.name ?? c.topicId}</div>
                                <div className="text-muted-foreground">Teacher: {teacherById.get(c.teacherId)?.name ?? c.teacherId}</div>
                                <div className="text-muted-foreground">Group: {groupById.get(c.groupId)?.name ?? c.groupId}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
