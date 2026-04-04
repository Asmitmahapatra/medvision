import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Languages,
  Loader2,
  MessageSquare,
  Siren,
  X,
  AlertTriangle
} from 'lucide-react';
import BackButton from './BackButton';
import {
  analyzeSymptoms,
  bookAppointment,
  getAppointments,
  getPatientProfile,
  rescheduleAppointment
} from '../services/patientService';

const DOCTOR_DIRECTORY = [
  {
    id: 'doc-1',
    name: 'Dr. Meera Rao',
    department: 'General Medicine',
    experience: '12 years',
    hospital: 'District Health Center',
    availability: 'Mon-Sat, 9:00 AM - 5:00 PM',
    languages: 'English, Hindi',
    phone: '+91 90000 10001',
  },
  {
    id: 'doc-2',
    name: 'Dr. Ashok Yadav',
    department: 'Pediatrics',
    experience: '9 years',
    hospital: 'Community Care Unit',
    availability: 'Mon-Fri, 10:00 AM - 4:00 PM',
    languages: 'English, Hindi',
    phone: '+91 90000 10002',
  },
  {
    id: 'doc-3',
    name: 'Dr. Pooja Sharma',
    department: 'Obstetrics & Gynecology',
    experience: '10 years',
    hospital: 'Women Wellness Clinic',
    availability: 'Mon-Sat, 11:00 AM - 6:00 PM',
    languages: 'English, Hindi',
    phone: '+91 90000 10003',
  },
  {
    id: 'doc-4',
    name: 'Dr. Imran Khan',
    department: 'Cardiology',
    experience: '14 years',
    hospital: 'Heart Care Trust',
    availability: 'Tue-Sun, 8:00 AM - 2:00 PM',
    languages: 'English, Hindi, Urdu',
    phone: '+91 90000 10004',
  },
];

