---
title: P2 Medium Priority Incident Response
version: 1.0.0
severity: P2 - Medium
sla_response_time: 4 hours
---

# P2 Medium Priority Incident Response

## Definition
P2 incidents cause minor issues affecting a small number of users or non-critical functionality.

### P2 Criteria
- Minor performance degradation
- Non-critical feature affected
- <25% of users impacted
- Workaround available
- Cosmetic issues affecting UX

### Response SLA
- Response: 4 business hours
- Resolution: 48 hours
- Communication: As needed

## Response Steps

### 1. Create Ticket
```bash
nexusos-incident create --severity p2 --title "[Issue]"
```

### 2. Investigate
- Review logs and metrics
- Reproduce issue if possible
- Identify root cause

### 3. Plan Fix
- Develop solution
- Test in staging
- Schedule deployment

### 4. Deploy Fix
```bash
nexusos-admin deploy --environment staging --verify
nexusos-admin deploy --environment production --strategy rolling
```

### 5. Verify and Close
- Confirm issue resolved
- Update ticket
- Notify affected users if applicable

## Escalation
Escalate to P1 if:
- User impact increases
- Workaround becomes unavailable
- Issue affects critical path

---

For higher severity incidents, see [P1](./p1_high_priority.md) or [P0](./p0_critical_incident.md) playbooks.
