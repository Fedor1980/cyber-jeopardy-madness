---
title: Rate Limits and Quotas
version: 1.0.0
last_updated: 2025-01-15
category: api
---

# NexusOS API Rate Limits

This document explains rate limiting policies, headers, quotas, and best practices for working within API limits.

## Overview

NexusOS implements rate limiting to ensure fair usage, maintain system stability, and prevent abuse. Rate limits are applied per API key or OAuth client and vary by subscription tier.

## Rate Limit Tiers

### Free Tier

| Resource | Limit | Burst | Concurrent |
|----------|-------|-------|------------|
| API Requests | 100/hour | 10/minute | 2 |
| Agent Executions | 10/hour | 2/minute | 1 |
| Workflow Triggers | 5/hour | 1/minute | 1 |
| Data Transfer | 100 MB/day | - | - |
| Storage | 500 MB | - | - |

**Best for**: Testing, personal projects, proof of concepts

### Standard Tier

| Resource | Limit | Burst | Concurrent |
|----------|-------|-------|------------|
| API Requests | 1,000/hour | 100/minute | 10 |
| Agent Executions | 100/hour | 20/minute | 5 |
| Workflow Triggers | 50/hour | 10/minute | 5 |
| Data Transfer | 10 GB/day | - | - |
| Storage | 50 GB | - | - |

**Best for**: Small teams, startups, development environments

**Price**: $49/month

### Professional Tier

| Resource | Limit | Burst | Concurrent |
|----------|-------|-------|------------|
| API Requests | 5,000/hour | 500/minute | 50 |
| Agent Executions | 500/hour | 100/minute | 25 |
| Workflow Triggers | 250/hour | 50/minute | 25 |
| Data Transfer | 100 GB/day | - | - |
| Storage | 500 GB | - | - |

**Best for**: Growing businesses, production workloads

**Price**: $199/month

### Enterprise Tier

| Resource | Limit | Burst | Concurrent |
|----------|-------|-------|------------|
| API Requests | 10,000+/hour | Custom | Unlimited |
| Agent Executions | 2,000+/hour | Custom | Unlimited |
| Workflow Triggers | 1,000+/hour | Custom | Unlimited |
| Data Transfer | Unlimited | - | - |
| Storage | Custom | - | - |

**Best for**: Large organizations, mission-critical applications

**Price**: Custom - [Contact Sales](https://nexusos.io/contact-sales)

**Additional Features**:
- Dedicated support team
- Custom SLAs
- Private deployments
- Advanced security features

## Rate Limit Headers

Every API response includes rate limit information in the headers:

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1642251600
X-RateLimit-Resource: api-requests
X-RateLimit-Tier: standard
Retry-After: 3600
```

### Header Descriptions

| Header | Description | Example |
|--------|-------------|---------|
| `X-RateLimit-Limit` | Maximum requests allowed in window | `1000` |
| `X-RateLimit-Remaining` | Requests remaining in current window | `987` |
| `X-RateLimit-Reset` | Unix timestamp when limit resets | `1642251600` |
| `X-RateLimit-Resource` | Type of resource being limited | `api-requests` |
| `X-RateLimit-Tier` | Your subscription tier | `standard` |
| `Retry-After` | Seconds until you can retry (when rate limited) | `3600` |

### Reading Rate Limit Headers

```bash
# Make request with verbose output
curl -i -X GET "https://api.nexusos.io/v1/agents" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}"

# Extract rate limit info
curl -s -D - -o /dev/null "https://api.nexusos.io/v1/agents" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" | grep "X-RateLimit"
```

Example Python implementation:

```python
import requests
from datetime import datetime

def check_rate_limits(response):
    """Extract and display rate limit information"""
    headers = response.headers

    limit = headers.get('X-RateLimit-Limit')
    remaining = headers.get('X-RateLimit-Remaining')
    reset = headers.get('X-RateLimit-Reset')

    if reset:
        reset_time = datetime.fromtimestamp(int(reset))
        print(f"Rate Limit: {remaining}/{limit}")
        print(f"Resets at: {reset_time}")

    return {
        'limit': int(limit) if limit else None,
        'remaining': int(remaining) if remaining else None,
        'reset': int(reset) if reset else None
    }

# Usage
response = requests.get(
    "https://api.nexusos.io/v1/agents",
    headers={"Authorization": f"Bearer {api_key}"}
)

rate_info = check_rate_limits(response)
```

## Rate Limit Responses

### 429 Too Many Requests

When you exceed rate limits:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642251600
Retry-After: 3600

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded",
    "details": {
      "limit": 1000,
      "window": "1 hour",
      "reset_at": "2025-01-15T12:00:00Z"
    },
    "request_id": "req_abc123xyz"
  }
}
```

