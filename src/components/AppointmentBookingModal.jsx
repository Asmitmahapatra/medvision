import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Calendar, AlertCircle, Loader2, X } from 'lucide-react';

const AppointmentBookingModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  doctors = [], 
  isLoading = false,
  copy = {}
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [preferredDate, setPreferredDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [departmentFilter, setDepartmentFilter] = useState('All departments');

  const departments = useMemo(() => {
    const depts = new Set(doctors.map(doc => doc.department));
    return ['All departments', ...Array.from(depts)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (departmentFilter === 'All departments') {
      return doctors;
    }
    return doctors.filter(doc => doc.department === departmentFilter);
  }, [doctors, departmentFilter]);

  const handleConfirm = () => {
    if (!selectedDoctor || !preferredDate) {
      return;
    }
    onConfirm({
      doctorId: selectedDoctor,
      preferredDate,
      doctorName: doctors.find(doc => doc.id === selectedDoctor)?.name
    });
  };

  if (!isOpen) return null;

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="space-y-6 p-6 md:p-8">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800">
              {copy.bookingTitle || 'Appointment booking'}
            </h2>
            <p className="text-sm text-gray-600">
              {copy.bookingSubtitle || 'Select a doctor and preferred date for your appointment'}
            </p>
          </div>

          {/* Doctor Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">
              {copy.doctorLabel || 'Doctor'}
            </label>
            
            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setSelectedDoctor(''); // Reset doctor when department changes
              }}
              disabled={isLoading}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Doctor List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    disabled={isLoading}
                    className={`w-full rounded-2xl border-2 p-4 text-left transition disabled:opacity-60 ${
                      selectedDoctor === doctor.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{doctor.name}</p>
                        <p className="text-xs text-slate-600">{doctor.department}</p>
                      </div>
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                        {doctor.experience}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">{doctor.hospital}</p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No doctors available in this department</p>
              )}
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">
              {copy.dateLabel || 'Preferred date'}
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                disabled={isLoading}
                min={minDate}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
              />
            </div>
          </div>

          {/* AI Reminder */}
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
            <div className="flex gap-3">
              <AlertCircle size={18} className="shrink-0 text-indigo-600 mt-0.5" />
              <div className="text-sm text-indigo-900">
                <p className="font-bold">
                  {copy.aiReminder || 'AI REMINDER'}
                </p>
                <p className="mt-1 text-xs">
                  {copy.aiReminderText || 'Run symptom analysis first so the doctor sees the AI suggestion.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {copy.cancelButton || 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDoctor || !preferredDate || isLoading}
              className="flex-1 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:from-teal-700 hover:to-teal-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {copy.bookingButton || 'Booking...'}
                </>
              ) : (
                copy.confirmButton || 'Confirm booking'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

AppointmentBookingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  doctors: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    department: PropTypes.string,
    experience: PropTypes.string,
    hospital: PropTypes.string,
  })),
  isLoading: PropTypes.bool,
  copy: PropTypes.object,
};

AppointmentBookingModal.defaultProps = {
  doctors: [],
  isLoading: false,
  copy: {},
};

export default AppointmentBookingModal;
