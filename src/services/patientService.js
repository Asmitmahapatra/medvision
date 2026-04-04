import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db, hasFirebaseConfig } from "./firebase";
import { getAuthUser } from "./authService";

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const APPOINTMENTS_KEY = "medvision-appointments";

const getDefaultAppointments = (copy) => [
  {
    id: "appt-1",
    ...copy.patient.appointment,
    department: copy.patient.appointment.speciality,
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
];

const readStoredAppointments = (copy) => {
  const fallback = getDefaultAppointments(copy);

  try {
    const raw = globalThis.localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const writeStoredAppointments = (appointments) => {
  globalThis.localStorage.setItem(
    APPOINTMENTS_KEY,
    JSON.stringify(appointments),
  );
};

const getUserAppointmentsCollection = () => {
  const authUser = getAuthUser();

  if (!hasFirebaseConfig || !db || !authUser?.uid) {
    return null;
  }

  return collection(db, "users", authUser.uid, "appointments");
};

const pickDoctorByDepartment = (department, copy) => {
  const doctors = copy.patient.doctorsByDepartment?.[department];
  if (Array.isArray(doctors) && doctors.length > 0) {
    return doctors[0];
  }

  return copy.patient.appointment.doctor;
};

export const analyzeSymptoms = async (symptoms, copy) => {
  const normalized = symptoms.toLowerCase();

  await wait(450);

  if (!normalized.trim()) {
    return [];
  }

  if (
    normalized.includes("fever") ||
    normalized.includes("cold") ||
    normalized.includes("cough")
  ) {
    return copy.patient.suggestions.fever;
  }

  if (
    normalized.includes("chest") ||
    normalized.includes("breath") ||
    normalized.includes("pain")
  ) {
    return copy.patient.suggestions.chest;
  }

  return copy.patient.suggestions.general;
};

export const getPatientProfile = async (copy, language) => {
  await wait(300);

  return {
    ...copy.patient.profile,
    language:
      copy.patient.profile.languages[language] ??
      copy.patient.profile.languages.en,
  };
};

export const getAppointments = async (copy) => {
  await wait(300);

  const userAppointmentsCollection = getUserAppointmentsCollection();
  if (userAppointmentsCollection) {
    const snapshot = await getDocs(
      query(userAppointmentsCollection, orderBy("scheduledAt", "desc")),
    );

    const appointments = snapshot.docs.map((entry) => ({
      id: entry.id,
      ...entry.data(),
    }));

    return appointments;
  }

  const appointments = readStoredAppointments(copy);
  writeStoredAppointments(appointments);

  return appointments;
};

export const bookAppointment = async (department, copy) => {
  await wait(450);

  const appointments = readStoredAppointments(copy);
  const nextAppointment = {
    doctor: pickDoctorByDepartment(department, copy),
    status: copy.patient.statusPending,
    speciality: department,
    department,
    notes: copy.patient.newAppointmentNotes,
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const userAppointmentsCollection = getUserAppointmentsCollection();
  if (userAppointmentsCollection) {
    const created = await addDoc(userAppointmentsCollection, nextAppointment);
    return {
      id: created.id,
      ...nextAppointment,
    };
  }

  const withId = {
    id: `appt-${Date.now()}`,
    ...nextAppointment,
  };

  const updated = [withId, ...appointments];
  writeStoredAppointments(updated);
  return withId;
};

export const rescheduleAppointment = async (appointmentId, copy) => {
  await wait(400);

  const userAppointmentsCollection = getUserAppointmentsCollection();
  if (userAppointmentsCollection) {
    const nextDate = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString();

    await updateDoc(doc(userAppointmentsCollection, appointmentId), {
      status: copy.patient.statusRescheduled,
      notes: copy.patient.rescheduledNotes,
      scheduledAt: nextDate,
    });

    return getAppointments(copy);
  }

  const appointments = readStoredAppointments(copy);
  const updated = appointments.map((appointment) => {
    if (appointment.id !== appointmentId) {
      return appointment;
    }

    const nextDate = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString();
    return {
      ...appointment,
      status: copy.patient.statusRescheduled,
      notes: copy.patient.rescheduledNotes,
      scheduledAt: nextDate,
    };
  });

  writeStoredAppointments(updated);
  return updated;
};
