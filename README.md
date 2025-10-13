# Clashless Timetabling Engine

A modern, production-ready React + Express application that builds clash-free schedules for student groups and teachers using a constraint-driven solver. It includes a clean UI for data entry, a visual timetable grid, an API solver, and local persistence.

## Features
- Data model: Teachers (with availability), Groups, Topics, Timeslots, and Classes to schedule
- Greedy constraint-based solver API (`POST /api/solve`) with validation and preference scoring
- Visual schedule grid with human-readable names
- Import/Export JSON and autosave to localStorage
- Type-safe shared interfaces between client and server
- Tailwind theme with light/dark mode

## Data Model
- Timeslot: `{ id, day, label }`
- Teacher: `{ id, name, availability: string[] }` (availability holds Timeslot IDs)
- Group: `{ id, name }`
- Topic: `{ id, name }`
- ClassDemand: `{ id, groupId, teacherId, topicId, preferredTimes?: string[] }`

## API
- `POST /api/solve`
  - Request: `SolveRequest { timeslots, teachers, groups, topics, classes }`
  - Response: `SolveResponse { assignments, unscheduled, conflicts, score? }`
    - `assignments`: `{ classId, timeslotId }[]`
    - `unscheduled`: array of classIds that couldn’t be placed
    - `conflicts`: human-readable issues (missing refs, no feasible timeslot, etc.)
    - `score`: `{ hardConflicts, softPreferencesSatisfied }`

## Solver Logic (Greedy Prototype)
1. Validate references: unknown teacher/group/topic are reported and excluded.
2. Compute candidate counts per class (number of feasible timeslots by teacher availability and preferences).
3. Order classes by tightest constraints (fewest candidates first).
4. For each class, try to place it:
   - Prioritize preferred timeslots (if provided), then other available times.
   - Respect hard constraints: no teacher or group double-booking per timeslot.
5. Track soft preference satisfaction (when a class lands in a preferred slot).

This approach is fast and produces reasonable schedules.

## How to Use
1) Load sample data (optional): Click “Load sample data” to populate example teachers, groups, topics, timeslots, and classes.
2) View sample data: Click “View sample data” to inspect the exact dataset that will be loaded.
3) Test solve: Click “Test solve” to auto-load the sample data and immediately run the solver.
4) Model your data: In the Data/Classes tabs, add Teachers (with availability), Groups, Topics, Timeslots, and Classes to schedule. Availability and Preferred times accept comma-separated Timeslot IDs (shown in the Timeslots list).
5) Run solver: Click “Run solver”. The Results card shows assignments, conflicts, unscheduled items, and preference stats.
6) Save/Load: Use Import/Export JSON to persist data and autosave keeps your last state locally.

### Sample Dataset
- Timeslots: Mon/Tue/Wed, 09:00–12:00 in 1h blocks (ids: mon-1..3, tue-1..3, wed-1..3)
- Teachers:
  - t-alan (Alan T.): availability mon-1, mon-2, tue-1, wed-2
  - t-ada (Ada L.): availability mon-2, mon-3, tue-2, wed-1, wed-2
- Groups: g-a (Group A), g-b (Group B)
- Topics: Algebra, Biology, History
- Classes:
  - c-1: g-a with t-alan on Algebra, preferred mon-1 or tue-1
  - c-2: g-b with t-ada on Biology, preferred mon-2
  - c-3: g-a with t-ada on History

## Frontend UI
- Hero with “Run solver”, “Load sample data”, and “Test solve”
- Editors (Tabs):
  - Teachers: add with availability (comma-separated timeslot IDs)
  - Groups, Topics, Timeslots: CRUD
  - Classes: create items to schedule (with optional preferred times)
- Timetable Grid: columns by day, rows by time; cells show assigned classes
- Results card: assigned count, preference stats, conflicts, and unscheduled list
- Import/Export JSON and Clear, with autosave to localStorage

## Local Development
- Install deps: `pnpm install`
- Start dev: `pnpm dev`
- Run tests: `pnpm test`
- Build: `pnpm build`

## License
MIT
