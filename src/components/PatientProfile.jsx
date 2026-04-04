import React from 'react';
import PropTypes from 'prop-types';
import { User, MapPin, Calendar, Globe } from 'lucide-react';

const PatientProfile = ({ profile = {}, copy = {} }) => {
  const defaultProfile = {
    name: copy.namePlaceholder || 'Patient Name',
    village: copy.villagePlaceholder || 'Village Name',
    ageGender: copy.ageGenderPlaceholder || '0 / Not specified',
    language: copy.languageLabel || 'Language',
    phone: '',
    email: '',
  };

  const displayProfile = { ...defaultProfile, ...profile };

  return (
    <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-md md:p-6">
      <h3 className="text-3xl font-black text-slate-700">
        {copy.profileTitle || 'Patient profile'}
      </h3>
      
      <div className="mt-6 space-y-4">
        {/* Name */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <User size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {copy.nameLabel || 'Name'}
              </p>
              <p className="mt-1 text-sm text-gray-500">{copy.nameLabel || 'Name'}</p>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-800">{displayProfile.name}</p>
        </div>

        {/* Village */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <MapPin size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {copy.villageLabel || 'Village'}
              </p>
              <p className="mt-1 text-sm text-gray-500">{copy.villageLabel || 'Village'}</p>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-800">{displayProfile.village}</p>
        </div>

        {/* Age & Gender */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <Calendar size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {copy.ageGenderLabel || 'Age / Gender'}
              </p>
              <p className="mt-1 text-sm text-gray-500">{copy.ageGenderLabel || 'Age / Gender'}</p>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-800">{displayProfile.ageGender}</p>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <Globe size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {copy.languageLabel || 'Language'}
              </p>
              <p className="mt-1 text-sm text-gray-500">{copy.languageLabel || 'Language'}</p>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-800">{displayProfile.language}</p>
        </div>
      </div>

      {/* Additional Info (Optional) */}
      {displayProfile.phone && (
        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Contact</p>
          <p className="mt-2 text-sm font-semibold text-slate-800">{displayProfile.phone}</p>
        </div>
      )}
    </div>
  );
};

PatientProfile.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string,
    village: PropTypes.string,
    ageGender: PropTypes.string,
    language: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
  }),
  copy: PropTypes.shape({
    profileTitle: PropTypes.string,
    nameLabel: PropTypes.string,
    villageLabel: PropTypes.string,
    ageGenderLabel: PropTypes.string,
    languageLabel: PropTypes.string,
  }),
};

PatientProfile.defaultProps = {
  profile: {},
  copy: {},
};

export default PatientProfile;
