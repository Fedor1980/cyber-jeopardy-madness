---
title: API Quickstart Guide
version: 1.0.0
last_updated: 2025-01-15
category: api
difficulty: beginner
estimated_time: 10 minutes
---

# NexusOS API Quickstart Guide

Get up and running with the NexusOS API in just 10 minutes. This guide walks you through authentication, making your first request, and common operations.

## Prerequisites

- Active NexusOS account ([sign up here](https://portal.nexusos.io/signup))
- Command-line access with `curl` installed
- Basic understanding of REST APIs and JSON

## Step 1: Obtain API Credentials

### Option A: API Key (Recommended for Getting Started)

1. Log in to the [Developer Portal](https://portal.nexusos.io)
2. Navigate to **Settings** → **API Keys**
3. Click **Generate New API Key**
4. Name your key (e.g., "Development Key")
5. Copy and save the key securely (you'll only see it once)

### Option B: OAuth 2.0 Client

1. Go to **Settings** → **OAuth Applications**
2. Click **New Application**
3. Fill in application details
4. Note your `client_id` and `client_secret`

## Step 2: Set Up Your Environment

Export your API key as an environment variable:

```bash
export NEXUSOS_API_KEY="your-api-key-here"
export NEXUSOS_BASE_URL="https://api.nexusos.io/v1"
```

For convenience, add this to your `~/.bashrc` or `~/.zshrc`.

## Step 3: Test Your Connection

Verify your credentials work:

```bash
curl -X GET "${NEXUSOS_BASE_URL}/health" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" \
  -H "Content-Type: application/json"
```

Expected response:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:30:00Z",
  "region": "us-east-1"
}
```

## Step 4: Make Your First Request

### List Your Agents

Retrieve all agents in your workspace:

```bash
curl -X GET "${NEXUSOS_BASE_URL}/agents" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" \
  -H "Content-Type: application/json"
```

Response:

```json
{
  "data": [
    {
      "id": "agt_1234567890",
      "name": "Customer Support Bot",
      "type": "conversational",
      "status": "active",
      "created_at": "2025-01-10T14:22:00Z",
      "last_executed": "2025-01-15T09:45:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "per_page": 20,
    "has_more": false
  }
}
```

## Step 5: Create a New Agent

Create your first AI agent:

```bash
curl -X POST "${NEXUSOS_BASE_URL}/agents" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Data Analyzer",
    "type": "analytical",
    "description": "Analyzes customer data and generates insights",
    "config": {
      "model": "nexus-gpt-4",
      "temperature": 0.7,
      "max_tokens": 2000
    },
    "capabilities": ["data_analysis", "visualization", "reporting"],
    "tags": ["analytics", "customer-data"]
  }'
```

Response:

```json
{
  "id": "agt_9876543210",
  "name": "Data Analyzer",
  "type": "analytical",
  "status": "active",
  "description": "Analyzes customer data and generates insights",
  "config": {
    "model": "nexus-gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000
  },
  "capabilities": ["data_analysis", "visualization", "reporting"],
  "tags": ["analytics", "customer-data"],
  "created_at": "2025-01-15T10:35:00Z",
  "created_by": "usr_1111111111",
  "workspace_id": "wks_2222222222"
}
```

## Step 6: Execute an Agent

Run your newly created agent:

```bash
curl -X POST "${NEXUSOS_BASE_URL}/agents/agt_9876543210/execute" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "task": "Analyze Q4 sales data",
      "dataset_id": "ds_5555555555",
      "output_format": "summary"
    },
    "options": {
      "async": false,
      "timeout": 60
    }
  }'
```

Response:

```json
{
  "execution_id": "exe_7777777777",
  "agent_id": "agt_9876543210",
  "status": "completed",
  "started_at": "2025-01-15T10:36:00Z",
  "completed_at": "2025-01-15T10:36:15Z",
  "duration_ms": 15000,
  "result": {
    "summary": "Q4 sales increased 23% YoY, driven by enterprise segment growth",
    "key_metrics": {
      "total_revenue": 5200000,
      "growth_rate": 0.23,
      "top_product": "Enterprise Suite"
    },
    "recommendations": [
      "Expand enterprise sales team",
      "Increase marketing budget for Enterprise Suite",
      "Develop advanced features for enterprise customers"
    ]
  },
  "usage": {
    "tokens": 1547,
    "cost_usd": 0.0231
  }
}
```

## Step 7: Retrieve Agent Details

Get detailed information about a specific agent:

```bash
curl -X GET "${NEXUSOS_BASE_URL}/agents/agt_9876543210" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" \
  -H "Content-Type: application/json"
```

## Step 8: Update an Agent

Modify agent configuration:

```bash
curl -X PATCH "${NEXUSOS_BASE_URL}/agents/agt_9876543210" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Advanced data analyzer with ML capabilities",
    "config": {
      "temperature": 0.5
    },
    "tags": ["analytics", "customer-data", "machine-learning"]
  }'
```

## Step 9: List Users in Your Workspace

```bash
curl -X GET "${NEXUSOS_BASE_URL}/users?workspace_id=wks_2222222222" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" \
  -H "Content-Type: application/json"
