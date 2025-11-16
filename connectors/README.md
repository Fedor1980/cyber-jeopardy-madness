# Phase 8: Enterprise Connectors

Pre-built connectors for seamless integration with enterprise data sources.

## Available Connectors

### 1. AWS S3 Connector
Ingest scrolls from S3 buckets with automatic consent verification.

**Features:**
- Event-driven ingestion via S3 notifications
- Batch processing support
- Metadata extraction from object tags
- Consent ID mapping from S3 metadata

**Configuration:**
```yaml
# config/connectors/s3.yaml
s3:
  bucket: my-data-bucket
  region: us-east-1
  prefix: scrolls/
  consent_metadata_key: consent-id
  batch_size: 100
  polling_interval: 60  # seconds
```

**Implementation:**
```python
# connectors/s3_connector.py
import boto3
from typing import List, Dict
import json

class S3Connector:
    def __init__(self, config: dict):
        self.s3 = boto3.client('s3', region_name=config['region'])
        self.bucket = config['bucket']
        self.prefix = config.get('prefix', '')
        self.consent_key = config['consent_metadata_key']

    def list_new_scrolls(self) -> List[Dict]:
        """List new scrolls from S3."""
        response = self.s3.list_objects_v2(
            Bucket=self.bucket,
            Prefix=self.prefix
        )

        scrolls = []
        for obj in response.get('Contents', []):
            # Get object metadata
            metadata = self.s3.head_object(
                Bucket=self.bucket,
                Key=obj['Key']
            )

            consent_id = metadata.get('Metadata', {}).get(self.consent_key)
            if consent_id:
                scrolls.append({
                    'key': obj['Key'],
                    'consent_id': consent_id,
                    'size': obj['Size'],
                    'last_modified': obj['LastModified']
                })

        return scrolls

    def ingest_scroll(self, key: str) -> Dict:
        """Ingest a single scroll from S3."""
        response = self.s3.get_object(Bucket=self.bucket, Key=key)
        content = response['Body'].read().decode('utf-8')

        metadata = response.get('Metadata', {})

        return {
            'content': content,
            'consent_id': metadata.get(self.consent_key),
            'source_system': 's3',
            'source_location': f's3://{self.bucket}/{key}'
        }
```

### 2. Snowflake Connector
Stream data from Snowflake tables with consent column mapping.

**Features:**
- Incremental CDC (Change Data Capture)
- Consent column mapping
- Batch export support
- Time-based partitioning

**Configuration:**
```yaml
# config/connectors/snowflake.yaml
snowflake:
  account: myaccount.us-east-1
  database: DATAWAREHOUSE
  schema: PUBLIC
  table: CONSENTED_DATA
  consent_column: CONSENT_ID
  content_column: DATA_CONTENT
  timestamp_column: CREATED_AT
  warehouse: COMPUTE_WH
  role: DATA_READER
```

**Implementation:**
```python
# connectors/snowflake_connector.py
import snowflake.connector
from datetime import datetime

class SnowflakeConnector:
    def __init__(self, config: dict):
        self.conn = snowflake.connector.connect(
            account=config['account'],
            user=config['user'],
            password=config['password'],
            warehouse=config['warehouse'],
            database=config['database'],
            schema=config['schema'],
            role=config.get('role')
        )
        self.table = config['table']
        self.consent_col = config['consent_column']
        self.content_col = config['content_column']
        self.timestamp_col = config['timestamp_column']
        self.last_sync = None

    def sync_scrolls(self, batch_size: int = 1000) -> List[Dict]:
        """Sync new scrolls since last sync."""
        cursor = self.conn.cursor()

        query = f"""
        SELECT {self.consent_col}, {self.content_col}, {self.timestamp_col}
        FROM {self.table}
        WHERE {self.timestamp_col} > %s
        ORDER BY {self.timestamp_col}
        LIMIT {batch_size}
        """

        cursor.execute(query, (self.last_sync or datetime(2000, 1, 1),))

        scrolls = []
        for row in cursor:
            scrolls.append({
                'consent_id': row[0],
                'content': row[1],
                'timestamp': row[2],
                'source_system': 'snowflake',
                'source_location': f'{self.table}'
            })

        if scrolls:
            self.last_sync = scrolls[-1]['timestamp']

        return scrolls
```

### 3. Salesforce Connector
Sync Salesforce records with consent tracking.

**Features:**
- Real-time webhook integration
- Bulk API support
- Consent field mapping
- Object relationship traversal

**Configuration:**
```yaml
# config/connectors/salesforce.yaml
salesforce:
  instance_url: https://myorg.salesforce.com
  api_version: v58.0
  object: CustomObject__c
  consent_field: Consent_ID__c
  content_field: Data__c
  query_filter: Status__c = 'Active'
```

