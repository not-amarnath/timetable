import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, X } from "lucide-react";
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
  return (
    <Card>
      <CardContent className="p-2 sm:p-4">
        <Tabs defaultValue="teachers" className="w-full">
          <TabsList className="grid w-full grid-cols-1 h-auto sm:h-10 sm:grid-cols-5 mb-4">
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="timeslots">Timeslots</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
          </TabsList>

          <TabsContent value="teachers"><TeachersTab value={props.teachers} timeslots={props.timeslots} onChange={(newTeachers) => props.onChange({ ...props, teachers: newTeachers })} /></TabsContent>
          <TabsContent value="groups"><GroupsTab value={props.groups} onChange={(newGroups) => props.onChange({ ...props, groups: newGroups })} /></TabsContent>
          <TabsContent value="topics"><TopicsTab value={props.topics} onChange={(newTopics) => props.onChange({ ...props, topics: newTopics })} /></TabsContent>
          <TabsContent value="timeslots"><TimeslotsTab value={props.timeslots} onChange={(newTimeslots) => props.onChange({ ...props, timeslots: newTimeslots })} /></TabsContent>
          <TabsContent value="classes"><ClassesTab value={props.classes} teachers={props.teachers} groups={props.groups} topics={props.topics} onChange={(newClasses) => props.onChange({ ...props, classes: newClasses })} /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TeachersTab({ value, onChange, timeslots }: { value: Teacher[]; onChange: (v: Teacher[]) => void; timeslots: Timeslot[] }) { const [name, setName] = useState(""); const [availability, setAvailability] = useState<string>(""); const [editingId, setEditingId] = useState<string | null>(null); const [editingName, setEditingName] = useState(""); const [editingAvailability, setEditingAvailability] = useState(""); const handleSave = (id: string) => { const availArray = editingAvailability.split(",").map((s) => s.trim()).filter(Boolean); onChange(value.map(t => t.id === id ? { ...t, name: editingName, availability: availArray } : t)); setEditingId(null); }; return ( <div className="space-y-4"> <div className="flex flex-col space-y-3 rounded-md border p-4"> <p className="font-medium text-sm">Add New Teacher</p> <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end"> <div><Label htmlFor="teacher-name">Name</Label><Input id="teacher-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Ms. Smith" /></div> <div className="md:col-span-2"><Label htmlFor="teacher-avail">Availability (IDs)</Label><Input id="teacher-avail" value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="mon-1,mon-2,tue-1" /></div> </div> <div className="flex flex-wrap justify-between items-center gap-2"> <Button size="sm" onClick={() => { if (!name.trim()) return; const id = `t-${crypto.randomUUID().slice(0, 6)}`; const avail = availability.split(",").map((s) => s.trim()).filter(Boolean); onChange([...value, { id, name, availability: avail }]); setName(""); setAvailability(""); }}>Add teacher</Button> <div className="text-xs text-muted-foreground truncate">Known IDs: {timeslots.map((t) => t.id).join(", ") || "none"}</div> </div> </div> <div className="border rounded-md"> <Table> <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Availability</TableHead><TableHead className="w-[120px]">Actions</TableHead></TableRow></TableHeader> <TableBody>{value.length > 0 ? (value.map((t) => (<TableRow key={t.id}>{editingId === t.id ? (<> <TableCell><Input value={editingName} onChange={e => setEditingName(e.target.value)} /></TableCell> <TableCell><Input value={editingAvailability} onChange={e => setEditingAvailability(e.target.value)} /></TableCell> <TableCell className="space-x-1"><Button size="sm" onClick={() => handleSave(t.id)}>Save</Button><Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button></TableCell> </>) : (<> <TableCell className="font-medium">{t.name}</TableCell> <TableCell className="text-muted-foreground text-xs">{t.availability.join(", ") || "—"}</TableCell> <TableCell className="space-x-1"> <Button variant="outline" size="sm" onClick={() => { setEditingId(t.id); setEditingName(t.name); setEditingAvailability(t.availability.join(", ")); }}><Pencil className="h-4 w-4 mr-1" /> Edit</Button> <Button variant="ghost" size="sm" onClick={() => onChange(value.filter((x) => x.id !== t.id))}><X className="h-4 w-4" /></Button> </TableCell></>)}</TableRow>))) : (<TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No teachers added yet.</TableCell></TableRow>)}</TableBody> </Table> </div> </div> ); }
function GroupsTab({ value, onChange }: { value: Group[]; onChange: (v: Group[]) => void }) { const [name, setName] = useState(""); const [editingId, setEditingId] = useState<string | null>(null); const [editingName, setEditingName] = useState(""); const handleSave = (id: string) => { onChange(value.map(g => g.id === id ? { ...g, name: editingName } : g)); setEditingId(null); }; return ( <div className="space-y-4"> <div className="flex items-end space-x-2 rounded-md border p-4"> <div className="flex-1"><Label htmlFor="group-name">Name</Label><Input id="group-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Grade 10 A" /></div> <Button size="sm" onClick={() => { if (!name.trim()) return; const id = `g-${crypto.randomUUID().slice(0, 6)}`; onChange([...value, { id, name }]); setName(""); }}>Add group</Button> </div> <div className="border rounded-md"> <Table> <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="w-[120px]">Actions</TableHead></TableRow></TableHeader> <TableBody>{value.length > 0 ? (value.map((g) => (<TableRow key={g.id}>{editingId === g.id ? (<> <TableCell><Input value={editingName} onChange={e => setEditingName(e.target.value)} /></TableCell> <TableCell className="space-x-1"><Button size="sm" onClick={() => handleSave(g.id)}>Save</Button><Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button></TableCell> </>) : (<> <TableCell className="font-medium">{g.name}</TableCell> <TableCell className="space-x-1"> <Button variant="outline" size="sm" onClick={() => { setEditingId(g.id); setEditingName(g.name); }}><Pencil className="h-4 w-4 mr-1" /> Edit</Button> <Button variant="ghost" size="sm" onClick={() => onChange(value.filter((x) => x.id !== g.id))}><X className="h-4 w-4" /></Button> </TableCell></>)}</TableRow>))) : (<TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No groups added yet.</TableCell></TableRow>)}</TableBody> </Table> </div> </div> ); }
function TopicsTab({ value, onChange }: { value: Topic[]; onChange: (v: Topic[]) => void }) { const [name, setName] = useState(""); const [editingId, setEditingId] = useState<string | null>(null); const [editingName, setEditingName] = useState(""); const handleSave = (id: string) => { onChange(value.map(p => p.id === id ? { ...p, name: editingName } : p)); setEditingId(null); }; return ( <div className="space-y-4"> <div className="flex items-end space-x-2 rounded-md border p-4"> <div className="flex-1"><Label htmlFor="topic-name">Name</Label><Input id="topic-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Algebra" /></div> <Button size="sm" onClick={() => { if (!name.trim()) return; const id = `p-${crypto.randomUUID().slice(0, 6)}`; onChange([...value, { id, name }]); setName(""); }}>Add topic</Button> </div> <div className="border rounded-md"> <Table> <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="w-[120px]">Actions</TableHead></TableRow></TableHeader> <TableBody>{value.length > 0 ? (value.map((p) => (<TableRow key={p.id}>{editingId === p.id ? (<> <TableCell><Input value={editingName} onChange={e => setEditingName(e.target.value)} /></TableCell> <TableCell className="space-x-1"><Button size="sm" onClick={() => handleSave(p.id)}>Save</Button><Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button></TableCell> </>) : (<> <TableCell className="font-medium">{p.name}</TableCell> <TableCell className="space-x-1"> <Button variant="outline" size="sm" onClick={() => { setEditingId(p.id); setEditingName(p.name); }}><Pencil className="h-4 w-4 mr-1" /> Edit</Button> <Button variant="ghost" size="sm" onClick={() => onChange(value.filter((x) => x.id !== p.id))}><X className="h-4 w-4" /></Button> </TableCell></>)}</TableRow>))) : (<TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No topics added yet.</TableCell></TableRow>)}</TableBody> </Table> </div> </div> ); }
function TimeslotsTab({ value, onChange }: { value: Timeslot[]; onChange: (v: Timeslot[]) => void }) { const [day, setDay] = useState("Mon"); const [label, setLabel] = useState(""); const [editingId, setEditingId] = useState<string | null>(null); const [editingDay, setEditingDay] = useState("Mon"); const [editingLabel, setEditingLabel] = useState(""); const handleSave = (id: string) => { onChange(value.map(t => t.id === id ? { ...t, day: editingDay, label: editingLabel } : t)); setEditingId(null); }; return ( <div className="space-y-4"> <div className="space-y-3 rounded-md border p-4"> <p className="font-medium text-sm">Add New Timeslot</p> <div className="grid grid-cols-1 md:grid-cols-3 gap-2"> <div><Label htmlFor="timeslot-day">Day</Label><Select value={day} onValueChange={setDay}><SelectTrigger id="timeslot-day"><SelectValue placeholder="Day" /></SelectTrigger><SelectContent>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent></Select></div> <div className="md:col-span-2"><Label htmlFor="timeslot-label">Label</Label><Input id="timeslot-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., 09:00–10:00" /></div> </div> <Button size="sm" onClick={() => { if (!label.trim()) return; const id = `${day.toLowerCase()}-${(value.filter((t) => t.day === day).length + 1).toString()}`; onChange([...value, { id, day, label }]); setLabel(""); }}>Add timeslot</Button> </div> <div className="border rounded-md"> <Table> <TableHeader><TableRow><TableHead>Day</TableHead><TableHead>Label</TableHead><TableHead>ID</TableHead><TableHead className="w-[120px]">Actions</TableHead></TableRow></TableHeader> <TableBody>{value.length > 0 ? (value.map((t) => (<TableRow key={t.id}>{editingId === t.id ? (<> <TableCell><Select value={editingDay} onValueChange={setEditingDay}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></TableCell> <TableCell><Input value={editingLabel} onChange={e => setEditingLabel(e.target.value)} /></TableCell> <TableCell className="text-muted-foreground text-xs">{t.id}</TableCell> <TableCell className="space-x-1"><Button size="sm" onClick={() => handleSave(t.id)}>Save</Button><Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button></TableCell> </>) : (<> <TableCell className="font-medium">{t.day}</TableCell> <TableCell>{t.label}</TableCell> <TableCell className="text-muted-foreground text-xs">{t.id}</TableCell> <TableCell className="space-x-1"> <Button variant="outline" size="sm" onClick={() => { setEditingId(t.id); setEditingDay(t.day); setEditingLabel(t.label); }}><Pencil className="h-4 w-4 mr-1" /> Edit</Button> <Button variant="ghost" size="sm" onClick={() => onChange(value.filter((x) => x.id !== t.id))}><X className="h-4 w-4" /></Button> </TableCell></>)}</TableRow>))) : (<TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No timeslots added yet.</TableCell></TableRow>)}</TableBody> </Table> </div> </div> ); }

// --- UPDATED: Component for the Classes Tab Content ---
function ClassesTab({ value, onChange, teachers, groups, topics }: { value: ClassDemand[]; onChange: (v: ClassDemand[]) => void; teachers: Teacher[]; groups: Group[]; topics: Topic[] }) {
  const [groupId, setGroupId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [topicId, setTopicId] = useState<string>("");
  const [preferred, setPreferred] = useState<string>("");
  
  // NEW: State to hold the instant conflict warning message
  const [warning, setWarning] = useState<string | null>(null);

  // NEW: useEffect hook to watch for changes and check for conflicts
  useEffect(() => {
    // Only check if a teacher and at least one preferred time are selected
    if (!teacherId || !preferred.trim()) {
      setWarning(null); // Clear warning if fields are empty
      return;
    }

    const preferredTimes = preferred.split(",").map(s => s.trim()).filter(Boolean);
    
    // Find a conflicting class
    const conflictingClass = value.find(c => 
      c.teacherId === teacherId &&
      c.preferredTimes?.some(pt => preferredTimes.includes(pt))
    );

    if (conflictingClass) {
      const teacherName = teachers.find(t => t.id === teacherId)?.name ?? teacherId;
      const topicName = topics.find(p => p.id === conflictingClass.topicId)?.name ?? conflictingClass.topicId;
      setWarning(`⚠️ Warning: ${teacherName} is already preferred for ${topicName} at one of these times.`);
    } else {
      setWarning(null); // Clear warning if no conflict is found
    }
  }, [teacherId, preferred, value, teachers, topics]); // This effect re-runs when these values change

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-md border p-4">
        <p className="font-medium text-sm">Add New Class</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <Label>Group</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
              <SelectContent>{groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Teacher</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
              <SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Topic</Label>
            <Select value={topicId} onValueChange={setTopicId}>
              <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
              <SelectContent>{topics.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Preferred times (IDs)</Label>
            <Input value={preferred} onChange={(e) => setPreferred(e.target.value)} placeholder="mon-1,wed-2" />
          </div>
        </div>
        
        {/* NEW: Display the warning message if it exists */}
        {warning && <p className="text-sm text-amber-600">{warning}</p>}
        
        <Button
          size="sm"
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
      </div>

      <ul className="space-y-2">
        {value.length > 0 ? (
          value.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
              <div>
                <div className="font-medium">{topics.find((p) => p.id === c.topicId)?.name || c.topicId}</div>
                <div className="text-muted-foreground">Teacher: {teachers.find((t) => t.id === c.teacherId)?.name || c.teacherId} • Group: {groups.find((g) => g.id === c.groupId)?.name || c.groupId}</div>
                <div className="text-xs text-muted-foreground">Preferred: {c.preferredTimes?.join(", ") || "—"}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onChange(value.filter((x) => x.id !== c.id))}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))
        ) : (
          <div className="text-center text-sm text-muted-foreground py-4">No classes added yet.</div>
        )}
      </ul>
    </div>
  );
}