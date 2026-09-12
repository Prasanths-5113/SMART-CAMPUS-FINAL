/**
 * Adaptive Campus Concierge — Deterministic Priority Engine
 *
 * Priority Score = Urgency × 0.40 + Relevance × 0.35 + StudentImpact × 0.25
 * All scores 0–100. No external API dependency.
 */

import type {
  CampusNotice, StudentPersona, Recommendation,
  PriorityBreakdown, RecommendationEvidence, PriorityLevel,
} from '../types';

// ── Urgency score ─────────────────────────────────────────

function urgencyScore(notice: CampusNotice): number {
  if (notice.urgency === 'High')   return 100;
  if (notice.urgency === 'Medium') return 60;
  return 30;
}

// ── Relevance score ───────────────────────────────────────

function relevanceScore(notice: CampusNotice, student: StudentPersona): { score: number; reasons: string[] } {
  let score = 30; // baseline
  const reasons: string[] = [];

  // Transport relevance
  if (notice.category === 'Transport') {
    if (student.preferences.transport === 'College Bus') {
      score += 50;
      reasons.push(`You use College Bus (affected route: ${notice.affectedRoute ?? 'your route'})`);
    }
  }

  // Academic relevance — check timetable match
  if (notice.category === 'Academic') {
    const subjects = student.timetableToday.map(t => t.code.toLowerCase());
    const titleLower = notice.title.toLowerCase();
    const hasMatch = subjects.some(s => titleLower.includes(s)) ||
      student.timetableToday.some(t => t.hasAssignmentDue);
    if (hasMatch) {
      score += 55;
      reasons.push('You have this subject scheduled today');
    }
    if (student.attendance < 75) {
      score += 10;
      reasons.push(`Your attendance is ${student.attendance}% — academic notices are high priority`);
    }
  }

  // Accessibility relevance
  if (notice.category === 'Accessibility') {
    const prefs = student.preferences.accessibility;
    if (prefs === 'Elevator preferred') {
      score += 60;
      reasons.push('Your accessibility preference is: Elevator preferred');
    } else if (prefs === 'Avoid stairs') {
      score += 55;
      reasons.push('Your accessibility preference is: Avoid stairs');
    } else if (prefs === 'Short walking distance') {
      score += 40;
      reasons.push('Your accessibility preference is: Short walking distance');
    } else if (prefs === 'No preference') {
      score += 10;
    }
    if (notice.affectedLocation) {
      const usesBlock = student.timetableToday.some(t =>
        t.venue.toLowerCase().includes(notice.affectedLocation!.toLowerCase())
      );
      if (usesBlock) {
        score += 15;
        reasons.push(`You have classes in ${notice.affectedLocation} today`);
      }
    }
  }

  // Notification preference filter
  const notif = student.preferences.notification;
  if (notif === 'Transport only' && notice.category !== 'Transport') score = Math.max(0, score - 40);
  if (notif === 'Academic only'  && notice.category !== 'Academic')  score = Math.max(0, score - 30);

  // Student Services
  if (notice.category === 'Student Services') {
    score += 20;
    reasons.push('Student services notice relevant to all students');
  }

  // Event — low baseline unless explicitly interested
  if (notice.category === 'Event') {
    score = Math.max(score, 20);
  }

  return { score: Math.min(100, score), reasons };
}

// ── Student impact score ──────────────────────────────────

function studentImpactScore(notice: CampusNotice, student: StudentPersona): { score: number; reasons: string[] } {
  let score = 20;
  const reasons: string[] = [];

  // Deadline urgency
  if (notice.deadlineHours !== undefined) {
    if (notice.deadlineHours <= 12) { score += 50; reasons.push('Deadline is less than 12 hours away'); }
    else if (notice.deadlineHours <= 24) { score += 35; reasons.push('Deadline is within 24 hours'); }
    else if (notice.deadlineHours <= 48) { score += 20; reasons.push('Deadline is within 2 days'); }
  }

  // Attendance impact
  if (notice.category === 'Academic' && student.attendance < 75) {
    score += 20;
    reasons.push(`Low attendance (${student.attendance}%) makes academic deadlines critical`);
  }

  // Transportation disruption
  if (notice.category === 'Transport' && student.preferences.transport === 'College Bus') {
    score += 30;
    reasons.push('This directly affects your commute');
  }

  // Accessibility impact on schedule
  if (notice.category === 'Accessibility') {
    const prefs = student.preferences.accessibility;
    if (prefs === 'Elevator preferred' || prefs === 'Avoid stairs') {
      score += 35;
      reasons.push('This affects your preferred accessible route');
    }
  }

  return { score: Math.min(100, score), reasons };
}

