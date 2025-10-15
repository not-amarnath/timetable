import serverless from "serverless-http";
import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
function sortByConstraintTightness(classes, candidateCounts) {
  return [...classes].sort((a, b) => {
    const ca = candidateCounts.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const cb = candidateCounts.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    if (ca !== cb) return ca - cb;
    return a.id.localeCompare(b.id);
  });
}
const handleSolve = (req, res) => {
  const body = req.body;
  if (!body || !body.timeslots || !body.teachers || !body.classes || !body.groups || !body.topics) {
    return res.status(400).json({
      assignments: [],
      unscheduled: [],
      conflicts: ["Invalid request body. Please provide timeslots, teachers, classes, groups, and topics."]
    });
  }
  const { timeslots, teachers, classes, groups, topics } = body;
  const timeslotIds = new Set(timeslots.map((t) => t.id));
  const teacherById = new Map(teachers.map((t) => [t.id, t]));
  const groupIds = new Set(groups.map((g) => g.id));
  const topicIds = new Set(topics.map((p) => p.id));
  const teacherBusy = /* @__PURE__ */ new Map();
  const groupBusy = /* @__PURE__ */ new Map();
  const assignments = [];
  const conflicts = [];
  const unscheduled = [];
  const validClasses = [];
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
  const candidateCounts = /* @__PURE__ */ new Map();
  for (const c of validClasses) {
    const teacher = teacherById.get(c.teacherId);
    const teacherAvail = new Set(teacher.availability.filter((id) => timeslotIds.has(id)));
    const pref = new Set((c.preferredTimes ?? []).filter((id) => timeslotIds.has(id)));
    const candidates = [...teacherAvail];
    const prioritized = candidates.filter((id) => pref.size === 0 || pref.has(id));
    candidateCounts.set(c.id, Math.max(1, prioritized.length || candidates.length));
  }
  const ordered = sortByConstraintTightness(validClasses, candidateCounts);
  let softPreferencesSatisfied = 0;
  for (const c of ordered) {
    const teacher = teacherById.get(c.teacherId);
    const avail = teacher.availability.filter((id) => timeslotIds.has(id));
    const prefSet = new Set((c.preferredTimes ?? []).filter((id) => timeslotIds.has(id)));
    const tryOrder = [
      ...avail.filter((id) => prefSet.has(id)),
      ...avail.filter((id) => !prefSet.has(id))
    ];
    let placed = null;
    for (const slotId of tryOrder) {
      const tBusy = teacherBusy.get(c.teacherId) ?? /* @__PURE__ */ new Set();
      const gBusy = groupBusy.get(c.groupId) ?? /* @__PURE__ */ new Set();
      if (tBusy.has(slotId) || gBusy.has(slotId)) continue;
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
  const response = {
    assignments,
    unscheduled,
    conflicts,
    score: { hardConflicts: conflicts.length, softPreferencesSatisfied }
  };
  res.json(response);
};
function createServer() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: true }));
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app.get("/api/demo", handleDemo);
  app.post("/api/solve", handleSolve);
  return app;
}
const handler = serverless(createServer());
export {
  handler
};
