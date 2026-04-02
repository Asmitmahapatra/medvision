import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Save, ShieldAlert, Stethoscope, XCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../services/firebase';

const defaultPatients = [
  {
    id: 'p-1',
    name: 'Sunita Devi',
    department: 'General Medicine',
    village: 'Bihara Khurd',
    visits: 1,
    symptoms: 'Fever, sore throat, body weakness',
    aiSuggestions: 'Seasonal Viral Fever, Common Cold, Throat Infection',
  },
  {
    id: 'p-2',
    name: 'Ramesh Kumar',
    department: 'General Medicine',
    village: 'Barua Tola',
    visits: 2,
    symptoms: 'Mild chest pain and fatigue',
    aiSuggestions: 'Acidity, Muscular Strain, Anxiety Related Discomfort',
  },
];

const DoctorDashboard = ({ authUser }) => {
  const [patients] = useState(defaultPatients);
  const [selectedPatientId, setSelectedPatientId] = useState(defaultPatients[0].id);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [cases, setCases] = useState([]);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [activeCaseId, setActiveCaseId] = useState('');

  const selectedPatient = useMemo(
    () => patients.find((item) => item.id === selectedPatientId) ?? patients[0],
    [patients, selectedPatientId],
  );

  useEffect(() => {
    if (!db || !authUser?.uid || authUser?.role !== 'doctor') {
      setCases([]);
      setIsLoadingCases(false);
      return undefined;
    }

    const casesQuery = query(
      collection(db, 'doctorCases'),
      where('doctorId', '==', authUser.uid),
    );

    const unsubscribe = onSnapshot(
      casesQuery,
      (snapshot) => {
        const mapped = snapshot.docs
          .map((caseDoc) => ({ id: caseDoc.id, ...caseDoc.data() }))
          .sort((a, b) => {
            const aTime = a?.updatedAt?.seconds ?? 0;
            const bTime = b?.updatedAt?.seconds ?? 0;
            return bTime - aTime;
          });
        setCases(mapped);
        setIsLoadingCases(false);
      },
      () => {
        setIsLoadingCases(false);
        setStatusMessage('Could not load saved cases right now.');
      },
    );

    return () => unsubscribe();
  }, [authUser?.uid, authUser?.role]);

  const handleLoadCase = (selectedCase) => {
    if (!selectedCase) {
      return;
    }

    setActiveCaseId(selectedCase.id);
    setDiagnosis(selectedCase.diagnosis || '');
    setPrescription(selectedCase.prescription || '');
    setNotes(selectedCase.notes || '');

    if (selectedCase.patientId) {
      setSelectedPatientId(selectedCase.patientId);
    }

    setStatusMessage('Loaded saved case. You can edit and save again.');
  };

  const handleStartNewCase = () => {
    setActiveCaseId('');
    setDiagnosis('');
    setPrescription('');
    setNotes('');
    setStatusMessage('New case draft ready.');
  };

  const handleAccept = async () => {
    if (isSaving) {
      return;
    }

    if (!authUser?.uid || authUser?.role !== 'doctor') {
      setStatusMessage('Only authenticated doctor accounts can save case files.');
      return;
    }

    if (!diagnosis.trim() || !prescription.trim()) {
      setStatusMessage('Please add diagnosis and prescription before saving.');
      return;
    }

    if (!db) {
      setStatusMessage('Database is not configured right now.');
      return;
    }

    try {
      setIsSaving(true);

      if (activeCaseId) {
        await updateDoc(doc(db, 'doctorCases', activeCaseId), {
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          department: selectedPatient.department || 'General Medicine',
          symptoms: selectedPatient.symptoms,
          aiSuggestions: selectedPatient.aiSuggestions,
          diagnosis: diagnosis.trim(),
          prescription: prescription.trim(),
          notes: notes.trim(),
          status: 'updated',
          updatedAt: serverTimestamp(),
        });
        setStatusMessage('Case updated successfully.');
      } else {
        const createdCase = await addDoc(collection(db, 'doctorCases'), {
          doctorId: authUser.uid,
          doctorName: authUser.displayName || 'Doctor',
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          department: selectedPatient.department || 'General Medicine',
          symptoms: selectedPatient.symptoms,
          aiSuggestions: selectedPatient.aiSuggestions,
          diagnosis: diagnosis.trim(),
          prescription: prescription.trim(),
          notes: notes.trim(),
          status: 'saved',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setActiveCaseId(createdCase.id);
        setStatusMessage('Case saved. Patient record updated successfully.');
      }
    } catch {
      setStatusMessage('Could not save case right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = () => {
    setActiveCaseId('');
    setDiagnosis('');
    setPrescription('');
    setNotes('');
    setStatusMessage('Case inputs cleared.');
  };

  return (
    <main className="bg-[#dde3de] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[0.95fr_1.25fr]">
        <section className="space-y-5">
          <article className="rounded-3xl border border-[#d3d8d3] bg-[#f4f6f4] p-5 shadow-sm">
            <h3 className="text-4xl font-black text-[#1d3330]">Doctor Profile</h3>
            <div className="mt-5 rounded-3xl bg-[#e5e9e5] p-4">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-[#5f736d]">Name</p>
                  <p className="font-black text-[#18322f]">{authUser?.displayName || 'Dr. Meera Rao'}</p>
                </div>
                <div>
                  <p className="text-[#5f736d]">Role</p>
                  <p className="font-black text-[#18322f]">doctor</p>
                </div>
                <div>
                  <p className="text-[#5f736d]">Center</p>
                  <p className="font-black text-[#18322f]">District Health Center</p>
                </div>
                <div>
                  <p className="text-[#5f736d]">Languages</p>
                  <p className="font-black text-[#18322f]">English, Hindi</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-[#d3d8d3] bg-[#f4f6f4] p-5 shadow-sm">
            <h3 className="text-5xl font-black text-[#1d3330]">Patients</h3>
            <div className="mt-5 space-y-3">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedPatientId === patient.id
                      ? 'border-[#87bbb1] bg-[#e9efeb] shadow-sm'
                      : 'border-[#d0d8d1] bg-[#e6ebe7] hover:border-[#87bbb1]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-4xl font-black text-[#1d3330]">{patient.name}</p>
                      <p className="text-sm font-black text-[#0e7f75]">{patient.village}</p>
                    </div>
                    <span className="rounded-full bg-[#f2f4f2] px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#60756f]">
                      {patient.visits} visits
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-[#1f3431]">Last appointment: {patient.symptoms}</p>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-[#d3d8d3] bg-[#f4f6f4] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-3xl font-black text-[#1d3330]">Saved Cases</h3>
              <button
                type="button"
                onClick={handleStartNewCase}
                className="rounded-full border border-[#87bbb1] bg-[#e9efeb] px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#0e7f75]"
              >
                New Case
              </button>
            </div>

            {isLoadingCases ? (
              <p className="text-sm font-semibold text-[#60756f]">Loading saved cases...</p>
            ) : cases.length === 0 ? (
              <p className="text-sm font-semibold text-[#60756f]">No saved cases yet.</p>
            ) : (
              <div className="space-y-2">
                {cases.slice(0, 8).map((savedCase) => (
                  <button
                    key={savedCase.id}
                    type="button"
                    onClick={() => handleLoadCase(savedCase)}
                    className={`w-full rounded-2xl border px-3 py-2 text-left transition ${
                      activeCaseId === savedCase.id
                        ? 'border-[#87bbb1] bg-[#e9efeb]'
                        : 'border-[#d0d8d1] bg-[#f2f4f2] hover:border-[#87bbb1]'
                    }`}
                  >
                    <p className="text-sm font-black text-[#1d3330]">{savedCase.patientName || 'Unknown patient'}</p>
                    <p className="text-xs font-semibold text-[#60756f]">{savedCase.department || 'General Medicine'}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-[#1f3431]">{savedCase.diagnosis || 'No diagnosis yet'}</p>
                  </button>
                ))}
              </div>
            )}
          </article>
        </section>

        <section className="rounded-3xl border border-[#d3d8d3] bg-[#e8ece8] p-5 shadow-sm">
          <div className="mb-4 flex w-fit items-center gap-2 rounded-full bg-[#dce5de] px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#2a4e48]">
            <Stethoscope size={14} />
            {activeCaseId ? 'Editing Saved Case' : 'Current Case'}
          </div>

          <h2 className="text-4xl font-black text-[#1d3330]">{selectedPatient.name}</h2>
          <p className="text-3xl font-black text-[#0d7a70]">General Medicine</p>

          <div className="mt-5 rounded-3xl border border-[#d8ddd8] bg-[#f4f6f4] p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5f736d]">Symptoms</p>
                <p className="mt-2 text-4xl font-semibold text-[#1c3330]">{selectedPatient.symptoms}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5f736d]">AI Suggestions</p>
                <p className="mt-2 text-4xl font-semibold text-[#1c3330]">{selectedPatient.aiSuggestions}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <p className="mb-2 text-3xl font-black text-[#1d3330]">Diagnosis</p>
              <textarea
                value={diagnosis}
                onChange={(event) => setDiagnosis(event.target.value)}
                placeholder="Example: Viral fever with dehydration"
                className="min-h-[128px] w-full rounded-3xl border border-[#cfd7d0] bg-[#f7f8f7] p-4 text-3xl text-[#1d3330] outline-none transition focus:border-[#0d7a70] focus:ring-2 focus:ring-[#b7d9d4]"
              />
            </label>
            <label className="block">
              <p className="mb-2 text-3xl font-black text-[#1d3330]">Prescription</p>
              <textarea
                value={prescription}
                onChange={(event) => setPrescription(event.target.value)}
                placeholder="Example: ORS, paracetamol, rest"
                className="min-h-[128px] w-full rounded-3xl border border-[#cfd7d0] bg-[#f7f8f7] p-4 text-3xl text-[#1d3330] outline-none transition focus:border-[#0d7a70] focus:ring-2 focus:ring-[#b7d9d4]"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <p className="mb-2 text-3xl font-black text-[#1d3330]">Notes</p>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Follow-up advice or any special note"
              className="min-h-[128px] w-full rounded-3xl border border-[#cfd7d0] bg-[#f7f8f7] p-4 text-3xl text-[#1d3330] outline-none transition focus:border-[#0d7a70] focus:ring-2 focus:ring-[#b7d9d4]"
            />
          </label>

          <div className="mt-4 rounded-3xl bg-[#f4f6f4] p-4">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5f736d]">Quick Reminder</p>
            <p className="mt-2 text-3xl font-semibold text-[#1d3330]">This is only a basic suggestion, not a diagnosis.</p>
          </div>

          {statusMessage && (
            <div className="toast-info mt-4">
              {statusMessage}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAccept}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-[#0e7f75] px-7 py-3 text-3xl font-black text-white transition hover:bg-[#0b6b62] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Accept & Save'}
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-6 py-3 text-3xl font-black text-red-700 transition hover:bg-red-100"
            >
              <XCircle size={16} />
              Reject
            </button>
          </div>
        </section>
      </div>

      <button
        type="button"
        className="fixed bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-lg font-black text-white shadow-xl transition hover:bg-red-700"
      >
        <ShieldAlert size={18} />
        Emergency 108
      </button>
    </main>
  );
};

DoctorDashboard.propTypes = {
  authUser: PropTypes.shape({
    uid: PropTypes.string,
    displayName: PropTypes.string,
    role: PropTypes.string,
  }),
};

DoctorDashboard.defaultProps = {
  authUser: null,
};

export default DoctorDashboard;
