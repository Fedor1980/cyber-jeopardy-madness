---
title: Exercise Solutions
confidential: true
---

# Exercise Solutions

## Exercise 1: User Management

```bash
# Create users
nexusos-admin create-user --email alice@company.com --name "Alice" --role admin
nexusos-admin create-user --email bob@company.com --name "Bob" --role developer
nexusos-admin create-user --email carol@company.com --name "Carol" --role viewer

# Generate API key
nexusos-admin create-api-key --user alice@company.com --scopes "agents:*"

# Test API key
curl -H "Authorization: Bearer ${API_KEY}" https://api.nexusos.io/v1/health

# Revoke
nexusos-admin revoke-api-key --key-id ${KEY_ID}
```

## Exercise 2: Agent Monitoring
[Solution steps...]

## Exercise 3: Security Response
[Solution steps...]

## Exercise 4: Incident Simulation
[Solution steps...]
