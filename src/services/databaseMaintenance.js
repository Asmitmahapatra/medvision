/**
 * Database Migration & Maintenance Utilities
 * Provides tools for data migration, backup, and schema updates
 */

import {
  collection,
  getDocs,
  writeBatch,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Migration utilities for updating database structure
 */
export const MigrationUtils = {
  /**
   * Migrate user profile fields
   * Use when adding/removing fields from user profiles
   */
  async migrateUserProfiles(fromField, toField, transform) {
    if (!db) throw new Error("Database not configured");

    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const batch = writeBatch(db);

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data[fromField] !== undefined) {
        const newValue = transform
          ? transform(data[fromField])
          : data[fromField];
        batch.update(doc.ref, {
          [toField]: newValue,
        });
      }
    });

    await batch.commit();
    console.log(`Migrated ${snapshot.size} user profiles`);
  },

  /**
   * Add default values to all users
   */
  async addDefaultUserFields(defaults) {
    if (!db) throw new Error("Database not configured");

    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const batch = writeBatch(db);

    snapshot.forEach((doc) => {
      const data = doc.data();
      const updates = {};

      Object.entries(defaults).forEach(([field, value]) => {
        if (data[field] === undefined) {
          updates[field] = value;
        }
      });

      if (Object.keys(updates).length > 0) {
        batch.update(doc.ref, updates);
      }
    });

    await batch.commit();
    console.log(`Added default fields to ${snapshot.size} users`);
  },

  /**
   * Remove deprecated fields from collection
   */
  async removeFields(collectionPath, fieldsToRemove) {
    if (!db) throw new Error("Database not configured");

    const ref = collection(db, collectionPath);
    const snapshot = await getDocs(ref);
    const batch = writeBatch(db);

    snapshot.forEach((doc) => {
      const updates = {};
      fieldsToRemove.forEach((field) => {
        updates[field] = null; // Firestore doesn't have delete, set to null for cleanup
      });
      batch.update(doc.ref, updates);
    });

    await batch.commit();
    console.log(`Removed fields from ${snapshot.size} documents`);
  },

  /**
   * Rename a field across collection
   */
  async renameField(collectionPath, oldField, newField) {
    if (!db) throw new Error("Database not configured");

    const ref = collection(db, collectionPath);
    const q = query(ref, where(oldField, "!=", null));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.forEach((doc) => {
      const data = doc.data();
      batch.update(doc.ref, {
        [newField]: data[oldField],
        [oldField]: null,
      });
    });

    await batch.commit();
    console.log(
      `Renamed field ${oldField} to ${newField} in ${snapshot.size} documents`,
    );
  },
};

/**
 * Backup utilities for data export and recovery
 */