const PatientDashboard = ({ copy, language }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [checked, setChecked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [profile, setProfile] = useState(copy.patient.profile);
  const [appointments, setAppointments] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [preferredDate, setPreferredDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyConfirmed, setEmergencyConfirmed] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [chatPreview, setChatPreview] = useState([]);

  const quickChatPrompts = useMemo(() => (
    language === 'hi'
      ? ['बुखार में क्या खाएं?', 'खांसी के लिए क्या करें?', 'ORS कब लेना चाहिए?']
      : ['What should I eat with fever?', 'What should I do for cough?', 'When should I take ORS?']
  ), [language]);

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

    readPreview();
    const handleStorage = (event) => {
      if (event.key === 'medvision-chat-history') {
        readPreview();
      }
    };
    globalThis.addEventListener?.('storage', handleStorage);
    return () => {
      globalThis.removeEventListener?.('storage', handleStorage);
    };
  }, []);

  const handleEmergencyCall = async () => {
    setIsCalling(true);
    // Simulate emergency call dispatch
    setTimeout(() => {
      setEmergencyConfirmed(true);
      setIsCalling(false);
      // Auto-close after 3 seconds
      setTimeout(() => {
        setEmergencyOpen(false);
        setEmergencyConfirmed(false);
      }, 3000);
    }, 1500);
  };

  useEffect(() => {
    let mounted = true;

    const hydrateDashboard = async () => {
      const [profileData, appointmentData] = await Promise.all([
        getPatientProfile(copy, language),
        getAppointments(copy)
      ]);

      if (mounted) {
        setProfile(profileData);
        setAppointments(appointmentData);
      }
    };

    hydrateDashboard();

    return () => {
      mounted = false;
    };
  }, [copy, language]);

  useEffect(() => {
    if (location.state?.signupSuccess) {
      setToastMessage('Registration complete. Welcome to MEDVISION.');
      setToastVisible(false);

      globalThis.requestAnimationFrame(() => {
        setToastVisible(true);
      });

      navigate(location.pathname, { replace: true, state: {} });

      const timer = globalThis.setTimeout(() => {
        setToastVisible(false);
        setToastMessage('');
      }, 3500);

      return () => globalThis.clearTimeout(timer);
    }

    return undefined;
  }, [location.pathname, location.state, navigate]);

  const handleCheckSymptoms = async () => {
    setIsChecking(true);
    setChecked(true);

    const inferred = await analyzeSymptoms(symptoms, copy);
    setSuggestions(inferred);
    setIsChecking(false);
  };

  const handleBookDoctor = async () => {
    if (!selectedDoctorId || !preferredDate) {
      return;
    }

    setIsBooking(true);
    const doctor = DOCTOR_DIRECTORY.find((doc) => doc.id === selectedDoctorId);
    const created = await bookAppointment(doctor?.department ?? 'General Medicine', copy);
    setAppointments((prev) => [created, ...prev]);
    setActionMessage(copy.patient.bookSuccess.replace('{department}', doctor?.department ?? 'General Medicine'));
    setIsBooking(false);
  };

  const handleReschedule = async () => {
    if (appointments.length === 0 || isRescheduling) {
      return;
    }

    setIsRescheduling(true);
    const updated = await rescheduleAppointment(appointments[0].id, copy);
    setAppointments(updated);
    setActionMessage(copy.patient.rescheduleSuccess);
    setIsRescheduling(false);
  };

  const selectedDoctor = useMemo(
    () => DOCTOR_DIRECTORY.find((doctor) => doctor.id === selectedDoctorId),
    [selectedDoctorId],
  );

  let resultsBlock = null;
  if (isChecking) {
    resultsBlock = <p className="mt-2 text-sm text-emerald-900">{copy.patient.loadingResults}</p>;
  } else if (suggestions.length > 0) {
    resultsBlock = (
      <ul className="mt-2 space-y-2">
        {suggestions.map((suggestion) => (
          <li key={suggestion} className="flex items-start gap-2 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={15} />
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    );
  } else {
    resultsBlock = <p className="mt-2 text-sm text-emerald-900">{copy.patient.emptyCheck}</p>;
  }

  return (
    <main className="bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50 px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <BackButton to="/" label={copy.backButton || 'Back to Home'} copy={copy} />
        {toastMessage && (
          <div
            className={`sticky top-4 z-20 mx-auto w-full max-w-2xl rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-indigo-50 px-4 py-3 shadow-lg shadow-emerald-100 transition-all duration-500 ${
              toastVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-3 opacity-0 scale-95'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-300">
                <CheckCircle2 size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-extrabold text-emerald-900">Registration successful</p>
                <p className="text-xs font-medium text-emerald-700">{toastMessage}</p>
              </div>
              <div className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                Welcome
              </div>
            </div>
          </div>
        )}

        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 p-6 text-white shadow-xl md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex rounded-full bg-indigo-900/40 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                {copy.patient.badge}
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight">{copy.patient.title}</h2>
              <p className="mt-2 max-w-3xl text-sm text-indigo-100 md:text-base">{copy.patient.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-white/20 px-3 py-2 text-sm font-bold">{copy.patient.stats.records}</span>
              <span className="rounded-full bg-white/20 px-3 py-2 text-sm font-bold">
                {`${appointments.length} ${copy.patient.stats.appointmentsLabel}`}
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-5">
            <article className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-md md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-3xl font-black text-slate-700">{copy.patient.symptomTitle}</h3>
                  <p className="mt-2 text-sm text-gray-500">{copy.patient.symptomText}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                  <Languages size={14} />
                  {copy.patient.languageHint}
                </span>
              </div>

              <textarea
                value={symptoms}
                onChange={(event) => {
                  setSymptoms(event.target.value);
                  setChecked(false);
                }}
                placeholder={copy.patient.placeholder}
                className="mt-4 min-h-[112px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <button
                onClick={handleCheckSymptoms}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:from-indigo-700 hover:to-violet-700"
              >
                <ClipboardList size={16} />
                {isChecking ? copy.patient.checkingButton : copy.patient.checkButton}
              </button>

              {checked && (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{copy.patient.resultLabel}</p>
                  {resultsBlock}
                </div>
              )}
            </article>

            <article className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-md md:p-6">
              <h4 className="text-3xl font-black text-slate-700">Appointment booking</h4>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700" htmlFor="booking-doctor">
                    Doctor
                  </label>
                  <select
                    id="booking-doctor"
                    value={selectedDoctorId}
                    onChange={(event) => setSelectedDoctorId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Select a doctor</option>
                    {DOCTOR_DIRECTORY.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700" htmlFor="booking-date">
                    Preferred date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    value={preferredDate}
                    onChange={(event) => setPreferredDate(event.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle size={18} className="shrink-0 text-indigo-600" />
                  <div className="text-xs text-indigo-900">
                    <p className="font-bold tracking-[0.2em]">AI REMINDER</p>
                    <p className="mt-1">
                      Run symptom analysis first so the doctor sees the AI suggestion.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookDoctor}
                disabled={!selectedDoctorId || !preferredDate || isBooking}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 text-base font-bold text-white transition hover:from-amber-600 hover:to-orange-700 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400"
              >
                {isBooking ? 'Confirming booking...' : 'Confirm booking'}
              </button>

              {selectedDoctor && (
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  {selectedDoctor.department} · {selectedDoctor.availability}
                </p>
              )}

              {actionMessage && !isBooking && (
                <p className="mt-3 text-xs font-semibold text-emerald-700">{actionMessage}</p>
              )}
            </article>
          </section>

          <aside className="space-y-5">
            <article className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-md md:p-6">
              <h4 className="text-3xl font-black text-slate-700">{copy.patient.profileTitle}</h4>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3 border-b border-gray-100 pb-2">
                  <dt className="text-gray-500">{copy.patient.profile.nameLabel}</dt>
                  <dd className="font-semibold text-gray-800">{profile.name}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-gray-100 pb-2">
                  <dt className="text-gray-500">{copy.patient.profile.villageLabel}</dt>
                  <dd className="font-semibold text-gray-800">{profile.village}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-gray-100 pb-2">
                  <dt className="text-gray-500">{copy.patient.profile.ageGenderLabel}</dt>
                  <dd className="font-semibold text-gray-800">{profile.ageGender}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500">{copy.patient.profile.languageLabel}</dt>
                  <dd className="font-semibold text-gray-800">{profile.language}</dd>
                </div>
              </dl>
            </article>

            <article className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-md md:p-6">
              <h4 className="text-3xl font-black text-slate-700">Appointments</h4>
              {appointments.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-xs font-semibold text-gray-500">
                  {copy.patient.noAppointments}
                </p>
              ) : (
                <div className="mt-4 rounded-3xl border border-gray-200 bg-[#f7f8f5] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-2xl font-black text-slate-800">{appointments[0].doctor}</p>
                      <p className="text-sm font-bold text-teal-700">{appointments[0].speciality}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold tracking-[0.2em] text-slate-500">
                      {appointments[0].status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{appointments[0].notes}</p>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={handleReschedule}
                  disabled={appointments.length === 0 || isRescheduling}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Calendar size={14} />
                  {isRescheduling ? copy.patient.rescheduling : copy.patient.reschedule}
                </button>
                <button className="inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-100 px-3 py-2 text-xs font-bold text-indigo-800 transition hover:bg-indigo-200">
                  <MessageSquare size={14} />
                  {copy.patient.chatDoctor}
                </button>
              </div>
            </article>

            <article className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-md md:p-6">
              <h4 className="text-3xl font-black text-slate-700">Records</h4>
              <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black text-slate-800">Mild viral infection</p>
                    <p className="text-sm font-bold text-teal-700">Dr. Meera Rao · General Medicine</p>
                  </div>
                  <p className="text-sm font-bold text-slate-500">28/3/2026</p>
                </div>

                <div className="mt-4 grid gap-3 rounded-3xl bg-[#f6f6ee] p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Symptoms</p>
                    <p className="mt-2 text-lg font-semibold text-slate-800">Cough and mild fever</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Prescription</p>
                    <p className="mt-2 text-lg font-semibold text-slate-800">Rest, warm fluids, paracetamol after food if fever is present</p>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-md md:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-3xl font-black text-slate-700">Multilingual Health Chat</h4>
                  <p className="mt-2 text-sm text-slate-500">
                    Use it for simple questions, preventive advice, and next-step guidance.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  {language === 'hi' ? 'हिंदी' : 'ENGLISH'}
                </span>
              </div>

              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-3">
                  {chatPreview.length > 0 ? (
                    chatPreview.map((message, index) => (
                      <div
                        key={`${message.sender}-${index}`}
                        className={`rounded-2xl px-4 py-3 text-sm ${
                          message.sender === 'user'
                            ? 'bg-teal-700 text-white'
                            : 'bg-white text-slate-700'
                        }`}
                      >
                        {message.text}
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                        {language === 'hi'
                          ? 'नमस्ते! मैं सामान्य स्वास्थ्य जानकारी में मदद कर सकता हूँ।'
                          : 'Hello! I can help with basic health guidance.'}
                      </div>
                      <div className="rounded-2xl bg-teal-700 px-4 py-3 text-sm text-white">
                        {language === 'hi' ? 'खांसी के लिए क्या करें?' : 'What should I do for cough?'}
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                        {language === 'hi'
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
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <input
                  type="text"
                  disabled
                  placeholder={language === 'hi' ? 'अपना सवाल लिखें...' : 'Type your question...'}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500"
                />
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-sm font-bold text-white transition hover:from-amber-600 hover:to-orange-700"
                >
                  Send
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {language === 'hi'
                  ? 'यह चैट केवल सामान्य जानकारी के लिए है।'
                  : 'This chat is for basic guidance only.'}
              </p>
            </article>
          </aside>
        </div>
      </div>

      {/* Floating Emergency Button */}
      <button
        onClick={() => setEmergencyOpen(true)}
        className="fixed bottom-8 right-8 z-30 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-base font-bold text-white shadow-2xl transition hover:from-red-700 hover:to-red-800 active:scale-95"
      >
        <Siren size={20} />
        Emergency 108
      </button>

      {/* Emergency Modal Overlay */}
      {emergencyOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => !isCalling && setEmergencyOpen(false)}
              disabled={isCalling}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={20} />
            </button>

            {emergencyConfirmed ? (
              <>
                {/* Success State */}
                <div className="space-y-6 p-8">
                  <div className="flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2 size={32} className="text-emerald-600" />
                    </div>
                  </div>

                  <div className="space-y-2 text-center">
                    <h2 className="text-3xl font-black text-emerald-700">Emergency Alert Sent</h2>
                    <p className="text-sm text-gray-600">
                      Emergency services have been notified. Help is on the way.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <div className="space-y-2 text-sm text-emerald-900">
                      <p className="font-bold">✓ Ambulance dispatched</p>
                      <p>✓ Your location shared</p>
                      <p>✓ Medical profile sent</p>
                    </div>
                  </div>

                  <p className="text-center text-xs text-gray-500">
                    Closing in a moment...
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Emergency Request Content */}
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
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

PatientDashboard.propTypes = {
  language: PropTypes.oneOf(['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'ur', 'or']).isRequired,
  copy: PropTypes.shape({
    patient: PropTypes.shape({
      badge: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      stats: PropTypes.shape({
        records: PropTypes.string.isRequired,
        appointmentsLabel: PropTypes.string.isRequired
      }).isRequired,
      symptomTitle: PropTypes.string.isRequired,
      symptomText: PropTypes.string.isRequired,
      languageHint: PropTypes.string.isRequired,
      placeholder: PropTypes.string.isRequired,
      checkButton: PropTypes.string.isRequired,
      checkingButton: PropTypes.string.isRequired,
      bookingInProgress: PropTypes.string.isRequired,
      bookSuccess: PropTypes.string.isRequired,
      resultLabel: PropTypes.string.isRequired,
      loadingResults: PropTypes.string.isRequired,
      emptyCheck: PropTypes.string.isRequired,
      bookTitle: PropTypes.string.isRequired,
      bookText: PropTypes.string.isRequired,
      departments: PropTypes.arrayOf(PropTypes.string).isRequired,
      profileTitle: PropTypes.string.isRequired,
      profile: PropTypes.shape({
        nameLabel: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        villageLabel: PropTypes.string.isRequired,
        village: PropTypes.string.isRequired,
        ageGenderLabel: PropTypes.string.isRequired,
        ageGender: PropTypes.string.isRequired,
        languageLabel: PropTypes.string.isRequired,
        languages: PropTypes.shape({
          en: PropTypes.string.isRequired,
          hi: PropTypes.string.isRequired
        }).isRequired
      }).isRequired,
      appointmentsTitle: PropTypes.string.isRequired,
      appointment: PropTypes.shape({
        doctor: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        speciality: PropTypes.string.isRequired,
        notes: PropTypes.string.isRequired
      }).isRequired,
      noAppointments: PropTypes.string.isRequired,
      scheduledAt: PropTypes.string.isRequired,
      rescheduleSuccess: PropTypes.string.isRequired,
      rescheduling: PropTypes.string.isRequired,
      statusPending: PropTypes.string.isRequired,
      statusRescheduled: PropTypes.string.isRequired,
      newAppointmentNotes: PropTypes.string.isRequired,
      rescheduledNotes: PropTypes.string.isRequired,
      doctorsByDepartment: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
      reschedule: PropTypes.string.isRequired,
      chatDoctor: PropTypes.string.isRequired,
      emergencyTitle: PropTypes.string.isRequired,
      emergencyText: PropTypes.string.isRequired,
      suggestions: PropTypes.shape({
        fever: PropTypes.arrayOf(PropTypes.string).isRequired,
        chest: PropTypes.arrayOf(PropTypes.string).isRequired,
        general: PropTypes.arrayOf(PropTypes.string).isRequired
      }).isRequired
    }).isRequired
  }).isRequired
};

export default PatientDashboard;
