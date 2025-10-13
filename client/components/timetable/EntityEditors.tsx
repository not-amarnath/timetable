import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ClassDemand, Group, Teacher, Timeslot, Topic } from "@shared/api";

export interface EditorsState {
  teachers: Teacher[];
  groups: Group[];
  topics: Topic[];
  timeslots: Timeslot[];
  classes: ClassDemand[];
}

interface Props extends EditorsState {
  onChange: (s: EditorsState) => void;
  onPrefill: () => void;
}

export default function EntityEditors(props: Props) {
  const [local, setLocal] = useState<EditorsState>({
    teachers: props.teachers,
    groups: props.groups,
    topics: props.topics,
    timeslots: props.timeslots,
    classes: props.classes,
  });

  function emit(next: Partial<EditorsState>) {
    const merged = { ...local, ...next } as EditorsState;
    setLocal(merged);
    props.onChange(merged);
  }

  return (
    <Tabs defaultValue="data" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={props.onPrefill}>Load sample</Button>
        </div>
      </div>

      <TabsContent value="data" className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <TeachersCard value={local.teachers} timeslots={local.timeslots} onChange={(v) => emit({ teachers: v })} />
          <GroupsCard value={local.groups} onChange={(v) => emit({ groups: v })} />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <TopicsCard value={local.topics} onChange={(v) => emit({ topics: v })} />
          <TimeslotsCard value={local.timeslots} onChange={(v) => emit({ timeslots: v })} />
        </div>
      </TabsContent>

      <TabsContent value="classes">
        <ClassesCard
          value={local.classes}
          teachers={local.teachers}
          groups={local.groups}
          topics={local.topics}
          onChange={(v) => emit({ classes: v })}
        />
      </TabsContent>
    </Tabs>
  );
}

