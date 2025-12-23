/**
 * Shared types
 */

export interface ApiError {
  error: string;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  message?: string;
  data?: T;
}
