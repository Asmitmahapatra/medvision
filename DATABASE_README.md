# MEDVISION Firebase Database Setup & Best Practices

## Overview

This document provides comprehensive guidance on the MEDVISION Firebase Firestore and Cloud Storage setup, including architecture, security, and operational procedures.

## Quick Start

### 1. Environment Setup

Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Deploy security rules
firebase deploy --only firestore:rules,storage
```

### 3. Create Firestore Indexes

Some queries require composite indexes. Create them through:

1. Firebase Console → Firestore Database → Indexes
2. Or let Firestore auto-create them when you run the queries

Required indexes are documented in `DATABASE_SCHEMA.md`

## Database Architecture

### Collection Structure

```
users/
├── {userId}
│   ├── appointments/
│   │   └── {appointmentId}
│   ├── medicalRecords/
│   │   └── {recordId}
│   └── symptomLogs/
│       └── {logId}
│
doctors/
└── {doctorId}

appointments/  (optional - global collection)
├── {appointmentId}

chatMessages/  (future feature)
└── {messageId}
```

### Design Decisions

- **Subcollections for user data**: Allows better security and logical grouping
- **Serverside timestamps**: Consistent across all clients
- **Role-based access control**: Implemented at security rules level
- **Data validation**: Happens in rules and app layer

## Security Rules

All security rules are defined in:

- `firestore.rules` - Firestore database access
- `storage.rules` - Cloud Storage file access

### Key Security Features

✅ **Role-based Access Control**

- Patient: Can only access own data
- Doctor: Can read patient data and create medical records
- Admin: Full access to all data

✅ **Data Validation**

- Field validation at rules level
- Type checking for critical fields
- Status enum validation

✅ **Default Deny**

- If not explicitly allowed, all access is denied
- Security-first approach

## API Reference

### User Management

```javascript
import { UserDB } from "./services/databaseService";

// Create user
const user = await UserDB.createUser(userId, {
  email: "user@example.com",
  displayName: "John Doe",
  phone: "+91...",
  village: "Bihara Khurd",
  role: "patient",
});

// Get user
const userData = await UserDB.getUser(userId);

// Update user
await UserDB.updateUser(userId, {
  displayName: "Jane Doe",
  phone: "+91...",
});

// Delete user
await UserDB.deleteUser(userId);
```

### Appointment Management

```javascript
import { AppointmentDB } from "./services/databaseService";

// Create appointment
await AppointmentDB.createAppointment(userId, {
  doctor: "Dr. Meera Rao",
  department: "General Medicine",
  notes: "Regular checkup",
  status: "pending",
  scheduledAt: "2026-04-10T10:00:00Z",
});

// Get appointments
const appointments = await AppointmentDB.getAppointments(userId, {
  limit: 10,
  orderBy: "scheduledAt",
});

// Update appointment
await AppointmentDB.updateAppointment(userId, appointmentId, {
  status: "confirmed",
});

// Delete appointment
await AppointmentDB.deleteAppointment(userId, appointmentId);
```

### Medical Records

```javascript
import { MedicalRecordDB } from "./services/databaseService";

// Create record
await MedicalRecordDB.createRecord(userId, {
  diagnosis: "Mild fever",
  doctor: "Dr. Meera Rao",
  department: "General Medicine",
  symptoms: "Fever, cough",
  prescription: "Rest, fluids...",
  date: "2026-03-28",
});

// Get records
const records = await MedicalRecordDB.getRecords(userId, {
  limit: 10,
  orderBy: "date",
});
```

## Data Maintenance

### Backup Operations

```javascript
import { BackupUtils } from "./services/databaseMaintenance";

// Export a collection
const backup = await BackupUtils.exportCollection("users");

// Export user with all related data
const userData = await BackupUtils.exportUserData(userId);

// Generate backup report
const report = await BackupUtils.generateBackupReport();
```

### Data Migration

```javascript
import { MigrationUtils } from "./services/databaseMaintenance";

// Rename a field
await MigrationUtils.renameField("users", "oldField", "newField");

// Add default values
await MigrationUtils.addDefaultUserFields({
  language: "en",
  verified: false,
});
```

### Cleanup Operations

```javascript
import { CleanupUtils } from "./services/databaseMaintenance";

// Soft delete user (preserves data)
await CleanupUtils.softDeleteUser(userId);

