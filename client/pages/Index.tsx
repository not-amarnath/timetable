import { useEffect, useRef, useState } from "react";
import EntityEditors, { EditorsState } from "@/components/timetable/EntityEditors";
import ScheduleGrid from "@/components/timetable/ScheduleGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Assignment, ClassDemand, Group, SolveRequest, SolveResponse, Teacher, Timeslot, Topic } from "@shared/api";

const LS_KEY = "clashless:state";

function getSampleData(): EditorsState {
  const timeslots: Timeslot[] = [ { id: "mon-1", day: "Mon", label: "09:00–10:00" }, { id: "mon-2", day: "Mon", label: "10:00–11:00" }, { id: "mon-3", day: "Mon", label: "11:00–12:00" }, { id: "tue-1", day: "Tue", label: "09:00–10:00" }, { id: "tue-2", day: "Tue", label: "10:00–11:00" }, { id: "tue-3", day: "Tue", label: "11:00–12:00" }, { id: "wed-1", day: "Wed", label: "09:00–10:00" }, { id: "wed-2", day: "Wed", label: "10:00–11:00" }, { id: "wed-3", day: "Wed", label: "11:00–12:00" }, ];
  const teachers: Teacher[] = [ { id: "t-alan", name: "Alan T.", availability: ["mon-1", "mon-2", "tue-1", "wed-2"] }, { id: "t-ada", name: "Ada L.", availability: ["mon-2", "mon-3", "tue-2", "wed-1", "wed-2"] }, ];
  const groups: Group[] = [{ id: "g-a", name: "Group A" }, { id: "g-b", name: "Group B" }];
  const topics: Topic[] = [{ id: "Algebra", name: "Algebra" }, { id: "Biology", name: "Biology" }, { id: "History", name: "History" }];
  const classes: ClassDemand[] = [ { id: "c-1", groupId: "g-a", teacherId: "t-alan", topicId: "Algebra", preferredTimes: ["mon-1", "tue-1"] }, { id: "c-2", groupId: "g-b", teacherId: "t-ada", topicId: "Biology", preferredTimes: ["mon-2"] }, { id: "c-3", groupId: "g-a", teacherId: "t-ada", topicId: "History" }, ];
  return { teachers, groups, topics, timeslots, classes };
}

