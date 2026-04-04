import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Save, Stethoscope, XCircle, AlertTriangle, CheckCircle2, X, Siren, Loader2 } from 'lucide-react';
import BackButton from './BackButton';
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
  const navigate = useNavigate();
  const [patients, setPatients] = useState(defaultPatients);
  const [selectedPatientId, setSelectedPatientId] = useState(defaultPatients[0].id);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [cases, setCases] = useState([]);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [activeCaseId, setActiveCaseId] = useState('');
  const [preferredDate, setPreferredDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [isBooking, setIsBooking] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyConfirmed, setEmergencyConfirmed] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [chatPreview, setChatPreview] = useState([]);
  const [chatLanguage, setChatLanguage] = useState(() => {
    if (globalThis.localStorage === undefined) {
      return 'en';
    }
    return globalThis.localStorage.getItem('medvision-language') || 'en';
  });

  const quickChatPrompts = chatLanguage === 'hi'
    ? ['एआरएस कब देना चाहिए?', 'खांसी के लिए क्या करें?', 'बुखार में क्या दें?']
    : ['When should I advise ORS?', 'What should I do for cough?', 'What should I eat with fever?'];

  const handleOpenChat = () => {
    navigate('/health-chat');
  };

  useEffect(() => {
    const readPreview = () => {
      if (globalThis.localStorage === undefined) {
        return;
      }

      try {
        const raw = globalThis.localStorage.getItem('medvision-chat-history');
        const parsed = raw ? JSON.parse(raw) : [];
        setChatPreview(Array.isArray(parsed) ? parsed.slice(-3) : []);
      } catch {
        setChatPreview([]);
      }
    };

    const readLanguage = () => {
      if (globalThis.localStorage === undefined) {
        return;
      }

      const saved = globalThis.localStorage.getItem('medvision-language');
      if (saved) {
        setChatLanguage(saved);
      }
    };

    readPreview();
    readLanguage();

    const handleStorage = (event) => {
      if (event.key === 'medvision-chat-history') {
        readPreview();
      }
      if (event.key === 'medvision-language') {
        readLanguage();
      }
    };

    globalThis.addEventListener?.('storage', handleStorage);
    return () => {
      globalThis.removeEventListener?.('storage', handleStorage);
    };
  }, []);

  const selectedPatient = useMemo(
    () => patients.find((item) => item.id === selectedPatientId) ?? patients[0],
    [patients, selectedPatientId],
  );

  useEffect(() => {
    if (!db || !authUser?.uid || authUser?.role !== 'doctor') {
      setCases([]);
      setIsLoadingCases(false);
      setPatients(defaultPatients);
      return undefined;
    }

    const casesQuery = query(
      collection(db, 'doctorCases'),
      where('doctorId', '==', authUser.uid),
    );

    const patientsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'patient'),
    );

    const unsubscribeCases = onSnapshot(
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

    const unsubscribePatients = onSnapshot(
      patientsQuery,
      (snapshot) => {
        const mappedPatients = snapshot.docs.map((patientDoc) => {
          const data = patientDoc.data() ?? {};
          return {
            id: patientDoc.id,
            name: data.displayName || 'Patient',
            village: data.address?.village || 'Village',
            age: data.age,
            gender: data.gender,
            language: data.language || 'hi',
            department: 'General Medicine',
            visits: 1,
            symptoms: data.symptoms || 'Symptoms not recorded yet',
            aiSuggestions: data.aiSuggestions || 'AI suggestions pending',
          };
        });

        if (mappedPatients.length === 0) {
          setPatients(defaultPatients);
          return;
        }

        setPatients(mappedPatients);
        if (!mappedPatients.some((patient) => patient.id === selectedPatientId)) {
          setSelectedPatientId(mappedPatients[0].id);
        }
      },
      () => {
        setPatients(defaultPatients);
      },
    );

    return () => {
      unsubscribeCases();
      unsubscribePatients();
    };
  }, [authUser?.uid, authUser?.role, selectedPatientId]);

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

  const handleScheduleFollowUp = () => {
    if (!preferredDate || !selectedPatient) {
      return;
    }

    setIsBooking(true);
    setTimeout(() => {
      setIsBooking(false);
      setStatusMessage(`Follow-up scheduled for ${selectedPatient.name} on ${preferredDate}.`);
    }, 500);
  };

  const handleEmergencyCall = async () => {
    setIsCalling(true);
    setTimeout(() => {
      setEmergencyConfirmed(true);
      setIsCalling(false);
      setTimeout(() => {
        setEmergencyOpen(false);
        setEmergencyConfirmed(false);
      }, 3000);
    }, 1500);
  };

  return (
    <main className="bg-[#dde3de] px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl mb-4">
        <BackButton to="/" label="← Back to Home" />
      </div>
      <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[0.95fr_1.25fr]">
        <section className="space-y-5">
          <article className="rounded-3xl border border-[#d3d8d3] bg-[#f4f6f4] p-5 shadow-sm">
            <h3 className="text-4xl font-black text-[#1d3330]">Appointment booking</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1d3330]" htmlFor="doctor-booking-patient">
                  Patient
                </label>
                <select
                  id="doctor-booking-patient"
                  value={selectedPatientId}
                  onChange={(event) => setSelectedPatientId(event.target.value)}
                  className="w-full rounded-2xl border border-[#d0d8d1] bg-[#edf2ee] px-4 py-3 text-sm font-semibold text-[#1d3330] outline-none transition focus:border-[#87bbb1]"
                >
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1d3330]" htmlFor="doctor-booking-date">
                  Preferred date
                </label>
                <input
                  id="doctor-booking-date"
                  type="date"
                  value={preferredDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(event) => setPreferredDate(event.target.value)}
                  className="w-full rounded-2xl border border-[#d0d8d1] bg-[#edf2ee] px-4 py-3 text-sm font-semibold text-[#1d3330] outline-none transition focus:border-[#87bbb1]"
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#d3d8d3] bg-[#edf2ee] p-4">
              <div className="flex gap-3">
                <AlertTriangle size={18} className="shrink-0 text-[#0e7f75]" />
                <div className="text-xs text-[#1d3330]">
                  <p className="font-bold tracking-[0.2em]">AI REMINDER</p>
                  <p className="mt-1">Run symptom analysis first so the doctor sees the AI suggestion.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleScheduleFollowUp}
              disabled={!preferredDate || isBooking}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#d87707] to-[#c86405] px-6 py-4 text-base font-bold text-white transition hover:from-[#c86405] hover:to-[#b75605] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBooking ? 'Confirming booking...' : 'Confirm booking'}
            </button>
          </article>

          <article className="rounded-3xl border border-[#d3d8d3] bg-[#f4f6f4] p-5 shadow-sm">
            <h3 className="text-4xl font-black text-[#1d3330]">Patient profile</h3>
            <div className="mt-5 rounded-3xl bg-[#e5e9e5] p-4">
              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[#5f736d]">Name</p>
                  <p className="font-black text-[#18322f]">{selectedPatient?.name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#5f736d]">Village</p>
                  <p className="font-black text-[#18322f]">{selectedPatient?.village}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#5f736d]">Age / Gender</p>
                  <p className="font-black text-[#18322f]">
                    {selectedPatient?.age ?? 'N/A'} / {selectedPatient?.gender ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#5f736d]">Language</p>
                  <p className="font-black text-[#18322f]">{selectedPatient?.language ?? 'hi'}</p>
                </div>
              </div>
            </div>
          </article>
          <article className="rounded-3xl border border-[#d3d8d3] bg-[#f4f6f4] p-5 shadow-sm">
            <h3 className="text-4xl font-black text-[#1d3330]">Appointments</h3>
            <div className="mt-4 rounded-3xl border border-[#d0d8d1] bg-[#f6f7f4] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-2xl font-black text-[#1d3330]">{selectedPatient?.name}</p>
                  <p className="text-sm font-bold text-[#0e7f75]">General Medicine</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold tracking-[0.2em] text-[#60756f]">
                  PENDING
                </span>
              </div>
              <p className="mt-3 text-sm text-[#1f3431]">{selectedPatient?.symptoms}</p>
            </div>
          </article>

          <article className="rounded-3xl border border-[#d3d8d3] bg-[#f4f6f4] p-5 shadow-sm">
            <h3 className="text-4xl font-black text-[#1d3330]">Records</h3>
            <div className="mt-4 rounded-3xl border border-[#d0d8d1] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-black text-[#1d3330]">Mild viral infection</p>
                  <p className="text-sm font-bold text-[#0e7f75]">Dr. Meera Rao · General Medicine</p>
                </div>
                <p className="text-sm font-bold text-[#60756f]">28/3/2026</p>
              </div>

              <div className="mt-4 grid gap-3 rounded-3xl bg-[#f6f6ee] p-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#60756f]">Symptoms</p>
                  <p className="mt-2 text-lg font-semibold text-[#1d3330]">Cough and mild fever</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#60756f]">Prescription</p>
                  <p className="mt-2 text-lg font-semibold text-[#1d3330]">Rest, warm fluids, paracetamol after food if fever is present</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-[#d3d8d3] bg-[#f4f6f4] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-4xl font-black text-[#1d3330]">Multilingual Health Chat</h3>
                <p className="mt-2 text-sm text-[#60756f]">
                  Use it for simple questions, preventive advice, and next-step guidance.
                </p>
              </div>
              <span className="rounded-full bg-[#dce5de] px-3 py-1 text-xs font-bold text-[#0e7f75]">
                {chatLanguage === 'hi' ? 'हिंदी' : 'ENGLISH'}
              </span>
            </div>

            <div className="mt-4 rounded-3xl border border-[#d0d8d1] bg-[#f6f7f4] p-4">
              <div className="space-y-3">
                {chatPreview.length > 0 ? (
                  chatPreview.map((message, index) => (
                    <div
                      key={`${message.sender}-${index}`}
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        message.sender === 'user'
                          ? 'bg-[#0e7f75] text-white'
                          : 'bg-white text-[#1d3330]'
                      }`}
                    >
                      {message.text}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[#1d3330]">
                      {chatLanguage === 'hi'
                        ? 'नमस्ते! मैं सामान्य स्वास्थ्य जानकारी में मदद कर सकता हूँ।'
                        : 'Hello! I can help with basic health guidance.'}
                    </div>
                    <div className="rounded-2xl bg-[#0e7f75] px-4 py-3 text-sm text-white">
                      {chatLanguage === 'hi'
                        ? 'खांसी के लिए क्या करें?'
                        : 'What should I do for cough?'}
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[#1d3330]">
                      {chatLanguage === 'hi'
                        ? 'आराम करें, पानी पिएं, और लक्षण बढ़ें तो डॉक्टर से मिलें।'
                        : 'Rest, drink water, and consult a doctor if symptoms worsen.'}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickChatPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-[#d0d8d1] bg-white px-3 py-1 text-xs font-semibold text-[#60756f] transition hover:border-[#87bbb1] hover:bg-[#e9efeb]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <input
                type="text"
                disabled
                placeholder={chatLanguage === 'hi' ? 'अपना सवाल लिखें...' : 'Type your question...'}
                className="flex-1 rounded-2xl border border-[#d0d8d1] bg-[#edf2ee] px-4 py-2 text-sm text-[#60756f]"
              />
              <button
                type="button"
                onClick={handleOpenChat}
                className="rounded-2xl bg-gradient-to-r from-[#d87707] to-[#c86405] px-5 py-2 text-sm font-bold text-white transition hover:from-[#c86405] hover:to-[#b75605]"
              >
                Send
              </button>
            </div>

            <p className="mt-3 text-xs text-[#60756f]">This chat is for basic guidance only.</p>
          </article>

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
        onClick={() => setEmergencyOpen(true)}
        className="fixed bottom-8 right-8 z-30 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-base font-bold text-white shadow-2xl transition hover:from-red-700 hover:to-red-800 active:scale-95"
      >
        <Siren size={20} />
        Emergency 108
      </button>

      {emergencyOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl">
            <button
              onClick={() => !isCalling && setEmergencyOpen(false)}
              disabled={isCalling}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={20} />
            </button>

            {emergencyConfirmed ? (
              <div className="space-y-6 p-8">
                <div className="flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <h2 className="text-3xl font-black text-emerald-700">Emergency Alert Sent</h2>
                  <p className="text-sm text-gray-600">Emergency services have been notified. Help is on the way.</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="space-y-2 text-sm text-emerald-900">
                    <p className="font-bold">✓ Ambulance dispatched</p>
                    <p>✓ Your location shared</p>
                    <p>✓ Medical profile sent</p>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500">Closing in a moment...</p>
              </div>
            ) : (
              <div className="space-y-6 p-8">
                <div className="flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle size={32} className="text-red-600" />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <h2 className="text-3xl font-black text-slate-800">Emergency Alert</h2>
                  <p className="text-sm text-gray-600">
                    Are you sure you need emergency assistance? This will initiate an emergency request.
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4">
                  <div className="flex gap-3">
                    <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
                    <div className="text-sm text-amber-900">
                      <p className="font-bold">Emergency services (108) will be contacted immediately.</p>
                      <p className="mt-1 text-xs">Your location and medical profile will be shared.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleEmergencyCall}
                    disabled={isCalling}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-sm font-bold text-white transition hover:from-red-700 hover:to-red-800 disabled:opacity-75"
                  >
                    {isCalling ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Calling...
                      </>
                    ) : (
                      <>
                        <Siren size={16} />
                        Call Emergency (108)
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setEmergencyOpen(false)}
                    disabled={isCalling}
                    className="w-full rounded-2xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
