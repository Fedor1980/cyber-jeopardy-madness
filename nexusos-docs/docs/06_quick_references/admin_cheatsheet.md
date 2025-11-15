---
title: Administrator Cheat Sheet
version: 1.0.0
category: quick-reference
---

# NexusOS Administrator Cheat Sheet

Quick reference for common administrative tasks.

## System Health

```bash
# Overall health check
nexusos-admin health-check

# Detailed health check
nexusos-admin health-check --verbose

# Service status
systemctl status nexusos-*

# View logs
nexusos-admin logs --tail 100
```

## User Management

```bash
# Create user
nexusos-admin create-user --email user@company.com --name "Name" --role developer

# Deactivate user
nexusos-admin deactivate-user --email user@company.com

# Reset password
nexusos-admin reset-password --email user@company.com

# List users
nexusos-admin list-users

# Create API key
nexusos-admin create-api-key --user alice@company.com --scopes "agents:*"
```

## Monitoring

```bash
# View metrics
nexusos-admin metrics --metric error_rate

# Check resource usage
nexusos-admin usage

# Active incidents
nexusos-incident list --active

# Audit logs
nexusos-admin audit-logs --since "24 hours ago"
```

## Backup & Recovery

```bash
# Manual backup
nexusos-backup --type full

# List backups
nexusos-backup list

# Restore
nexusos-restore --backup-file /path/to/backup.tar.gz --confirm
```

## Deployment

```bash
# Deploy update
nexusos-admin deploy --version 1.1.0 --backup-first

# Rollback
nexusos-admin rollback --to-version previous

# Scale service
nexusos-admin scale --service api --replicas 10
```

## Database

```bash
# Connection status
nexusos-admin db-status

# Slow queries
nexusos-admin db-slow-queries

# Kill idle connections
nexusos-admin db-kill-idle --older-than 5m
```

## Security

```bash
# Enable MFA
nexusos-admin set-policy --policy mfa_required --value true

# Rotate keys
nexusos-admin rotate-keys --type api

# Block IP
nexusos-admin firewall --block-ip 203.0.113.45
```

## Troubleshooting

```bash
# Error logs
nexusos-admin logs --level error --since "1 hour ago"

# Recent changes
nexusos-admin recent-changes --since "4 hours ago"

# Service restart
systemctl restart nexusos-api

# Maintenance mode
nexusos-admin maintenance-mode --enable
```

## Emergency Contacts

- Support: admin-support@nexusos.io
- Emergency: +1-800-NEXUSOS
- PagerDuty: Auto-escalation configured

---

**Full Documentation**: [Admin Manual](../03_admin_manual/admin_manual_full.md)