// ── Composite score ───────────────────────────────────────

function compositeScore(u: number, r: number, i: number): number {
  return Math.round(u * 0.40 + r * 0.35 + i * 0.25);
}

function priorityLevel(score: number): PriorityLevel {
  if (score >= 70) return 'HIGH';
  if (score >= 45) return 'MEDIUM';
  return 'LOW';
}

// ── Action string ─────────────────────────────────────────

function buildAction(notice: CampusNotice, student: StudentPersona): string {
  if (notice.id === 'n2') return `Submit your DBMS assignment before ${notice.deadline ?? '11:59 PM'}.`;
  if (notice.id === 'n1') return `Use Gate 2 for Bus 3 pickup tomorrow morning.`;
  if (notice.id === 'n3') return `Apply for the scholarship before the deadline (${notice.deadline}).`;
  if (notice.id === 'n4') {
    const prefs = student.preferences.accessibility;
    if (prefs === 'Elevator preferred' || prefs === 'Avoid stairs') {
      return `Use Block A elevator instead — Block B elevator is under maintenance 2–4 PM.`;
    }
    return `Note: Block B elevator unavailable 2–4 PM today.`;
  }
  if (notice.id === 'n5') return `Attend Technical Club meetup at Seminar Hall at 4 PM.`;
  return notice.message;
}

// ── Evidence builder ──────────────────────────────────────

function buildEvidence(
  notice: CampusNotice,
  student: StudentPersona,
  uScore: number,
  relResult: { score: number; reasons: string[] },
  impResult: { score: number; reasons: string[] },
  final: number,
): RecommendationEvidence {
  const allReasons: string[] = [
    `Notice urgency: ${notice.urgency}`,
    ...relResult.reasons,
    ...impResult.reasons,
  ];

  // Add timetable evidence for academic notices
  if (notice.category === 'Academic') {
    const match = student.timetableToday.find(t => notice.title.toLowerCase().includes(t.code.toLowerCase()) || t.hasAssignmentDue);
    if (match) allReasons.unshift(`Your timetable has ${match.subject} (${match.code}) today at ${match.time}`);
  }

  // Notification preference evidence
  allReasons.push(`Your notification preference: ${student.preferences.notification}`);

  return {
    reasons: [...new Set(allReasons)], // deduplicate
    breakdown: {
      urgencyScore: uScore,
      relevanceScore: relResult.score,
      studentImpactScore: impResult.score,
      finalScore: final,
    },
  };
}

// ── Main engine function ──────────────────────────────────

export interface EngineOptions {
  dismissedIds?: string[];
  dismissedPenalties?: Record<string, number>; // id → score reduction
}

export function computeRecommendations(
  notices: CampusNotice[],
  student: StudentPersona,
  opts: EngineOptions = {},
): Recommendation[] {
  const { dismissedIds = [], dismissedPenalties = {} } = opts;

  const recs: Recommendation[] = notices.map(notice => {
    const u   = urgencyScore(notice);
    const rel = relevanceScore(notice, student);
    const imp = studentImpactScore(notice, student);
    let final = compositeScore(u, rel.score, imp.score);

    // Apply dismissal penalty if user marked as not relevant
    if (dismissedIds.includes(notice.id)) {
      final = Math.max(0, final - (dismissedPenalties[notice.id] ?? 100));
    }

    const evidence = buildEvidence(notice, student, u, rel, imp, final);

    return {
      id: notice.id,
      notice,
      action: buildAction(notice, student),
      priorityLevel: priorityLevel(final),
      evidence: { ...evidence, breakdown: { ...evidence.breakdown, finalScore: final } },
      dismissed: dismissedIds.includes(notice.id),
      dismissReason: undefined,
    };
  });

  // Sort by finalScore descending, filter fully dismissed, take top 5
  return recs
    .filter(r => !r.dismissed)
    .sort((a, b) => b.evidence.breakdown.finalScore - a.evidence.breakdown.finalScore)
    .slice(0, 5);
}
