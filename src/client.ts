import { CircuitBreaker } from './circuit-breaker.js';
import { calculateBackoff, shouldRetry, sleep } from './retry.js';
import { HttpError, ResilientFetchConfig } from './types.js';

export class ResilientClient {
  private readonly config: ResilientFetchConfig;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(config: ResilientFetchConfig = {}) {
    this.config = {
      retries: 3,
      baseDelayMs: 200,
      maxDelayMs: 5000,
      jitter: true,
      retryOnStatus: [408, 429, 500, 502, 503, 504],
      ...config,
    };
    this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
  }

  public async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    return this.circuitBreaker.execute(async () => {
      const maxRetries = this.config.retries ?? 3;
      let attempt = 0;

      while (true) {
        try {
          const controller = new AbortController();
          let timeoutId: NodeJS.Timeout | undefined;

          if (this.config.timeoutMs) {
            timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);
          }

          const response = await globalThis.fetch(input, {
            ...init,
            headers: {
              ...this.config.defaultHeaders,
              ...init?.headers,
            },
            signal: init?.signal ?? controller.signal,
          });

          if (timeoutId) clearTimeout(timeoutId);

          if (!response.ok && (this.config.retryOnStatus ?? []).includes(response.status)) {
            throw new HttpError(response);
          }

          return response;
        } catch (error) {
          if (!shouldRetry(error, attempt, maxRetries, this.config.retryOnStatus ?? [])) {
            throw error;
          }

          const delay = calculateBackoff(attempt, this.config);
          attempt += 1;
          await sleep(delay);
        }
      }
    });
  }

  public async get<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await this.fetch(url, { ...init, method: 'GET' });
    return (await response.json()) as T;
  }

  public async post<T>(url: string, body?: unknown, init?: RequestInit): Promise<T> {
    const response = await this.fetch(url, {
      ...init,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return (await response.json()) as T;
  }
}

export function createResilientFetch(config?: ResilientFetchConfig): ResilientClient {
  return new ResilientClient(config);
}
