// Shared domain types for Lambda functions
export type TicketStatus = 'SUBMITTED' | 'IN_REVIEW' | 'ACTION_TAKEN' | 'RESOLVED';
export type TicketCategory = 'SCHOLARSHIP_FINANCE'|'HOSTEL'|'TRANSPORT'|'EXAMINATION'|'ATTENDANCE'|'LIBRARY'|'CERTIFICATES'|'IT_SUPPORT'|'PLACEMENT'|'WELFARE'|'ADMISSION'|'FEES'|'GENERAL';
export type TicketPriority = 'LOW'|'NORMAL'|'HIGH'|'URGENT';
export type TicketSource = 'WEB'|'VOICE'|'ASSISTED'|'OFFLINE';

export interface Ticket {
  PK: string;              // TICKET#CAMP-4827
  SK: string;              // METADATA
  GSI1PK: string;          // STUDENT#<studentId>
  GSI1SK: string;          // CREATED#<timestamp>
  GSI2PK: string;          // DEPARTMENT#<department>
  GSI2SK: string;          // STATUS#<status>#<timestamp>
  ticketId: string;
  studentId: string;
  studentName?: string;
  requestText: string;
  language: 'en'|'ta';
  category: TicketCategory;
  department: string;
  priority: TicketPriority;
  status: TicketStatus;
  source: TicketSource;
  accessibilityMode: string;
  consent: object;
  assignedStaff?: string;
  requiredInformation: string[];
  timeline: object[];
  createdAt: string;
  updatedAt: string;
  feedback?: object;
  idempotencyKey: string;
  estimatedResponseTime: string;
}
