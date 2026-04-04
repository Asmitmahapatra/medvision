/\*\*

- MEDVISION Database Schema Documentation
-
- This file documents the structure and design of the Firestore database
- used by the MEDVISION healthcare platform.
  \*/

/\*\*

- ===========================================================
- USERS COLLECTION
- ===========================================================
-
- Path: /users/{userId}
- Document ID: Firebase Auth UID
-
- Purpose: Store user profile information and metadata
-
- Fields:
- - email (string): User's email address (unique)
- - displayName (string): User's full name
- - phone (string): Contact phone number
- - village (string): User's village/location
- - age (number): User's age
- - gender (string): User's gender (M/F)
- - address (string): Full address
- - language (string): Preferred language (en/hi)
- - role (string): User role (patient/doctor/admin)
- - createdAt (timestamp): Account creation time
- - updatedAt (timestamp): Last profile update
-
- Indexes: email, role, createdAt
-
- Security Rules:
- - READ: Owner, Admins, Doctors (for patient profiles)
- - CREATE: Owner (patient role only)
- - UPDATE: Owner or Admin
- - DELETE: Admin only
    \*/

/\*\*

- ===========================================================
- USERS -> APPOINTMENTS SUBCOLLECTION
- ===========================================================
-
- Path: /users/{userId}/appointments/{appointmentId}
- Document ID: Auto-generated
-
- Purpose: Store patient appointment records
-
- Fields:
- - doctor (string): Doctor's name
- - department (string): Medical department
- - speciality (string): Doctor's specialty
- - notes (string): Appointment notes/symptoms
- - status (string): One of [pending, confirmed, completed, cancelled]
- - scheduledAt (string): ISO 8601 datetime string
- - createdAt (timestamp): Appointment creation time
- - updatedAt (timestamp): Last update time
-
- Indexes: status, scheduledAt, createdAt
-
- Security Rules:
- - READ: Owner, Doctors, Admins
- - CREATE: Owner or Doctor
- - UPDATE: Owner, Doctor, or Admin
- - DELETE: Admin only
    \*/

/\*\*

- ===========================================================
- USERS -> MEDICAL_RECORDS SUBCOLLECTION
- ===========================================================
-
- Path: /users/{userId}/medicalRecords/{recordId}
- Document ID: Auto-generated
-
- Purpose: Store patient medical consultion records
-
- Fields:
- - diagnosis (string): Medical diagnosis
- - doctor (string): Consulting doctor's name
- - department (string): Medical department
- - symptoms (string): Patient's symptoms
- - prescription (string): Treatment prescription
- - notes (string): Additional medical notes
- - date (string): Consultation date (YYYY-MM-DD)
- - attachmentUrl (string, optional): URL to medical document/report
- - createdAt (timestamp): Record creation time
- - updatedAt (timestamp): Last update time
-
- Indexes: date, createdAt
-
- Security Rules:
- - READ: Owner, Doctors, Admins
- - CREATE/UPDATE: Doctors or Admins only
- - DELETE: Admin only
    \*/

/\*\*

- ===========================================================
- USERS -> SYMPTOM_LOGS SUBCOLLECTION
- ===========================================================
-
- Path: /users/{userId}/symptomLogs/{logId}
- Document ID: Auto-generated
-
- Purpose: Store patient symptom tracking logs
-
- Fields:
- - symptoms (string): Described symptoms
- - severity (string): Severity level (mild/moderate/severe)
- - temperature (number, optional): Body temperature in Celsius
- - notes (string): Additional notes
- - createdAt (timestamp): Log creation time
-
- Indexes: createdAt
-
- Security Rules:
- - READ: Owner, Admins
- - CREATE: Owner only
- - UPDATE/DELETE: Admin only
    \*/

/\*\*

