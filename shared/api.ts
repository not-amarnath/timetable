/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/** Timetabling shared types */
export interface Timeslot {
  id: string; // unique identifier
  day: string; // e.g., "Mon"
  label: string; // e.g., "09:00–10:00"
}

export interface Teacher {
  id: string;
  name: string;
  availability: string[]; // timeslot ids
}

export interface Group {
  id: string;
  name: string;
}

export interface Topic {
  id: string;
  name: string;
}

export interface ClassDemand {
  id: string;
  groupId: string;
  teacherId: string;
  topicId: string;
  preferredTimes?: string[]; // optional timeslot ids
}

export interface SolveRequest {
  timeslots: Timeslot[];
  teachers: Teacher[];
  groups: Group[];
  topics: Topic[];
  classes: ClassDemand[];
}

export interface Assignment {
  classId: string;
  timeslotId: string;
}

export interface SolveScore {
  hardConflicts: number; // number of hard conflicts encountered
  softPreferencesSatisfied: number; // count of assignments meeting preferences
}

export interface SolveResponse {
  assignments: Assignment[];
  unscheduled: string[]; // class ids not scheduled
  conflicts: string[]; // human-readable messages
  score?: SolveScore;
}