### Secondary Rate Limits

In addition to primary limits, secondary limits protect specific operations:

#### Authentication Endpoints

```json
{
  "endpoint": "/oauth/token",
  "limit": "10 requests/minute per client",
  "burst": "3 requests/second"
}
```

#### Agent Execution

```json
{
  "endpoint": "/agents/{id}/execute",
  "limit": "Based on tier (see table above)",
  "additional": "Token consumption limits apply"
}
```

#### Bulk Operations

```json
{
  "endpoint": "/users/batch",
  "limit": "100 items per request",
  "max_concurrent": "5 requests"
}
```

## Handling Rate Limits

### Strategy 1: Exponential Backoff

Implement exponential backoff with jitter:

```python
import time
import random
import requests

def make_request_with_backoff(url, headers, max_retries=5):
    """Make request with exponential backoff"""
    for attempt in range(max_retries):
        response = requests.get(url, headers=headers)

        if response.status_code != 429:
            return response

        # Extract Retry-After header
        retry_after = int(response.headers.get('Retry-After', 60))

        # Calculate backoff with jitter
        backoff = min(2 ** attempt + random.uniform(0, 1), retry_after)

        print(f"Rate limited. Retrying in {backoff:.2f} seconds...")
        time.sleep(backoff)

    raise Exception("Max retries exceeded")

# Usage
response = make_request_with_backoff(
    "https://api.nexusos.io/v1/agents",
    headers={"Authorization": f"Bearer {api_key}"}
)
```

### Strategy 2: Request Queuing

Implement a request queue to stay within limits:

```python
import time
from collections import deque
from threading import Lock

class RateLimiter:
    def __init__(self, max_requests, time_window):
        """
        Args:
            max_requests: Maximum requests allowed
            time_window: Time window in seconds
        """
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = deque()
        self.lock = Lock()

    def acquire(self):
        """Wait until request can be made within rate limit"""
        with self.lock:
            now = time.time()

            # Remove old requests outside the window
            while self.requests and self.requests[0] <= now - self.time_window:
                self.requests.popleft()

            # If at limit, wait
            if len(self.requests) >= self.max_requests:
                sleep_time = self.requests[0] + self.time_window - now
                time.sleep(sleep_time)
                return self.acquire()

            # Add current request
            self.requests.append(now)

# Usage
limiter = RateLimiter(max_requests=100, time_window=60)  # 100 req/min

for i in range(200):
    limiter.acquire()
    response = requests.get(
        "https://api.nexusos.io/v1/agents",
        headers={"Authorization": f"Bearer {api_key}"}
    )
    print(f"Request {i+1}: {response.status_code}")
```

### Strategy 3: Distributed Rate Limiting

For multi-server deployments, use Redis:

```python
import redis
import time

class DistributedRateLimiter:
    def __init__(self, redis_client, key, max_requests, window):
        self.redis = redis_client
        self.key = key
        self.max_requests = max_requests
        self.window = window

    def is_allowed(self):
        """Check if request is allowed using sliding window"""
        now = time.time()
        window_start = now - self.window

        pipe = self.redis.pipeline()

        # Remove old entries
        pipe.zremrangebyscore(self.key, 0, window_start)

        # Count requests in window
        pipe.zcard(self.key)

        # Add current request
        pipe.zadd(self.key, {str(now): now})

        # Set expiration
        pipe.expire(self.key, int(self.window) + 1)

        results = pipe.execute()
        request_count = results[1]

        return request_count < self.max_requests

# Usage
redis_client = redis.Redis(host='localhost', port=6379, db=0)
limiter = DistributedRateLimiter(
    redis_client,
    key="nexusos:ratelimit:api_key_123",
    max_requests=1000,
    window=3600
)

if limiter.is_allowed():
    # Make API request
    response = requests.get(...)
else:
    print("Rate limit exceeded")
```

## Best Practices

### 1. Monitor Your Usage

Track rate limit consumption:

```python
import logging

def make_tracked_request(url, headers):
    """Make request and log rate limit info"""
    response = requests.get(url, headers=headers)

    limit = response.headers.get('X-RateLimit-Limit')
    remaining = response.headers.get('X-RateLimit-Remaining')

    if remaining and int(remaining) < int(limit) * 0.2:
        logging.warning(
            f"Rate limit running low: {remaining}/{limit} remaining"
        )

    return response
```

### 2. Cache Responses

Reduce API calls by caching:

