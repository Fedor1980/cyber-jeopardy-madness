# Security Documentation

## Overview

Cyber Jeopardy Madness implements defense-in-depth security controls appropriate for financial institution deployment.

## Security Controls by Layer

### 1. Application Security

#### Authentication & Authorization

**JWT-Based Authentication**
- Access tokens (24-hour expiration)
- Refresh tokens (7-day expiration)
- Token rotation on refresh
- Secure token storage (localStorage with httpOnly option recommended for production)

**Password Security**
- bcrypt hashing (12 rounds)
- Minimum 8 characters
- No password transmission in logs
- Secure password reset flow

**Role-Based Access Control (RBAC)**
```
Roles:
├── Admin (full system access)
├── Facilitator (game management)
└── Player (game participation)
```

#### Input Validation

**Joi Schema Validation**
- All request bodies validated
- Type checking enforced
- String length limits
- Regex pattern matching
- Array size constraints

**Sanitization**
- HTML entity encoding
- Script tag removal
- SQL injection prevention (parameterized queries)
- XSS prevention

#### Rate Limiting

```typescript
General API: 100 requests / 15 minutes
Auth Endpoints: 5 requests / 15 minutes
AI Endpoints: 10 requests / 1 minute
```

### 2. Network Security

#### CORS Configuration
```typescript
Origin: Configured whitelist
Credentials: true
Methods: GET, POST, PUT, PATCH, DELETE
Headers: Authorization, Content-Type
```

#### Security Headers (Helmet.js)
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### 3. Data Security

#### Encryption

**At Rest**
- Database encryption (PostgreSQL native)
- Password hashing (bcrypt)
- Sensitive configuration in environment variables

**In Transit**
- HTTPS/TLS 1.3 required in production
- Certificate pinning recommended
- Secure WebSocket connections (WSS)

#### Data Classification

| Level | Examples | Protection |
|-------|----------|------------|
| Public | Game questions, categories | None required |
| Internal | Session data, team scores | Authentication required |
| Confidential | User credentials, API keys | Encryption + restricted access |
| Restricted | Audit logs, admin actions | Encryption + audit trail |

### 4. Database Security

#### SQL Injection Prevention
- Parameterized queries exclusively
- No dynamic SQL construction
- Input validation before queries
- ORM-style prepared statements

#### Access Controls
```sql
-- Application user (limited privileges)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES TO app_user;

-- Migration user (schema changes)
GRANT ALL PRIVILEGES ON DATABASE cyber_jeopardy TO migration_user;

-- Read-only reporting user
GRANT SELECT ON ALL TABLES TO reporting_user;
```

#### Connection Security
- SSL/TLS connections required
- Connection pooling (max 20)
- Timeout configurations
- Credential rotation procedures

### 5. API Security

#### Authentication Flow
```
1. Client sends credentials
2. Server validates (rate limited)
3. Server generates JWT tokens
4. Client stores tokens securely
5. Client includes token in requests
6. Server validates on each request
```

#### Token Security
- Short expiration times
- Token blacklisting capability
- Refresh token rotation
- Secure signing algorithm (HS256)

#### Endpoint Protection

**Public Endpoints**
- `/api/v1/health` - Health check
- Rate limited

**Authenticated Endpoints**
- All game operations
- User management
- Require valid JWT

**Admin-Only Endpoints**
- User administration
- System configuration
- Audit log access

### 6. Audit & Logging

#### Audit Log Entries

```sql
audit_logs table:
  - user_id (who)
  - action (what)
  - resource_type (where)
  - resource_id (which)
  - details (how/why)
  - ip_address (from where)
  - user_agent (with what)
  - timestamp (when)
```

#### Logged Actions
- User authentication (success/failure)
- Session creation
- Answer submissions
- Score changes
- Configuration changes
- Administrative actions

#### Log Retention
- Security logs: 90 days minimum
- Audit logs: 1 year minimum
- Access logs: 30 days
- Error logs: 90 days

### 7. Error Handling

#### Secure Error Responses

**Production**
```json
{
  "error": "Error",
  "message": "An error occurred",
  "code": "INTERNAL_SERVER_ERROR"
}
```

**Development**
```json
{
  "error": "Error",
  "message": "Detailed error message",
  "code": "SPECIFIC_ERROR_CODE",
  "details": {
    "stack": "Error stack trace"
  }
}
```

#### Information Disclosure Prevention
- Generic error messages in production
- No stack traces exposed
- No database error details
- No file path information

## Compliance Alignment

### NCUA Requirements

