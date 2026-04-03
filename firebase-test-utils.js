// firebase-test-utils.js
/**
 * Firebase Database Testing & Validation Utilities
 *
 * Use these functions to:
 * - Test database connections and rules
 * - Validate data before operations
 * - Perform integration testing
 * - Debug security rules violations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  limitToLast,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";

// ============================================================================
// CONNECTION & PERMISSION TESTS
// ============================================================================

/**
 * Test basic Firestore connection
 */
export async function testFirestoreConnection() {
  console.log("🧪 Testing Firestore connection...");
  try {
    const testRef = collection(db, "__test__");
    await getDocs(testRef);
    console.log("✅ Firestore connection OK");
    return true;
  } catch (err) {
    console.error("❌ Firestore connection failed:", err);
    return false;
  }
}

/**
 * Test Firebase Authentication
 */
export async function testAuthentication() {
  console.log("🧪 Testing authentication...");
  try {
    if (!auth.currentUser) {
      console.warn("⚠️ No user logged in");
      return false;
    }
    console.log("✅ User authenticated:", auth.currentUser.email);
    return true;
  } catch (err) {
    console.error("❌ Authentication check failed:", err);
    return false;
  }
}

/**
 * Test read permissions for a collection
 */
export async function testReadPermission(collectionName) {
  console.log(`🧪 Testing read permission for ${collectionName}...`);
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    console.log(`✅ Read permission OK (${snapshot.size} documents)`);
    return true;
  } catch (err) {
    console.error(`❌ Read permission denied for ${collectionName}:`, err.code);
    return false;
  }
}

/**
 * Test write permissions for a collection
 */
export async function testWritePermission(collectionName, testData) {
  console.log(`🧪 Testing write permission for ${collectionName}...`);
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...testData,
      __test__: true,
      createdAt: new Date().toISOString(),
    });

    // Cleanup
    await deleteDoc(docRef);
    console.log(`✅ Write permission OK`);
    return true;
  } catch (err) {
    console.error(
      `❌ Write permission denied for ${collectionName}:`,
      err.code,
    );
    return false;
  }
}

// ============================================================================
// DATA VALIDATION TESTS
// ============================================================================

/**
 * Validate user data structure
 */
export function validateUserData(userData) {
  console.log("🧪 Validating user data...");
  const errors = [];

  if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push("Invalid or missing email");
  }

  if (!userData.displayName || userData.displayName.trim().length === 0) {
    errors.push("Missing displayName");
  }

  if (
    userData.role &&
    !["patient", "doctor", "admin"].includes(userData.role)
  ) {
    errors.push("Invalid role value");
  }

  if (errors.length === 0) {
    console.log("✅ User data validation passed");
    return { valid: true, errors: [] };
  } else {
    console.error("❌ User data validation failed:", errors);
    return { valid: false, errors };
  }
}

/**
 * Validate appointment data structure
 */
export function validateAppointmentData(appointmentData) {
  console.log("🧪 Validating appointment data...");
  const errors = [];

  if (!appointmentData.doctor || appointmentData.doctor.trim().length === 0) {
    errors.push("Missing doctor name");
  }

  if (
    !appointmentData.department ||
    appointmentData.department.trim().length === 0
  ) {
    errors.push("Missing department");
  }

  if (
    !appointmentData.scheduledAt ||
    Number.isNaN(new Date(appointmentData.scheduledAt).getTime())
  ) {
    errors.push("Invalid scheduledAt date");
  }

  if (
    appointmentData.status &&
    !["pending", "confirmed", "cancelled", "completed"].includes(
      appointmentData.status,
    )
  ) {
    errors.push("Invalid status value");
  }

  if (errors.length === 0) {
    console.log("✅ Appointment data validation passed");
    return { valid: true, errors: [] };
  } else {
    console.error("❌ Appointment data validation failed:", errors);
    return { valid: false, errors };
  }
}

/**
 * Validate medical record data
 */
