---
title: Authentication Guide
version: 1.0.0
last_updated: 2025-01-15
category: api
security_level: critical
---

# NexusOS API Authentication Guide

This comprehensive guide covers all authentication methods supported by the NexusOS API, including OAuth 2.0, API keys, and service accounts.

## Overview

NexusOS supports three authentication methods:

1. **API Keys** - Simple, suitable for server-to-server communication
2. **OAuth 2.0** - Standard for user-delegated access
3. **Service Accounts** - For automated systems and CI/CD pipelines

## Authentication Methods Comparison

| Method | Use Case | Security Level | Token Lifetime | Refresh Capability |
|--------|----------|----------------|----------------|-------------------|
| API Keys | Simple integrations | Medium | Permanent* | N/A |
| OAuth 2.0 | User-delegated access | High | 1 hour | Yes |
| Service Accounts | Automation, CI/CD | High | 1 hour | Yes |

*API keys don't expire but can be revoked

## Method 1: API Keys

### When to Use API Keys

- Server-to-server communication
- Internal tools and scripts
- Development and testing
- Simple integrations without user context

### Creating an API Key

1. Log in to the [Developer Portal](https://portal.nexusos.io)
2. Navigate to **Settings** → **API Keys**
3. Click **Generate New API Key**
4. Configure key settings:
   - **Name**: Descriptive name (e.g., "Production Server")
   - **Scopes**: Select required permissions
   - **Expiration**: Optional expiration date
   - **IP Restrictions**: Whitelist allowed IPs (recommended)

5. Click **Generate** and save the key securely

### API Key Format

```
nxs_live_1234567890abcdef1234567890abcdef
```

Prefixes indicate the environment:
- `nxs_live_` - Production keys
- `nxs_test_` - Test/sandbox keys
- `nxs_dev_` - Development keys

### Using API Keys

Include the API key in the `Authorization` header with the `Bearer` scheme:

```bash
curl -X GET "https://api.nexusos.io/v1/agents" \
  -H "Authorization: Bearer nxs_live_1234567890abcdef1234567890abcdef"
```

### API Key Security Best Practices

1. **Never commit keys to version control**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   secrets/
   ```

2. **Use environment variables**
   ```bash
   export NEXUSOS_API_KEY="nxs_live_xxx"
   ```

3. **Implement key rotation**
   - Rotate keys every 90 days
   - Use multiple keys for zero-downtime rotation
   - Revoke unused keys immediately

4. **Restrict key scopes**
   - Grant minimum required permissions
   - Use separate keys for different services

5. **Enable IP whitelisting**
   ```json
   {
     "ip_whitelist": [
       "192.168.1.0/24",
       "10.0.0.100"
     ]
   }
   ```

### Revoking API Keys

Via API:
```bash
curl -X DELETE "https://api.nexusos.io/v1/api-keys/key_123456" \
  -H "Authorization: Bearer ${NEXUSOS_API_KEY}"
```

Via Portal:
1. Go to **Settings** → **API Keys**
2. Find the key to revoke
3. Click **Revoke**

## Method 2: OAuth 2.0

### When to Use OAuth 2.0

- Third-party applications accessing user data
- Mobile and web applications
- When you need user-level permissions
- Public-facing integrations

### Supported OAuth 2.0 Flows

#### Authorization Code Flow (Recommended)

Best for server-side web applications.

**Step 1: Register Your Application**

1. Go to **Settings** → **OAuth Applications**
2. Click **New Application**
3. Fill in details:
   - **Name**: Your app name
   - **Redirect URIs**: Callback URLs (must be HTTPS)
   - **Scopes**: Required permissions
   - **Application Type**: Web Application

4. Save your `client_id` and `client_secret`

**Step 2: Redirect User to Authorization URL**

```
https://auth.nexusos.io/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://yourapp.com/callback&
  response_type=code&
  scope=agents:read agents:write users:read&
  state=random_state_string
```

Parameters:
- `client_id`: Your application's client ID
- `redirect_uri`: Where to send the user after authorization
- `response_type`: Must be `code`
- `scope`: Space-separated list of permissions
- `state`: Random string for CSRF protection

**Step 3: Handle the Callback**

After user authorization, they're redirected to:

```
https://yourapp.com/callback?code=AUTH_CODE&state=random_state_string
```

Verify the `state` parameter matches what you sent.

**Step 4: Exchange Code for Access Token**

```bash
curl -X POST "https://auth.nexusos.io/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=https://yourapp.com/callback"
```

Response:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def50200a8f9b1c2d3e4f5g6h7i8j9k0...",
  "scope": "agents:read agents:write users:read"
}
```

**Step 5: Use Access Token**

```bash
curl -X GET "https://api.nexusos.io/v1/agents" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Step 6: Refresh Access Token**

When the access token expires (after 1 hour):

```bash
curl -X POST "https://auth.nexusos.io/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=def50200a8f9b1c2d3e4f5g6h7i8j9k0..." \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

#### Client Credentials Flow

For machine-to-machine communication.

```bash
curl -X POST "https://auth.nexusos.io/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "scope=agents:read workflows:write"
```

Response:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "agents:read workflows:write"
}
```

#### PKCE Flow (Public Clients)

For mobile and single-page applications that can't securely store secrets.

**Step 1: Generate Code Verifier and Challenge**

```javascript
// Generate code verifier (random string)
const codeVerifier = generateRandomString(128);

