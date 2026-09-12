/**
 * getImpactMetrics Lambda
 * GET /impact
 * Authorization: ADMIN or public (summary only)
 */
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { successResponse, errorResponse } from '../../shared/errors';

export async function handler(_event: APIGatewayProxyEvent) {
  try {
    // In production: query DynamoDB GSIs for aggregated counts
    // For prototype: return illustrative metrics labelled clearly as prototype data
    const metrics = {
      _disclaimer: 'Prototype metrics — not real-world measured outcomes.',
      totalRequests: 3,
      successfullyRouted: 3,
      resolved: 0,
      averageResponseTimeHours: 0,
      offlineRequests: 0,
      assistedRequests: 1,
      voiceRequests: 1,
      reroutedRequests: 0,
      studentSatisfaction: null,
      firstContactResolution: null,
      byStatus: { SUBMITTED: 1, IN_REVIEW: 1, ACTION_TAKEN: 1, RESOLVED: 0 },
    };
    return successResponse(metrics);
  } catch (err) {
    return errorResponse(err as Error);
  }
}
