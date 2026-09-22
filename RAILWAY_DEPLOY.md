# Railway Deployment Guide

## Quick Deploy (5 Minutes)

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Deploy to Railway:**
   - Go to https://railway.app/
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Node.js and deploy!

3. **Add Environment Variables:**

In Railway Dashboard → Variables → Add these:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=<your-prisma-database-url>
JWT_SECRET=V3riStaff_9xK7mP2qL8vN4sR6tY1wZ5aB0cD7eF3hJ8kM2
JWT_EXPIRES_IN=7d
APP_URL=<will-get-after-deploy>
CORS_ORIGIN=<your-frontend-url>
CLOUDINARY_CLOUD_NAME=djt7gf8y
CLOUDINARY_API_KEY=459657783282957
CLOUDINARY_API_SECRET=Ly23KYmFJD18USeMYAsclwBd6fs
SEED_ADMIN_NAME=Admin User
SEED_ADMIN_EMAIL=admin@empverify.com
SEED_ADMIN_PASSWORD=Admin@123456
```

4. **Update APP_URL:**
   - After deployment, Railway will give you a URL like: `https://empverify-production.up.railway.app`
   - Copy that URL
   - Update `APP_URL` environment variable with that URL
   - Redeploy

5. **Done!** Your API is live! 🚀

---

### Option 2: Deploy using Railway CLI

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login:**
```bash
railway login
```

3. **Initialize:**
```bash
railway init
```

4. **Add Environment Variables:**
```bash
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=<your-database-url>
# ... add all other variables
```

5. **Deploy:**
```bash
railway up
```

6. **Open:**
```bash
railway open
```

---

## Testing Deployment

Once deployed, test with:

**Health Check:**
```bash
curl https://your-app.railway.app/api/health
```

**Login:**
```bash
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empverify.com","password":"Admin@123456"}'
```

---

## Free Tier Limits

Railway Free Tier includes:
- $5 credit per month
- ~500 hours runtime
- Automatic sleep after inactivity (wakes on request)

This is perfect for development and testing!

---

## Troubleshooting

**Build fails:**
- Check logs in Railway dashboard
- Ensure all dependencies are in package.json

**Database connection fails:**
- Verify DATABASE_URL is correct
- Check if Prisma migrations ran

**App crashes:**
- Check runtime logs
- Verify all environment variables are set

---

## Monitoring

Railway provides:
- Real-time logs
- Metrics (CPU, Memory, Network)
- Deployment history
- Automatic rollback

Access from: Dashboard → Your Project → Deployments

---

## Custom Domain (Optional)

1. Go to Settings → Domains
2. Click "Generate Domain" for free Railway subdomain
3. Or add your custom domain

---

## Support

- Railway Docs: https://docs.railway.app/
- Community: https://discord.gg/railway

---

**Your backend is production-ready on Railway! 🚀**
