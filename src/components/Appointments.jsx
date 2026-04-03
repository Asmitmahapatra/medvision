import React from 'react';
import PropTypes from 'prop-types';
import { Calendar, MessageSquare, Loader2 } from 'lucide-react';

const getStatusBadgeClass = (status) => {
  if (status === 'pending') {
    return 'bg-amber-100 text-amber-700';
  }
  if (status === 'confirmed') {
    return 'bg-emerald-100 text-emerald-700';
  }
  return 'bg-gray-100 text-gray-700';
};

const Appointments = ({ 
  appointments = [], 
  onReschedule, 
  onChat,
  isRescheduling = false,
  copy = {} 
}) => {
  return (
    <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-md md:p-6">
      <h3 className="text-3xl font-black text-slate-700">
        {copy.appointmentsTitle || 'Appointments'}
      </h3>

      {appointments.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold text-gray-500">
            {copy.noAppointments || 'No appointments scheduled'}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {appointments.slice(0, 3).map((appointment) => (
            <div 
              key={appointment.id} 
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:bg-gray-100"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{appointment.doctor}</p>
                  <p className="text-sm font-semibold text-teal-700 mt-1">{appointment.speciality}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${
                  getStatusBadgeClass(appointment.status)
                }`}>
                  {appointment.status?.toUpperCase() || 'PENDING'}
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-600">{appointment.notes}</p>
              
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-indigo-700">
                  {copy.scheduledAt || 'Scheduled at'}: {new Date(appointment.scheduledAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {appointments.length > 3 && (
        <p className="mt-3 text-xs font-semibold text-gray-500">
          +{appointments.length - 3} more appointment{appointments.length - 3 > 1 ? 's' : ''}
        </p>
      )}

      {/* Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={onReschedule}
          disabled={appointments.length === 0 || isRescheduling}
          className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRescheduling ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {copy.rescheduling || 'Rescheduling...'}
            </>
          ) : (
            <>
              <Calendar size={14} />
              {copy.reschedule || 'Reschedule'}
            </>
          )}
        </button>
        <button 
          onClick={onChat}
          className="inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-100 px-3 py-2 text-xs font-bold text-indigo-800 transition hover:bg-indigo-200"
        >
          <MessageSquare size={14} />
          {copy.chatDoctor || 'Chat doctor'}
        </button>
      </div>
    </div>
  );
};

Appointments.propTypes = {
  appointments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    doctor: PropTypes.string.isRequired,
    speciality: PropTypes.string,
    notes: PropTypes.string,
    status: PropTypes.string,
    scheduledAt: PropTypes.string.isRequired,
  })),
  onReschedule: PropTypes.func.isRequired,
  onChat: PropTypes.func,
  isRescheduling: PropTypes.bool,
  copy: PropTypes.shape({
    appointmentsTitle: PropTypes.string,
    noAppointments: PropTypes.string,
    scheduledAt: PropTypes.string,
    reschedule: PropTypes.string,
    rescheduling: PropTypes.string,
    chatDoctor: PropTypes.string,
  }),
};

Appointments.defaultProps = {
  appointments: [],
  onChat: () => {},
  isRescheduling: false,
  copy: {},
};

export default Appointments;