- ===========================================================
- DOCTORS COLLECTION
- ===========================================================
-
- Path: /doctors/{doctorId}
- Document ID: Auto-generated or custom ID
-
- Purpose: Store doctor profile and directory information
-
- Fields:
- - id (string): Unique doctor identifier
- - name (string): Doctor's full name
- - department (string): Medical department
- - experience (string): Years of experience
- - hospital (string): Associated hospital/clinic
- - availability (string): Availability hours
- - languages (string): Languages spoken
- - phone (string): Contact number
- - rating (number, optional): Doctor rating (1-5)
- - verified (boolean): Is doctor verified
- - createdAt (timestamp): Profile creation time
- - updatedAt (timestamp): Last update time
-
- Indexes: department, verified, rating
-
- Security Rules:
- - READ: All signed-in users
- - CREATE/UPDATE/DELETE: Admin only
    \*/

/\*\*

- ===========================================================
- APPOINTMENTS COLLECTION (GLOBAL, OPTIONAL)
- ===========================================================
-
- Path: /appointments/{appointmentId}
- Document ID: Auto-generated
-
- Purpose: Global appointment directory (alternative to subcollection)
- Use this if you want centralized appointment management
-
- Fields:
- - Same as users/{userId}/appointments/
- - patientId (string): Reference to patient user ID
- - doctorId (string): Reference to doctor ID
    \*/

/\*\*

- ===========================================================
- DATABASE DESIGN NOTES
- ===========================================================
-
- 1.  SUBCOLLECTION DESIGN
- - Appointments, medical records, and symptom logs are stored
- - as subcollections under users/ for better organization
- - and to leverage user-scoped security
-
- 2.  TIMESTAMPS
- - Use serverTimestamp() for createdAt and updatedAt
- - This ensures consistency across all clients
-
- 3.  DATA CONSISTENCY
- - Always use batch operations for multi-document updates
- - Implement soft deletes (status: deleted) for audit trails
-
- 4.  SCALABILITY
- - Collections are indexed for common queries
- - Consider pagination with startAfter() for large result sets
- - Archive old records to a separate collection if needed
-
- 5.  SECURITY
- - All rules use role-based access control (RBAC)
- - Data validation happens at the rules level
- - Default deny: if not explicitly allowed, it's denied
-
- 6.  FUTURE COLLECTIONS
- - /chatMessages/{messageId} - For doctor-patient messaging
- - /notifications/{userId}/messages/{messageId} - User notifications
- - /analytics/{date}/events/{eventId} - Analytics tracking
    \*/

/\*\*

- ===========================================================
- QUERY PATTERNS
- ===========================================================
  \*/

// Get user's recent appointments
// db.collection('users').doc(userId).collection('appointments')
// .where('status', '==', 'pending')
// .orderBy('scheduledAt', 'asc')
// .limit(10)

// Get all doctors in a department
// db.collection('doctors')
// .where('department', '==', 'General Medicine')
// .orderBy('rating', 'desc')
// .limit(20)

// Get user's medical records by date
// db.collection('users').doc(userId).collection('medicalRecords')
// .orderBy('date', 'desc')
// .limit(10)

/\*\*

- ===========================================================
- DATABASE INDEXES
- ===========================================================
-
- Required Firestore Indexes:
-
- 1.  users collection:
- - role (Ascending)
- - createdAt (Descending)
-
- 2.  doctors collection:
- - department (Ascending)
- - rating (Descending)
- - verified (Ascending)
-
- 3.  users -> appointments:
- - status (Ascending), scheduledAt (Ascending)
-
- 4.  users -> medicalRecords:
- - date (Descending)
    \*/

export const DATABASE_SCHEMA = {
version: '1.0.0',
lastUpdated: '2026-04-03',
collections: {
users: {
path: '/users/{userId}',
type: 'collection',
subcollections: ['appointments', 'medicalRecords', 'symptomLogs'],
},
doctors: {
path: '/doctors/{doctorId}',
type: 'collection',
},
appointments: {
path: '/appointments/{appointmentId}',
type: 'collection',
optional: true,
},
},
};

export default DATABASE_SCHEMA;
