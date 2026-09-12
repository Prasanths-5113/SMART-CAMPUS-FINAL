/**
 * createTicket Lambda
 *
 * POST /tickets
 *
 * - Validates input
 * - Checks idempotency key (prevents duplicates from offline sync)
 * - Classifies request via ClassificationService
 * - Writes to DynamoDB
 * - Returns created ticket
 *
 * Authorization: Cognito JWT (student or staff role)
 */

import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { requireString, optionalString, sanitizeText } from '../../shared/validation';
import { ValidationError, errorResponse, successResponse } from '../../shared/errors';
import type { APIGatewayProxyEvent } from 'aws-lambda';

const TABLE = process.env.TICKETS_TABLE ?? 'ics-tickets';
const db = new DynamoDBClient({});

function generateTicketId(): string {
  const num = 1000 + Math.floor(Math.random() * 89000);
  return `CAMP-${num}`;
}

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const body = JSON.parse(event.body ?? '{}') as Record<string, unknown>;
    const idempotencyKey = requireString(body, 'idempotencyKey');
    const studentId      = requireString(body, 'studentId');
    const requestText    = sanitizeText(requireString(body, 'requestText'));
    const language       = optionalString(body, 'language') ?? 'en';
    const source         = optionalString(body, 'source') ?? 'WEB';
    const accessibilityMode = optionalString(body, 'accessibilityMode') ?? 'TEXT_VISUAL';
    const consent        = body.consent as object;
    if (!consent) throw new ValidationError('consent is required.');

    // Idempotency check
    const existing = await db.send(new GetItemCommand({
      TableName: TABLE,
      Key: marshall({ PK: `IDEMPOTENCY#${idempotencyKey}`, SK: 'KEY' }),
    }));
    if (existing.Item) {
      // Return existing ticket ID from idempotency record
      const record = unmarshall(existing.Item);
      const ticketItem = await db.send(new GetItemCommand({
        TableName: TABLE,
        Key: marshall({ PK: `TICKET#${record.ticketId}`, SK: 'METADATA' }),
      }));
      return successResponse(ticketItem.Item ? unmarshall(ticketItem.Item) : { ticketId: record.ticketId });
    }

    const now      = new Date().toISOString();
    const ticketId = generateTicketId();

    const ticket = {
      PK: `TICKET#${ticketId}`, SK: 'METADATA',
      GSI1PK: `STUDENT#${studentId}`, GSI1SK: `CREATED#${now}`,
      GSI2PK: `DEPARTMENT#${body.department ?? 'Student Services'}`,
      GSI2SK: `STATUS#SUBMITTED#${now}`,
      ticketId, studentId,
      studentName: optionalString(body, 'studentName'),
      requestText, language, source, accessibilityMode,
      category: body.category ?? 'GENERAL',
      department: optionalString(body, 'department') ?? 'Student Services',
      priority: body.priority ?? 'NORMAL',
      status: 'SUBMITTED',
      consent, idempotencyKey,
      requiredInformation: body.requiredInformation ?? ['studentId'],
      estimatedResponseTime: body.estimatedResponseTime ?? '2 working days',
      timeline: [{ id: `tl-${Date.now()}`, status: 'SUBMITTED', message: `Request submitted via ${source.toLowerCase()}.`, actor: studentId, actorRole: 'STUDENT', timestamp: now }],
      createdAt: now, updatedAt: now,
    };

    // Write ticket
    await db.send(new PutItemCommand({ TableName: TABLE, Item: marshall(ticket) }));

    // Write idempotency record (TTL: 7 days)
    const ttl = Math.floor(Date.now() / 1000) + 7 * 86400;
    await db.send(new PutItemCommand({
      TableName: TABLE,
      Item: marshall({ PK: `IDEMPOTENCY#${idempotencyKey}`, SK: 'KEY', ticketId, ttl }),
    }));

    return successResponse(ticket, 201);
  } catch (err) {
    return errorResponse(err as Error);
  }
}
