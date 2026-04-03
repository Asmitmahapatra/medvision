import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Calendar, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import Appointments from './Appointments';
import Records from './Records';

const AppointmentsRecordsPage = ({
  appointments = [],
  records = [],
  copy = {},
  onReschedule = () => {},
  onChatDoctor = () => {},
}) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleReschedule = () => {
    setIsRescheduling(true);
    Promise.resolve(onReschedule()).finally(() => {
      setIsRescheduling(false);
    });
  };

  const hasData = appointments.length > 0 || records.length > 0;

  return (
    <main className="bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50 px-4 py-6 md:px-8 md:py-8 min-h-screen">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Header */}
        <section 
          className={`rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 p-6 text-white shadow-xl md:p-8 transition-all duration-500 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <p className="inline-flex rounded-full bg-indigo-900/40 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Health Management
              </p>
              <h2 className="mt-3 text-4xl md:text-5xl font-black leading-tight">Your Health Records</h2>
              <p className="mt-2 max-w-3xl text-sm text-indigo-100 md:text-base">
                Manage your appointments and medical records in one convenient place
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="flex flex-col gap-3 min-w-max">
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-200" />
                <div>
                  <p className="text-xs text-indigo-100 font-semibold">Appointments</p>
                  <p className="text-xl font-black text-white">{appointments.length}</p>
                </div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 flex items-center gap-2">
                <FileText size={16} className="text-indigo-200" />
                <div>
                  <p className="text-xs text-indigo-100 font-semibold">Records</p>
                  <p className="text-xl font-black text-white">{records.length}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        {hasData ? (
          <div className={`grid gap-6 lg:grid-cols-2 transition-all duration-500 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            {/* Appointments Section */}
            <div className="transform transition-all duration-500 hover:shadow-lg">
              <Appointments
                appointments={appointments}
                onReschedule={handleReschedule}
                onChat={onChatDoctor}
                isRescheduling={isRescheduling}
                copy={copy}
              />
            </div>

            {/* Records Section */}
            <div className="transform transition-all duration-500 hover:shadow-lg">
              <Records
                records={records}
                copy={copy}
              />
            </div>
          </div>
        ) : (
          <section className={`rounded-3xl border border-indigo-100 bg-white shadow-lg p-12 text-center transition-all duration-500 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {/* Empty State Illustration */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                {/* Animated background circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-indigo-100/40 animate-pulse"></div>
                </div>
                
                {/* Icon */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 shadow-lg">
                  <div className="flex gap-2">
                    <Calendar className="text-indigo-600" size={32} />
                    <FileText className="text-indigo-600 ml-2" size={32} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <h3 className="mt-8 text-3xl font-black text-slate-800">No health records yet</h3>
              <p className="mt-3 max-w-md text-base text-gray-600">
                Start your healthcare journey by booking your first appointment with one of our experienced doctors.
              </p>

              {/* Action Items */}
              <div className="mt-8 space-y-3 text-left inline-block">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 shrink-0 mt-0.5">
                    <Calendar size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Schedule an appointment</p>
                    <p className="text-sm text-gray-600">Book a consultation with our doctors</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 shrink-0 mt-0.5">
                    <TrendingUp size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Track your health</p>
                    <p className="text-sm text-gray-600">Build a comprehensive health history</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 shrink-0 mt-0.5">
                    <FileText size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Access records anytime</p>
                    <p className="text-sm text-gray-600">View your medical history whenever needed</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-3 font-bold text-white transition-all hover:shadow-lg hover:from-indigo-700 hover:to-indigo-800 group">
                Book Your First Appointment
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>

              {/* Additional Info */}
              <p className="mt-6 text-xs text-gray-500">
                💡 Tip: Use our Multilingual Health Chat to ask questions before booking
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

AppointmentsRecordsPage.propTypes = {
  appointments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    doctor: PropTypes.string.isRequired,
    speciality: PropTypes.string,
    notes: PropTypes.string,
    status: PropTypes.string,
    scheduledAt: PropTypes.string.isRequired,
  })),
  records: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    diagnosis: PropTypes.string.isRequired,
    doctor: PropTypes.string.isRequired,
    department: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    symptoms: PropTypes.string.isRequired,
    prescription: PropTypes.string.isRequired,
    notes: PropTypes.string,
    attachmentUrl: PropTypes.string,
  })),
  copy: PropTypes.object,
  onReschedule: PropTypes.func,
  onChatDoctor: PropTypes.func,
};

AppointmentsRecordsPage.defaultProps = {
  appointments: [],
  records: [],
  copy: {},
  onReschedule: () => {},
  onChatDoctor: () => {},
};

export default AppointmentsRecordsPage;
