/**
 * Database Service Layer
 * Centralized Firestore operations with error handling and optimizations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db, hasFirebaseConfig } from "./firebase";

// Collections
const COLLECTIONS = {
  USERS: "users",
  APPOINTMENTS: "appointments",
  DOCTORS: "doctors",
  MEDICAL_RECORDS: "medicalRecords",
  SYMPTOM_LOGS: "symptomLogs",
  CHAT_MESSAGES: "chatMessages",
};

/**
 * User Management
 */
export const UserDB = {
  /**
   * Create user profile
   */
  async createUser(userId, userData) {
    if (!db || !userId) throw new Error("Database not configured");

    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      throw new Error("User already exists");
    }

    const newUser = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      role: userData.role || "patient",
    };

    await setDoc(userRef, newUser);
    return newUser;
  },

  /**
   * Get user profile
   */
  async getUser(userId) {
    if (!db || !userId) return null;

    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateUser(userId, updates) {
    if (!db || !userId) throw new Error("Database not configured");

    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updateData);
    return updateData;
  },

  /**
   * Delete user profile (admin only)
   */
  async deleteUser(userId) {
    if (!db || !userId) throw new Error("Database not configured");

    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await deleteDoc(userRef);
  },
};

/**
 * Appointment Management
 */
export const AppointmentDB = {
  /**
   * Create appointment
   */
  async createAppointment(userId, appointmentData) {
    if (!db || !userId) throw new Error("Database not configured");

    const appointmentRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      "appointments",
      appointmentData.id || doc(collection(db, "temp")).id,
    );

    const newAppointment = {
      ...appointmentData,
      status: appointmentData.status || "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(appointmentRef, newAppointment);
    return newAppointment;
  },

  /**
   * Get user appointments
   */
  async getAppointments(userId, options = {}) {
    if (!db || !userId) return [];

    try {
      const appointmentsRef = collection(
        db,
        COLLECTIONS.USERS,
        userId,
        "appointments",
      );

      let q = appointmentsRef;
      if (options.orderBy) {
        q = query(q, orderBy(options.orderBy, options.direction || "desc"));
      }
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return [];
    }
  },

  /**
   * Update appointment
   */
  async updateAppointment(userId, appointmentId, updates) {
    if (!db || !userId || !appointmentId) throw new Error("Invalid parameters");

    const appointmentRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      "appointments",
      appointmentId,
    );

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(appointmentRef, updateData);
    return updateData;
  },

  /**
   * Delete appointment
   */
  async deleteAppointment(userId, appointmentId) {
    if (!db || !userId || !appointmentId) throw new Error("Invalid parameters");

    const appointmentRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      "appointments",
      appointmentId,
    );

    await deleteDoc(appointmentRef);
  },
};

/**
 * Medical Records Management
 */
export const MedicalRecordDB = {
  /**
   * Create medical record
   */
  async createRecord(userId, recordData) {
    if (!db || !userId) throw new Error("Database not configured");

    const recordRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      "medicalRecords",
      recordData.id || doc(collection(db, "temp")).id,
    );

    const newRecord = {
      ...recordData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(recordRef, newRecord);
    return newRecord;
  },

  /**
   * Get user medical records
   */
  async getRecords(userId, options = {}) {
    if (!db || !userId) return [];

    try {
      const recordsRef = collection(
        db,
        COLLECTIONS.USERS,
        userId,
        "medicalRecords",
      );

      let constraints = [];
      if (options.orderBy) {
        constraints.push(orderBy(options.orderBy, options.direction || "desc"));
      }
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(recordsRef, ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching records:", error);
      return [];
    }
  },

  /**
   * Update medical record
   */
  async updateRecord(userId, recordId, updates) {
    if (!db || !userId || !recordId) throw new Error("Invalid parameters");

    const recordRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      "medicalRecords",
      recordId,
    );

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(recordRef, updateData);
    return updateData;
  },

  /**
   * Delete medical record
   */
  async deleteRecord(userId, recordId) {
    if (!db || !userId || !recordId) throw new Error("Invalid parameters");

    const recordRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      "medicalRecords",
      recordId,
    );

    await deleteDoc(recordRef);
  },
};

/**
 * Symptom Logs Management
 */
export const SymptomLogDB = {
  /**
   * Create symptom log
   */
  async createLog(userId, logData) {
    if (!db || !userId) throw new Error("Database not configured");

    const logRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      "symptomLogs",
      logData.id || doc(collection(db, "temp")).id,
    );

    const newLog = {
      ...logData,
      createdAt: serverTimestamp(),
    };

    await setDoc(logRef, newLog);
    return newLog;
  },

  /**
   * Get symptom logs
   */
  async getLogs(userId, options = {}) {
    if (!db || !userId) return [];

    try {
      const logsRef = collection(db, COLLECTIONS.USERS, userId, "symptomLogs");

      let constraints = [orderBy("createdAt", "desc")];
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(logsRef, ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching symptom logs:", error);
      return [];
    }
  },

  /**
   * Delete symptom log
   */
  async deleteLog(userId, logId) {
    if (!db || !userId || !logId) throw new Error("Invalid parameters");

    const logRef = doc(db, COLLECTIONS.USERS, userId, "symptomLogs", logId);

    await deleteDoc(logRef);
  },
};

/**
 * Doctor Management
 */
export const DoctorDB = {
  /**
   * Get all doctors
   */
  async getDoctors(options = {}) {
    if (!db) return [];

    try {
      const doctorsRef = collection(db, COLLECTIONS.DOCTORS);
      let constraints = [];

      if (options.department) {
        constraints.push(where("department", "==", options.department));
      }
      if (options.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(doctorsRef, ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return [];
    }
  },

  /**
   * Get doctor profile
   */
  async getDoctor(doctorId) {
    if (!db || !doctorId) return null;

    try {
      const doctorRef = doc(db, COLLECTIONS.DOCTORS, doctorId);
      const doctorDoc = await getDoc(doctorRef);
      return doctorDoc.exists()
        ? { id: doctorDoc.id, ...doctorDoc.data() }
        : null;
    } catch (error) {
      console.error("Error fetching doctor:", error);
      return null;
    }
  },
};

/**
 * Batch Operations
 */
export const BatchDB = {
  /**
   * Batch update multiple documents
   */
  async batchUpdate(updates) {
    if (!db) throw new Error("Database not configured");

    const batch = writeBatch(db);

    updates.forEach(({ ref, data }) => {
      batch.update(ref, data);
    });

    await batch.commit();
  },

  /**
   * Batch delete multiple documents
   */
  async batchDelete(refs) {
    if (!db) throw new Error("Database not configured");

    const batch = writeBatch(db);

    refs.forEach((ref) => {
      batch.delete(ref);
    });

    await batch.commit();
  },
};

/**
 * Query Helpers
 */
export const QueryDB = {
  /**
   * Search users by email
   */
  async searchUsersByEmail(email) {
    if (!db || !email) return [];

    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, where("email", "==", email.toLowerCase()));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  },

  /**
   * Get doctors by department
   */
  async getDoctorsByDepartment(department) {
    return DoctorDB.getDoctors({ department });
  },
};

export default {
  UserDB,
  AppointmentDB,
  MedicalRecordDB,
  SymptomLogDB,
  DoctorDB,
  BatchDB,
  QueryDB,
  hasConfig: hasFirebaseConfig,
};
