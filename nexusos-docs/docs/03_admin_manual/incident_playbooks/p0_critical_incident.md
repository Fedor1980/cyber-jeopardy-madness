---
title: P0 Critical Incident Response Playbook
version: 1.0.0
last_updated: 2025-01-15
category: incident-response
severity: P0 - Critical
sla_response_time: 15 minutes
---

# P0 Critical Incident Response Playbook

## Definition

A P0 incident is a **critical issue** affecting all or most users, causing complete service unavailability or data loss risk.

### P0 Criteria

- Complete system outage (>95% of users affected)
- Data breach or loss
- Security compromise
- Payment system failure
- Legal/regulatory violation in progress

### Response SLA

- **Detection to Response**: 15 minutes
- **Response to Mitigation**: 1 hour
- **Mitigation to Resolution**: 4 hours
- **Communication**: Every 30 minutes

## Immediate Response (0-15 minutes)

### Step 1: Incident Declaration

**Who**: On-call engineer or any team member who discovers the issue

**Actions**:
1. Open incident war room channel: `/incident create p0 [brief-description]`
2. Page incident commander: `@incident-commander`
3. Activate PagerDuty escalation policy
4. Set incident status page to "Major Outage"

**Example Command**:
```bash
# Create incident
nexusos-incident create \
  --severity p0 \
  --title "Complete API outage" \
  --description "All API endpoints returning 503" \
  --notify pagerduty,slack,email

# Update status page
nexusos-status update --status major-outage \
  --message "We are experiencing a complete service outage. Our team is investigating."
```

### Step 2: Assemble Response Team

**Required Roles**:
- Incident Commander (IC)
- Technical Lead
- Communications Lead
- Customer Success representative
- Engineering on-call

**IC Responsibilities**:
- Coordinate response efforts
- Make final decisions
- Manage communications
- Delegate tasks
- Maintain timeline

### Step 3: Initial Assessment

**Gather Information** (5 minutes):

```bash
# System health
nexusos-admin health-check --verbose

# Service status
kubectl get pods -n nexusos
systemctl status nexusos-*

# Recent changes
nexusos-admin recent-changes --since "1 hour ago"

# Error logs
nexusos-admin logs --level error --tail 100

# Monitoring dashboards
open https://monitoring.nexusos.io/dashboard/incident
```

**Key Questions**:
- When did the incident start?
- What changed recently?
- What services are affected?
- How many users are impacted?
- Is data at risk?

## Triage and Diagnosis (15-45 minutes)

### Step 4: Rapid Diagnosis

**Check Common Causes**:

1. **Database Issues**:
```bash
# Connection status
nexusos-admin db-status

# Active connections
nexusos-admin db-connections --count

# Slow queries
nexusos-admin db-slow-queries --limit 10
```

2. **Infrastructure Failures**:
```bash
# Cloud provider status
curl https://status.aws.amazon.com/data.json

# Load balancer health
aws elbv2 describe-target-health --target-group-arn $TG_ARN

# Auto-scaling events
aws autoscaling describe-scaling-activities --max-records 10
```

3. **Application Errors**:
```bash
# Error rate spike
nexusos-admin metrics --metric error_rate --since "1 hour ago"

# Exception traces
nexusos-admin logs --level fatal --trace

# Recent deployments
nexusos-admin deployments --status failed --limit 5
```

4. **External Dependencies**:
```bash
# Third-party API status
nexusos-admin check-dependencies

# DNS resolution
dig api.nexusos.io +short

# SSL certificate
echo | openssl s_client -connect api.nexusos.io:443 2>/dev/null | openssl x509 -noout -dates
```

### Step 5: Implement Immediate Mitigation

**If cause is identified**, implement quickest mitigation:

**Rollback Recent Deployment**:
```bash
nexusos-admin rollback --to-version previous --confirm
```

**Scale Up Resources**:
```bash
nexusos-admin scale --service api --replicas 20
```

**Enable Maintenance Mode**:
```bash
nexusos-admin maintenance-mode --enable \
  --message "System under maintenance. We'll be back shortly."
```

**Failover to DR Site**:
```bash
# See disaster_recovery.md for complete procedure
nexusos-admin failover --site dr-west --confirm
```

**If cause is unknown**, implement protective measures:
```bash
# Rate limiting
nexusos-admin set-rate-limit --global --limit 100/min

# Disable non-critical features
nexusos-admin disable-features --non-critical

# Circuit breaker activation
nexusos-admin circuit-breaker --enable --service third-party-api
```

## Communication (Throughout Incident)

### Step 6: Customer Communication

**Initial Notification** (within 15 minutes):

```
Subject: [INCIDENT] Service Disruption - Investigation Underway

We are currently experiencing a service disruption affecting all users.
Our team has been alerted and is actively investigating.

Status: https://status.nexusos.io
Updates: Every 30 minutes

We apologize for the inconvenience and are working to resolve this as quickly as possible.
```

**Update Template** (every 30 minutes):

```
Update [HH:MM UTC]:

Current Status: [Investigating / Identified / Monitoring]

What we know:
- [Brief description of issue]
- [Impact scope]
- [Current actions]

Next Update: [Time]
```

### Step 7: Internal Communication

**War Room Updates** (every 15 minutes):

