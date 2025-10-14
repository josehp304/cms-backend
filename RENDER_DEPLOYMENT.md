# 🚀 Render Deployment Guide for Nyxta Backend

## ✅ Files Configured for Render

Your backend is now ready to deploy to Render with the following configuration:

### 📁 Configuration Files

1. **`render.yaml`** - Render Blueprint configuration
2. **`.npmrc`** - Ensures all dependencies are installed during build
3. **`package.json`** - TypeScript moved to dependencies

---

## 🔧 Render Dashboard Configuration

### Step 1: Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `josehp304/cms-backend`
4. Render will automatically detect the `render.yaml` file

### Step 2: Configure Settings (if not using render.yaml)

If you're setting up manually without `render.yaml`:

- **Name:** `nyxta-backend`
- **Runtime:** Node
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`
- **Instance Type:** Free (or your preferred tier)

### Step 3: Environment Variables

Add these environment variables in Render Dashboard:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `DATABASE_URL` | `your_neon_postgres_url` | Get from Neon dashboard |
| `PORT` | `3000` | Optional (Render auto-assigns) |

**To get your DATABASE_URL from Neon:**
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to Dashboard → Connection Details
4. Copy the connection string
5. Paste it in Render's `DATABASE_URL` environment variable

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [x] ✅ TypeScript is in `dependencies` (not devDependencies)
- [x] ✅ `render.yaml` is configured
- [x] ✅ `.npmrc` is created
- [x] ✅ Build command: `npm ci && npm run build`
- [x] ✅ Start command: `npm start`
- [x] ✅ All files are committed to Git
- [ ] ⚠️ `DATABASE_URL` is set in Render environment variables
- [ ] ⚠️ Database tables are created (run migrations)

---

## 🗄️ Database Setup on Render

After first deployment, you need to create the database tables:

### Option 1: Using Render Shell (Recommended)

1. In Render Dashboard, go to your web service
2. Click **"Shell"** tab
3. Run these commands:

```bash
npm run db:push
npm run seed  # Optional: seed sample data
```

### Option 2: Run Locally Against Production DB

1. Temporarily add your production `DATABASE_URL` to local `.env`
2. Run: `npm run db:push`
3. Run: `npm run seed` (optional)
4. Remove production URL from local `.env`

---

## 🔄 Deployment Process

### Initial Deployment

1. **Commit and Push:**
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **In Render Dashboard:**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Or enable auto-deploy for automatic deployments on push

3. **Monitor Build:**
   - Watch the build logs in Render dashboard
   - Build should complete in 2-3 minutes

4. **Setup Database:**
   - Use Shell to run `npm run db:push`
   - Optionally run `npm run seed`

### Subsequent Deployments

Render will auto-deploy when you push to `main` branch (if auto-deploy is enabled):

```bash
git add .
git commit -m "Your changes"
git push origin main
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module"

**Solution:** Ensure TypeScript is in `dependencies`:
```json
"dependencies": {
  "typescript": "^5.9.3"
}
```

### Error: "Module not found: drizzle-orm"

**Solution:** Check `.npmrc` exists with:
```
production=false
```

### Error: "Connection refused" or Database errors

**Solution:** 
1. Verify `DATABASE_URL` is set in Render environment variables
2. Check Neon database is accessible
3. Verify IP allowlist in Neon (should allow all for Render)

### Build Succeeds but App Crashes

**Solution:**
1. Check logs in Render dashboard
2. Verify `dist/src/server.js` exists after build
3. Run `npm run build` locally to test
4. Check environment variables are set

---

## 📊 Expected Build Output

Your build should show:

```
==> Building...
==> Running 'npm ci && npm run build'
added 134 packages
> tsc
Build succeeded
==> Build complete

==> Starting service...
==> Running 'npm start'
> node dist/src/server.js
✅ Database connected successfully
🚀 Nyxta Backend Server Started
```

---

## 🌐 After Deployment

Once deployed, your API will be available at:

```
https://nyxta-backend.onrender.com
```

### Test Your API

```bash
# Health check
curl https://nyxta-backend.onrender.com/

# Get branches
curl https://nyxta-backend.onrender.com/api/branches

# Get gallery
curl https://nyxta-backend.onrender.com/api/gallery

# Get enquiries
curl https://nyxta-backend.onrender.com/api/enquiries
```

---

## 🔒 Security Checklist

- [ ] `DATABASE_URL` is stored as environment variable (not in code)
- [ ] `.env` is in `.gitignore`
- [ ] CORS is configured (already done in your backend)
- [ ] Database has proper SSL connection
- [ ] Only necessary environment variables are exposed

---

## 💰 Cost Estimates

### Render Free Tier
- ✅ Free web service
- ⚠️ Spins down after 15 min of inactivity
- ⚠️ Cold start: ~30 seconds
- ✅ Good for: Development, testing, low-traffic apps

### Render Paid Tier ($7/month)
- ✅ Always-on service
- ✅ No cold starts
- ✅ Better performance
- ✅ Good for: Production apps

### Neon Postgres
- ✅ Free tier: 0.5 GB storage, 3 projects
- 💵 Paid tier: From $19/month

---

## 📝 Quick Commands Reference

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Database operations
npm run db:generate    # Generate migrations
npm run db:push        # Push schema to database
npm run db:studio      # Open Drizzle Studio
npm run seed           # Seed sample data
```

---

## 🎯 Next Steps

1. ✅ Commit all changes
2. ✅ Push to GitHub
3. ⚠️ Set `DATABASE_URL` in Render
4. ⚠️ Deploy on Render
5. ⚠️ Run `npm run db:push` in Render Shell
6. ✅ Test API endpoints
7. ✅ Update frontend to use new URL

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Your API Docs:** See `API_TESTS.md` in this repo

---

**Your backend is production-ready! 🚀**
