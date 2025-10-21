# Deployment Instructions for Database Updates

## 🎯 Overview
This document provides step-by-step instructions to deploy the new database fields to your production/staging environment.

---

## 📋 What Changed?

### New Fields Added to `branch` Table:
1. `is_ladies` (boolean) - Indicates if it's a ladies hostel
2. `is_cooking` (boolean) - Indicates if cooking facilities are available  
3. `cooking_price` (integer) - Price for cooking facilities
4. `display_order` (integer) - Controls display order of branches

---

## 🚀 Deployment Steps

### Step 1: Backup Your Database (IMPORTANT!)
```bash
# If using Neon/Render/Railway, use their backup feature
# Or manually backup using pg_dump
pg_dump -U your_username -h your_host -d your_database > backup_$(date +%Y%m%d).sql
```

### Step 2: Apply Database Migration

**Option A: Using Drizzle Kit (Recommended)**
```bash
# Make sure you have database connection in .env
npx drizzle-kit push
```

**Option B: Run SQL Manually**
Connect to your database and run:
```sql
ALTER TABLE "branch" ADD COLUMN "is_ladies" boolean DEFAULT false;
ALTER TABLE "branch" ADD COLUMN "is_cooking" boolean DEFAULT false;
ALTER TABLE "branch" ADD COLUMN "cooking_price" integer;
ALTER TABLE "branch" ADD COLUMN "display_order" integer DEFAULT 0;
```

### Step 3: Verify Migration
```sql
-- Check if columns were added successfully
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'branch'
AND column_name IN ('is_ladies', 'is_cooking', 'cooking_price', 'display_order');
```

Expected output:
```
 column_name   | data_type | column_default
---------------+-----------+----------------
 is_ladies     | boolean   | false
 is_cooking    | boolean   | false
 cooking_price | integer   | NULL
 display_order | integer   | 0
```

### Step 4: Test API Endpoints

**Test GET all branches:**
```bash
curl http://localhost:3000/api/branches
```

**Test POST with new fields:**
```bash
curl -X POST http://localhost:3000/api/branches \
  -F "name=Test Branch" \
  -F "is_ladies=true" \
  -F "is_cooking=true" \
  -F "cooking_price=500" \
  -F "display_order=1"
```

**Test PUT to update:**
```bash
curl -X PUT http://localhost:3000/api/branches/1 \
  -F "is_ladies=true" \
  -F "display_order=2"
```

### Step 5: Deploy Backend Code

```bash
# Push to your git repository
git add .
git commit -m "feat: add is_ladies, is_cooking, cooking_price, display_order fields to branches"
git push origin main

# If deploying to Render/Railway/etc., trigger deployment
# Or restart your backend server manually
```

### Step 6: Update Frontend
Follow the instructions in `BACKEND_UPDATE_DOCUMENTATION.md` to update your frontend application.

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Migration ran successfully (no SQL errors)
- [ ] All existing branches still load correctly
- [ ] New fields appear in GET responses with default values
- [ ] POST endpoint accepts new fields
- [ ] PUT endpoint can update new fields
- [ ] Branches are ordered by `display_order` in GET all endpoint
- [ ] Frontend can read new fields without errors

---

## 🔄 Rollback Plan (If Needed)

If something goes wrong:

**Step 1: Restore Database Backup**
```bash
psql -U your_username -h your_host -d your_database < backup_YYYYMMDD.sql
```

**Step 2: Revert Backend Code**
```bash
git revert HEAD
git push origin main
```

---

## 📊 Database Schema Before vs After

### Before:
```sql
CREATE TABLE branch (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  -- ... other fields
  is_mess_available BOOLEAN DEFAULT false,
  thumbnail TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### After:
```sql
CREATE TABLE branch (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  -- ... other fields
  is_mess_available BOOLEAN DEFAULT false,
  is_ladies BOOLEAN DEFAULT false,        -- ✨ NEW
  is_cooking BOOLEAN DEFAULT false,       -- ✨ NEW
  cooking_price INTEGER,                  -- ✨ NEW
  display_order INTEGER DEFAULT 0,        -- ✨ NEW
  thumbnail TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

---

## 🆘 Troubleshooting

### Issue: Migration Fails with "Column Already Exists"
**Solution:** The column was already added. Skip to verification step.

### Issue: API Returns 500 Error After Migration
**Solution:** 
1. Check server logs
2. Verify all fields were added correctly
3. Restart backend server
4. Check TypeScript compilation

### Issue: Frontend Errors Reading New Fields
**Solution:**
1. Clear browser cache
2. Update TypeScript types in frontend
3. Rebuild frontend application

### Issue: Branches Not Ordered by display_order
**Solution:** 
- Verify the GET endpoint includes `.orderBy(asc(branch.display_order))`
- Check that `asc` is imported from `drizzle-orm`

---

## 📞 Support

If you encounter issues during deployment:
1. Check the server logs
2. Review the migration SQL file: `drizzle/0001_married_whirlwind.sql`
3. Verify database connection
4. Test endpoints with Postman/Thunder Client

---

**Migration File:** `drizzle/0001_married_whirlwind.sql`  
**Documentation:** `BACKEND_UPDATE_DOCUMENTATION.md`  
**Date:** October 21, 2025
