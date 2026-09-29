export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeoutMs?: number;
}

export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitter?: boolean;
  retryOnStatus?: number[];
}

export interface ResilientFetchConfig extends RetryOptions {
  circuitBreaker?: CircuitBreakerOptions;
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
}

export class CircuitBreakerOpenError extends Error {
  constructor(message = 'Circuit breaker is OPEN. Requests blocked to prevent cascading failure.') {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly response: Response;

  constructor(response: Response) {
    super(`HTTP request failed with status ${response.status} ${response.statusText}`);
    this.name = 'HttpError';
    this.status = response.status;
    this.statusText = response.statusText;
    this.response = response;
  }
}
