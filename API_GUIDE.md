# Sovereign Scroll API Guide

REST API for querying validated and consented scrolls from the Sovereign Scroll Pipeline.

## Quick Start

### 1. Start the API

```powershell
docker compose -f docker-compose.scroll-pipeline.yml up -d scroll-api
```

### 2. Access the API

- **API Base URL**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)

### 3. Run Tests

```powershell
pip install requests
python test_api.py
```

## Authentication

All protected endpoints require an API key passed in the `X-API-Key` header.

**Default API Key**: `sovereign-scroll-key-2024`

**Example**:
```bash
curl -H "X-API-Key: sovereign-scroll-key-2024" http://localhost:8000/api/scrolls
```

**PowerShell Example**:
```powershell
$headers = @{"X-API-Key" = "sovereign-scroll-key-2024"}
Invoke-RestMethod -Uri "http://localhost:8000/api/scrolls" -Headers $headers
```

## Endpoints

### Health Check
**GET** `/health`

No authentication required.

**Response**:
```json
{
  "status": "healthy",
  "qdrant_connected": true,
  "collection_exists": true,
  "total_scrolls": 1
}
```

---

### List All Scrolls
**GET** `/api/scrolls?limit=10`

Returns all scrolls in the database.

**Authentication**: Required

**Query Parameters**:
- `limit` (int, optional): Maximum number of results (default: 10, max: 100)

**Response**:
```json
{
  "total": 1,
  "scrolls": [
    {
      "uuid": "b99a0e53-89be-55ef-8444-e49e3c0ca369",
      "scroll_id": "doc-valid-001",
      "content": "The company's Q3 performance showed strong revenue growth...",
      "source_system": "Finance_Report",
      "consent_id": "0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c"
    }
  ]
}
```

**PowerShell Example**:
```powershell
$headers = @{"X-API-Key" = "sovereign-scroll-key-2024"}
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/scrolls?limit=10" -Headers $headers
$response.scrolls | Format-Table
```

---

### Get Specific Scroll
**GET** `/api/scrolls/{scroll_id}`

Retrieve a specific scroll by its scroll_id.

**Authentication**: Required

**Path Parameters**:
- `scroll_id` (string): The scroll ID to retrieve

**Response**:
```json
{
  "uuid": "b99a0e53-89be-55ef-8444-e49e3c0ca369",
  "scroll_id": "doc-valid-001",
  "content": "The company's Q3 performance showed strong revenue growth...",
  "source_system": "Finance_Report",
  "consent_id": "0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c"
}
```

**Error Response** (404):
```json
{
  "detail": "Scroll 'doc-xyz-123' not found"
}
```

**PowerShell Example**:
```powershell
$headers = @{"X-API-Key" = "sovereign-scroll-key-2024"}
Invoke-RestMethod -Uri "http://localhost:8000/api/scrolls/doc-valid-001" -Headers $headers
```

---

### Search Scrolls
**POST** `/api/scrolls/search`

Search scrolls with optional filters.

**Authentication**: Required

**Request Body**:
```json
{
  "source_system": "Finance_Report",
  "limit": 10
}
```

**Parameters**:
- `source_system` (string, optional): Filter by source system
- `limit` (int, optional): Maximum results (1-100, default: 10)

**Response**: Same as List All Scrolls

**PowerShell Example**:
```powershell
$headers = @{
    "X-API-Key" = "sovereign-scroll-key-2024"
    "Content-Type" = "application/json"
}
$body = @{
    source_system = "Finance_Report"
    limit = 10
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/scrolls/search" -Method Post -Headers $headers -Body $body
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 401 | Unauthorized (invalid or missing API key) |
| 404 | Scroll not found |
| 500 | Internal server error |

## Security

### Change the API Key

Set the `API_KEY` environment variable in `docker-compose.scroll-pipeline.yml`:

```yaml
scroll-api:
  environment:
    API_KEY: your-secure-key-here
```

Then restart the service:
```powershell
docker compose -f docker-compose.scroll-pipeline.yml restart scroll-api
```

### Production Recommendations

1. **Use strong API keys**: Generate with `openssl rand -hex 32`
2. **Enable HTTPS**: Use a reverse proxy (nginx, Traefik)
3. **Rate limiting**: Add API gateway for production
4. **Multiple API keys**: Implement per-user authentication
5. **Audit logging**: Log all API access

## Integration Examples

### Python
```python
import requests

headers = {"X-API-Key": "sovereign-scroll-key-2024"}
response = requests.get(
    "http://localhost:8000/api/scrolls",
    headers=headers
)
scrolls = response.json()["scrolls"]

for scroll in scrolls:
    print(f"{scroll['scroll_id']}: {scroll['content'][:50]}...")
```

### JavaScript
```javascript
const headers = {
  'X-API-Key': 'sovereign-scroll-key-2024'
};

fetch('http://localhost:8000/api/scrolls', { headers })
  .then(res => res.json())
  .then(data => {
    data.scrolls.forEach(scroll => {
      console.log(`${scroll.scroll_id}: ${scroll.content.substring(0, 50)}...`);
    });
  });
```

### curl
```bash
curl -H "X-API-Key: sovereign-scroll-key-2024" \
  http://localhost:8000/api/scrolls
```

## Next Steps

1. **Add Semantic Search**: Integrate vector similarity search
2. **Advanced Filters**: Filter by consent_id, date ranges
3. **Pagination**: Add offset/cursor pagination for large result sets
4. **Webhooks**: Real-time notifications for new scrolls
5. **GraphQL**: Alternative query interface

## Troubleshooting

### API won't start
```powershell
docker logs scroll-api
docker compose -f docker-compose.scroll-pipeline.yml restart scroll-api
```

### Connection refused
Make sure Qdrant is running:
```powershell
docker compose -f docker-compose.scroll-pipeline.yml ps
```

### 401 Unauthorized
Check your API key matches the one configured in docker-compose.yml.

### No scrolls returned
Send test scrolls:
```powershell
python produce_scrolls.py
python view_scrolls.py
```