```

Response:

```json
{
  "data": [
    {
      "id": "usr_1111111111",
      "email": "admin@company.com",
      "name": "Admin User",
      "role": "admin",
      "status": "active",
      "created_at": "2024-11-01T08:00:00Z",
      "last_login": "2025-01-15T09:00:00Z"
    },
    {
      "id": "usr_3333333333",
      "email": "developer@company.com",
      "name": "Dev User",
      "role": "developer",
      "status": "active",
      "created_at": "2024-12-15T10:00:00Z",
      "last_login": "2025-01-14T16:30:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "per_page": 20,
    "has_more": false
  }
}
```

## Step 10: Working with Workflows

### Create a Workflow

```bash
curl -X POST "${NEXUSOS_BASE_URL}/workflows" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Customer Onboarding",
    "description": "Automated customer onboarding workflow",
    "trigger": {
      "type": "webhook",
      "config": {
        "method": "POST",
        "path": "/onboard"
      }
    },
    "steps": [
      {
        "id": "step_1",
        "type": "agent_execution",
        "agent_id": "agt_9876543210",
        "config": {
          "task": "Validate customer data"
        }
      },
      {
        "id": "step_2",
        "type": "email",
        "config": {
          "template": "welcome_email",
          "to": "{{customer.email}}"
        },
        "depends_on": ["step_1"]
      }
    ]
  }'
```

### Trigger a Workflow

```bash
curl -X POST "${NEXUSOS_BASE_URL}/workflows/wfl_8888888888/trigger" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "customer": {
        "email": "newcustomer@example.com",
        "name": "John Doe",
        "company": "Acme Corp"
      }
    }
  }'
```

## Common Patterns

### Pagination

Use `page` and `per_page` parameters:

```bash
curl -X GET "${NEXUSOS_BASE_URL}/agents?page=2&per_page=10" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" \
  -H "Content-Type: application/json"
```

### Filtering

Apply filters with query parameters:

```bash
curl -X GET "${NEXUSOS_BASE_URL}/agents?status=active&type=analytical" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" \
  -H "Content-Type: application/json"
```

### Sorting

Sort results using the `sort` parameter:

```bash
curl -X GET "${NEXUSOS_BASE_URL}/agents?sort=-created_at" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" \
  -H "Content-Type: application/json"
```

(Use `-` prefix for descending order)

### Field Selection

Request specific fields only:

```bash
curl -X GET "${NEXUSOS_BASE_URL}/agents?fields=id,name,status" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}" \
  -H "Content-Type: application/json"
```

## Error Handling

### Example Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid agent configuration",
    "details": [
      {
        "field": "config.temperature",
        "issue": "Must be between 0 and 1"
      }
    ],
    "request_id": "req_abc123xyz",
    "timestamp": "2025-01-15T10:40:00Z"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_FAILED` | 401 | Invalid or expired credentials |
| `INSUFFICIENT_PERMISSIONS` | 403 | Lack required permissions |
| `RESOURCE_NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 422 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

Monitor your rate limit status via response headers:

```bash
curl -i -X GET "${NEXUSOS_BASE_URL}/agents" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}"
```

Look for these headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1642248000
```

## Next Steps

Now that you've completed the quickstart:

1. **Explore the Full API** - Review the [OpenAPI Specification](./openapi.yaml)
2. **Learn Authentication** - Read the [Authentication Guide](./authentication_guide.md)
3. **Use an SDK** - Install an official SDK for your language
4. **Join the Community** - Visit [community.nexusos.io](https://community.nexusos.io)
5. **Build Something** - Check out [example applications](https://github.com/nexusos/examples)

## Complete Example Script

Here's a complete bash script that demonstrates the full workflow:

```bash
#!/bin/bash
set -e

# Configuration
API_KEY="${NEXUSOS_API_KEY}"
BASE_URL="https://api.nexusos.io/v1"

# Create agent
echo "Creating agent..."
AGENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/agents" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quickstart Agent",
    "type": "analytical",
    "description": "Agent created via quickstart guide"
  }')

AGENT_ID=$(echo $AGENT_RESPONSE | jq -r '.id')
echo "Created agent: ${AGENT_ID}"

# Execute agent
echo "Executing agent..."
EXEC_RESPONSE=$(curl -s -X POST "${BASE_URL}/agents/${AGENT_ID}/execute" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "task": "Hello, NexusOS!"
    }
  }')

echo "Execution result:"
echo $EXEC_RESPONSE | jq '.result'

# Clean up
echo "Cleaning up..."
curl -s -X DELETE "${BASE_URL}/agents/${AGENT_ID}" \
  -H "Authorization: Bearer ${API_KEY}"

echo "Done!"
```

## Support

If you encounter issues:

- Check [API Status](https://status.nexusos.io)
- Review [Common Issues](https://docs.nexusos.io/troubleshooting)
- Contact support at api-support@nexusos.io

---

**Congratulations!** You've successfully completed the NexusOS API quickstart guide.
