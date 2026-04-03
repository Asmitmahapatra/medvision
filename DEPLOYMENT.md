# MEDVISION Deployment Guide

This guide covers deploying MEDVISION to production with Firebase backend and Vite frontend.

## Prerequisites

- Node.js 16+ and npm installed
- Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)
- Firebase CLI installed: `npm install -g firebase-tools`
- Domain/hosting ready (Firebase Hosting, Vercel, Netlify, etc.)

## Step 1: Prepare Firebase Project

### 1.1 Create Firebase Project

```bash
# If not already created, create a new Firebase project
# Go to https://console.firebase.google.com
# Click "Add project"
# Enable:
# - Authentication (Email/Password, Google, optional others)
# - Firestore Database
# - Cloud Storage
# - Cloud Functions (optional, for backend logic)
```

### 1.2 Initialize Firebase Locally

```bash
# In project root
firebase login
firebase init

# Select features:
# - Firestore
# - Storage
# - Hosting
# - Functions (optional)
```

### 1.3 Get Firebase Configuration

```bash
# Copy from Firebase Console > Project Settings
# Save to .env.local
```

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 2: Deploy Security Rules

### 2.1 Update Rules (Already Done)

Rules are already configured in:

- `firestore.rules` - Database access control
- `storage.rules` - File storage access control

### 2.2 Deploy Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore

# Deploy Storage rules
firebase deploy --only storage

# Deploy all rules
firebase deploy --only firestore,storage
```

### 2.3 Verify Rules Deployment

1. Go to Firebase Console
2. Firestore Database → Rules tab → View current rules
3. Cloud Storage → Rules tab → View current rules

## Step 3: Prepare Database

### 3.1 Create Required Collections (Optional)

Firestore will auto-create collections when first document is added. But you can pre-create:

```bash
# Create empty collections via Firebase Console
# Or use your app to create first user/appointment
```

### 3.2 Create Composite Indexes (if needed)

```bash
# When you first query with multiple conditions, Firebase will suggest indexes
# You can create them through Console or let Firestore auto-create

# Common indexes needed:
# users: index on (role, createdAt)
# appointments: index on (status, scheduledAt)
# doctors: index on (department, rating)
```

### 3.3 Load Sample Data (Optional)

```bash
# Run seed script to load doctors and sample data
node seed-admin.js

# Or use the admin panel once deployed
```

## Step 4: Build Frontend

### 4.1 Install Dependencies

```bash
npm install
```

### 4.2 Environment Variables

Create `public/.env.production`:

```env
VITE_FIREBASE_API_KEY=production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id
NODE_ENV=production
```

### 4.3 Build Application

```bash
# Build for production
npm run build

# Output goes to dist/ directory
# Verify build:
ls -la dist/
```

### 4.4 Test Production Build Locally

```bash
# Install serve (production server)
npm install -g serve

# Serve production build
serve -s dist -l 3000

# Visit http://localhost:3000
```

## Step 5: Deploy Frontend

### Option A: Firebase Hosting (Recommended)

```bash
# Configure firebase.json (already done)
cat firebase.json

# Deploy
firebase deploy --only hosting

# Get URL from output:
# ✔  Deploy complete!
# Project Console: https://console.firebase.google.com/project/YOUR_PROJECT_ID
# Hosting URL: https://YOUR_PROJECT_ID.web.app
```

**Additional Firebase Hosting Options:**

```bash
# Preview URL
firebase hosting:channel:deploy preview

# Deploy to specific channel
firebase hosting:channel:deploy staging

# Rollback to previous version
firebase hosting:rollback
```

### Option B: Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (first time)
vercel

# Deploy (subsequent times)
vercel --prod

# Set environment variables
vercel env add
```

### Option C: Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Set environment variables in Netlify Console
# Settings > Environment > Create variable
```

## Step 6: Configure Domain (Optional)

### Firebase Hosting

```bash
# In Firebase Console
# Hosting > Domains > Add custom domain

