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

// Re-export task types for convenience
export type { TaskType, TaskCategory, TaskData } from "./tasks";
