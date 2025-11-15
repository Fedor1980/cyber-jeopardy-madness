---
title: Frequently Asked Questions
version: 1.0.0
last_updated: 2025-01-15
category: user-guides
---

# Frequently Asked Questions (FAQ)

Find answers to common questions about NexusOS. Can't find what you're looking for? Contact support@nexusos.io.

## Table of Contents

- [Account & Billing](#account--billing)
- [Agents](#agents)
- [Workflows](#workflows)
- [Security & Privacy](#security--privacy)
- [API & Integrations](#api--integrations)
- [Troubleshooting](#troubleshooting)
- [General](#general)

## Account & Billing

### 1. How do I upgrade my subscription plan?

Navigate to **Settings → Billing → Subscription** and click **Upgrade Plan**. Select your desired tier and complete payment. Upgrades take effect immediately, and you'll be prorated for the remainder of your billing period.

### 2. What payment methods do you accept?

We accept:
- All major credit cards (Visa, MasterCard, American Express, Discover)
- ACH bank transfers (Enterprise tier only)
- Invoice billing with NET 30 terms (Enterprise tier only)

### 3. How does billing work for overages?

Each tier includes a base quota. If you exceed your quota:
- **API Requests**: $0.10 per 1,000 additional requests
- **Agent Executions**: $0.05 per additional execution
- **Storage**: $0.20 per GB per month
- **Data Transfer**: $0.10 per GB

Overages are calculated at month-end and charged automatically.

### 4. Can I cancel my subscription anytime?

Yes, you can cancel anytime without penalty. Your account remains active until the end of your billing period. After cancellation, your data is retained for 30 days, then permanently deleted. You can export your data before cancellation.

### 5. Do you offer refunds?

We offer a 14-day money-back guarantee for new subscriptions. Refunds are not available for renewals or usage overages. Contact billing@nexusos.io for refund requests.

### 6. How do I add team members to my workspace?

Go to **Settings → Team** and click **Invite Member**. Enter their email, assign a role (Admin, Developer, or Viewer), and send the invitation. They'll receive an email with setup instructions.

### 7. What's the difference between a workspace and an organization?

A **workspace** is a collaborative environment for a single team. An **organization** (Enterprise only) can contain multiple workspaces with centralized billing and admin controls. Most users need only one workspace.

## Agents

### 8. What's the difference between agent types?

- **Conversational**: Interactive chat agents for dialogue with users
- **Analytical**: Data analysis, insights, and reporting
- **Automation**: Task execution and process automation
- **Integration**: Orchestration of multiple systems and APIs

Choose based on your primary use case.

### 9. Which AI model should I use?

- **nexus-gpt-3.5**: Best for most use cases; fast and cost-effective
- **nexus-gpt-4**: Use for complex reasoning, creative tasks, or when accuracy is critical
- **nexus-claude**: Excellent for long-form content, analysis, and creative writing

Start with GPT-3.5 and upgrade if needed. You can A/B test different models.

### 10. How do I reduce agent costs?

- Use GPT-3.5 instead of GPT-4 when possible
- Lower the `max_tokens` parameter
- Write more concise system prompts
- Enable response caching for common queries
- Implement rate limiting on public-facing agents
- Monitor usage in Analytics dashboard

### 11. Can agents access the internet?

Not directly. Agents can access external data through:
- **Knowledge bases**: Upload documents for reference
- **API integrations**: Configure allowed external APIs
- **Workflows**: Use HTTP request steps to fetch data

This ensures security and prevents uncontrolled external access.

### 12. How do I improve agent response quality?

1. **Refine system prompt**: Be more specific about desired behavior
2. **Adjust temperature**: Lower for consistency, higher for creativity
3. **Add examples**: Include few-shot examples in the prompt
4. **Use knowledge bases**: Upload reference documents
5. **Test iteratively**: Use test mode to experiment
6. **Review logs**: Analyze actual usage patterns

### 13. Can I deploy the same agent to multiple environments?

Yes! Create the agent once, then:
- **Clone it** for different environments (production, staging, development)
- Use **tags** to distinguish environments (e.g., `env:prod`, `env:dev`)
- Configure different **execution limits** per environment
- Use **version control** to track changes

### 14. What happens if an agent execution times out?

Executions have a default timeout of 60 seconds (configurable up to 300 seconds). If timeout occurs:
- Execution stops immediately
- Status is marked as "timed_out"
- No charges for incomplete processing
- Error details are logged
- Configured error handlers are triggered

Increase timeout for complex tasks or optimize your agent.

## Workflows

### 15. How many steps can a workflow have?

Standard tier: Up to 20 steps per workflow
Professional: Up to 50 steps
Enterprise: Up to 200 steps

If you need more steps, consider:
- Breaking into multiple workflows
- Using sub-workflows (call one workflow from another)
- Optimizing by combining steps

### 16. Can workflows call other workflows?

Yes! Use the "Trigger Workflow" step type to call another workflow. This is useful for:
- Reusing common workflow patterns
- Building modular, maintainable workflows
- Managing complexity
- Implementing workflow libraries

### 17. How do I schedule a workflow to run automatically?

1. Edit your workflow
2. Change trigger type to **Schedule**
3. Configure using cron syntax:
   - `0 9 * * *` - Daily at 9 AM
   - `0 */6 * * *` - Every 6 hours
   - `0 0 * * 1` - Every Monday at midnight
4. Set timezone
5. Save and activate

Use [crontab.guru](https://crontab.guru) for help with cron expressions.

### 18. What happens if a workflow step fails?

Depends on your error handling configuration:

- **Retry**: Automatically retry with exponential backoff
- **Continue**: Skip failed step and continue
- **Fail**: Stop workflow execution
- **Custom Handler**: Run specified error handling steps

Configure in each step's error handling settings.

### 19. Can I pause or cancel a running workflow?

Yes! From the Executions page:
- **Pause**: Temporarily halt execution (can resume later)
- **Cancel**: Stop execution immediately
- **Resume**: Continue a paused execution

Useful for long-running workflows or when issues are detected.

## Security & Privacy

### 20. Is my data encrypted?

Yes, we use:
- **In transit**: TLS 1.3 encryption for all API calls
- **At rest**: AES-256 encryption for stored data
- **Keys**: Managed by AWS KMS or customer-managed (Enterprise)

All data is encrypted by default with no configuration required.

### 21. Where is my data stored?

Data is stored in the region you select during workspace setup:
- us-east-1 (Virginia, USA)
- us-west-2 (Oregon, USA)
- eu-west-1 (Ireland)
- eu-central-1 (Frankfurt)
- ap-southeast-1 (Singapore)
- ap-northeast-1 (Tokyo)

Enterprise customers can request additional regions or private deployments.

### 22. Do you have SOC 2 compliance?

Yes, NexusOS is SOC 2 Type II certified. We also comply with:
- GDPR (EU data protection)
- CCPA (California privacy)
- HIPAA (healthcare data) - Enterprise only
- ISO 27001 (information security)

Compliance certificates available upon request.

### 23. Can I use NexusOS for HIPAA-compliant applications?

Yes, with an Enterprise plan and a signed Business Associate Agreement (BAA). HIPAA features include:
- Dedicated isolated infrastructure
- Enhanced audit logging
- Automatic PHI detection and masking
- Encrypted backups
- Access controls and monitoring

Contact enterprise@nexusos.io to enable HIPAA compliance.

### 24. How long do you retain my data?

- **Active accounts**: Data retained indefinitely
- **Execution logs**: 90 days (configurable up to 1 year)
- **Deleted agents**: 30-day recovery period
- **Canceled accounts**: 30-day grace period, then permanent deletion
- **Backups**: 30 days

Enterprise customers can configure custom retention policies.

### 25. Do you train AI models on my data?

**No, absolutely not.** We never:
- Use your data to train our AI models
- Share your data with third parties
- Access your data except for support requests (with permission)

Your data is yours. See our [Privacy Policy](https://nexusos.io/privacy) for details.

## API & Integrations

### 26. How do I get an API key?

1. Navigate to **Settings → API Keys**
2. Click **Generate New API Key**
3. Name your key (e.g., "Production Server")
4. Configure scopes (permissions)
5. Click **Generate**
6. Copy and save the key (shown only once)

Use Bearer authentication: `Authorization: Bearer nxs_live_...`

### 27. What's the difference between API keys and OAuth tokens?

**API Keys**:
- Permanent (until revoked)
- Best for server-to-server
- Simpler to use
- No expiration

**OAuth Tokens**:
- Expire after 1 hour
- Best for user-delegated access
- More secure for third-party apps
- Can be refreshed

Use API keys for your own integrations, OAuth for third-party apps.

### 28. What integrations are available?

We support 50+ integrations including:

**Communication**: Slack, Microsoft Teams, Discord
**Productivity**: Google Workspace, Microsoft 365
**Development**: GitHub, GitLab, Jira, Linear
**Data**: Snowflake, PostgreSQL, MongoDB
**CRM**: Salesforce, HubSpot, Pipedrive
**Cloud**: AWS, Azure, Google Cloud
**Marketing**: Mailchimp, SendGrid, Segment

View all at **Settings → Integrations**.

### 29. Can I build custom integrations?

Yes! Use our API to build custom integrations:
- Full REST API documented at [API Docs](../01_api_documentation/)
- Official SDKs for Python, JavaScript, Go, Java, Ruby
- Webhook support for real-time events
- GraphQL endpoint (v2 API, beta)

See [Integration Guides](../07_integration_guides/) for examples.

### 30. How do webhooks work?

Webhooks send HTTP POST requests to your URL when events occur:

1. **Configure webhook**: Settings → Webhooks → Add Webhook
2. **Choose events**: Select what triggers the webhook
3. **Add your URL**: Where to send notifications
4. **Set secret**: For signature verification
5. **Test**: Verify it works

Events include: agent executed, workflow completed, user invited, etc.

## Troubleshooting

### 31. Why is my agent giving inconsistent responses?

Likely causes:
- **High temperature**: Lower to 0.3 or below for consistency
- **Vague prompt**: Make system prompt more specific
- **No examples**: Add few-shot examples
- **Model choice**: Try GPT-3.5 instead of GPT-4

Test with temperature=0 for completely deterministic responses.

### 32. Why did my workflow fail?

Check the execution logs:
1. Go to **Executions** → Find your workflow
2. Click on failed execution
3. Review which step failed
4. Check error message
5. Review step configuration

Common causes:
- Invalid API credentials
- Timeout exceeded
- Invalid data format
- Rate limit exceeded
- External service unavailable

### 33. Why am I being rate limited?

Rate limits vary by tier:
- Free: 100 requests/hour
- Standard: 1,000 requests/hour
- Professional: 5,000 requests/hour
- Enterprise: Custom

Check headers:
- `X-RateLimit-Remaining`: How many left
- `X-RateLimit-Reset`: When limit resets

Solutions:
- Implement exponential backoff
- Upgrade your tier
- Use caching
- Optimize request frequency

### 34. I forgot my password. How do I reset it?

1. Go to [nexusos.io/login](https://nexusos.io/login)
2. Click **Forgot Password?**
3. Enter your email
4. Check email for reset link
5. Click link and set new password

Links expire after 1 hour. Request a new one if expired.

### 35. Why can't I see my teammate's agents?

Check sharing settings:
1. Ask teammate to open the agent
2. Click **Share** button
3. Set sharing to "Workspace" or add you specifically
4. Set your permission level

Only shared resources are visible to other team members.

## General

### 36. What's the difference between NexusOS and ChatGPT?

**NexusOS**:
- Platform for building AI agents and workflows
- Programmable via API
- Team collaboration features
- Workflow automation
- Enterprise features
- Multiple AI models

**ChatGPT**:
- Consumer chat interface
- Limited automation
- Individual use
- Web-based only

Think of NexusOS as a development platform vs. ChatGPT as a tool.

### 37. Can I export my data?

Yes! Export options:
- **Agents**: Export as JSON
- **Workflows**: Export as JSON or YAML
- **Execution logs**: Export as CSV or JSON
- **Analytics**: Export reports as CSV
- **All data**: Request full data export (Settings → Privacy)

Data exports are processed within 48 hours.

### 38. Do you offer training or onboarding help?

Yes! We provide:
- **Self-paced**: Documentation, video tutorials
- **Live webinars**: Monthly training sessions
- **Office hours**: Weekly Q&A sessions
- **Dedicated onboarding**: Professional and Enterprise tiers
- **Custom training**: Enterprise tier only
- **Certification program**: Get certified in NexusOS

See [Training Materials](../05_training_materials/) to get started.

### 39. What's your uptime SLA?

**Standard**: 99.5% uptime (best effort)
**Professional**: 99.9% uptime (with SLA)
**Enterprise**: 99.95%+ uptime (custom SLA)

Check current status at [status.nexusos.io](https://status.nexusos.io).

SLA details:
- Monthly uptime calculation
- Credits for violations
- Planned maintenance excluded
- Regional availability

### 40. How do I delete my account?

1. Export your data first (can't recover after deletion)
2. Go to **Settings → Account**
3. Scroll to **Danger Zone**
4. Click **Delete Account**
5. Confirm by typing your workspace name
6. Account deleted immediately, data deleted after 30 days

**Warning**: This is permanent and cannot be undone!

---

## Still Have Questions?

### Contact Support

- **Email**: support@nexusos.io
- **Chat**: Available in platform (business hours: Mon-Fri 9am-5pm EST)
- **Emergency**: enterprise@nexusos.io (Enterprise customers only, 24/7)
- **Community**: [community.nexusos.io](https://community.nexusos.io)

### Additional Resources

- [User Onboarding Guide](./user_onboarding_guide.md) - Complete guide for new users
- [API Documentation](../01_api_documentation/) - For developers
- [Admin Manual](../03_admin_manual/) - For administrators
- [Training Materials](../05_training_materials/) - Comprehensive training

### Report Documentation Issues

Found an error in our docs? Help us improve:
- Email: docs@nexusos.io
- GitHub: [github.com/nexusos/docs/issues](https://github.com/nexusos/docs/issues)
- Rate this page using the feedback widget below

---

**Last Updated**: 2025-01-15 | **Questions Answered**: 40+
