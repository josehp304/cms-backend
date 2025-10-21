# Implementation Checklist

**Project:** CMS Backend - Branch Table Updates  
**Date:** October 21, 2025

---

## ✅ Backend Changes (COMPLETED)

### Database Schema
- [x] Added `is_ladies` boolean field to branch table
- [x] Added `is_cooking` boolean field to branch table
- [x] Added `cooking_price` integer field to branch table
- [x] Added `display_order` integer field to branch table
- [x] Set appropriate default values
- [x] Generated migration file (`0001_married_whirlwind.sql`)

### API Routes
- [x] Updated POST `/api/branches` to accept new fields
- [x] Updated PUT `/api/branches/:id` to accept new fields
- [x] Updated GET `/api/branches` to order by `display_order`
- [x] Added `asc` import from drizzle-orm
- [x] TypeScript types auto-inferred from schema

### Documentation
- [x] Created `BACKEND_UPDATE_DOCUMENTATION.md` (comprehensive guide)
- [x] Created `DEPLOYMENT_INSTRUCTIONS.md` (deployment steps)
- [x] Created `FRONTEND_QUICK_REFERENCE.md` (quick start)
- [x] Created `CHANGES_SUMMARY.md` (overview)
- [x] Created this `IMPLEMENTATION_CHECKLIST.md`

---

## ⏳ Pending Backend Tasks

### Database Migration
- [ ] **CRITICAL:** Run `npx drizzle-kit push` to apply migration
- [ ] Verify migration completed successfully
- [ ] Test database connection
- [ ] Check that all 4 columns exist

### API Testing
- [ ] Test GET `/api/branches` - verify sorting by display_order
- [ ] Test GET `/api/branches/:id` - verify new fields present
- [ ] Test POST `/api/branches` with new fields
- [ ] Test PUT `/api/branches/:id` to update new fields
- [ ] Test DELETE `/api/branches/:id` (should work unchanged)

### Deployment
- [ ] Backup production database
- [ ] Deploy to staging first
- [ ] Run migration on staging
- [ ] Test on staging
- [ ] Deploy to production
- [ ] Run migration on production
- [ ] Monitor for errors

---

## ⏳ Frontend Implementation Tasks

### 1. TypeScript Types (Priority: HIGH)
- [ ] Create/update `types/branch.ts` or similar
- [ ] Add `is_ladies: boolean | null`
- [ ] Add `is_cooking: boolean | null`
- [ ] Add `cooking_price: number | null`
- [ ] Add `display_order: number | null`
- [ ] Verify no TypeScript errors

### 2. Branch Creation Form (Priority: HIGH)
- [ ] Add checkbox for "Ladies Hostel" (`is_ladies`)
- [ ] Add checkbox for "Cooking Facilities" (`is_cooking`)
- [ ] Add number input for "Cooking Price" (conditional on `is_cooking`)
- [ ] Add number input for "Display Order"
- [ ] Update FormData submission to include new fields
- [ ] Test form submission

### 3. Branch Edit Form (Priority: HIGH)
- [ ] Add same fields as creation form
- [ ] Pre-populate with existing values
- [ ] Test updating fields
- [ ] Verify PUT request includes new fields

### 4. Branch Display/Cards (Priority: MEDIUM)
- [ ] Show "Ladies Hostel" badge when `is_ladies` is true
- [ ] Show "Cooking Available" badge/text when `is_cooking` is true
- [ ] Display cooking price (if available)
- [ ] Style badges appropriately

### 5. Filtering (Priority: MEDIUM)
- [ ] Add "Ladies Hostels Only" filter checkbox
- [ ] Add "With Cooking" filter checkbox
- [ ] Implement filter logic
- [ ] Test filters work correctly

### 6. Price Display (Priority: LOW)
- [ ] Update total price calculation to include cooking_price
- [ ] Show breakdown: Room + Cooking = Total
- [ ] Make it clear what's included

### 7. Sorting (Priority: LOW)
- [ ] Verify branches display in correct order (already sorted by API)
- [ ] Optional: Add manual sort controls if needed

---

## 🧪 Testing Checklist

### Backend Tests
- [ ] Migration runs without errors
- [ ] All existing branches still load
- [ ] New branches can be created with new fields
- [ ] Existing branches can be updated with new fields
- [ ] GET returns branches in correct order
- [ ] Default values work correctly
- [ ] Null values handled properly