# Or use Firebase-provided domain
# https://YOUR_PROJECT_ID.web.app
```

### Vercel/Netlify

```bash
# Follow their DNS setup guides
# Add DNS records pointing to their servers
```

## Step 7: Post-Deployment Checklist

### Functional Tests

- [ ] Users can sign up and log in
- [ ] Users can create appointments
- [ ] Users can view medical records
- [ ] Doctors can view assigned patients
- [ ] Chat features work (if implemented)
- [ ] File uploads work (profile pictures, medical documents)
- [ ] Multilingual chat responds correctly

### Security Tests

- [ ] Users can only see their own data
- [ ] Doctors can only see patient appointments
- [ ] Admins have full access
- [ ] Non-authenticated users redirected to login
- [ ] CORS headers are correct
- [ ] No sensitive data in browser console

### Performance Tests

```bash
# Check page load time
# Use Chrome DevTools > Performance tab
# Target: < 3s first contentful paint
# Target: < 5s time to interactive

# Check Firestore usage
# Firebase Console > Usage
# Monitor read/write/delete operations

# Check storage usage
# Firebase Console > Storage > Files
```

### Database Integrity

```bash
# Run test suite from development environment
import { runFullTestSuite } from './firebase-test-utils.js';
await runFullTestSuite(userId);
```

## Step 8: Monitoring & Maintenance

### Monitor Firebase Usage

```bash
# Firebase Console > Dashboard
# Track:
# - Daily active users
# - Firestore read/write operations
# - Storage usage
# - Authentication events
```

### Monitor Application Performance

Set up error logging:

```javascript
// In App.jsx or main.jsx
import { logError } from "./services/errorLogging";

window.addEventListener("error", (event) => {
  logError({
    type: "uncaught-error",
    message: event.message,
    stack: event.error?.stack,
    url: window.location.href,
  });
});
```

### Database Backups

```bash
# Enable Cloud Firestore automated backups
# Firebase Console > Firestore > Backups > Create

# Or manually export:
node -e "
const { BackupUtils } = require('./services/databaseMaintenance');
BackupUtils.exportCollection('users').then(data => {
  console.log(JSON.stringify(data, null, 2));
});
"
```

## Step 9: Scaling & Optimization

### Database Optimization

```javascript
// Index frequently queried fields
// Update firestore.rules with proper validation
// Archive old data regularly

import { CleanupUtils } from "./services/databaseMaintenance";
await CleanupUtils.archiveOldRecords(userId, 365);
```

### Frontend Optimization

```bash
# Analyze bundle size
npm run build -- --analyze

# Optimize images
# Use https://imageoptim.com or similar

# Code splitting
# Lazy load routes:
const Dashboard = lazy(() => import('./Dashboard'));
```

### Firestore Optimization

```javascript
// 1. Use pagination
// 2. Index compound queries
// 3. Cache data in React state
// 4. Use batch operations for bulk updates
// 5. Archive old documents
```

## Step 10: Troubleshooting

### Issue: Deploy fails with permission errors

```bash
# Solution: Ensure Firebase project ID matches
firebase use --list
firebase use your_project_id
firebase deploy
```

### Issue: Environment variables not loading

```bash
# Solution: Restart dev server after changing .env.local
npm run dev

# Verify in browser console:
console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID);
```

### Issue: Users can't upload files

```bash
# Solution: Check storage rules and quotas
# Firebase Console > Storage > Rules
# Check file size limits in storage.rules
```

### Issue: Slow queries

```bash
# Solution: Create composite indexes
# Firebase Console > Firestore > Indexes
# See DATABASE_SCHEMA.md for required indexes

# Or enable Firestore statistics:
firebase deploy --only firestore:stats
```

### Issue: High billing costs

```bash
# Solutions:
# 1. Reduce write operations (batch updates)
# 2. Archive old data
# 3. Use document-level pagination
# 4. Implement caching on client side
# 5. Review and delete test data regularly
```

## Step 11: Rollback & Recovery

### Rollback to Previous Version

```bash
# Firebase Hosting
firebase hosting:rollback

# Or if using git
git revert <commit-hash>
npm run build
firebase deploy --only hosting
```

### Restore from Backup

```bash
# Firebase provides automated daily backups
# To restore:
# 1. Go to Firebase Console
# 2. Firestore > Backup and Restore
# 3. Click restore