```
# Update format
@here Status Update - [TIME]

SITUATION:
- [What's happening]

ACTIONS TAKEN:
- [What we've done]

NEXT STEPS:
- [What's next]

BLOCKERS:
- [What's blocking us]
```

## Resolution (45 minutes - 4 hours)

### Step 8: Implement Fix

**Structured Approach**:

1. **Verify Fix in Staging**:
```bash
# Deploy to staging
nexusos-admin deploy --environment staging --version fix-branch

# Run smoke tests
nexusos-admin test --suite smoke --environment staging

# Verify metrics
nexusos-admin metrics --environment staging --watch 5m
```

2. **Deploy to Production**:
```bash
# Canary deployment (10% traffic)
nexusos-admin deploy --environment production \
  --version fix-branch \
  --strategy canary \
  --canary-percentage 10

# Monitor for 15 minutes
# If successful, proceed

# Full deployment
nexusos-admin deploy --environment production \
  --version fix-branch \
  --strategy rolling
```

3. **Verify Resolution**:
```bash
# Health checks
nexusos-admin health-check --comprehensive

# Error rates
nexusos-admin metrics --metric error_rate --compare baseline

# User impact
nexusos-admin metrics --metric active_users --compare pre-incident
```

### Step 9: Confirm Recovery

**Verification Checklist**:

- [ ] All services healthy
- [ ] Error rate returned to baseline (<0.1%)
- [ ] Response times normal (<500ms p95)
- [ ] No degraded services
- [ ] User can complete critical flows
- [ ] Monitoring shows stable metrics (15 min)

**Customer Confirmation**:

```
Subject: [RESOLVED] Service Restored

The service disruption has been resolved as of [TIME UTC].

All systems are now operational and functioning normally.

Summary:
- Start: [TIME]
- End: [TIME]
- Duration: [X hours X minutes]
- Root Cause: [Brief description]

Post-Mortem:
A detailed post-mortem will be published within 5 business days at:
https://status.nexusos.io/incidents/[ID]

We sincerely apologize for the disruption.
```

## Post-Incident (Within 24 hours)

### Step 10: Incident Documentation

**Immediate Documentation**:

```bash
# Generate incident report
nexusos-incident report --id INC-12345 \
  --include-timeline \
  --include-metrics \
  --include-communications \
  --output incident-report.md
```

**Timeline Export**:
```bash
nexusos-incident timeline --id INC-12345 --export timeline.csv
```

### Step 11: Close Incident

**Closure Checklist**:

- [ ] Service fully restored
- [ ] Monitoring stable for 2 hours
- [ ] Customer communication sent
- [ ] Incident report generated
- [ ] Post-mortem scheduled
- [ ] Status page updated to "Resolved"

**Close Incident**:
```bash
nexusos-incident close --id INC-12345 \
  --resolution "Service restored after database failover" \
  --notify all
```

## Post-Mortem (Within 5 Business Days)

### Conduct Blameless Post-Mortem

**Template**: See [post_mortem_template.md](../../08_templates/post_mortem_template.md)

**Required Attendees**:
- Incident Commander
- Technical Lead
- Engineering Manager
- Product Manager
- Customer Success Lead

**Discussion Points**:
1. What happened? (Timeline)
2. What was the root cause?
3. What went well?
4. What could be improved?
5. Action items (with owners and deadlines)

**Publish Post-Mortem**:
```bash
nexusos-incident publish-postmortem --id INC-12345 \
  --file postmortem.md \
  --visibility public
```

## Prevention

### Action Items

Create follow-up tasks:

```bash
# Track action items
nexusos-incident create-actions --id INC-12345 \
  --action "Add database failover automation" \
  --owner alice@company.com \
  --due-date "2025-02-01"

nexusos-incident create-actions --id INC-12345 \
  --action "Improve monitoring alerts" \
  --owner bob@company.com \
  --due-date "2025-01-30"
```

### Testing and Validation

**Runbook Exercise**: Schedule within 30 days
- Test failover procedures
- Verify backup restoration
- Practice incident response

## Appendix

### Emergency Contacts

| Role | Contact | Phone |
|------|---------|-------|
| Incident Commander | See PagerDuty | - |
| CTO | cto@nexusos.io | +1-555-0100 |
| VP Engineering | vpe@nexusos.io | +1-555-0101 |
| Security Lead | security@nexusos.io | +1-555-0102 |

### Escalation Path

1. On-call engineer (0-15 min)
2. Engineering Manager (15-30 min)
3. VP Engineering (30-60 min)
4. CTO (60+ min or data breach)
5. CEO (legal/regulatory issues)

### Critical Systems Access

```bash
# Production database (read-only)
export DB_READONLY_HOST=prod-db-ro.nexusos.io

# Production logs
export LOGS_BUCKET=s3://nexusos-prod-logs

# Monitoring
https://monitoring.nexusos.io

# Status page admin
https://manage.statuspage.io
```

### Useful Commands Reference

```bash
# Quick health check
nexusos-admin health

# Rollback deployment
nexusos-admin rollback --confirm

# Enable maintenance mode
nexusos-admin maintenance --on

# View active incidents
nexusos-incident list --active

# Get metrics
nexusos-admin metrics --dashboard incident
```

---

**Remember**: Stay calm, communicate clearly, and follow the playbook. You've got this!

**Questions?** Contact incident-response@nexusos.io
