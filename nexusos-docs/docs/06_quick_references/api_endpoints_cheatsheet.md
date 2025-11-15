---
title: API Endpoints Cheat Sheet
---
# API Endpoints Quick Reference

## Agents
- `GET /api/v1/agents` - List agents
- `POST /api/v1/agents` - Create agent  
- `GET /api/v1/agents/{id}` - Get agent
- `PATCH /api/v1/agents/{id}` - Update agent
- `DELETE /api/v1/agents/{id}` - Delete agent
- `POST /api/v1/agents/{id}/execute` - Execute agent

## Users
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/{id}` - Get user
- `PATCH /api/v1/users/{id}` - Update user

## Workflows
- `GET /api/v1/workflows` - List workflows
- `POST /api/v1/workflows` - Create workflow
- `POST /api/v1/workflows/{id}/trigger` - Trigger workflow

Base URL: `https://api.nexusos.io/v1`
Auth: `Authorization: Bearer {api_key}`