export function validateMedicalRecordData(recordData) {
  console.log("🧪 Validating medical record data...");
  const errors = [];

  if (!recordData.diagnosis || recordData.diagnosis.trim().length === 0) {
    errors.push("Missing diagnosis");
  }

  if (!recordData.doctor || recordData.doctor.trim().length === 0) {
    errors.push("Missing doctor name");
  }

  if (!recordData.date || Number.isNaN(new Date(recordData.date).getTime())) {
    errors.push("Invalid date");
  }

  if (errors.length === 0) {
    console.log("✅ Medical record validation passed");
    return { valid: true, errors: [] };
  } else {
    console.error("❌ Medical record validation failed:", errors);
    return { valid: false, errors };
  }
}

// ============================================================================
// DATA INTEGRITY TESTS
// ============================================================================

/**
 * Check for orphaned documents (subcollection without parent)
 */
export async function findOrphanedDocuments(userId) {
  console.log(`🧪 Checking for orphaned documents in user ${userId}...`);

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn("⚠️ User document not found");
      return [];
    }

    const orphaned = [];

    // Check appointments subcollection
    const appointmentsRef = collection(userRef, "appointments");
    const appoSnap = await getDocs(appointmentsRef);
    appoSnap.forEach((doc) => {
      // Check if appointment has valid references
      if (!doc.data().doctor || !doc.data().scheduledAt) {
        orphaned.push({
          collection: "appointments",
          id: doc.id,
          issue: "Missing required fields",
        });
      }
    });

    if (orphaned.length === 0) {
      console.log("✅ No orphaned documents found");
    } else {
      console.warn(`⚠️ Found ${orphaned.length} orphaned documents`);
    }

    return orphaned;
  } catch (err) {
    console.error("❌ Error checking orphaned documents:", err);
    return [];
  }
}

/**
 * Validate referential integrity
 */
export async function validateReferentialIntegrity(userId) {
  console.log(`🧪 Validating referential integrity for user ${userId}...`);

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error("❌ User not found");
      return false;
    }

    const issues = [];

    // Check that all appointments reference valid doctors
    const appointmentsRef = collection(userRef, "appointments");
    const appoSnap = await getDocs(appointmentsRef);

    for (const appoDoc of appoSnap.docs) {
      const appoData = appoDoc.data();
      if (appoData.doctorId) {
        const doctorRef = doc(db, "doctors", appoData.doctorId);
        const doctorSnap = await getDoc(doctorRef);
        if (!doctorSnap.exists()) {
          issues.push(
            `Appointment ${appoDoc.id} references non-existent doctor`,
          );
        }
      }
    }

    if (issues.length === 0) {
      console.log("✅ Referential integrity OK");
      return true;
    } else {
      console.error("❌ Referential integrity issues found:", issues);
      return false;
    }
  } catch (err) {
    console.error("❌ Error validating referential integrity:", err);
    return false;
  }
}

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

/**
 * Benchmark a database read operation
 */