export default function Index() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [classes, setClasses] = useState<ClassDemand[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [unscheduled, setUnscheduled] = useState<string[]>([]);
  const [score, setScore] = useState<{ hardConflicts: number; softPreferencesSatisfied: number } | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => { try { const raw = localStorage.getItem(LS_KEY); if (raw) { const s = JSON.parse(raw) as EditorsState; setTeachers(s.teachers ?? []); setGroups(s.groups ?? []); setTopics(s.topics ?? []); setTimeslots(s.timeslots ?? []); setClasses(s.classes ?? []); } } catch { } }, []);
  useEffect(() => { const s: EditorsState = { teachers, groups, topics, timeslots, classes }; localStorage.setItem(LS_KEY, JSON.stringify(s)); }, [teachers, groups, topics, timeslots, classes]);

  const fileRef = useRef<HTMLInputElement | null>(null);
  function testSolve() { if (loading) return; prefill(); setTimeout(() => runSolve(), 0); }
  function prefill() { const s = getSampleData(); setTimeslots(s.timeslots); setTeachers(s.teachers); setGroups(s.groups); setTopics(s.topics); setClasses(s.classes); }
  async function runSolve() { setLoading(true); try { const payload: SolveRequest = { timeslots, teachers, groups, topics, classes }; const res = await fetch("/api/solve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const data = (await res.json()) as SolveResponse; setAssignments(data.assignments ?? []); setConflicts(data.conflicts ?? []); setUnscheduled(data.unscheduled ?? []); setScore(data.score); } catch (e) { setConflicts(["Failed to contact solver API."]); setAssignments([]); setUnscheduled([]); } finally { setLoading(false); } }
  const editorsState: EditorsState = { teachers, groups, topics, timeslots, classes };

  const shouldShowResults = (assignments && assignments.length > 0) || (conflicts && conflicts.length > 0) || (unscheduled && unscheduled.length > 0);

  return (
    // CORRECTED: Added flex-grow to the main container
    <div className="bg-grid min-h-[calc(100dvh-4rem)] flex flex-col flex-grow">
      <section className="container py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              Timetabling engine for constraint solving
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Visually build and refine your perfect schedule
            </h1>
            <p className="mt-4 text-muted-foreground max-w-prose">
              Interactively model your constraints with instant feedback on conflicts. Let the solver generate an optimal schedule, then manually place any remaining classes to achieve the perfect result.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={runSolve} disabled={loading} className="shadow-lg shadow-primary/20">{loading ? "Solving…" : "Run solver"}</Button>
              <Button variant="outline" onClick={prefill}>Load sample data</Button>
              <Button variant="secondary" onClick={testSolve} disabled={loading}>Test solve</Button>
            </div>
          </div>
          <div className="min-w-0">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardContent className="p-2 sm:p-4">
                <ScheduleGrid 
                  timeslots={timeslots} 
                  classes={classes} 
                  assignments={assignments} 
                  teachers={teachers} 
                  groups={groups} 
                  topics={topics} 
                  conflicts={conflicts}
                  unscheduled={unscheduled}
                  onUpdateAssignments={setAssignments}
                  onUpdateUnscheduled={setUnscheduled}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container pb-12">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="text-sm text-muted-foreground">Manage your data (autosaves to your browser).</div>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const s = JSON.parse(String(reader.result)) as EditorsState;
                  setTeachers(s.teachers ?? []); setGroups(s.groups ?? []); setTopics(s.topics ?? []);
                  setTimeslots(s.timeslots ?? []); setClasses(s.classes ?? []);
                } catch { }
              };
              reader.readAsText(f);
              e.currentTarget.value = "";
            }} />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>Import JSON</Button>
            <Button variant="outline" onClick={() => {
              const s: EditorsState = { teachers, groups, topics, timeslots, classes };
              const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "timetable-data.json"; a.click();
              URL.revokeObjectURL(url);
            }}>Export JSON</Button>
            <Button variant="ghost" onClick={() => { setTeachers([]); setGroups([]); setTopics([]); setTimeslots([]); setClasses([]); setAssignments([]); setConflicts([]); setUnscheduled([]); }}>Clear</Button>
          </div>
        </div>
        <EntityEditors {...editorsState} onChange={(s) => { setTeachers(s.teachers); setGroups(s.groups); setTopics(s.topics); setTimeslots(s.timeslots); setClasses(s.classes); }} onPrefill={prefill} />
      </section>
      
      {shouldShowResults && (
        <section className="container pb-12">
          
            <Card>
            <CardContent className="p-4 space-y-3">
              <div className="text-sm">
                <span className="font-medium">Results:</span> Assigned {assignments.length}/{classes.length} classes.
              </div>
              
              {conflicts && conflicts.length > 0 && (
                <div className="text-sm text-destructive">
                  <span className="font-medium">Conflicts:</span>
                  <ul className="list-disc pl-5">
                    {conflicts.map((c, i) => (<li key={i}>{c}</li>))}
                  </ul>
                </div>
              )}

              {unscheduled && unscheduled.length > 0 && (
                <div className="text-sm text-amber-600">
                  <span className="font-medium">⚠️ Unscheduled Classes:</span>
                  <ul className="list-disc pl-5">
                    {unscheduled.map(classId => {
                      const classInfo = classes.find(c => c.id === classId);
                      if (!classInfo) return <li key={classId}>{classId} (Unknown)</li>;
                      
                      const topicName = topics.find(t => t.id === classInfo.topicId)?.name ?? classInfo.topicId;
                      const groupName = groups.find(g => g.id === classInfo.groupId)?.name ?? classInfo.groupId;
                      
                      return <li key={classId}>{topicName} for {groupName}</li>;
                    })}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}