/**
 * getTicket Lambda
 * GET /tickets/{ticketId}
 * Authorization: owner (student) or staff/admin
 */
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { NotFoundError, UnauthorizedError, errorResponse, successResponse } from '../../shared/errors';
import type { APIGatewayProxyEvent } from 'aws-lambda';

const TABLE = process.env.TICKETS_TABLE ?? 'ics-tickets';
const db = new DynamoDBClient({});

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const ticketId = event.pathParameters?.ticketId;
    if (!ticketId) throw new NotFoundError('ticketId path parameter required.');

    const result = await db.send(new GetItemCommand({
      TableName: TABLE,
      Key: marshall({ PK: `TICKET#${ticketId}`, SK: 'METADATA' }),
    }));

    if (!result.Item) throw new NotFoundError(`Ticket ${ticketId} not found.`);
    const ticket = unmarshall(result.Item);

    // Authorization: student can only read own ticket
    const claims = event.requestContext?.authorizer?.claims ?? {};
    const sub = claims.sub ?? '';
    const role = (claims['custom:role'] as string) ?? 'STUDENT';
    if (role === 'STUDENT' && ticket.studentId !== sub) {
      throw new UnauthorizedError('You are not authorised to view this ticket.');
    }

    return successResponse(ticket);
  } catch (err) {
    return errorResponse(err as Error);
  }
}
