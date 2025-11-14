# Deployment Guide

## Quick Start (Docker Compose)

The fastest way to deploy Cyber Jeopardy Madness:

```bash
# Clone repository
git clone https://github.com/yourusername/cyber-jeopardy-madness.git
cd cyber-jeopardy-madness

# Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migrate

# Seed initial data
docker-compose exec backend npm run seed

# Access application
open http://localhost
```

## Production Deployment

### Prerequisites

- Docker 24+ & Docker Compose 2+
- 2GB+ RAM
- 20GB+ disk space
- Domain name with DNS configured
- SSL/TLS certificates

### Step-by-Step Production Setup

#### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Create application user
sudo useradd -m -s /bin/bash cyberj
sudo usermod -aG docker cyberj
```

#### 2. Application Setup

```bash
# Clone as application user
sudo su - cyberj
git clone https://github.com/yourusername/cyber-jeopardy-madness.git
cd cyber-jeopardy-madness

# Generate secure secrets
export DB_PASSWORD=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 48)
export JWT_REFRESH_SECRET=$(openssl rand -base64 48)

# Create production environment file
cat > .env << EOF
NODE_ENV=production
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
CORS_ORIGIN=https://yourdomain.com
PRODUCTION_URL=https://yourdomain.com
EOF

# Secure environment file
chmod 600 .env
```

#### 3. SSL/TLS Configuration

**Option A: Let's Encrypt (Recommended)**

```bash
# Install Certbot
sudo apt install certbot

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/
sudo chown cyberj:cyberj ./ssl/*
```

**Option B: Commercial Certificate**

```bash
# Place your certificates
cp your-cert.pem ./ssl/fullchain.pem
cp your-key.pem ./ssl/privkey.pem
chmod 600 ./ssl/*
```

#### 4. Nginx Configuration for SSL

Create `frontend/nginx-prod.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 5. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  database:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: cyber_jeopardy
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --locale=en_US.UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 1G

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3001
      DB_HOST: database
      DB_PORT: 5432
      DB_NAME: cyber_jeopardy
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
      LOG_LEVEL: info
    volumes:
      - ./backend/logs:/app/logs
    networks:
      - internal
    depends_on:
      database:
        condition: service_healthy
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=${PRODUCTION_URL}/api/v1
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
      - ./frontend/nginx-prod.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - internal
    depends_on:
      - backend
    deploy:
      resources:
        limits:
          memory: 256M

volumes:
  postgres_data:

networks:
  internal:
    driver: bridge
```

#### 6. Build and Deploy

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Seed initial data
docker-compose -f docker-compose.prod.yml exec backend npm run seed

# Load question packs
docker-compose -f docker-compose.prod.yml exec backend npm run load-questions

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Monitoring & Health Checks

```bash
# Check application health
curl https://yourdomain.com/api/v1/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Monitor resource usage
docker stats
```

### Backup Strategy

#### Database Backups

```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T database pg_dump -U postgres cyber_jeopardy | gzip > ${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz
find ${BACKUP_DIR} -name "backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x backup-db.sh

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /home/cyberj/cyber-jeopardy-madness/backup-db.sh
```

#### Restore from Backup

```bash
# Stop application
docker-compose -f docker-compose.prod.yml down

# Restore database
gunzip < backup_TIMESTAMP.sql.gz | docker-compose exec -T database psql -U postgres cyber_jeopardy

# Restart
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling

#### Horizontal Scaling (Multiple Backend Instances)

```yaml
services:
  backend:
    deploy:
      replicas: 4  # Run 4 backend instances
```

#### Load Balancing with Nginx

```nginx
upstream backend_cluster {
    least_conn;
    server backend_1:3001;
    server backend_2:3001;
    server backend_3:3001;
    server backend_4:3001;
}

location /api/ {
    proxy_pass http://backend_cluster;
    # ... other proxy settings
}
```

### Performance Tuning

#### PostgreSQL Tuning

```sql
-- In postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
```

#### Node.js Tuning

```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=2048"
```

### Security Hardening

```bash
# Firewall configuration
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Fail2ban for SSH
sudo apt install fail2ban
sudo systemctl enable fail2ban

# Auto-updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### Monitoring Setup

#### Prometheus + Grafana (Optional)

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Troubleshooting

#### Common Issues

**Database connection errors**
```bash
# Check database status
docker-compose logs database

# Verify network connectivity
docker-compose exec backend ping database

# Check credentials in .env
```

**Frontend can't reach backend**
```bash
# Check CORS configuration
# Verify API URL in frontend .env
# Check nginx proxy configuration
```

**High memory usage**
```bash
# Reduce backend replicas
# Increase swap space
# Optimize database queries
```

### Maintenance Windows

```bash
# Graceful shutdown
docker-compose -f docker-compose.prod.yml down

# Update application
git pull origin main

# Rebuild images
docker-compose -f docker-compose.prod.yml build

# Run migrations
docker-compose -f docker-compose.prod.yml up -d database backend
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# Start frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

### Rollback Procedure

```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout <previous-commit>

# Restore database backup (if needed)
gunzip < backup_TIMESTAMP.sql.gz | docker-compose exec -T database psql -U postgres cyber_jeopardy

# Rebuild and start
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

---

**For additional support, contact DevOps team or open an issue on GitHub.**
