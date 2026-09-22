# Deployment Guide

Complete guide for deploying EmpVerify Backend to production.

## Pre-Deployment Checklist

### 1. Code Quality
- ✅ All tests passing: `npm test`
- ✅ No TypeScript errors: `npm run build`
- ✅ Environment variables configured
- ✅ Database migrations ready
- ✅ Sensitive data removed from code

### 2. Security
- ✅ Strong JWT_SECRET (min 32 chars, random)
- ✅ CORS_ORIGIN set to actual frontend domain
- ✅ Database credentials secured
- ✅ Cloudinary credentials secured
- ✅ No secrets in version control
- ✅ HTTPS enabled
- ✅ Rate limiting configured

### 3. Database
- ✅ Production database created
- ✅ Database backups configured
- ✅ Connection pooling setup
- ✅ Monitoring enabled

### 4. External Services
- ✅ Cloudinary account setup
- ✅ Redis instance ready (optional but recommended)
- ✅ Email service configured (if needed)

---

## Deployment Options

### Option 1: Traditional VPS (AWS EC2, DigitalOcean, etc.)
### Option 2: Docker Container
### Option 3: Platform as a Service (Heroku, Railway, Render)

We'll cover all three options.

---

## Option 1: VPS Deployment (Ubuntu)

### Step 1: Server Setup

SSH into your server and update packages:

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should be 18+
```

### Step 3: Install PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Create database:

```bash
sudo -u postgres psql

CREATE DATABASE empverify;
CREATE USER empuser WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE empverify TO empuser;
\q
```

### Step 4: Install Redis (Optional)

```bash
sudo apt install redis-server -y
sudo systemctl start redis
sudo systemctl enable redis
```

### Step 5: Clone and Setup Application

```bash
# Create app directory
sudo mkdir -p /var/www/empverify
sudo chown -R $USER:$USER /var/www/empverify
cd /var/www/empverify

# Clone repository
git clone <your-repo-url> .

# Install dependencies
npm ci --only=production

# Setup environment
nano .env
```

Configure `.env`:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://empuser:your-secure-password@localhost:5432/empverify?schema=public
JWT_SECRET=your-long-random-secure-jwt-secret-min-32-characters
JWT_EXPIRES_IN=7d
APP_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
REDIS_URL=redis://localhost:6379
```

### Step 6: Build Application

```bash
npm run build
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### Step 7: Setup PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Start application
pm2 start dist/server.js --name empverify

# Setup startup script
pm2 startup
pm2 save
```

### Step 8: Setup Nginx Reverse Proxy

Install Nginx:

```bash
sudo apt install nginx -y
```

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/empverify
```

Add configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/empverify /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 9: Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

Follow prompts to setup SSL. Certbot will auto-renew certificates.

### Step 10: Setup Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Step 11: Monitoring

```bash
# View logs
pm2 logs empverify

# Monitor
pm2 monit

# Status
pm2 status
```

---

## Option 2: Docker Deployment

### Step 1: Create Dockerfile

Already included in the project. Review and adjust if needed.

### Step 2: Create docker-compose.yml

Already included in the project. Update with production values.

### Step 3: Build and Run

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# View logs
docker-compose logs -f app

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npx prisma db seed
```

### Step 4: Setup Nginx (Same as Option 1)

Point Nginx proxy to Docker container port.

---

## Option 3: Platform as a Service

### Heroku Deployment

1. **Create Heroku App**
```bash
heroku create your-app-name
```

2. **Add PostgreSQL**
```bash
heroku addons:create heroku-postgresql:mini
```

3. **Add Redis (Optional)**
```bash
heroku addons:create heroku-redis:mini
```

4. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set APP_URL=https://your-app-name.herokuapp.com
heroku config:set CORS_ORIGIN=https://yourfrontend.com
heroku config:set CLOUDINARY_CLOUD_NAME=your-cloud-name
heroku config:set CLOUDINARY_API_KEY=your-key
heroku config:set CLOUDINARY_API_SECRET=your-secret
```

5. **Add Procfile**
```bash
echo "web: npm start" > Procfile
```

6. **Deploy**
```bash
git push heroku main
```

7. **Run Migrations**
```bash
heroku run npx prisma migrate deploy
heroku run npx prisma db seed
```

### Railway Deployment

1. Go to railway.app
2. Create new project
3. Deploy from GitHub
4. Add PostgreSQL database
5. Add Redis (optional)
6. Set environment variables in dashboard
7. Deploy automatically on push

### Render Deployment

Similar to Railway - connect GitHub, add services, configure environment.

---

## Post-Deployment

### 1. Verify Deployment

Test all endpoints:

```bash
# Health check
curl https://api.yourdomain.com/api/health

