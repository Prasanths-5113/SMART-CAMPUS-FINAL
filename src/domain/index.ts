// ============================================================
// Inclusive Campus Support — Domain Models
// ============================================================

export type TicketStatus = 'SUBMITTED' | 'IN_REVIEW' | 'ACTION_TAKEN' | 'RESOLVED';

export type TicketCategory =
  | 'SCHOLARSHIP_FINANCE' | 'HOSTEL' | 'TRANSPORT' | 'EXAMINATION'
  | 'ATTENDANCE' | 'LIBRARY' | 'CERTIFICATES' | 'IT_SUPPORT'
  | 'PLACEMENT' | 'WELFARE' | 'ADMISSION' | 'FEES' | 'GENERAL';

export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type TicketSource = 'WEB' | 'VOICE' | 'ASSISTED' | 'OFFLINE';
export type AccessMode = 'VOICE_AUDIO' | 'TEXT_VISUAL' | 'VOICE_TEXT_VISUAL' | 'ASSISTED';
export type Language = 'en' | 'ta';
export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

export interface TicketTimelineEvent {
  id: string;
  status: TicketStatus;
  message: string;
  actor: string;
  actorRole: UserRole;
  timestamp: string;
}

export interface ConsentRecord {
  consentGiven: boolean;
  consentTimestamp: string;
  dataShared: {
    requestText: string;
    recipient: string;
    purpose: string;
    requiredIdentifier: string;
  };
  notCollected: string[];
}

export interface TicketFeedback {
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  submittedAt: string;
}

export interface Ticket {
  ticketId: string;
  studentId: string;
  studentName?: string;
  requestText: string;
  language: Language;
  category: TicketCategory;
  department: string;
  priority: TicketPriority;
  status: TicketStatus;
  source: TicketSource;
  accessibilityMode: AccessMode;
  consent: ConsentRecord;
  assignedStaff?: string;
  requiredInformation: string[];
  timeline: TicketTimelineEvent[];
  createdAt: string;
  updatedAt: string;
  feedback?: TicketFeedback;
  idempotencyKey: string;
  estimatedResponseTime: string;
}

export interface RequestClassification {
  category: TicketCategory;
  department: string;
  priority: TicketPriority;
  requiredInformation: string[];
  estimatedResponseTime: string;
  reason: string;
  reasonTA?: string;
  confidence: number;
}

export interface RoutingDecision {
  classification: RequestClassification;
  detectedIssue: string;
  routingExplanation: string;
  routingExplanationTA?: string;
}

export interface AccessibilityPreferences {
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  voiceInput: boolean;
  captions: boolean;
  visualAlerts: boolean;
  largeTouchTargets: boolean;
  simpleLanguage: boolean;
  hapticFeedback: boolean;
  lowBandwidthMode: boolean;
}

export const DEFAULT_ACCESSIBILITY_PREFS: AccessibilityPreferences = {
  largeText: false, highContrast: false, reducedMotion: false,
  screenReaderOptimized: false, voiceInput: false, captions: false,
  visualAlerts: false, largeTouchTargets: false, simpleLanguage: false,
  hapticFeedback: false, lowBandwidthMode: false,
};

export type OfflineQueueStatus = 'QUEUED' | 'SYNCING' | 'SYNCED' | 'FAILED';

export interface OfflineQueueItem {
  clientRequestId: string;
  payload: Omit<Ticket, 'ticketId' | 'timeline' | 'createdAt' | 'updatedAt'>;
  createdAt: string;
  retryCount: number;
  status: OfflineQueueStatus;
  lastAttempt?: string;
  errorMessage?: string;
}

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  language: Language;
  accessMode?: AccessMode;
  accessibility: AccessibilityPreferences;
}

export const DEPARTMENT_MAP: Record<TicketCategory, string> = {
  SCHOLARSHIP_FINANCE: 'Scholarship & Finance Office',
  HOSTEL: 'Hostel Administration',
  TRANSPORT: 'Transport Office',
  EXAMINATION: 'Examination Cell',
  ATTENDANCE: 'Academic Office',
  LIBRARY: 'Central Library',
  CERTIFICATES: 'Academic Records Office',
  IT_SUPPORT: 'IT Help Desk',
  PLACEMENT: 'Placement & Career Cell',
  WELFARE: 'Student Welfare Office',
  ADMISSION: 'Admissions Office',
  FEES: 'Fees & Accounts Office',
  GENERAL: 'Student Services',
};

export const RESPONSE_TIME_MAP: Record<TicketPriority, string> = {
  LOW: '5 working days',
  NORMAL: '2 working days',
  HIGH: '1 working day',
  URGENT: 'Within 4 hours',
};