function TeachersCard({ value, onChange, timeslots }: { value: Teacher[]; onChange: (v: Teacher[]) => void; timeslots: Timeslot[] }) {
  const [name, setName] = useState("");
  const [availability, setAvailability] = useState<string>("");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teachers</CardTitle>
        <CardDescription>Manage teachers and their available timeslots (comma-separated IDs).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Ms. Smith" />
          </div>
          <div className="md:col-span-2">
            <Label>Availability (IDs)</Label>
            <Input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="mon-1,mon-2,tue-1" />
          </div>
        </div>
        <Button
          onClick={() => {
            if (!name.trim()) return;
            const id = `t-${crypto.randomUUID().slice(0, 6)}`;
            const avail = availability
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            onChange([...value, { id, name, availability: avail }]);
            setName("");
            setAvailability("");
          }}
        >
          Add teacher
        </Button>
        <div className="text-xs text-muted-foreground">
          Known timeslot IDs: {timeslots.map((t) => t.id).join(", ") || "none"}
        </div>
        <ul className="mt-2 space-y-2">
          {value.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-md border p-2">
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[32ch]">{t.availability.join(", ") || "—"}</div>
              </div>
              <Button variant="ghost" onClick={() => onChange(value.filter((x) => x.id !== t.id))}>Remove</Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function GroupsCard({ value, onChange }: { value: Group[]; onChange: (v: Group[]) => void }) {
  const [name, setName] = useState("");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student groups</CardTitle>
        <CardDescription>Define the student cohorts to be scheduled.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Grade 10 A" />
        </div>
        <Button
          onClick={() => {
            if (!name.trim()) return;
            const id = `g-${crypto.randomUUID().slice(0, 6)}`;
            onChange([...value, { id, name }]);
            setName("");
          }}
        >
          Add group
        </Button>
        <ul className="mt-2 space-y-2">
          {value.map((g) => (
            <li key={g.id} className="flex items-center justify-between rounded-md border p-2">
              <div className="font-medium">{g.name}</div>
              <Button variant="ghost" onClick={() => onChange(value.filter((x) => x.id !== g.id))}>Remove</Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function TopicsCard({ value, onChange }: { value: Topic[]; onChange: (v: Topic[]) => void }) {
  const [name, setName] = useState("");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Topics</CardTitle>
        <CardDescription>Subjects or topics to be taught.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Algebra" />
        </div>
        <Button
          onClick={() => {
            if (!name.trim()) return;
            const id = `p-${crypto.randomUUID().slice(0, 6)}`;
            onChange([...value, { id, name }]);
            setName("");
          }}
        >
          Add topic
        </Button>
        <ul className="mt-2 space-y-2">
          {value.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-md border p-2">
              <div className="font-medium">{p.name}</div>
              <Button variant="ghost" onClick={() => onChange(value.filter((x) => x.id !== p.id))}>Remove</Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function TimeslotsCard({ value, onChange }: { value: Timeslot[]; onChange: (v: Timeslot[]) => void }) {
  const [day, setDay] = useState("Mon");
  const [label, setLabel] = useState("");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeslots</CardTitle>
        <CardDescription>Define the available timeslots (day and label). IDs generated automatically.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <Label>Day</Label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger>
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., 09:00–10:00" />
          </div>
        </div>
        <Button
          onClick={() => {
            if (!label.trim()) return;
            const id = `${day.toLowerCase()}-${(value.filter((t) => t.day === day).length + 1).toString()}`;
            onChange([...value, { id, day, label }]);
            setLabel("");
          }}
        >
          Add timeslot
        </Button>
        <ul className="mt-2 space-y-2">
          {value.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-md border p-2">
              <div>
                <div className="font-medium">{t.day} • {t.label}</div>
                <div className="text-xs text-muted-foreground">ID: {t.id}</div>
              </div>
              <Button variant="ghost" onClick={() => onChange(value.filter((x) => x.id !== t.id))}>Remove</Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ClassesCard({ value, onChange, teachers, groups, topics }: { value: ClassDemand[]; onChange: (v: ClassDemand[]) => void; teachers: Teacher[]; groups: Group[]; topics: Topic[] }) {
  const [groupId, setGroupId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [topicId, setTopicId] = useState<string>("");
  const [preferred, setPreferred] = useState<string>("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classes to schedule</CardTitle>
        <CardDescription>Create the class sessions that must be scheduled.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid md:grid-cols-4 gap-2">
          <div>
            <Label>Group</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
              <SelectContent>
                {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Teacher</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
              <SelectContent>
                {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Topic</Label>
            <Select value={topicId} onValueChange={setTopicId}>
              <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
              <SelectContent>
                {topics.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Preferred times (IDs)</Label>
            <Input value={preferred} onChange={(e) => setPreferred(e.target.value)} placeholder="mon-1,wed-2" />
          </div>
        </div>
        <Button
          onClick={() => {
            if (!groupId || !teacherId || !topicId) return;
            const id = `c-${crypto.randomUUID().slice(0, 6)}`;
            const preferredTimes = preferred.split(",").map((s) => s.trim()).filter(Boolean);
            onChange([...value, { id, groupId, teacherId, topicId, preferredTimes }]);
            setGroupId(""); setTeacherId(""); setTopicId(""); setPreferred("");
          }}
        >
          Add class
        </Button>
        <ul className="mt-2 space-y-2">
          {value.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div>
                <div className="font-medium">{topics.find((p) => p.id === c.topicId)?.name || c.topicId}</div>
                <div className="text-muted-foreground">Teacher: {teachers.find((t) => t.id === c.teacherId)?.name || c.teacherId} • Group: {groups.find((g) => g.id === c.groupId)?.name || c.groupId}</div>
                <div className="text-xs text-muted-foreground">Preferred: {c.preferredTimes?.join(", ") || "—"}</div>
              </div>
              <Button variant="ghost" onClick={() => onChange(value.filter((x) => x.id !== c.id))}>Remove</Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
