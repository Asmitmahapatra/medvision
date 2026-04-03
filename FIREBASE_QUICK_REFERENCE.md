# Firebase Deployment Quick Reference

## One-Line Deployment (After Firebase Login)

```bash
firebase init && firebase deploy --only firestore:rules,storage
```

## Manual Step-by-Step

```bash
# 1. Login to Firebase (opens browser)
firebase login

# 2. Initialize Firebase config
firebase init

# 3. Deploy rules
firebase deploy --only firestore:rules,storage

# 4. Create admin user (after getting service account key)
npm install firebase-admin
node seed-admin.js YOUR_UID your.email@example.com
```

## Windows (Without Terminal)

Double-click: `deploy-firebase.bat`

## macOS/Linux

```bash
bash deploy-firebase.sh
```

## Verify Deployment

1. **Firestore Console:**
   - Go to Firebase Console → Firestore → Rules
   - Check for recent "Publish" timestamp

2. **Storage Console:**
   - Go to Firebase Console → Storage → Rules
   - Check for recent "Publish" timestamp

3. **Test in Browser Console:**
   ```javascript
   // Must be logged in first
   db.collection("users").doc(auth.currentUser.uid).get();
   ```

## Common Issues

| Issue                         | Solution                                                             |
| ----------------------------- | -------------------------------------------------------------------- |
| `firebase: command not found` | `npm install -g firebase-tools`                                      |
| `firestore.rules not found`   | Run from project root directory                                      |
| Rules don't take effect       | Wait 2 min, hard refresh (Ctrl+Shift+R)                              |
| Service account key missing   | Download from Firebase Console → Project Settings → Service Accounts |
| Can't create admin user       | Verify UID from Firebase Console → Authentication → Users            |

## Project Status After Deployment

✅ Frontend: Ready (login/signup functional)  
✅ Backend: Rules deployed to Firestore/Storage  
⏳ Admin setup: Need to run `seed-admin.js`  
⏳ Testing: Need to verify security rules work

**Time required: 15 minutes total**
