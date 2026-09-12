// ── Adaptive Campus Concierge — Types ───────────────────

export type TransportMode = 'College Bus' | 'Walking' | 'Private Vehicle';
export type AccessibilityPref = 'No preference' | 'Elevator preferred' | 'Avoid stairs' | 'Short walking distance' | 'Avoid crowded areas';
export type NotificationPref = 'All' | 'Important only' | 'Academic only' | 'Transport only';
export type NoticeCategory = 'Transport' | 'Academic' | 'Student Services' | 'Accessibility' | 'Event';
export type Urgency = 'High' | 'Medium' | 'Low';
export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface StudentPreferences {
  transport: TransportMode;
  accessibility: AccessibilityPref;
  notification: NotificationPref;
}

export interface StudentPersona {
  id: string;
  name: string;
  department: string;
  year: string;
  attendance: number;          // percentage
  preferences: StudentPreferences;
  timetableToday: TimetableEntry[];
}

export interface TimetableEntry {
  subject: string;
  code: string;
  time: string;
  venue: string;
  hasAssignmentDue?: boolean;
}

export interface CampusNotice {
  id: string;
  title: string;
  category: NoticeCategory;
  urgency: Urgency;
  message: string;
  deadline?: string;           // human-readable e.g. "Today", "2 days"
  deadlineHours?: number;      // numeric for scoring
  affectedRoute?: string;
  affectedLocation?: string;
}

// ── Scoring ───────────────────────────────────────────────

export interface PriorityBreakdown {
  urgencyScore: number;       // 0–100
  relevanceScore: number;     // 0–100
  studentImpactScore: number; // 0–100
  finalScore: number;         // weighted composite
}

export interface RecommendationEvidence {
  reasons: string[];          // human-readable evidence lines
  breakdown: PriorityBreakdown;
}

export interface Recommendation {
  id: string;
  notice: CampusNotice;
  action: string;             // imperative action string
  priorityLevel: PriorityLevel;
  evidence: RecommendationEvidence;
  dismissed: boolean;
  dismissReason?: DismissReason;
}

export type DismissReason =
  | 'Already completed'
  | 'Not applicable to me'
  | 'Not interested'
  | 'Incorrect information';

export const DISMISS_REASONS: DismissReason[] = [
  'Already completed',
  'Not applicable to me',
  'Not interested',
  'Incorrect information',
];
