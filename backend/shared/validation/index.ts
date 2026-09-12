import { ValidationError } from '../errors';

export function requireString(obj: Record<string,unknown>, key: string): string {
  const val = obj[key];
  if (typeof val !== 'string' || !val.trim()) throw new ValidationError(`${key} is required.`);
  return val.trim();
}

export function optionalString(obj: Record<string,unknown>, key: string): string | undefined {
  const val = obj[key];
  return typeof val === 'string' && val.trim() ? val.trim() : undefined;
}

export function requireEnum<T extends string>(obj: Record<string,unknown>, key: string, values: T[]): T {
  const val = requireString(obj, key) as T;
  if (!values.includes(val)) throw new ValidationError(`${key} must be one of: ${values.join(', ')}.`);
  return val;
}

export function sanitizeText(text: string): string {
  // Basic XSS prevention — strip HTML tags
  return text.replace(/<[^>]*>/g, '').trim().slice(0, 2000);
}
