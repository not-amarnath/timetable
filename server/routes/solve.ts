import { RequestHandler } from "express";
import { Assignment, ClassDemand, SolveRequest, SolveResponse, Timeslot } from "@shared/api";

function sortByConstraintTightness(classes: ClassDemand[], candidateCounts: Map<string, number>) {
  return [...classes].sort((a, b) => {
    const ca = candidateCounts.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const cb = candidateCounts.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    if (ca !== cb) return ca - cb;
    return a.id.localeCompare(b.id);
  });
}

export const handleSolve: RequestHandler = (req, res) => {
  const body = req.body as SolveRequest;
  const { timeslots, teachers, classes, groups, topics } = body;

  // Basic validation collections
  const timeslotIds = new Set(timeslots.map((t) => t.id));
  const teacherById = new Map(teachers.map((t) => [t.id, t]));
  const groupIds = new Set(groups.map((g) => g.id));
  const topicIds = new Set(topics.map((p) => p.id));

  const teacherBusy = new Map<string, Set<string>>(); // teacherId -> timeslotIds
  const groupBusy = new Map<string, Set<string>>(); // groupId -> timeslotIds

  const assignments: Assignment[] = [];
  const conflicts: string[] = [];
  const unscheduled: string[] = [];

  // Filter out invalid class references and record conflicts
  const validClasses: ClassDemand[] = [];
  for (const c of classes) {
    if (!teacherById.has(c.teacherId)) {
      unscheduled.push(c.id);
      conflicts.push(`Unknown teacher '${c.teacherId}' for class ${c.id}`);
      continue;
    }
    if (!groupIds.has(c.groupId)) {
      unscheduled.push(c.id);
      conflicts.push(`Unknown group '${c.groupId}' for class ${c.id}`);
      continue;
    }
    if (!topicIds.has(c.topicId)) {
      unscheduled.push(c.id);
      conflicts.push(`Unknown topic '${c.topicId}' for class ${c.id}`);
      continue;
    }
    validClasses.push(c);
  }

  // Pre-calc candidate counts for ordering (fewer candidates scheduled first)
  const candidateCounts = new Map<string, number>();
  for (const c of validClasses) {
    const teacher = teacherById.get(c.teacherId)!;
    const teacherAvail = new Set(teacher.availability.filter((id) => timeslotIds.has(id)));
    const pref = new Set((c.preferredTimes ?? []).filter((id) => timeslotIds.has(id)));
    const candidates = [...teacherAvail];
    const prioritized = candidates.filter((id) => pref.size === 0 || pref.has(id));
    candidateCounts.set(c.id, Math.max(1, prioritized.length || candidates.length));
  }

  const ordered = sortByConstraintTightness(validClasses, candidateCounts);

  let softPreferencesSatisfied = 0;

  for (const c of ordered) {
    const teacher = teacherById.get(c.teacherId)!;
    const avail = teacher.availability.filter((id) => timeslotIds.has(id));
    const prefSet = new Set((c.preferredTimes ?? []).filter((id) => timeslotIds.has(id)));

    const tryOrder = [
      ...avail.filter((id) => prefSet.has(id)),
      ...avail.filter((id) => !prefSet.has(id)),
    ];

    let placed: string | null = null;
    for (const slotId of tryOrder) {
      const tBusy = teacherBusy.get(c.teacherId) ?? new Set();
      const gBusy = groupBusy.get(c.groupId) ?? new Set();
      if (tBusy.has(slotId) || gBusy.has(slotId)) continue; // clash

      // Assign
      assignments.push({ classId: c.id, timeslotId: slotId });
      if (prefSet.has(slotId)) softPreferencesSatisfied += 1;
      tBusy.add(slotId);
      gBusy.add(slotId);
      teacherBusy.set(c.teacherId, tBusy);
      groupBusy.set(c.groupId, gBusy);
      placed = slotId;
      break;
    }

    if (!placed) {
      unscheduled.push(c.id);
      conflicts.push(`Could not schedule class ${c.id}: no feasible timeslot (teacher/group clashes or availability).`);
    }
  }

  const response: SolveResponse = {
    assignments,
    unscheduled,
    conflicts,
    score: { hardConflicts: conflicts.length, softPreferencesSatisfied },
  };
  res.json(response);
};
