export interface RateLimiterOptions {
  tokensPerInterval: number;
  intervalMs: number;
  maxBurst?: number;
}

export class TokenBucketRateLimiter {
  private readonly tokensPerInterval: number;
  private readonly intervalMs: number;
  private readonly maxBurst: number;
  private availableTokens: number;
  private lastRefill: number;

  constructor(options: RateLimiterOptions) {
    this.tokensPerInterval = options.tokensPerInterval;
    this.intervalMs = options.intervalMs;
    this.maxBurst = options.maxBurst ?? options.tokensPerInterval;
    this.availableTokens = this.maxBurst;
    this.lastRefill = Date.now();
  }

  public async acquire(tokens = 1): Promise<void> {
    this.refill();

    if (this.availableTokens >= tokens) {
      this.availableTokens -= tokens;
      return;
    }

    const missingTokens = tokens - this.availableTokens;
    const waitTimeMs = Math.ceil((missingTokens / this.tokensPerInterval) * this.intervalMs);

    await new Promise((resolve) => setTimeout(resolve, waitTimeMs));
    return this.acquire(tokens);
  }

  private refill(): void {
    const now = Date.now();
    const elapsedTime = now - this.lastRefill;

    if (elapsedTime > 0) {
      const tokensToAdd = (elapsedTime / this.intervalMs) * this.tokensPerInterval;
      this.availableTokens = Math.min(this.maxBurst, this.availableTokens + tokensToAdd);
      this.lastRefill = now;
    }
  }
}
