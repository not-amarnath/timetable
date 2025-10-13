import { useEffect, useMemo, useRef, useState } from "react";
import EntityEditors, { EditorsState } from "@/components/timetable/EntityEditors";
import ScheduleGrid from "@/components/timetable/ScheduleGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const LS_KEY = "clashless:state";
import type { Assignment, ClassDemand, Group, SolveRequest, SolveResponse, Teacher, Timeslot, Topic } from "@shared/api";

function getSampleData(): EditorsState {
  const timeslots: Timeslot[] = [
    { id: "mon-1", day: "Mon", label: "09:00–10:00" },
    { id: "mon-2", day: "Mon", label: "10:00–11:00" },
    { id: "mon-3", day: "Mon", label: "11:00–12:00" },
    { id: "tue-1", day: "Tue", label: "09:00–10:00" },
    { id: "tue-2", day: "Tue", label: "10:00–11:00" },
    { id: "tue-3", day: "Tue", label: "11:00–12:00" },
    { id: "wed-1", day: "Wed", label: "09:00–10:00" },
    { id: "wed-2", day: "Wed", label: "10:00–11:00" },
    { id: "wed-3", day: "Wed", label: "11:00–12:00" },
  ];
  const teachers: Teacher[] = [
    { id: "t-alan", name: "Alan T.", availability: ["mon-1", "mon-2", "tue-1", "wed-2"] },
    { id: "t-ada", name: "Ada L.", availability: ["mon-2", "mon-3", "tue-2", "wed-1", "wed-2"] },
  ];
  const groups: Group[] = [
    { id: "g-a", name: "Group A" },
    { id: "g-b", name: "Group B" },
  ];
  const topics: Topic[] = [
    { id: "Algebra", name: "Algebra" },
    { id: "Biology", name: "Biology" },
    { id: "History", name: "History" },
  ];
  const classes: ClassDemand[] = [
    { id: "c-1", groupId: "g-a", teacherId: "t-alan", topicId: "Algebra", preferredTimes: ["mon-1", "tue-1"] },
    { id: "c-2", groupId: "g-b", teacherId: "t-ada", topicId: "Biology", preferredTimes: ["mon-2"] },
    { id: "c-3", groupId: "g-a", teacherId: "t-ada", topicId: "History" },
  ];
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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const s = JSON.parse(raw) as EditorsState;
        setTeachers(s.teachers ?? []);
        setGroups(s.groups ?? []);
        setTopics(s.topics ?? []);
        setTimeslots(s.timeslots ?? []);
        setClasses(s.classes ?? []);
      }
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    const s: EditorsState = { teachers, groups, topics, timeslots, classes };
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  }, [teachers, groups, topics, timeslots, classes]);

  const fileRef = useRef<HTMLInputElement | null>(null);

  function testSolve() {
    if (loading) return;
    prefill();
    setTimeout(() => runSolve(), 0);
  }

  function prefill() {
    const s = getSampleData();
    setTimeslots(s.timeslots); setTeachers(s.teachers); setGroups(s.groups); setTopics(s.topics); setClasses(s.classes);
  }

  async function runSolve() {
    setLoading(true);
    try {
      const payload: SolveRequest = { timeslots, teachers, groups, topics, classes };
      const res = await fetch("/api/solve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json()) as SolveResponse;
      setAssignments(data.assignments);
      setConflicts(data.conflicts);
      setUnscheduled(data.unscheduled);
      setScore(data.score);
    } catch (e) {
      setConflicts(["Failed to contact solver API."]);
      setAssignments([]);
      setUnscheduled([]);
    } finally {
      setLoading(false);
    }
  }

  const editorsState: EditorsState = { teachers, groups, topics, timeslots, classes };
  const canSolve = teachers.length > 0 && groups.length > 0 && topics.length > 0 && timeslots.length > 0 && classes.length > 0;

  return (
    <div className="bg-grid min-h-[calc(100dvh-4rem)]">
      <section className="container py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground bg-white/70 backdrop-blur">
              Timetabling engine for constraint solving
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Build clash-free schedules for students and teachers
            </h1>
            <p className="mt-4 text-muted-foreground max-w-prose">
              Model availability, topic mapping, preferences and clashes, then generate a feasible timetable. Connect to OptaPlanner or other solvers via API.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button onClick={runSolve} disabled={loading || !canSolve} className="shadow-lg shadow-primary/20">
                {loading ? "Solving…" : "Run solver"}
              </Button>
              <Button variant="outline" onClick={prefill}>Load sample data</Button>
              <Button variant="secondary" onClick={testSolve} disabled={loading}>Test solve</Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost">View sample data</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sample dataset</DialogTitle>
                    <DialogDescription>This is the data loaded by “Load sample data”.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 max-h-[60vh] overflow-auto text-sm">
                    {(() => { const s = getSampleData(); return (
                      <>
                        <div>
                          <div className="font-semibold">Timeslots ({s.timeslots.length})</div>
                          <ul className="list-disc pl-5 text-muted-foreground">
                            {s.timeslots.map(t => <li key={t.id}>{t.id} — {t.day} {t.label}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div className="font-semibold">Teachers ({s.teachers.length})</div>
                          <ul className="list-disc pl-5 text-muted-foreground">
                            {s.teachers.map(t => <li key={t.id}>{t.id} — {t.name} • avail: {t.availability.join(", ")}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div className="font-semibold">Groups ({s.groups.length})</div>
                          <ul className="list-disc pl-5 text-muted-foreground">
                            {s.groups.map(g => <li key={g.id}>{g.id} — {g.name}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div className="font-semibold">Topics ({s.topics.length})</div>
                          <ul className="list-disc pl-5 text-muted-foreground">
                            {s.topics.map(p => <li key={p.id}>{p.id} — {p.name}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div className="font-semibold">Classes ({s.classes.length})</div>
                          <ul className="list-disc pl-5 text-muted-foreground">
                            {s.classes.map(c => <li key={c.id}>{c.id} — group:{c.groupId} teacher:{c.teacherId} topic:{c.topicId} prefs:{c.preferredTimes?.join(", ") || "—"}</li>)}
                          </ul>
                        </div>
                      </>
                    ); })()}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardContent className="p-4">
              <ScheduleGrid timeslots={timeslots} classes={classes} assignments={assignments} teachers={teachers} groups={groups} topics={topics} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="text-sm text-muted-foreground">Manage your data (autosaves to your browser).</div>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const s = JSON.parse(String(reader.result)) as EditorsState;
                  setTeachers(s.teachers ?? []);
                  setGroups(s.groups ?? []);
                  setTopics(s.topics ?? []);
                  setTimeslots(s.timeslots ?? []);
                  setClasses(s.classes ?? []);
                } catch {}
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
            <Button variant="ghost" onClick={() => { setTeachers([]); setGroups([]); setTopics([]); setTimeslots([]); setClasses([]); }}>Clear</Button>
          </div>
        </div>
        <EntityEditors
          {...editorsState}
          onChange={(s) => { setTeachers(s.teachers); setGroups(s.groups); setTopics(s.topics); setTimeslots(s.timeslots); setClasses(s.classes); }}
          onPrefill={prefill}
        />
      </section>

      {(conflicts.length > 0 || unscheduled.length > 0 || assignments.length > 0) && (
        <section className="container pb-12">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="text-sm">
                <span className="font-medium">Results:</span> Assigned {assignments.length}/{classes.length}
                {typeof score?.softPreferencesSatisfied === "number" && (
                  <span className="ml-2 text-muted-foreground">Prefs satisfied: {score.softPreferencesSatisfied}</span>
                )}
              </div>
              {conflicts.length > 0 && (
                <div className="text-sm text-destructive">
                  {conflicts.map((c, i) => (<div key={i}>• {c}</div>))}
                </div>
              )}
              {unscheduled.length > 0 && (
                <div className="text-sm text-muted-foreground">Unscheduled classes: {unscheduled.join(", ")}</div>
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
