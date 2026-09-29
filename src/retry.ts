import { RetryOptions } from './types.js';

export function calculateBackoff(attempt: number, options: RetryOptions): number {
  const baseDelay = options.baseDelayMs ?? 200;
  const maxDelay = options.maxDelayMs ?? 5000;
  const useJitter = options.jitter ?? true;

  const exponential = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));

  if (!useJitter) {
    return exponential;
  }

  // Full Jitter: random between 0 and exponential
  return Math.floor(Math.random() * exponential);
}

export function shouldRetry(error: unknown, attempt: number, maxRetries: number, retryOnStatus: number[]): boolean {
  if (attempt >= maxRetries) {
    return false;
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return false;
  }

  return true;
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