// Hard delete user (removes all data)
await CleanupUtils.hardDeleteUser(userId);

// Delete old appointments
await CleanupUtils.deleteOldAppointments(userId, 90); // 90 days old

// Archive old records
await CleanupUtils.archiveOldRecords(userId, 365); // 1 year old
```

## Best Practices

### 1. Always Use Transactions for Multi-Document Updates

```javascript
// BAD ❌
await updateDoc(userRef, { field1: value1 });
await updateDoc(appointmentRef, { field2: value2 });

// GOOD ✅
const batch = writeBatch(db);
batch.update(userRef, { field1: value1 });
batch.update(appointmentRef, { field2: value2 });
await batch.commit();
```

### 2. Index Your Queries

```javascript
// Create indexes in Firebase Console for:
// - users: role, createdAt
// - doctors: department, rating
// - appointments: status, scheduledAt
```

### 3. Paginate Large Result Sets

```javascript
// BAD ❌
const allRecords = await getDocs(
  collection(db, "users", userId, "medicalRecords"),
);

// GOOD ✅
const first = await getDocs(
  query(collection(db, "users", userId, "medicalRecords"), limit(10)),
);

const next = await getDocs(
  query(
    collection(db, "users", userId, "medicalRecords"),
    startAfter(first.docs[first.docs.length - 1]),
    limit(10),
  ),
);
```

### 4. Validate Data Before Writing

```javascript
import { ValidationUtils } from "./services/databaseMaintenance";

const validation = ValidationUtils.validateUserData(userData);
if (!validation.valid) {
  throw new Error(`Validation errors: ${validation.errors.join(", ")}`);
}
```

### 5. Use Offline Persistence (Optional)

```javascript
import {
  initializeFirestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";

const db = initializeFirestore(app, {
  cacheSizeBytes: 50 * 1024 * 1024, // 50MB
});

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.log("Multiple tabs open, persistence disabled");
  }
});
```

## Monitoring & Performance

### Firestore Quotas & Pricing

- **Read operations**: 100,000 reads + 50,000 free per day
- **Write operations**: 20,000 writes + 20,000 free per day
- **Delete operations**: 20,000 deletes + 20,000 free per day
- **Storage**: 1GB free + $0.18/GB

### Optimize Queries

1. **Only fetch fields you need**: Use select() to reduce data transfer
2. **Avoid N+1 queries**: Batch related data in single documents
3. **Cache results**: Use React Context or Redux for frequently accessed data
4. **Use pagination**: Limit results to 10-50 documents per query

### Monitor Database Usage

```bash
# View Firestore usage in Firebase Console
# Dashboard → Storage → Firestore Database
```

## Troubleshooting

### Issue: Permission Denied Errors

**Cause**: Security rules don't allow the operation

**Solution**:

1. Check user role and authentication status
2. Verify security rules allow the operation
3. Use Firebase Emulator to debug locally

### Issue: High Billing Costs

**Cause**: Too many read operations or inefficient queries

**Solution**:

1. Add composite indexes for complex queries
2. Use pagination to limit result sets
3. Cache frequently accessed data
4. Archive old data to reduce collection size

### Issue: Query Performance is Slow

**Cause**: Missing indexes or large result sets

**Solution**:

1. Create composite indexes in Firebase Console
2. Add where clauses to filter results early
3. Use pagination for large result sets
4. Consider denormalizing data if needed

## Local Development with Firebase Emulator

```bash
# Install emulator
firebase init emulator

# Start emulator
firebase emulators:start

# Configure app to use emulator (development only)
import { connectFirestoreEmulator } from 'firebase/firestore';

if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## Deployment Checklist

- [ ] All environment variables set in `.env.local`
- [ ] Firebase project created and configured
- [ ] Firestore security rules deployed
- [ ] Cloud Storage rules deployed
- [ ] Composite indexes created
- [ ] Backup strategy implemented
- [ ] Error logging configured
- [ ] Rate limiting implemented
- [ ] Data retention policy defined
- [ ] GDPR compliance verified

## Additional Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Cloud Storage Documentation](https://firebase.google.com/docs/storage)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/start)
- [Best Practices](https://firebase.google.com/docs/firestore/best-practices)

## Support & Questions

For issues or questions:

1. Check Firebase Console error logs
2. Review this documentation
3. Search Firebase GitHub issues
4. Post on Firebase community forums
