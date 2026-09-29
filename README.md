# resilient-fetch

> A lightweight, zero-dependency resilient HTTP client wrapper for TypeScript with configurable retry strategies, exponential backoff, jitter, and circuit breaker patterns.

[![CI](https://github.com/lunarstrings/resilient-fetch/actions/workflows/ci.yml/badge.svg)](https://github.com/lunarstrings/resilient-fetch/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **Automatic Retries**: Exponential backoff with full/decorrelated jitter to prevent thundering herds.
- **Circuit Breaker**: Detect cascading downstream failures and fail fast in `OPEN`, `HALF_OPEN`, and `CLOSED` states.
- **Type-Safe**: Full TypeScript generics supporting runtime schema validation integration.
- **AbortSignal Support**: Native timeout and cancellation propagation.
- **Zero Runtime Dependencies**: Built entirely on standard Fetch API specifications.

## Installation

```bash
npm install @lunarstrings/resilient-fetch
```

## Quick Start

```typescript
import { createResilientFetch } from '@lunarstrings/resilient-fetch';

const client = createResilientFetch({
  retries: 3,
  baseDelayMs: 250,
  maxDelayMs: 2000,
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeoutMs: 15000,
  },
});

// Resilient GET request with typed response
const data = await client.get<UserData>('https://api.example.com/users/42');
console.log(data);
```

## Configuration

| Option | Type | Default | Description |
|---|---|---|---|
| `retries` | `number` | `3` | Maximum retry attempts for transient network/5xx errors |
| `baseDelayMs` | `number` | `200` | Initial exponential backoff delay |
| `maxDelayMs` | `number` | `5000` | Maximum cap on backoff delay |
| `circuitBreaker.failureThreshold` | `number` | `5` | Consecutive failures before tripping to `OPEN` |
| `circuitBreaker.resetTimeoutMs` | `number` | `30000` | Cooldown period before transitioning to `HALF_OPEN` |

## License

MIT © [lunarstrings](https://github.com/lunarstrings)
