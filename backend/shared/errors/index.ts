export class ValidationError extends Error {
  statusCode = 400;
  constructor(message: string) { super(message); this.name = 'ValidationError'; }
}
export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) { super(message); this.name = 'NotFoundError'; }
}
export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message: string) { super(message); this.name = 'UnauthorizedError'; }
}
export class ConflictError extends Error {
  statusCode = 409;
  constructor(message: string) { super(message); this.name = 'ConflictError'; }
}

export function errorResponse(err: Error) {
  const status = (err as ValidationError).statusCode ?? 500;
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({
      error: err.name,
      // Sanitize — never expose stack traces or internal details to clients
      message: status < 500 ? err.message : 'Internal server error',
    }),
  };
}

export function successResponse(body: object, statusCode = 200) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  };
}
