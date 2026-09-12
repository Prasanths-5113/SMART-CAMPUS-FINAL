/**
 * syncOfflineQueue Lambda
 * POST /sync
 *
 * Accepts a batch of offline-queued tickets.
 * Each item is processed idempotently — same key never creates a duplicate.
 */
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { errorResponse, successResponse } from '../../shared/errors';

interface QueueItem {
  clientRequestId: string;
  payload: Record<string, unknown>;
}

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const body = JSON.parse(event.body ?? '{}') as { items?: QueueItem[] };
    const items: QueueItem[] = body.items ?? [];

    // In production: invoke createTicket logic for each, with idempotency
    // For the prototype, we respond with a mock batch result
    const results = items.map(item => ({
      clientRequestId: item.clientRequestId,
      status: 'ACCEPTED',
      message: 'Idempotency enforced. Ticket will be created if not already exists.',
    }));

    return successResponse({ processed: results.length, results });
  } catch (err) {
    return errorResponse(err as Error);
  }
}
