# Render.com Deployment Guide

## Deploy in 10 Minutes

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Create Render Account

1. Go to https://render.com/
2. Sign up with GitHub (easiest)

### Step 3: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select the **EmpVerify** repo

### Step 4: Configure Service

**Basic Settings:**
- **Name:** `empverify-backend`
- **Region:** Choose closest (Singapore for Asia)
- **Branch:** `main`
- **Root Directory:** Leave blank
- **Runtime:** `Node`

**Build Settings:**
```
Build Command:
npm install && npm run build && npx prisma generate && npx prisma migrate deploy
```

```
Start Command:
npm start
```

**Instance Type:**
- Select **"Free"** (0$/month)

### Step 5: Add Environment Variables

Click **"Advanced"** → Add these environment variables:

```
NODE_ENV = production
PORT = 5000
DATABASE_URL = postgres://310d116b765a5b996e1f926801559edb4babe1f76acc2670f124860f6283e38a:sk_VbPQJXYej1d_faHqCHvUn@pooled.db.prisma.io:5432/postgres?sslmode=require
JWT_SECRET = V3riStaff_9xK7mP2qL8vN4sR6tY1wZ5aB0cD7eF3hJ8kM2
JWT_EXPIRES_IN = 7d
CLOUDINARY_CLOUD_NAME = djt7gf8y
CLOUDINARY_API_KEY = 459657783282957
CLOUDINARY_API_SECRET = Ly23KYmFJD18USeMYAsclwBd6fs
SEED_ADMIN_NAME = Admin User
SEED_ADMIN_EMAIL = admin@empverify.com
SEED_ADMIN_PASSWORD = Admin@123456
```

**Note:** `APP_URL` এবং `CORS_ORIGIN` পরে add করবেন

### Step 6: Create Service

Click **"Create Web Service"**

Render will:
- Clone your repo
- Install dependencies
- Build the project
- Run migrations
- Start the server

This takes 5-10 minutes.

### Step 7: Update URLs

Once deployed, you'll get a URL like:
```
https://empverify-backend.onrender.com
```

Go back to **Environment** and add:

```
APP_URL = https://empverify-backend.onrender.com
CORS_ORIGIN = https://your-frontend-domain.com
```

Then click **"Manual Deploy"** → **"Clear build cache & deploy"**

---

## Testing Your Deployment

### Health Check
```bash
curl https://empverify-backend.onrender.com/api/health
```

### Login Test
```bash
curl -X POST https://empverify-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empverify.com",
    "password": "Admin@123456"
  }'
```

You should get a JWT token in response!

---

## Important: Free Tier Limitations

⚠️ **Render Free Tier:**
- App **sleeps after 15 minutes** of inactivity
- First request after sleep takes **30-60 seconds** (cold start)
- 750 hours/month free (enough for 1 app)

**Solutions:**
1. Use a cron job to ping your app every 14 minutes
2. Upgrade to Starter plan ($7/month) for always-on

---

## Monitoring & Logs

**View Logs:**
- Dashboard → Your Service → Logs tab
- Real-time logs while deploying and running

**Metrics:**
- Dashboard → Your Service → Metrics tab
- CPU, Memory, Network usage

**Events:**
- All deployments, restarts, crashes logged

---

## Auto-Deploy on Git Push

Render automatically redeploys when you push to main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render detects the push and redeploys automatically! 🚀

---

## Custom Domain (Optional)

1. Go to **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records (Render provides instructions)
4. SSL certificate auto-generated

---

## Database Backups

Your Prisma database (pooled.db.prisma.io) is already backed up by Prisma.

For extra safety:
1. Export data regularly using Prisma Studio
2. Use `pg_dump` for manual backups

---

## Troubleshooting

### Build Fails
- Check build logs in dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies installed

### App Crashes
- Check runtime logs
- Verify environment variables
- Check DATABASE_URL connection

### Database Migration Fails
- Ensure DATABASE_URL is correct
- Check Prisma schema for errors
- Try manual migration:
  ```bash
  npx prisma migrate deploy
  ```

### Cold Start Issues (Free Tier)
- Expected on free tier
- First request after sleep is slow
- Consider paid tier or use cron job

---

## Upgrade to Paid (Optional)

**Starter Plan - $7/month:**
- No sleep/cold starts
- Always on
- Faster builds
- Better support

To upgrade:
1. Dashboard → Billing
2. Select plan
3. Add payment method

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **Community:** https://community.render.com/
- **Status:** https://status.render.com/

---

## Comparison: Render vs Railway

| Feature | Render | Railway |
|---------|--------|---------|
| Free Tier | 750hrs/month | $5 credit/month |
| Sleep/Cold Start | Yes (15 min) | Yes (varies) |
| Deploy Speed | 5-10 min | 2-5 min |
| Custom Domain | Free SSL | Free SSL |
| Ease of Use | Medium | Easy |
| Dashboard | Good | Excellent |

Both are great! Choose based on preference.

---

**Your backend is live on Render! 🎉**
