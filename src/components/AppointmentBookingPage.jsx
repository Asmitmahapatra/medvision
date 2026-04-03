import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Calendar, MapPin, User, Globe, AlertCircle } from 'lucide-react';

const AppointmentBookingPage = ({
  doctors = [],
  profile = {},
  copy = {},
  onBookingSubmit = () => {},
  onBookingCancel = () => {},
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [preferredDate, setPreferredDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [departmentFilter, setDepartmentFilter] = useState('All departments');
  const [isLoading, setIsLoading] = useState(false);

  const departments = useMemo(() => {
    const depts = new Set(doctors.map((doc) => doc.department));
    return ['All departments', ...Array.from(depts)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (departmentFilter === 'All departments') {
      return doctors;
    }
    return doctors.filter((doc) => doc.department === departmentFilter);
  }, [doctors, departmentFilter]);

  const selectedDoctor = doctors.find((doc) => doc.id === selectedDoctorId);

  const handleSubmit = () => {
    if (!selectedDoctorId || !preferredDate) return;

    setIsLoading(true);
    Promise.resolve(onBookingSubmit({
      doctorId: selectedDoctorId,
      doctorName: selectedDoctor?.name,
      departmentName: selectedDoctor?.department,
      preferredDate,
    })).finally(() => {
      setIsLoading(false);
    });
  };

  const defaultProfile = {
    name: 'Patient Name',
    village: 'Village',
    ageGender: '0 / Not specified',
    language: 'Language',
  };

  const displayProfile = { ...defaultProfile, ...profile };
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <main className="bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50 px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-6xl flex-col gap-5 flex">
        {/* Header */}
        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 p-6 text-white shadow-xl md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex rounded-full bg-indigo-900/40 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Book Appointment
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight">Schedule a Consultation</h2>
              <p className="mt-2 max-w-3xl text-sm text-indigo-100 md:text-base">
                Select a doctor and your preferred date for your appointment
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Booking Form */}
          <section className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-md md:p-6">
            <h3 className="text-3xl font-black text-slate-700 mb-6">
              {copy.bookingTitle || 'Appointment booking'}
            </h3>

            <div className="space-y-6">
              {/* Department Filter */}
              <div className="space-y-3">
                <label htmlFor="department-select" className="block text-sm font-bold text-slate-700">
                  Department
                </label>
                <select
                  id="department-select"
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setSelectedDoctorId('');
                  }}
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">
                  {copy.doctorLabel || 'Select a doctor'}
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => setSelectedDoctorId(doctor.id)}
                        disabled={isLoading}
                        className={`w-full rounded-2xl border-2 p-4 text-left transition disabled:opacity-60 ${
                          selectedDoctorId === doctor.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-bold text-slate-800">{doctor.name}</p>
                            <p className="text-xs text-slate-600 mt-1">{doctor.department}</p>
                            <p className="text-xs text-slate-500 mt-2">{doctor.availability}</p>
                          </div>
                          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full whitespace-nowrap">
                            {doctor.experience}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic py-4">
                      No doctors available in this department
                    </p>
                  )}
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-3">
                <label htmlFor="preferred-date" className="block text-sm font-bold text-slate-700">
                  {copy.dateLabel || 'Preferred date'}
                </label>
                <input
                  id="preferred-date"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  disabled={isLoading}
                  min={minDate}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                />
              </div>

              {/* AI Reminder */}
              <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
                <div className="flex gap-3">
                  <AlertCircle size={18} className="shrink-0 text-indigo-600 mt-0.5" />
                  <div className="text-sm text-indigo-900">
                    <p className="font-bold">AI REMINDER</p>
                    <p className="mt-1 text-xs">
                      Run symptom analysis first so the doctor sees the AI suggestion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!selectedDoctorId || !preferredDate || isLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 text-lg font-bold text-white transition hover:from-amber-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Confirming booking...' : 'Confirm booking'}
              </button>
            </div>
          </section>

          {/* Patient Profile Sidebar */}
          <section className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-md md:p-6">
            <h3 className="text-3xl font-black text-slate-700 mb-6">
              {copy.profileTitle || 'Patient profile'}
            </h3>

            <div className="space-y-4">
              {/* Name */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                    <User size={18} className="text-indigo-600" />
                  </div>
                  <span className="text-sm text-gray-600 font-semibold">Name</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{displayProfile.name}</span>
              </div>

              {/* Village */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                    <MapPin size={18} className="text-indigo-600" />
                  </div>
                  <span className="text-sm text-gray-600 font-semibold">Village</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{displayProfile.village}</span>
              </div>

              {/* Age & Gender */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                    <Calendar size={18} className="text-indigo-600" />
                  </div>
                  <span className="text-sm text-gray-600 font-semibold">Age / Gender</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{displayProfile.ageGender}</span>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                    <Globe size={18} className="text-indigo-600" />
                  </div>
                  <span className="text-sm text-gray-600 font-semibold">Language</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{displayProfile.language}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

AppointmentBookingPage.propTypes = {
  doctors: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    department: PropTypes.string,
    experience: PropTypes.string,
    availability: PropTypes.string,
    hospital: PropTypes.string,
  })),
  profile: PropTypes.shape({
    name: PropTypes.string,
    village: PropTypes.string,
    ageGender: PropTypes.string,
    language: PropTypes.string,
  }),
  copy: PropTypes.object,
  onBookingSubmit: PropTypes.func,
  onBookingCancel: PropTypes.func,
};

AppointmentBookingPage.defaultProps = {
  doctors: [],
  profile: {},
  copy: {},
  onBookingSubmit: () => {},
  onBookingCancel: () => {},
};

export default AppointmentBookingPage;