**Part 748 Appendix B - Information Security Program**

✅ Administrative Safeguards
- Security policies documented
- Employee training materials
- Access control procedures
- Incident response plan

✅ Technical Safeguards
- Access controls implemented
- Audit logs maintained
- Encryption for sensitive data
- Vulnerability scanning

✅ Physical Safeguards
- Server security (Docker/cloud)
- Backup procedures
- Disaster recovery plan

### FFIEC Cybersecurity Assessment Tool

**Cyber Risk Management**
- ✅ Risk assessment process
- ✅ Security policies
- ✅ Incident response procedures

**Threat Intelligence**
- ✅ Threat awareness
- ✅ Security monitoring
- ✅ Vulnerability management

**Cybersecurity Controls**
- ✅ Preventive controls (authentication, validation)
- ✅ Detective controls (logging, monitoring)
- ✅ Corrective controls (error handling, recovery)

**External Dependency Management**
- ✅ Vendor risk management
- ✅ Third-party security (AI providers)
- ✅ Supply chain security

**Cyber Incident Management**
- ✅ Incident detection
- ✅ Response procedures
- ✅ Recovery processes

## Security Best Practices

### Deployment Security

**Environment Variables**
```bash
# Never commit to version control
.env
.env.local
.env.production

# Use secrets management
- Docker secrets
- Kubernetes secrets
- Cloud provider secret stores
```

**Database Security**
```bash
# Strong passwords
DB_PASSWORD=$(openssl rand -base64 32)

# SSL connections
DB_SSL_MODE=require

# Limited privileges
DB_USER=app_user # not postgres superuser
```

**JWT Configuration**
```bash
# Strong secrets
JWT_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)

# Minimum lengths
JWT_SECRET: 32+ characters
JWT_REFRESH_SECRET: 32+ characters
```

### Secure Development

**Code Review Checklist**
- [ ] No hardcoded secrets
- [ ] Input validation on all endpoints
- [ ] Parameterized queries only
- [ ] Error handling implemented
- [ ] Authentication required where needed
- [ ] Authorization checked
- [ ] Logging added for security events
- [ ] Rate limiting configured

**Dependency Management**
```bash
# Regular updates
npm audit
npm audit fix

# Vulnerability scanning
npm run test:security
```

### Incident Response

**Detection**
1. Monitor audit logs
2. Review error logs
3. Check rate limit violations
4. Analyze authentication failures

**Response**
1. Isolate affected systems
2. Preserve evidence (logs, database snapshots)
3. Notify affected users (NCUA requirements)
4. Implement fixes
5. Document incident

**Recovery**
1. Restore from backups if needed
2. Verify system integrity
3. Update security controls
4. Conduct post-incident review

## Security Testing

### Automated Testing

**Unit Tests**
- Authentication logic
- Password hashing
- Token generation/validation
- Input validation
- Error handling

**Integration Tests**
- API endpoint security
- Authentication flows
- Authorization checks
- Rate limiting

**Security Scanning**
```bash
# Dependency vulnerabilities
npm audit

# Container scanning
trivy image cyber-jeopardy-backend
trivy image cyber-jeopardy-frontend

# Static analysis
eslint --ext .ts src/
```

### Manual Testing

**Penetration Testing**
- SQL injection attempts
- XSS attempts
- CSRF testing
- Authentication bypass attempts
- Authorization bypass attempts

**Recommended Tools**
- OWASP ZAP
- Burp Suite
- SQLMap
- Nikto

## Vulnerability Disclosure

### Reporting

**Contact**: security@cyberjeopardymadness.com

**Process**
1. Report vulnerability via email
2. Receive acknowledgment within 24 hours
3. Work with team on remediation
4. Disclosure after fix deployment

**Scope**
- Authentication/authorization bypasses
- SQL injection
- XSS vulnerabilities
- Sensitive data exposure
- Rate limiting bypasses

## Security Roadmap

### Planned Enhancements

**Q1**
- [ ] Implement CSP (Content Security Policy)
- [ ] Add 2FA/MFA support
- [ ] Implement session management

**Q2**
- [ ] Add Redis for rate limiting
- [ ] Implement API key management
- [ ] Add security headers analyzer

**Q3**
- [ ] Implement intrusion detection
- [ ] Add automated security testing
- [ ] Conduct external penetration test

**Q4**
- [ ] Achieve SOC 2 Type 1 certification
- [ ] Implement SIEM integration
- [ ] Add automated threat intelligence

---

**Security is everyone's responsibility. Report suspicious activity immediately.**