# Note: Restoring replaces existing data!
```

## Step 12: Performance Metrics

### Key Performance Indicators (KPIs)

Monitor these metrics:

```
✓ Page Load Time: < 3 seconds
✓ Time to Interactive: < 5 seconds
✓ Largest Contentful Paint: < 2.5 seconds
✓ Cumulative Layout Shift: < 0.1
✓ First Input Delay: < 100ms

✓ Firestore Read Latency: < 100ms
✓ Firestore Write Latency: < 100ms
✓ API Response Time: < 200ms

✓ Error Rate: < 0.1%
✓ Uptime: > 99.9%
```

### Track Metrics

```javascript
// In App.jsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Step 13: Security Hardening (Production)

### Enable Additional Features

```bash
# 1. Enable Email Verification
# Firebase Console > Authentication > Templates > Email Verification

# 2. Enable Rate Limiting
# Firebase Console > Authentication > Firewall rules

# 3. Enable Multi-factor Authentication (MFA)
# Firebase Console > Authentication > Sign-in method
```

### Review Security Rules

Ensure:

- ✅ All endpoints require authentication
- ✅ Users can only access their own data
- ✅ Doctors can only access assigned patients
- ✅ Admin access is restricted
- ✅ File uploads are validated
- ✅ No sensitive data exposed

### Set Up Monitoring

```bash
# Enable Cloud Logging
firebase deploy --only functions

# View logs
firebase functions:log

# Or in Firebase Console > Functions > Logs
```

## Deployment Summary

### What Got Deployed

**Backend (Firestore)**

- ✅ Security rules (firestore.rules)
- ✅ Storage rules (storage.rules)
- ✅ Composite indexes
- ✅ Cloud Functions (optional)

**Frontend (React + Vite)**

- ✅ HTML/CSS/JS bundle (dist/)
- ✅ Assets (images, fonts)
- ✅ Service Worker (for offline support)

**Database**

- ✅ Collections (users, appointments, doctors, etc.)
- ✅ Indexes for common queries
- ✅ Backup strategy

### Post-Launch Tasks

1. **Monitor** - Watch Firebase Dashboard for issues
2. **Backup** - Set up daily backups
3. **Update** - Plan for feature releases
4. **Scale** - Optimize as usage grows
5. **Support** - Set up error tracking and user support

## Useful Commands

```bash
# Development
npm run dev                 # Start dev server

# Building
npm run build              # Build production
npm run preview            # Preview production build

# Firebase
firebase deploy            # Deploy everything
firebase deploy --only hosting  # Deploy frontend only
firebase deploy --only firestore:rules,storage  # Deploy rules only
firebase logs             # View function logs
firebase emulators:start   # Start local emulator

# Testing
npm run test              # Run unit tests (when available)
npm run test:e2e         # Run e2e tests (when available)

# Analytics
firebase functions:log    # View server logs
firebase hosting:rollback # Rollback to previous version
```

## Getting Help

- **Firebase Docs**: https://firebase.google.com/docs
- **Vite Docs**: https://vitejs.dev/
- **React Docs**: https://react.dev
- **Firebase CLI Reference**: `firebase --help`
- **Support**: Firebase Console > Support or GitHub Issues

## Production Deployment Checklist

**Do NOT deploy without completing all checks:**

- [ ] Environment variables configured
- [ ] Security rules reviewed and tested
- [ ] Database indexes created
- [ ] Error logging enabled
- [ ] Performance monitored
- [ ] Backup strategy implemented
- [ ] SSL/HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] All tests passing
- [ ] User authentication working
- [ ] File uploads working
- [ ] Database operations verified
- [ ] Monitoring and alerts set up
- [ ] Rollback plan documented

**Estimated Deployment Time**: 30-60 minutes

**Estimated Cost** (Firebase free tier covers most needs initially):

- Firestore: Free 50K reads/day, $0.06 per 100K reads after
- Storage: Free 5GB, $0.18/GB after
- Hosting: Free with generous limits
- Total: Often < $5/month for small apps
