import React from 'react';
import PropTypes from 'prop-types';
import { FileText, ArrowRight } from 'lucide-react';

const Records = ({ records = [], copy = {} }) => {
  return (
    <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-md md:p-6">
      <h3 className="text-3xl font-black text-slate-700">
        {copy.recordsTitle || 'Records'}
      </h3>

      {records.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold text-gray-500">
            {copy.noRecords || 'No medical records available'}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {records.map((record) => (
            <div 
              key={record.id} 
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:bg-gray-100"
            >
              {/* Record Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-indigo-600 shrink-0" />
                    <h4 className="text-lg font-bold text-slate-800">{record.diagnosis}</h4>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-teal-700">
                    {record.doctor} · {record.department}
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-600 whitespace-nowrap">
                  {new Date(record.date).toLocaleDateString('en-GB')}
                </p>
              </div>

              {/* Record Details Grid */}
              <div className="mt-4 grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-2">
                {/* Symptoms */}
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    {copy.symptomsLabel || 'Symptoms'}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {record.symptoms}
                  </p>
                </div>

                {/* Prescription */}
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    {copy.prescriptionLabel || 'Prescription'}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {record.prescription}
                  </p>
                </div>

                {/* Notes (if available) */}
                {record.notes && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                      {copy.notesLabel || 'Notes'}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {record.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {record.attachmentUrl && (
                <div className="mt-3 flex justify-end">
                  <a
                    href={record.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 transition hover:text-indigo-700"
                  >
                    View Document
                    <ArrowRight size={12} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {records.length > 3 && (
        <div className="mt-4">
          <button className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100">
            {copy.viewAllRecords || 'View all records'}
            <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

Records.propTypes = {
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
  copy: PropTypes.shape({
    recordsTitle: PropTypes.string,
    noRecords: PropTypes.string,
    symptomsLabel: PropTypes.string,
    prescriptionLabel: PropTypes.string,
    notesLabel: PropTypes.string,
    viewAllRecords: PropTypes.string,
  }),
};

Records.defaultProps = {
  records: [],
  copy: {},
};

export default Records;
