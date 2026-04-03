// DATABASE_INTEGRATION_EXAMPLES.js
// Practical examples for integrating databaseService.js with React components

import { useState, useEffect } from "react";
import {
  UserDB,
  AppointmentDB,
  MedicalRecordDB,
  SymptomLogDB,
  DoctorDB,
  QueryDB,
} from "./databaseService";

// ============================================================================
// EXAMPLE 1: User Profile Management Hook
// ============================================================================

export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await UserDB.getUser(userId);
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const updateProfile = async (updates) => {
    try {
      await UserDB.updateUser(userId, updates);
      setProfile((prev) => ({ ...prev, ...updates }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { profile, loading, error, updateProfile };
}

// Usage in component: see App integration guide.
// ============================================================================
// EXAMPLE 2: Appointments List with Pagination
// ============================================================================

export function useAppointments(userId, options = {}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const loadAppointments = async () => {
      try {
        setLoading(true);
        const data = await AppointmentDB.getAppointments(userId, {
          limit: options.limit || 10,
          orderBy: options.orderBy || "scheduledAt",
          ...options,
        });
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [userId]);

  const addAppointment = async (appointmentData) => {
    try {
      const newAppointment = await AppointmentDB.createAppointment(
        userId,
        appointmentData,
      );
      setAppointments((prev) => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateAppointment = async (appointmentId, updates) => {
    try {
      await AppointmentDB.updateAppointment(userId, appointmentId, updates);
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, ...updates } : apt,
        ),
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      await AppointmentDB.deleteAppointment(userId, appointmentId);
      setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    appointments,
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  };
}

// Usage in component: see App integration guide.
// ============================================================================
// EXAMPLE 3: Medical Records Management
// ============================================================================

export function useMedicalRecords(userId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const loadRecords = async () => {
      try {
        setLoading(true);
        const data = await MedicalRecordDB.getRecords(userId, {
          limit: 20,
          orderBy: "date",
        });
        setRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [userId]);

  const addRecord = async (recordData) => {
    try {
      const newRecord = await MedicalRecordDB.createRecord(userId, recordData);
      setRecords((prev) => [...prev, newRecord]);
      return newRecord;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateRecord = async (recordId, updates) => {
    try {
      await MedicalRecordDB.updateRecord(userId, recordId, updates);
      setRecords((prev) =>
        prev.map((record) =>
          record.id === recordId ? { ...record, ...updates } : record,
        ),
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    records,
    loading,
    error,
    addRecord,
    updateRecord,
  };
}

// ============================================================================
// EXAMPLE 4: Symptom Tracker
// ============================================================================

export function useSymptomLogs(userId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const loadLogs = async () => {
      try {
        setLoading(true);
        const data = await SymptomLogDB.getLogs(userId, { limit: 30 });
        setLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [userId]);

  const logSymptom = async (symptomData) => {
    try {
      const newLog = await SymptomLogDB.createLog(userId, {
        symptoms: symptomData.symptoms,
        severity: symptomData.severity, // 'mild' | 'moderate' | 'severe'
        notes: symptomData.notes,
        timestamp: new Date().toISOString(),
      });
      setLogs((prev) => [newLog, ...prev]);
      return newLog;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    logs,
    loading,
    error,
    logSymptom,
  };
}

// Usage in component: see App integration guide.
// ============================================================================
// EXAMPLE 5: Doctor Directory
// ============================================================================

export function useDoctorDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        const data = await DoctorDB.getDoctors();
        setDoctors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const getDoctorsByDepartment = async (department) => {
    try {
      const data = await QueryDB.getDoctorsByDepartment(department);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    doctors,
    loading,
    error,
    getDoctorsByDepartment,
  };
}

// ============================================================================
// EXAMPLE 6: User Search
// ============================================================================

export function useUserSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchByEmail = async (email) => {
    try {
      setLoading(true);
      const data = await QueryDB.searchUsersByEmail(email);
      setResults(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    searchByEmail,
  };
}

// ============================================================================
// EXAMPLE 7: Batch Operations
// ============================================================================

export async function bulkUpdateAppointments(userId, updates) {
  /**
   * Update multiple appointments efficiently
   *
   * @param {string} userId - User ID
   * @param {Array} updates - Array of {appointmentId, data} objects
   *
   * Example:
   * await bulkUpdateAppointments(userId, [
   *   { appointmentId: 'apt1', data: { status: 'confirmed' } },
   *   { appointmentId: 'apt2', data: { status: 'cancelled' } }
   * ]);
   */
  try {
    const updatePromises = updates.map(({ appointmentId, data }) =>
      AppointmentDB.updateAppointment(userId, appointmentId, data),
    );
    await Promise.all(updatePromises);
  } catch (err) {
    console.error("Batch update failed:", err);
    throw err;
  }
}

// ============================================================================
// EXAMPLE 8: Complete Profile Setup (New User Onboarding)
// ============================================================================

export async function setupNewUserProfile(userId, userData) {
  /**
   * Complete user onboarding with all initial data
   */
  try {
    // Create user profile
    const user = await UserDB.createUser(userId, {
      email: userData.email,
      displayName: userData.displayName,
      phone: userData.phone,
      village: userData.village,
      role: userData.role || "patient",
      language: userData.language || "en",
    });

    // Create initial symptom log
    if (userData.initialSymptoms) {
      await SymptomLogDB.createLog(userId, {
        symptoms: userData.initialSymptoms,
        severity: "mild",
        notes: "Initial onboarding log",
      });
    }

    return user;
  } catch (err) {
    console.error("User profile setup failed:", err);
    throw err;
  }
}

// ============================================================================
// EXAMPLE 9: Error Handling Pattern
// ============================================================================

export async function safeOperation(operation, fallback = null) {
  /**
   * Wrapper for database operations with error handling
   *
   * Usage:
   * const result = await safeOperation(
   *   () => UserDB.getUser(userId),
   *   { displayName: 'Guest User' }
   * );
   */
  try {
    return await operation();
  } catch (err) {
    console.error("Database operation failed:", err);
    if (fallback) return fallback;
    throw err;
  }
}

// Usage: see App integration guide.
// ============================================================================
// EXPORT ALL HOOKS AND UTILITIES
// ============================================================================

export {
  useUserProfile,
  useAppointments,
  useMedicalRecords,
  useSymptomLogs,
  useDoctorDirectory,
  useUserSearch,
  bulkUpdateAppointments,
  setupNewUserProfile,
  safeOperation,
};