// Create code challenge (SHA256 hash, base64url encoded)
const codeChallenge = base64url(sha256(codeVerifier));
```

**Step 2: Authorization Request**

```
https://auth.nexusos.io/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://yourapp.com/callback&
  response_type=code&
  scope=agents:read&
  state=random_state&
  code_challenge=CODE_CHALLENGE&
  code_challenge_method=S256
```

**Step 3: Token Exchange**

```bash
curl -X POST "https://auth.nexusos.io/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "redirect_uri=https://yourapp.com/callback" \
  -d "code_verifier=CODE_VERIFIER"
```

### OAuth 2.0 Scopes

Available scopes:

| Scope | Description |
|-------|-------------|
| `agents:read` | Read agent information |
| `agents:write` | Create and modify agents |
| `agents:execute` | Execute agents |
| `agents:delete` | Delete agents |
| `users:read` | Read user information |
| `users:write` | Create and modify users |
| `workflows:read` | Read workflows |
| `workflows:write` | Create and modify workflows |
| `workflows:execute` | Trigger workflows |
| `analytics:read` | Access analytics data |
| `admin:*` | Full administrative access |

### Token Introspection

Validate and inspect tokens:

```bash
curl -X POST "https://auth.nexusos.io/oauth/introspect" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=ACCESS_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

Response:

```json
{
  "active": true,
  "scope": "agents:read agents:write",
  "client_id": "YOUR_CLIENT_ID",
  "username": "user@example.com",
  "exp": 1642251600,
  "iat": 1642248000,
  "sub": "usr_1234567890"
}
```

### Revoking Tokens

```bash
curl -X POST "https://auth.nexusos.io/oauth/revoke" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=ACCESS_TOKEN_OR_REFRESH_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

## Method 3: Service Accounts

### When to Use Service Accounts

- CI/CD pipelines
- Automated scripts and cron jobs
- System integrations
- Background workers

### Creating a Service Account

Via API:

```bash
curl -X POST "https://api.nexusos.io/v1/service-accounts" \
  -H "Authorization: Bearer ${ADMIN_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CI/CD Pipeline",
    "description": "Service account for GitHub Actions",
    "scopes": ["agents:read", "agents:write", "workflows:execute"],
    "metadata": {
      "environment": "production",
      "owner": "devops-team"
    }
  }'
```

Response:

```json
{
  "id": "sva_9876543210",
  "name": "CI/CD Pipeline",
  "description": "Service account for GitHub Actions",
  "client_id": "sva_client_abc123",
  "client_secret": "sva_secret_xyz789_DO_NOT_SHARE",
  "scopes": ["agents:read", "agents:write", "workflows:execute"],
  "created_at": "2025-01-15T10:00:00Z"
}
```

**Important**: Save the `client_secret` immediately; it won't be shown again.

### Using Service Accounts

Service accounts use the OAuth 2.0 Client Credentials flow:

```bash
# Get access token
TOKEN_RESPONSE=$(curl -s -X POST "https://auth.nexusos.io/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=${SERVICE_ACCOUNT_CLIENT_ID}" \
  -d "client_secret=${SERVICE_ACCOUNT_CLIENT_SECRET}")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

# Use access token
curl -X GET "https://api.nexusos.io/v1/agents" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

### Service Account Best Practices

