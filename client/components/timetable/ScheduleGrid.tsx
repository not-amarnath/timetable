import React from "react";
import { Assignment, ClassDemand, Timeslot, Teacher, Group, Topic } from "@shared/api";
import { cn } from "@/lib/utils";
import { AlertTriangle, PlusCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

function getColorForString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 85%)`;
}

interface Props {
  timeslots: Timeslot[];
  classes: ClassDemand[];
  assignments: Assignment[];
  teachers: Teacher[];
  groups: Group[];
  topics: Topic[];
  conflicts: string[];
  unscheduled: string[];
  onUpdateAssignments: (newAssignments: Assignment[]) => void;
  onUpdateUnscheduled: (newUnscheduled: string[]) => void;
}

export default function ScheduleGrid({ timeslots, classes, assignments, teachers, groups, topics, conflicts, unscheduled, onUpdateAssignments, onUpdateUnscheduled }: Props) {
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
  
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const uniqueLabels = Array.from(new Set((timeslots ?? []).map(t => t.label))).sort();

  const unscheduledClasses = (unscheduled ?? []).map(id => classesById.get(id)).filter(Boolean) as ClassDemand[];

  const handleManualAssign = (classId: string, timeslotId: string) => {
    onUpdateAssignments([...assignments, { classId, timeslotId }]);
    onUpdateUnscheduled(unscheduled.filter(id => id !== classId));
  };

  return (
    <div className="overflow-x-auto">
      <div className="grid" style={{ gridTemplateColumns: `minmax(140px, 1fr) repeat(${days.length}, minmax(160px, 1fr))` }}>
        <div className="p-3 font-semibold text-muted-foreground border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">Timeslot</div>
        {days.map((d) => (
          <div key={d} className="p-3 font-semibold text-muted-foreground border-b text-center sticky top-0 bg-background/80 backdrop-blur-sm z-10">{d}</div>
        ))}
        
        {uniqueLabels.map((label, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            <div className="p-3 border-b bg-muted/20 text-sm">{label}</div>
            {days.map((day) => {
              const slot = (timeslots ?? []).find(s => s.day === day && s.label === label);
              if (!slot) return <div key={`${day}-${rowIndex}`} className="border-b" />;
              
              const items = bySlot.get(slot.id) ?? [];
              return (
                <div key={slot.id} className="border-b p-2">
                  {items.length > 0 ? (
                    <div className="space-y-2">
                      {items.map((it) => {
                        const c = classesById.get(it.classId);
                        if (!c) return null;
                        
                        const teacherColor = getColorForString(c.teacherId);
                        const isConflict = (conflicts ?? []).includes(c.id);
                        const isMisplaced = c.preferredTimes && c.preferredTimes.length > 0 && !c.preferredTimes.includes(slot.id);

                        return (
                          <div 
                            key={it.classId} 
                            className={cn("rounded-md border p-2 text-xs", isConflict && "border-destructive bg-destructive/20 text-destructive-foreground")}
                            style={isConflict ? {} : { backgroundColor: teacherColor }}
                          >
                            <div className="font-semibold flex items-center gap-1 text-slate-900">
                              {isMisplaced && <AlertTriangle className="h-3 w-3 text-amber-600" aria-label="Not in preferred timeslot" role="img" />}
                              {topicById.get(c.topicId)?.name ?? c.topicId}
                            </div>
                            {/* CORRECTED: Changed to a solid, dark text color for readability */}
                            <div className="text-slate-800">{isConflict ? "CONFLICT" : `Teacher: ${teacherById.get(c.teacherId)?.name ?? c.teacherId}`}</div>
                            <div className="text-slate-800">Group: {groupById.get(c.groupId)?.name ?? c.groupId}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full h-full flex items-center justify-center text-muted-foreground hover:bg-muted rounded-sm transition-colors">
                          <PlusCircle className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold px-2">Assign Unscheduled Class:</p>
                          {unscheduledClasses.length > 0 ? (
                            unscheduledClasses.map(c => (
                              <Button key={c.id} variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleManualAssign(c.id, slot.id)}>
                                {topicById.get(c.topicId)?.name} for {groupById.get(c.groupId)?.name}
                              </Button>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground px-2">No unscheduled classes.</p>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}