export async function benchmarkRead(collectionName, queryConfig = {}) {
  console.log(`⏱️ Benchmarking read from ${collectionName}...`);

  try {
    const startTime = performance.now();
    const colRef = collection(db, collectionName);

    let q = colRef;
    if (queryConfig.limit) {
      q = query(colRef, limitToLast(queryConfig.limit));
    }

    const snapshot = await getDocs(q);
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(
      `✅ Read completed in ${duration.toFixed(2)}ms (${snapshot.size} documents)`,
    );
    return {
      success: true,
      duration,
      documentCount: snapshot.size,
    };
  } catch (err) {
    console.error("❌ Benchmark read failed:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Benchmark a database write operation
 */
export async function benchmarkWrite(collectionName, testData = {}) {
  console.log(`⏱️ Benchmarking write to ${collectionName}...`);

  try {
    const startTime = performance.now();
    const colRef = collection(db, collectionName);

    const docRef = await addDoc(colRef, {
      ...testData,
      __benchmark__: true,
      timestamp: new Date().toISOString(),
    });

    // Cleanup
    await deleteDoc(docRef);

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`✅ Write completed in ${duration.toFixed(2)}ms`);
    return {
      success: true,
      duration,
    };
  } catch (err) {
    console.error("❌ Benchmark write failed:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

// ============================================================================
// COMPLETE TEST SUITE
// ============================================================================

/**
 * Run comprehensive database test suite
 */
export async function runFullTestSuite(userId = null) {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 FIREBASE DATABASE TEST SUITE");
  console.log("=".repeat(60) + "\n");

  const results = {
    connection: false,
    auth: false,
    permissions: {},
    validation: {},
    integrity: false,
    performance: {},
  };

  // 1. Connection tests
  console.log("\n📍 CONNECTION TESTS");
  console.log("-".repeat(60));
  results.connection = await testFirestoreConnection();

  // 2. Authentication test
  console.log("\n📍 AUTHENTICATION TEST");
  console.log("-".repeat(60));
  results.auth = await testAuthentication();

  // 3. Permission tests
  if (results.auth) {
    console.log("\n📍 PERMISSION TESTS");
    console.log("-".repeat(60));

    results.permissions.users = await testReadPermission("users");
    results.permissions.doctors = await testReadPermission("doctors");

    if (userId) {
      results.permissions.appointments = await testReadPermission(
        `users/${userId}/appointments`,
      );
    }
  }

  // 4. Validation tests
  console.log("\n📍 DATA VALIDATION TESTS");
  console.log("-".repeat(60));

  const testUserData = {
    email: "test@example.com",
    displayName: "Test User",
    role: "patient",
  };
  results.validation.user = validateUserData(testUserData);

  const testAppointment = {
    doctor: "Dr. Test",
    department: "General",
    scheduledAt: new Date().toISOString(),
    status: "pending",
  };
  results.validation.appointment = validateAppointmentData(testAppointment);

  // 5. Integrity tests
  if (userId) {
    console.log("\n📍 DATA INTEGRITY TESTS");
    console.log("-".repeat(60));

    results.integrity = await validateReferentialIntegrity(userId);
  }

  // 6. Performance tests
  console.log("\n📍 PERFORMANCE TESTS");
  console.log("-".repeat(60));

  results.performance.users = await benchmarkRead("users", { limit: 10 });
  results.performance.doctors = await benchmarkRead("doctors", { limit: 10 });

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(JSON.stringify(results, null, 2));

  return results;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Print all Firebase collection names (requires Firebase CLI access)
 */
export async function listCollections() {
  console.log("📋 Collections:");
  try {
    const collections = await getDocs(collection(db, "__COLLECTIONS__"));
    collections.forEach((doc) => {
      console.log(`  - ${doc.id}`);
    });
  } catch (err) {
    console.warn("Note: Use Firebase Console to view all collections", err);
  }
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(collectionName) {
  console.log(`📊 Stats for ${collectionName}:`);
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    console.log(`  Documents: ${snapshot.size}`);

    let totalSize = 0;
    snapshot.forEach((doc) => {
      totalSize += JSON.stringify(doc.data()).length;
    });

    console.log(`  Estimated size: ${(totalSize / 1024).toFixed(2)} KB`);

    return {
      documentCount: snapshot.size,
      estimatedSizeKB: totalSize / 1024,
    };
  } catch (err) {
    console.error("Error getting collection stats:", err);
    return null;
  }
}

// ============================================================================
// EXPORT ALL TEST FUNCTIONS
// ============================================================================

export {
  testFirestoreConnection,
  testAuthentication,
  testReadPermission,
  testWritePermission,
  validateUserData,
  validateAppointmentData,
  validateMedicalRecordData,
  findOrphanedDocuments,
  validateReferentialIntegrity,
  benchmarkRead,
  benchmarkWrite,
  runFullTestSuite,
  listCollections,
  getCollectionStats,
};