1. **Use separate service accounts per service**
   - One for CI/CD
   - One for monitoring
   - One for backup scripts

2. **Implement credential rotation**
   ```bash
   # Rotate service account credentials
   curl -X POST "https://api.nexusos.io/v1/service-accounts/sva_123/rotate" \
     -H "Authorization: Bearer ${ADMIN_API_KEY}"
   ```

3. **Monitor service account usage**
   ```bash
   # Get usage logs
   curl -X GET "https://api.nexusos.io/v1/service-accounts/sva_123/logs" \
     -H "Authorization: Bearer ${ADMIN_API_KEY}"
   ```

4. **Store credentials securely**
   - Use secret management services (AWS Secrets Manager, HashiCorp Vault)
   - Never log credentials
   - Encrypt at rest

## Security Best Practices

### General Guidelines

1. **Use HTTPS only** - Never send credentials over HTTP
2. **Validate SSL certificates** - Don't disable certificate verification
3. **Implement token caching** - Reduce token requests
4. **Use short-lived tokens** - Prefer OAuth 2.0 over permanent API keys
5. **Monitor for suspicious activity** - Set up alerts for unusual API usage

### Storing Credentials

**Never:**
```javascript
// DON'T DO THIS
const apiKey = "nxs_live_1234567890abcdef";
```

**Always:**
```javascript
// DO THIS
const apiKey = process.env.NEXUSOS_API_KEY;
```

### Handling Token Expiration

Implement automatic token refresh:

```python
import requests
from datetime import datetime, timedelta

class NexusOSClient:
    def __init__(self, client_id, client_secret):
        self.client_id = client_id
        self.client_secret = client_secret
        self.access_token = None
        self.token_expires_at = None

    def get_access_token(self):
        if self.access_token and self.token_expires_at > datetime.now():
            return self.access_token

        # Token expired or doesn't exist, fetch new one
        response = requests.post(
            "https://auth.nexusos.io/oauth/token",
            data={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret
            }
        )

        data = response.json()
        self.access_token = data["access_token"]
        self.token_expires_at = datetime.now() + timedelta(seconds=data["expires_in"] - 60)

        return self.access_token

    def make_request(self, method, path, **kwargs):
        token = self.get_access_token()
        headers = kwargs.get("headers", {})
        headers["Authorization"] = f"Bearer {token}"
        kwargs["headers"] = headers

        return requests.request(method, f"https://api.nexusos.io/v1{path}", **kwargs)
```

### Rate Limiting and Authentication

Authentication requests are also rate-limited:

- **Token requests**: 10 per minute per client
- **Introspection**: 100 per minute per client
- **Authorization**: 20 per minute per user

Implement exponential backoff for retries.

## Troubleshooting

### Common Authentication Errors

#### 401 Unauthorized

**Error:**
```json
{
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid or expired credentials"
  }
}
```

**Solutions:**
- Verify credentials are correct
- Check if token has expired
- Ensure Authorization header is properly formatted
- Verify API key hasn't been revoked

#### 403 Forbidden

**Error:**
```json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Token lacks required scope: agents:write"
  }
}
```

**Solutions:**
- Request additional scopes during authorization
- Create new API key with required permissions
- Contact admin to grant permissions

#### Invalid Grant

**Error:**
```json
{
  "error": "invalid_grant",
  "error_description": "Authorization code has expired"
}
```

**Solutions:**
- Authorization codes expire after 10 minutes
- Don't reuse authorization codes
- Start the OAuth flow again

### Testing Authentication

Use our authentication test endpoint:

```bash
curl -X GET "https://api.nexusos.io/v1/auth/test" \
  -H "Authorization: Bearer ${YOUR_TOKEN}"
```

Response:

```json
{
  "authenticated": true,
  "token_type": "api_key",
  "user_id": "usr_1234567890",
  "scopes": ["agents:read", "agents:write"],
  "expires_at": null
}
```

## Additional Resources

- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)
- [NexusOS Security Whitepaper](https://nexusos.io/security)
- [Developer Portal](https://portal.nexusos.io)

## Support

For authentication issues:
- Email: security@nexusos.io
- Documentation: https://docs.nexusos.io/security
- Community: https://community.nexusos.io/c/authentication

---

**Security Notice**: Never share your credentials. If you believe your credentials have been compromised, revoke them immediately through the Developer Portal.
