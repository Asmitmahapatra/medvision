import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const BackButton = ({ to = -1, label, copy = {} }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof to === 'number') {
      navigate(to);
    } else {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="group inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm hover:shadow-md"
    >
      <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
      {label || copy.backButton || 'Go Back'}
    </button>
  );
};


BackButton.propTypes = {
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  copy: PropTypes.object
};

BackButton.defaultProps = {
  to: -1,
  label: '',
  copy: {}
};

export default BackButton;