```python
from functools import lru_cache
import time

@lru_cache(maxsize=128)
def get_agent_cached(agent_id, cache_time):
    """Fetch agent with caching (cache_time for cache invalidation)"""
    response = requests.get(
        f"https://api.nexusos.io/v1/agents/{agent_id}",
        headers={"Authorization": f"Bearer {api_key}"}
    )
    return response.json()

# Usage - cache for 5 minutes
cache_key = int(time.time() / 300)  # Changes every 5 minutes
agent = get_agent_cached("agt_123", cache_key)
```

### 3. Use Webhooks Instead of Polling

Instead of:
```python
# DON'T: Poll for workflow completion
while True:
    status = get_workflow_status(workflow_id)
    if status == "completed":
        break
    time.sleep(10)  # Wastes API calls
```

Do:
```python
# DO: Use webhooks
workflow = create_workflow({
    "webhook_url": "https://yourapp.com/webhook",
    "events": ["workflow.completed"]
})
```

### 4. Batch Operations

Use batch endpoints when available:

```python
# Instead of multiple requests
for user_id in user_ids:
    get_user(user_id)  # 100 API calls

# Use batch endpoint
get_users_batch(user_ids)  # 1 API call
```

### 5. Request Only What You Need

Use field selection:

```python
# Don't fetch all fields
response = requests.get(
    "https://api.nexusos.io/v1/agents?fields=id,name,status",
    headers={"Authorization": f"Bearer {api_key}"}
)
```

### 6. Implement Circuit Breakers

Prevent cascading failures:

```python
from datetime import datetime, timedelta

class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half-open

    def call(self, func, *args, **kwargs):
        if self.state == "open":
            if datetime.now() - self.last_failure_time > timedelta(seconds=self.timeout):
                self.state = "half-open"
            else:
                raise Exception("Circuit breaker is open")

        try:
            result = func(*args, **kwargs)
            if self.state == "half-open":
                self.state = "closed"
                self.failures = 0
            return result
        except Exception as e:
            self.failures += 1
            self.last_failure_time = datetime.now()

            if self.failures >= self.failure_threshold:
                self.state = "open"

            raise e
```

## Monitoring and Alerts

### Set Up Usage Alerts

Configure alerts in the Developer Portal:

1. Go to **Settings** → **Alerts**
2. Create new alert:
   - **Trigger**: Rate limit usage > 80%
   - **Action**: Send email/webhook
   - **Frequency**: Every 15 minutes

### API Usage Dashboard

View your usage in real-time:

```bash
curl -X GET "https://api.nexusos.io/v1/usage/current" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}"
```

Response:

```json
{
  "period": "current_hour",
  "usage": {
    "api_requests": {
      "used": 687,
      "limit": 1000,
      "percentage": 68.7
    },
    "agent_executions": {
      "used": 42,
      "limit": 100,
      "percentage": 42.0
    },
    "workflow_triggers": {
      "used": 15,
      "limit": 50,
      "percentage": 30.0
    }
  },
  "reset_at": "2025-01-15T12:00:00Z"
}
```

## Upgrading Your Tier

### When to Upgrade

Consider upgrading if you:
- Consistently hit rate limits (>80% usage)
- Need higher concurrency
- Require faster response times
- Want dedicated support

### How to Upgrade

1. Visit the [Developer Portal](https://portal.nexusos.io)
2. Go to **Settings** → **Subscription**
3. Select your new tier
4. Confirm and complete payment

Upgrades take effect immediately; no API changes required.

## Fair Use Policy

While we provide generous rate limits, we reserve the right to throttle or suspend accounts that:

- Make excessive concurrent requests
- Implement inefficient polling instead of webhooks
- Repeatedly trigger expensive operations
- Abuse free tier for production use
- Violate our Terms of Service

## Troubleshooting

### Q: Why am I getting rate limited when I'm below my limit?

**A**: You may be hitting:
- Burst limits (requests per minute)
- Concurrent request limits
- Secondary limits on specific endpoints

### Q: Can I request a rate limit increase?

**A**: Enterprise customers can request custom limits. Contact sales@nexusos.io.

### Q: Do rate limits reset gradually or all at once?

**A**: We use a sliding window algorithm. Limits reset gradually as time passes, not all at once.

### Q: Are rate limits shared across API keys?

**A**: No, each API key has independent rate limits. However, all keys in a workspace share storage and data transfer quotas.

## Additional Resources

- [API Quickstart](./api_quickstart.md)
- [Authentication Guide](./authentication_guide.md)
- [Usage Dashboard](https://portal.nexusos.io/usage)
- [Community Forum](https://community.nexusos.io/c/rate-limits)

## Support

For rate limit questions:
- Email: billing@nexusos.io
- Enterprise Support: enterprise-support@nexusos.io
- Documentation: https://docs.nexusos.io/rate-limits

---

**Note**: Rate limits are subject to change. We'll notify customers 30 days before any limit reductions.
