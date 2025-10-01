# 🚀 SpaceChild Deployment Guide

Complete guide for deploying SpaceChild Consciousness Platform to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Security Checklist](#security-checklist)
- [Monitoring Setup](#monitoring-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: 18.x or 20.x
- **PostgreSQL**: 14+ (production)
- **Redis**: 7+ (recommended)
- **Docker**: 24+ (for containerized deployment)
- **Git**: For version control

### Required Services
- AI Provider API Keys (OpenAI, Anthropic, or Google)
- Cloud provider account (AWS, GCP, or Azure)
- Domain name and SSL certificate
- Email service (optional, for notifications)

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/spacechild.git
cd spacechild
```

### 2. Configure Environment Variables
```bash
# Copy example environment file
cp .env.example .env

# Edit with your production values
nano .env
```

### Critical Variables to Set:
```env
# Production Settings
NODE_ENV=production
PORT=5000

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/spacechild"
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis Cache
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="strong-redis-password"

# Session Security
SESSION_SECRET="generate-with-openssl-rand-base64-32"

# AI Providers (at least one required)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_API_KEY="..."

# CORS (your production domain)
CORS_ORIGIN="https://your-domain.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring (optional but recommended)
SENTRY_DSN="https://...@sentry.io/..."
```

### 3. Generate Secure Secrets
```bash
# Generate SESSION_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -base64 32

# Generate API_KEY (if needed)
openssl rand -hex 32
```

---

## Database Setup

### Option 1: Manual PostgreSQL Setup

#### Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Start service
sudo systemctl start postgresql
```

#### Create Database
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE spacechild;
CREATE USER spacechild WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE spacechild TO spacechild;
\q
```

#### Run Migrations
```bash
# Install dependencies
npm ci --production

# Push database schema
npm run db:push

# Setup initial data
npm run db:setup
```

### Option 2: Docker PostgreSQL
```bash
# Start PostgreSQL with Docker
docker run -d \
  --name spacechild-postgres \
  -e POSTGRES_DB=spacechild \
  -e POSTGRES_USER=spacechild \
  -e POSTGRES_PASSWORD=your-password \
  -p 5432:5432 \
  -v spacechild_data:/var/lib/postgresql/data \
  postgres:16-alpine

# Run migrations
DATABASE_URL="postgresql://spacechild:your-password@localhost:5432/spacechild" \
  npm run db:push
```

---

## Docker Deployment

### Single Container Deployment

#### Build Image
```bash
# Build production image
docker build -t spacechild:latest .

# Test locally
docker run -d \
  --name spacechild \
  -p 5000:5000 \
  --env-file .env \
  spacechild:latest
```

### Docker Compose Deployment (Recommended)

#### Start All Services
```bash
# Create .env file with your values
cp .env.example .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Check health
curl http://localhost:5000/health
```

#### Useful Commands
```bash
# Stop services
docker-compose down

# Restart application
docker-compose restart app

# View resource usage
docker stats

# Execute commands in container
docker-compose exec app npm run db:push
```

---

## Kubernetes Deployment

### Prerequisites
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Install helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### Create Kubernetes Resources

#### 1. Create Namespace
```yaml
# namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: spacechild
```

#### 2. Create Secrets
```bash
kubectl create secret generic spacechild-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=session-secret="..." \
  --from-literal=openai-api-key="..." \
  --namespace=spacechild
```

#### 3. Deploy Application
```yaml
# deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spacechild
  namespace: spacechild
spec:
  replicas: 3
  selector:
    matchLabels:
      app: spacechild
  template:
    metadata:
      labels:
        app: spacechild
    spec:
      containers:
      - name: spacechild
        image: spacechild/consciousness-platform:latest
        ports:
        - containerPort: 5000
        envFrom:
        - secretRef:
            name: spacechild-secrets
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
```

#### 4. Create Service
```yaml
# service.yml
apiVersion: v1
kind: Service
metadata:
  name: spacechild
  namespace: spacechild
spec:
  selector:
    app: spacechild
  ports:
  - port: 80
    targetPort: 5000
  type: LoadBalancer
```

#### Deploy
```bash
kubectl apply -f namespace.yml
kubectl apply -f deployment.yml
kubectl apply -f service.yml

# Check status
kubectl get pods -n spacechild
kubectl get services -n spacechild
```

---

## Security Checklist

### Before Production Deployment

- [ ] **Environment Variables**
  - [ ] All secrets generated with cryptographically secure methods
  - [ ] No default/example values in production
  - [ ] Secrets stored in secure vault (AWS Secrets Manager, etc.)

- [ ] **Database Security**
  - [ ] Strong database password (20+ characters)
  - [ ] Database not exposed to public internet
  - [ ] SSL/TLS enabled for database connections
  - [ ] Regular automated backups configured

- [ ] **Application Security**
  - [ ] HTTPS/SSL certificate installed
  - [ ] Rate limiting enabled
  - [ ] CORS configured for production domain only
  - [ ] Session secret is unique and strong
  - [ ] API keys validated on sensitive endpoints

- [ ] **Network Security**
  - [ ] Firewall configured (only ports 80/443 public)
  - [ ] VPC/private network for database
  - [ ] DDoS protection enabled
  - [ ] CDN configured for static assets

- [ ] **Monitoring**
  - [ ] Error tracking (Sentry) configured
  - [ ] Log aggregation setup
  - [ ] Health check monitoring
  - [ ] Alert notifications configured

---

## Monitoring Setup

### Health Endpoints
```bash
# Quick health check
curl https://your-domain.com/health

# Detailed readiness check
curl https://your-domain.com/ready

# Prometheus metrics
curl https://your-domain.com/metrics
```

### Sentry Error Tracking
```bash
# Set in .env
SENTRY_DSN="https://xxx@sentry.io/xxx"

# Test error reporting
curl -X POST https://your-domain.com/api/test-error
```

### Log Aggregation
```bash
# View logs
docker-compose logs -f app

# Kubernetes logs
kubectl logs -f deployment/spacechild -n spacechild

# Export to file
docker-compose logs app > app.log
```

---

## Troubleshooting

### Application Won't Start

**Check logs:**
```bash
docker-compose logs app
kubectl logs deployment/spacechild -n spacechild
```

**Common issues:**
- Database connection failed → Check DATABASE_URL
- Missing API keys → Check .env file
- Port already in use → Change PORT variable

### Database Connection Issues

**Test connection:**
```bash
# PostgreSQL
psql -h localhost -U spacechild -d spacechild

# From container
docker-compose exec app npm run db:test
```

**Fix:**
- Ensure PostgreSQL is running
- Check firewall rules
- Verify credentials in DATABASE_URL

### High Memory Usage

**Check resource usage:**
```bash
docker stats
kubectl top pods -n spacechild
```

**Solutions:**
- Increase container memory limits
- Enable connection pooling
- Configure Redis cache
- Scale horizontally with more replicas

### Slow Performance

**Check:**
- Database query performance
- Redis cache hit rate
- Network latency
- AI provider response times

**Optimize:**
- Add database indexes
- Enable query caching
- Use CDN for static assets
- Configure connection pooling

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificate installed
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backups automated
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

## Support

- **Documentation**: https://docs.spacechild.dev
- **Issues**: https://github.com/your-org/spacechild/issues
- **Discord**: https://discord.gg/spacechild
- **Email**: support@spacechild.dev

---

**Deployed Successfully? 🎉**

Share your deployment experience and help improve this guide!