# Login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empverify.com","password":"your-password"}'
```

### 2. Setup Monitoring

**Application Monitoring:**
- New Relic
- DataDog
- Sentry (for error tracking)

**Server Monitoring:**
- Prometheus + Grafana
- CloudWatch (AWS)
- DigitalOcean Monitoring

**Uptime Monitoring:**
- UptimeRobot
- Pingdom
- StatusCake

### 3. Setup Logging

**PM2 Logs:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Application Logs:**
Configure log aggregation (ELK stack, Papertrail, Loggly)

### 4. Setup Backups

**Database Backups:**
```bash
# Automated PostgreSQL backup script
#!/bin/bash
BACKUP_DIR="/var/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U empuser empverify > $BACKUP_DIR/empverify_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

Add to cron:
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

**Cloud Backups:**
- AWS RDS automated backups
- DigitalOcean automated backups
- S3 for file backups

### 5. Setup CI/CD

**GitHub Actions Example:**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: easingthemes/ssh-deploy@v2
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: /var/www/empverify
      
      - name: Restart application
        run: |
          ssh ${{ secrets.REMOTE_USER }}@${{ secrets.REMOTE_HOST }} \
          'cd /var/www/empverify && pm2 restart empverify'
```

### 6. Performance Optimization

**Enable Compression:**
Already enabled in code via compression middleware.

**Database Connection Pooling:**
Add to DATABASE_URL:
```
postgresql://user:pass@host:5432/db?schema=public&connection_limit=10
```

**Redis Caching:**
Ensure Redis is enabled in production for better performance.

**CDN for Images:**
Cloudinary already provides CDN. No additional setup needed.

### 7. Security Hardening

**Firewall:**
- Only allow necessary ports (22, 80, 443)
- Use security groups/firewall rules

**Database:**
- Don't expose PostgreSQL port publicly
- Use strong passwords
- Regular security updates

**Application:**
- Keep dependencies updated: `npm audit`
- Use environment variables for secrets
- Enable HTTPS only
- Implement API rate limiting (already done)

**Server:**
- Regular security updates: `sudo apt update && sudo apt upgrade`
- Disable root login
- Use SSH keys instead of passwords
- Setup fail2ban

### 8. Scaling

**Horizontal Scaling:**
- Use load balancer (Nginx, AWS ALB)
- Run multiple instances with PM2 cluster mode:
  ```bash
  pm2 start dist/server.js -i max
  ```

**Database Scaling:**
- Read replicas for read-heavy workloads
- Connection pooling (PgBouncer)
- Database indexes (already optimized)

**Caching:**
- Redis for session and data caching
- CDN for static assets

---

## Maintenance

### Regular Tasks

**Daily:**
- Check application logs
- Monitor error rates
- Check uptime status

**Weekly:**
- Review performance metrics
- Check disk space
- Review security alerts

**Monthly:**
- Update dependencies: `npm update`
- Review and optimize database queries
- Check backup integrity
- Security audit: `npm audit`

### Updates

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build
npm run build

# Run migrations
npx prisma migrate deploy

# Restart
pm2 restart empverify
```

---

## Troubleshooting

### Application Won't Start

**Check logs:**
```bash
pm2 logs empverify --lines 100
```

**Common issues:**
- Database connection failed (check DATABASE_URL)
- Missing environment variables
- Port already in use

### Database Connection Issues

**Test connection:**
```bash
psql -U empuser -d empverify -h localhost
```

**Check PostgreSQL status:**
```bash
sudo systemctl status postgresql
```

### High Memory Usage

**Monitor with PM2:**
```bash
pm2 monit
```

**Restart if needed:**
```bash
pm2 restart empverify
```

### Redis Connection Failed

**Check Redis:**
```bash
redis-cli ping
# Should return PONG
```

**Restart Redis:**
```bash
sudo systemctl restart redis
```

---

## Rollback Plan

If deployment fails:

```bash
# Revert to previous version
git checkout <previous-commit>
npm ci
npm run build
pm2 restart empverify

# Or restore from backup
# Restore database
psql -U empuser -d empverify < /var/backups/postgres/backup.sql
```

---

## Support Resources

- **Documentation**: README.md, API.md
- **Monitoring Dashboard**: Setup Grafana/New Relic
- **Error Tracking**: Setup Sentry
- **Logs**: Centralized logging (ELK, Papertrail)

---

## Cost Estimation

**Minimum Production Setup:**
- VPS (2GB RAM): $10-20/month
- PostgreSQL: Included or $7/month (managed)
- Redis: Included or $5/month (managed)
- Cloudinary: Free tier (10GB storage, 25 credits/month)
- Domain: $10-15/year
- SSL: Free (Let's Encrypt)

**Total**: ~$20-40/month

**Recommended Production Setup:**
- VPS (4GB RAM): $20-40/month
- Managed PostgreSQL: $15-25/month
- Managed Redis: $10/month
- Cloudinary: Free or paid tier
- Monitoring: $0-50/month
- Backups: $5-10/month

**Total**: ~$50-135/month

---

## Next Steps

1. ✅ Complete pre-deployment checklist
2. ✅ Choose deployment option
3. ✅ Setup production environment
4. ✅ Deploy application
5. ✅ Setup monitoring
6. ✅ Configure backups
7. ✅ Test thoroughly
8. ✅ Document everything
9. ✅ Setup alerts
10. ✅ Train team on operations

---

**Production Ready! 🚀**
