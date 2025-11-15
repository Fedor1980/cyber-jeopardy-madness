---
title: Condensed Administrator Manual
version: 1.0.0
last_updated: 2025-01-15
category: admin
audience: system-administrators
---

# NexusOS Admin Manual - Quick Reference

Condensed version of the complete admin manual. For detailed information, see [Full Admin Manual](./admin_manual_full.md).

## Quick Start

### Essential Commands

```bash
# System health check
nexusos-admin health-check

# View logs
nexusos-admin logs --tail 100

# Restart services
systemctl restart nexusos-*

# Backup now
nexusos-backup --type full
```

### Admin Console Access

- URL: `https://your-domain/admin`
- Require MFA: Yes
- Default port: 443

## User Management

### Create User
```bash
nexusos-admin create-user \
  --email user@company.com \
  --name "John Doe" \
  --role developer
```

### Deactivate User
```bash
nexusos-admin deactivate-user --email user@company.com
```

### Reset Password
```bash
nexusos-admin reset-password --email user@company.com
```

## System Monitoring

### Key Metrics

| Metric | Threshold | Alert Level |
|--------|-----------|-------------|
| CPU | >80% | Warning |
| Memory | >85% | Warning |
| Disk | <20% free | Critical |
| Error rate | >1% | Critical |
| Response time | >1000ms | Warning |

### Health Check URLs

```
https://your-domain/health          # Overall health
https://your-domain/health/database # Database
https://your-domain/health/cache    # Redis
```

## Security

### Enable MFA for All Users
```bash
nexusos-admin set-policy --policy mfa_required --value true
```

### API Key Management
```bash
# Create API key
nexusos-admin create-api-key --user alice@company.com

# List API keys
nexusos-admin list-api-keys --user alice@company.com

# Revoke API key
nexusos-admin revoke-api-key --key-id key_abc123
```

### Review Audit Logs
```bash
nexusos-admin audit-logs --since "24 hours ago"
```

## Backup and Recovery

### Backup Schedule

- Database: Every 6 hours
- Files: Daily at 2 AM
- Configuration: Daily at 3 AM
- Retention: 30 days

### Manual Backup
```bash
nexusos-backup --type full --output /backups/manual.tar.gz
```

### Restore from Backup
```bash
nexusos-restore --backup-file /backups/backup.tar.gz --confirm
```

## Updates

### Apply Update
```bash
# Download
nexusos-admin download-update --version 1.1.0

# Apply
nexusos-admin apply-update --version 1.1.0 --backup-first

# Verify
nexusos-admin verify-installation --version 1.1.0
```

## Troubleshooting

### Common Issues

**High CPU**:
- Scale up infrastructure
- Check agent queue depth
- Optimize expensive agents

**Database Connections**:
```bash
nexusos-admin db-kill-idle --older-than 5m
nexusos-admin set-config database.pool_size 100
```

**Slow Responses**:
- Check cache hit rate
- Review slow queries
- Scale application servers

### Emergency Contacts

- Support: admin-support@nexusos.io
- Emergency: +1-800-NEXUSOS
- Pager: Use PagerDuty integration

## Configuration Files

| File | Purpose |
|------|---------|
| `/etc/nexusos/config.yaml` | Main configuration |
| `/etc/nexusos/database.conf` | Database settings |
| `/etc/nexusos/redis.conf` | Cache configuration |
| `/etc/nexusos/nginx.conf` | Web server config |

## Performance Tuning

### Database
```bash
# Connection pool
nexusos-admin set-config database.pool_size 50

# Query timeout
nexusos-admin set-config database.timeout 30
```

### Caching
```bash
# Cache TTL
nexusos-admin set-cache-ttl --resource agents --ttl 3600

# Max memory
redis-cli CONFIG SET maxmemory 4gb
```

### Auto-scaling
```bash
nexusos-admin set-autoscaling \
  --min-replicas 3 \
  --max-replicas 20 \
  --target-cpu 70
```

## Incident Response

For detailed incident procedures, see:

- [P0 Critical](./incident_playbooks/p0_critical_incident.md)
- [P1 High Priority](./incident_playbooks/p1_high_priority.md)
- [P2 Medium Priority](./incident_playbooks/p2_medium_priority.md)
- [Security Breach](./incident_playbooks/security_breach_response.md)
- [Disaster Recovery](./incident_playbooks/disaster_recovery.md)

### Quick Response Steps

1. **Assess severity** - P0, P1, or P2?
2. **Notify team** - Use incident channel
3. **Follow playbook** - Execute response procedures
4. **Document** - Log all actions
5. **Post-mortem** - After resolution

## Best Practices

- ✅ Enable MFA for all admin accounts
- ✅ Rotate credentials every 90 days
- ✅ Monitor logs daily
- ✅ Backup before changes
- ✅ Test in staging first
- ✅ Document all changes
- ✅ Keep system updated
- ✅ Use IP whitelisting

## Additional Resources

- Full Admin Manual: [admin_manual_full.md](./admin_manual_full.md)
- API Documentation: [../01_api_documentation/](../01_api_documentation/)
- Support Portal: https://support.nexusos.io
- Status Page: https://status.nexusos.io

---

**For emergencies**, call +1-800-NEXUSOS (24/7)
