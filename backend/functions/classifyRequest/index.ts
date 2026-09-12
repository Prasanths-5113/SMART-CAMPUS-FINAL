/**
 * classifyRequest Lambda
 * POST /tickets/classify  (internal — not exposed directly to browser)
 *
 * Swappable classifier interface. Currently deterministic keyword engine.
 * Replace this function body with an ML/LLM call to upgrade without UI changes.
 */
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { requireString, sanitizeText } from '../../shared/validation';
import { errorResponse, successResponse } from '../../shared/errors';

const DEPARTMENT_MAP: Record<string, string> = {
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
  GENERAL: 'Student Services',
};

function classify(text: string) {
  const lower = text.toLowerCase();
  if (['scholarship','stipend','financial aid','amount not received'].some(k => lower.includes(k)))
    return { category: 'SCHOLARSHIP_FINANCE', priority: 'NORMAL' };
  if (['hostel','room','dormitory','warden','fan','maintenance'].some(k => lower.includes(k)))
    return { category: 'HOSTEL', priority: 'HIGH' };
  if (['exam','hall ticket','result','revaluation','arrear'].some(k => lower.includes(k)))
    return { category: 'EXAMINATION', priority: 'HIGH' };
  if (['certificate','bonafide','transcript','tc'].some(k => lower.includes(k)))
    return { category: 'CERTIFICATES', priority: 'NORMAL' };
  if (['welfare','harassment','ragging','counselling'].some(k => lower.includes(k)))
    return { category: 'WELFARE', priority: 'URGENT' };
  return { category: 'GENERAL', priority: 'NORMAL' };
}

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const body = JSON.parse(event.body ?? '{}') as Record<string,unknown>;
    const raw = requireString(body, 'requestText');
    const text = sanitizeText(raw);
    const result = classify(text);
    return successResponse({
      ...result,
      department: DEPARTMENT_MAP[result.category],
      confidence: 0.85,
      engine: 'deterministic-keyword-v1',
      _note: 'Replace this function with ML/LLM for production.',
    });
  } catch (err) {
    return errorResponse(err as Error);
  }
}