### Frontend Tests
- [ ] No TypeScript compilation errors
- [ ] Forms display correctly
- [ ] New fields are optional (form works without them)
- [ ] Checkboxes toggle correctly
- [ ] Numbers validate properly
- [ ] API integration works
- [ ] Branch cards display new info
- [ ] Filters work as expected
- [ ] Responsive on mobile
- [ ] Cross-browser testing

### Integration Tests
- [ ] Create branch with all new fields → Success
- [ ] Create branch without new fields → Success (defaults used)
- [ ] Update only new fields → Success
- [ ] Filter by ladies hostel → Shows correct results
- [ ] Filter by cooking → Shows correct results
- [ ] Price calculation includes cooking → Correct total

---

## 📋 Documentation to Review

Before implementing, team members should read:

### Backend Developer:
1. ✅ `DEPLOYMENT_INSTRUCTIONS.md` - How to deploy
2. ✅ `CHANGES_SUMMARY.md` - What changed

### Frontend Developer:
1. ✅ `FRONTEND_QUICK_REFERENCE.md` - Quick start guide
2. ✅ `BACKEND_UPDATE_DOCUMENTATION.md` - Full API docs (if needed)

### Both:
1. ✅ This checklist - Track progress
2. ✅ Migration file: `drizzle/0001_married_whirlwind.sql`

---

## 🚨 Critical Items (Do First!)

### Backend:
1. 🔴 **BACKUP DATABASE** before running migration
2. 🔴 **RUN MIGRATION:** `npx drizzle-kit push`
3. 🔴 **VERIFY:** Check that columns were added
4. 🟡 **TEST:** Create a test branch with new fields

### Frontend:
1. 🔴 **UPDATE TYPES:** Add new fields to TypeScript interfaces
2. 🔴 **UPDATE FORMS:** Add input fields
3. 🟡 **UPDATE DISPLAY:** Show new information
4. 🟢 **ADD FILTERS:** Implement filtering (optional)

---

## 📊 Progress Tracking

### Backend Status
- **Schema:** ✅ Complete
- **Routes:** ✅ Complete
- **Migration File:** ✅ Generated
- **Migration Applied:** ⏳ Pending
- **Testing:** ⏳ Pending
- **Deployment:** ⏳ Pending

### Frontend Status
- **Types:** ⏳ Not Started
- **Forms:** ⏳ Not Started
- **Display:** ⏳ Not Started
- **Filters:** ⏳ Not Started
- **Testing:** ⏳ Not Started

### Documentation Status
- **API Docs:** ✅ Complete
- **Deployment Guide:** ✅ Complete
- **Quick Reference:** ✅ Complete
- **Summary:** ✅ Complete

---

## 🎯 Definition of Done

### Backend:
- [x] Code changes committed
- [ ] Migration applied successfully
- [ ] All tests pass
- [ ] API endpoints work correctly
- [ ] Deployed to production
- [ ] No errors in logs

### Frontend:
- [ ] TypeScript types updated
- [ ] Forms include new fields
- [ ] Display shows new information
- [ ] Filters work (if implemented)
- [ ] All tests pass
- [ ] No console errors
- [ ] Deployed to production

### Overall:
- [ ] Both backend and frontend deployed
- [ ] End-to-end testing complete
- [ ] Team trained on new features
- [ ] Documentation reviewed
- [ ] Stakeholders notified

---

## 🆘 Help & Support

**Questions about:**
- Database schema → See `src/db/schema.ts`
- API usage → See `BACKEND_UPDATE_DOCUMENTATION.md`
- Deployment → See `DEPLOYMENT_INSTRUCTIONS.md`
- Quick examples → See `FRONTEND_QUICK_REFERENCE.md`

**Issues:**
- Database errors → Check `DEPLOYMENT_INSTRUCTIONS.md` troubleshooting
- API errors → Check server logs and endpoint responses
- Frontend errors → Check browser console and network tab

---

## 📅 Timeline Suggestion

### Day 1 (Backend)
- ✅ Code changes (DONE)
- ⏳ Run migration
- ⏳ Test APIs
- ⏳ Deploy to staging

### Day 2 (Frontend)
- ⏳ Update types
- ⏳ Update forms
- ⏳ Update display
- ⏳ Test locally

### Day 3 (Integration & Deploy)
- ⏳ Integration testing
- ⏳ Deploy to production
- ⏳ Monitor
- ⏳ Final verification

---

**Status:** Backend code complete, awaiting migration and frontend implementation.

**Next Step:** Run database migration with `npx drizzle-kit push`