export const BackupUtils = {
  /**
   * Export collection data to JSON
   */
  async exportCollection(collectionPath) {
    if (!db) throw new Error("Database not configured");

    const ref = collection(db, collectionPath);
    const snapshot = await getDocs(ref);
    const data = [];

    snapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      collection: collectionPath,
      documentCount: data.length,
      exportDate: new Date().toISOString(),
      documents: data,
    };
  },

  /**
   * Export user and related data
   */
  async exportUserData(userId) {
    if (!db || !userId) throw new Error("Invalid parameters");

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = {
      user: {
        id: userDoc.id,
        ...userDoc.data(),
      },
      appointments: [],
      medicalRecords: [],
      symptomLogs: [],
    };

    // Get appointments
    const appointmentsRef = collection(db, "users", userId, "appointments");
    const appointmentsSnap = await getDocs(appointmentsRef);
    appointmentsSnap.forEach((doc) => {
      userData.appointments.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Get medical records
    const recordsRef = collection(db, "users", userId, "medicalRecords");
    const recordsSnap = await getDocs(recordsRef);
    recordsSnap.forEach((doc) => {
      userData.medicalRecords.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Get symptom logs
    const logsRef = collection(db, "users", userId, "symptomLogs");
    const logsSnap = await getDocs(logsRef);
    logsSnap.forEach((doc) => {
      userData.symptomLogs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return userData;
  },

  /**
   * Generate backup report
   */
  async generateBackupReport() {
    if (!db) throw new Error("Database not configured");

    const report = {
      timestamp: new Date().toISOString(),
      collections: {},
    };

    const collections = ["users", "doctors", "appointments"];

    for (const collectionName of collections) {
      const ref = collection(db, collectionName);
      const snapshot = await getDocs(ref);
      report.collections[collectionName] = {
        count: snapshot.size,
        estimatedStorageBytes: snapshot.size * 1024, // Rough estimate
      };
    }

    return report;
  },
};

/**
 * Data cleanup utilities
 */
export const CleanupUtils = {
  /**
   * Soft delete user (mark as deleted without removing data)
   */
  async softDeleteUser(userId) {
    if (!db || !userId) throw new Error("Invalid user ID");

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      status: "deleted",
      deletedAt: new Date(),
    });

    console.log(`User ${userId} marked as deleted`);
  },

  /**
   * Permanently delete user and related data
   */
  async hardDeleteUser(userId) {
    if (!db || !userId) throw new Error("Invalid user ID");

    const batch = writeBatch(db);

    // Delete appointments
    const appointmentsRef = collection(db, "users", userId, "appointments");
    const apptSnap = await getDocs(appointmentsRef);
    apptSnap.forEach((doc) => batch.delete(doc.ref));

    // Delete medical records
    const recordsRef = collection(db, "users", userId, "medicalRecords");
    const recSnap = await getDocs(recordsRef);
    recSnap.forEach((doc) => batch.delete(doc.ref));

    // Delete symptom logs
    const logsRef = collection(db, "users", userId, "symptomLogs");
    const logSnap = await getDocs(logsRef);
    logSnap.forEach((doc) => batch.delete(doc.ref));

    // Delete user document
    const userRef = doc(db, "users", userId);
    batch.delete(userRef);

    await batch.commit();
    console.log(`User ${userId} and all related data permanently deleted`);
  },

  /**
   * Delete old appointments (older than specified days)
   */
  async deleteOldAppointments(userId, daysOld = 90) {
    if (!db || !userId) throw new Error("Invalid parameters");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const appointmentsRef = collection(db, "users", userId, "appointments");
    const q = query(
      appointmentsRef,
      where("createdAt", "<", cutoffDate),
      where("status", "==", "completed"),
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${snapshot.size} old appointments for user ${userId}`);
  },

  /**
   * Archive old records to a separate collection
   */
  async archiveOldRecords(userId, daysOld = 365) {
    if (!db || !userId) throw new Error("Invalid parameters");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const recordsRef = collection(db, "users", userId, "medicalRecords");
    const q = query(recordsRef, where("date", "<", cutoffDate.toISOString()));

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.forEach((doc) => {
      const archiveRef = doc(db, "users", userId, "archivedRecords", doc.id);
      batch.set(archiveRef, doc.data());
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Archived ${snapshot.size} old records for user ${userId}`);
  },
};

/**
 * Data validation utilities
 */
export const ValidationUtils = {
  /**
   * Validate user data structure
   */
  validateUserData(userData) {
    const required = ["email", "displayName", "role"];
    const valid = required.every((field) => userData[field] !== undefined);
    return {
      valid,
      errors: required.filter((field) => userData[field] === undefined),
    };
  },

  /**
   * Validate appointment data
   */
  validateAppointmentData(appointmentData) {
    const required = ["doctor", "department", "scheduledAt", "status"];
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];

    const errors = [];
    required.forEach((field) => {
      if (appointmentData[field] === undefined) {
        errors.push(`Missing field: ${field}`);
      }
    });

    if (
      appointmentData.status &&
      !validStatuses.includes(appointmentData.status)
    ) {
      errors.push(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Scan collection for orphaned documents
   */
  async scanForOrphanedDocuments(collectionPath, foreignKeyField) {
    if (!db) throw new Error("Database not configured");

    const ref = collection(db, collectionPath);
    const snapshot = await getDocs(ref);
    const orphaned = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const foreignKeyValue = data[foreignKeyField];

      if (foreignKeyValue) {
        const parentRef = doc(db, "users", foreignKeyValue);
        const parentDoc = await getDoc(parentRef);

        if (!parentDoc.exists()) {
          orphaned.push({
            id: doc.id,
            data: data,
          });
        }
      }
    }

    return {
      collectionPath,
      orphanedCount: orphaned.length,
      orphaned,
    };
  },
};

export default {
  MigrationUtils,
  BackupUtils,
  CleanupUtils,
  ValidationUtils,
};
