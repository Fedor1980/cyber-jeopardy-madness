---
title: SLA Definitions
---
# SLA Definitions

## Uptime Calculation

Uptime % = (Total Minutes - Downtime Minutes) / Total Minutes × 100

### Exclusions from Downtime
- Scheduled maintenance (with 48-hour notice)
- Issues caused by customer configuration
- Third-party service outages
- Force majeure events

## Availability Tiers

### Standard (99.5%)
- Maximum downtime: 3.6 hours/month
- Credits: 10% for <99.5%, 25% for <99.0%

### Professional (99.9%)
- Maximum downtime: 43 minutes/month
- Credits: 10% for <99.9%, 25% for <99.5%, 50% for <99.0%

### Enterprise (99.95%)
- Maximum downtime: 21 minutes/month
- Credits: 10% for <99.95%, 25% for <99.9%, 100% for <99.5%

## Support Response Times

| Priority | Description | Response | Resolution Target |
|----------|-------------|----------|-------------------|
| P0 | Service Down | 15 min | 4 hours |
| P1 | Severe Impact | 1 hour | 8 hours |
| P2 | Medium Impact | 4 hours | 48 hours |
| P3 | Low Impact | 1 business day | 5 business days |

## SLA Credits

Credits calculated as percentage of monthly fees:
- Applied automatically to next invoice
- Cannot exceed 100% of monthly fees
- Must be claimed within 30 days
