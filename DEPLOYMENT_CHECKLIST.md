# MEDVISION Firebase Deployment Checklist

## Pre-Deployment Setup (5 minutes)

### Step 1: Verify Firebase Project

- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Verify your Firebase project exists (project name should match in console)
- [ ] Navigate to **Project Settings** → **Service Accounts**
- [ ] Click **Generate New Private Key** and save as `firebase-service-account.json` in project root

### Step 2: Verify Environment Configuration

- [ ] Check if `.env` file exists in project root
- [ ] If not, copy from `.env.example`:
  ```bash
  cp .env.example .env
  ```
- [ ] Fill in your Firebase config values from Firebase Console → Project Settings

### Step 3: Install Dependencies

```bash
npm install firebase-admin
npm install -g firebase-tools
```

## Deployment (5 minutes)

### Step 4: Login to Firebase

```bash
firebase login
```

- Opens browser for authentication
- Approve the Firebase CLI access

### Step 5: Initialize Firebase Locally

```bash
firebase init
```

- When prompted, select your existing project
- When asked for Firestore rules file, enter: `firestore.rules`
- When asked for Storage rules file, enter: `storage.rules`

### Step 6: Deploy Rules

```bash
firebase deploy --only firestore:rules,storage
```

**Success indicator:** You should see:

```
✔ deployed to cloud.firestore
✔ deployed to firebase.storage
```

## Verification (5 minutes)

### Step 7: Verify in Firebase Console

- [ ] Go to Firebase Console → **Firestore** → **Rules** tab
  - Check: Latest publish timestamp should be recent (within last minute)
- [ ] Go to Firebase Console → **Storage** → **Rules** tab
  - Check: Latest publish timestamp should be recent

### Step 8: Create First Admin User

```bash
node seed-admin.js YOUR_UID your.email@example.com
```

Example:

```bash
node seed-admin.js "user123abc" "admin@medvision.com"
```

**Where to get YOUR_UID:**

1. In Firebase Console, go to **Authentication** → **Users**
2. Find the user you created when testing login
3. Click on them to see their **User UID**
4. Copy that UUID and use it in the command above

### Step 9: Test Rules

Run these quick tests from browser console (must be logged in):

**Test 1 - Verify user can access own data:**

```javascript
// Should succeed (user can read own appointments)
db.collection("users").doc("YOUR_UID").collection("appointments").get();
```

**Test 2 - Verify user isolation:**

```javascript
// Should fail (user cannot read another user's data)
db.collection("users").doc("OTHER_UID").get();
```

**Test 3 - Verify storage access:**

```javascript
// Should succeed (user can upload to own folder)
const ref = firebase.storage().ref(`medicalRecords/YOUR_UID/test.txt`);
```

## Troubleshooting

### Firebase CLI not found

```bash
npm install -g firebase-tools --force
```

### Rules deployment fails

- Check that `firestore.rules` and `storage.rules` files exist in project root
- Run: `firebase status` to check connection

### Can't create admin user

- Verify `firebase-service-account.json` exists in project root
- Check that user UID is correct (from Firebase Console)
- Run: `node seed-admin.js --help` for usage examples

### Rules not taking effect

- Wait 1-2 minutes for rules to propagate
- Hard refresh Firebase Console (Ctrl+Shift+R)
- Check that you're using same Firebase project in `.env`

---

## Next Steps After Deployment

1. ✅ Frontend is ready to use (login/signup functional)
2. ⏳ Test all authentication flows (login, signup, logout)
3. ⏳ Build forgot password feature
4. ⏳ Add email verification flow
5. ⏳ Optimize bundle size (<500 kB)

**Estimated time to full deployment: 15-20 minutes**
