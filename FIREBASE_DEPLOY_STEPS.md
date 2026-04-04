# Firebase Rules Deploy Steps (MEDVISION)

## 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

## 2. Login to Firebase

```bash
firebase login
```

## 3. Initialize Firebase in this folder

Run from project root and choose your existing Firebase project:

```bash
firebase init
```

When prompted:

- Select `Firestore` and `Storage`
- Use existing project: `medvision` (or your project id)
- Firestore rules file: `firestore.rules`
- Storage rules file: `storage.rules`

If `firebase init` already ran before, skip this step.

## 4. Link project directly (optional shortcut)

```bash
firebase use --add
```

Choose your project and set an alias (example: `prod`).

## 5. Deploy only security rules

```bash
firebase deploy --only firestore:rules,storage
```

## 6. Verify in Firebase Console

- Firestore -> Rules: check latest publish timestamp
- Storage -> Rules: check latest publish timestamp

## 7. Recommended test cases

1. Signed-out user cannot read/write Firestore.
2. User A cannot read/write User B document in `users/{uid}`.
3. User can read/write own `users/{uid}/appointments`.
4. User can only upload files under `medicalRecords/{uid}/...`.
5. Any random storage path outside defined folders is denied.

## 8. Important note for roles

These rules rely on role values in Firestore user docs:

- `users/{uid}.role = patient | doctor | admin`

For admin-level write access, set the role carefully from trusted scripts/admin panel only.