**Implementation:**
```python
# connectors/salesforce_connector.py
from simple_salesforce import Salesforce

class SalesforceConnector:
    def __init__(self, config: dict):
        self.sf = Salesforce(
            instance_url=config['instance_url'],
            username=config['username'],
            password=config['password'],
            security_token=config['security_token']
        )
        self.object = config['object']
        self.consent_field = config['consent_field']
        self.content_field = config['content_field']
        self.filter = config.get('query_filter')

    def fetch_records(self) -> List[Dict]:
        """Fetch records from Salesforce."""
        query = f"""
        SELECT {self.consent_field}, {self.content_field}
        FROM {self.object}
        WHERE {self.filter}
        """

        result = self.sf.query_all(query)

        scrolls = []
        for record in result['records']:
            scrolls.append({
                'consent_id': record[self.consent_field],
                'content': record[self.content_field],
                'source_system': 'salesforce',
                'source_location': f'{self.object}/{record["Id"]}'
            })

        return scrolls
```

### 4. SAP HANA Connector
Enterprise data extraction from SAP systems.

**Features:**
- Direct database connectivity
- RFC function module calls
- IDoc processing
- Multi-table joins with consent mapping

**Configuration:**
```yaml
# config/connectors/sap.yaml
sap:
  host: sap.company.com
  port: 30015
  database: HDB
  schema: SAPABAP1
  table: CONSENTED_DOCS
  consent_field: CONSENT_NO
  content_field: DOC_CONTENT
```

### 5. PostgreSQL Connector
Generic PostgreSQL database connector.

**Features:**
- Logical replication streaming
- Trigger-based CDC
- Partition awareness
- Connection pooling

**Implementation:**
```python
# connectors/postgresql_connector.py
import psycopg2
from psycopg2.extras import RealDictCursor

class PostgreSQLConnector:
    def __init__(self, config: dict):
        self.conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            database=config['database'],
            user=config['user'],
            password=config['password']
        )
        self.table = config['table']
        self.consent_col = config['consent_column']
        self.content_col = config['content_column']

    def stream_changes(self):
        """Stream changes using logical replication."""
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)

        # Create replication slot if not exists
        cursor.execute(f"""
        SELECT * FROM pg_create_logical_replication_slot(
            'scroll_slot', 'wal2json'
        )
        """)

        # Stream changes
        cursor.execute(f"""
        SELECT * FROM pg_logical_slot_get_changes(
            'scroll_slot', NULL, NULL
        )
        """)

        for change in cursor:
            yield self.parse_change(change)
```

## Connector Manager

Central service to manage all connectors:

```python
# connectors/manager.py
from typing import Dict, List
import asyncio

class ConnectorManager:
    def __init__(self):
        self.connectors = {}

    def register_connector(self, name: str, connector):
        """Register a new connector."""
        self.connectors[name] = connector

    async def sync_all(self) -> Dict[str, List]:
        """Sync all registered connectors."""
        tasks = []
        for name, connector in self.connectors.items():
            tasks.append(self.sync_connector(name, connector))

        results = await asyncio.gather(*tasks)
        return dict(zip(self.connectors.keys(), results))

    async def sync_connector(self, name: str, connector) -> List:
        """Sync a single connector."""
        try:
            scrolls = connector.sync_scrolls()
            # Send to Kafka for processing
            self.send_to_kafka(scrolls)
            return scrolls
        except Exception as e:
            logger.error(f"Error syncing {name}: {e}")
            return []
```

## Deployment

Add connectors to docker-compose:

```yaml
# docker-compose.connectors.yml
services:
  connector-manager:
    build:
      context: ./connectors
    environment:
      - KAFKA_BOOTSTRAP_SERVERS=kafka:9092
      - S3_BUCKET=${S3_BUCKET}
      - SNOWFLAKE_ACCOUNT=${SNOWFLAKE_ACCOUNT}
      - SALESFORCE_INSTANCE=${SALESFORCE_INSTANCE}
    volumes:
      - ./config/connectors:/config
    depends_on:
      - kafka
```

## Monitoring

Track connector metrics:

```python
# Prometheus metrics for connectors
connector_sync_duration = Histogram(
    'connector_sync_duration_seconds',
    'Connector sync duration',
    ['connector']
)

connector_records_synced = Counter(
    'connector_records_synced_total',
    'Total records synced',
    ['connector']
)

connector_errors = Counter(
    'connector_errors_total',
    'Connector errors',
    ['connector', 'error_type']
)
```

## Usage

```python
# Example: Using connectors
from connectors import S3Connector, SnowflakeConnector, ConnectorManager

# Initialize connectors
s3_conn = S3Connector(s3_config)
sf_conn = SnowflakeConnector(snowflake_config)

# Register with manager
manager = ConnectorManager()
manager.register_connector('s3', s3_conn)
manager.register_connector('snowflake', sf_conn)

# Sync all connectors
await manager.sync_all()
```

## Security

- All connectors support credential encryption
- Secrets stored in Kubernetes secrets or HashiCorp Vault
- Network policies restrict connector access
- Audit logging for all data access
