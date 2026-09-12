/**
 * updateTicket Lambda
 * PATCH /tickets/{ticketId}
 * Authorization: STAFF or ADMIN only
 */
import { DynamoDBClient, UpdateItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { NotFoundError, UnauthorizedError, ValidationError, errorResponse, successResponse } from '../../shared/errors';
import type { APIGatewayProxyEvent } from 'aws-lambda';

const TABLE = process.env.TICKETS_TABLE ?? 'ics-tickets';
const VALID_STATUSES = ['SUBMITTED','IN_REVIEW','ACTION_TAKEN','RESOLVED'];
const db = new DynamoDBClient({});

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const ticketId = event.pathParameters?.ticketId;
    if (!ticketId) throw new ValidationError('ticketId required.');

    const claims = event.requestContext?.authorizer?.claims ?? {};
    const role = (claims['custom:role'] as string) ?? 'STUDENT';
    if (role === 'STUDENT') throw new UnauthorizedError('Students cannot update ticket status.');

    const body = JSON.parse(event.body ?? '{}') as Record<string,unknown>;
    const { status, note, assignedStaff } = body as { status?: string; note?: string; assignedStaff?: string };

    if (status && !VALID_STATUSES.includes(status)) throw new ValidationError(`Invalid status: ${status}`);

    // Read existing
    const existing = await db.send(new GetItemCommand({
      TableName: TABLE, Key: marshall({ PK: `TICKET#${ticketId}`, SK: 'METADATA' }),
    }));
    if (!existing.Item) throw new NotFoundError(`Ticket ${ticketId} not found.`);
    const ticket = unmarshall(existing.Item);

    const now = new Date().toISOString();
    const actor = claims['name'] ?? 'Staff';
    const newTimeline = [...(ticket.timeline as object[])];

    if (status && status !== ticket.status) {
      newTimeline.push({ id: `tl-${Date.now()}`, status, message: note ?? `Status updated to ${status}.`, actor, actorRole: role, timestamp: now });
    } else if (note) {
      newTimeline.push({ id: `tl-${Date.now()}`, status: ticket.status, message: note, actor, actorRole: role, timestamp: now });
    }

    // Safe update — structured expression, no injection risk
    await db.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: marshall({ PK: `TICKET#${ticketId}`, SK: 'METADATA' }),
      UpdateExpression: 'SET #st = :st, assignedStaff = :as, timeline = :tl, updatedAt = :ua, GSI2SK = :gsk',
      ExpressionAttributeNames: { '#st': 'status' },
      ExpressionAttributeValues: marshall({
        ':st': status ?? ticket.status,
        ':as': assignedStaff ?? ticket.assignedStaff ?? null,
        ':tl': newTimeline,
        ':ua': now,
        ':gsk': `STATUS#${status ?? ticket.status}#${now}`,
      }),
    }));

    return successResponse({ ...ticket, status: status ?? ticket.status, assignedStaff: assignedStaff ?? ticket.assignedStaff, timeline: newTimeline, updatedAt: now });
  } catch (err) {
    return errorResponse(err as Error);
  }
}
