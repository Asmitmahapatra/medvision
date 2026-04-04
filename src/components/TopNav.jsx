import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Activity, ChevronDown, Globe, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const TopNav = ({ language, onLanguageChange, copy, authUser = null, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isProtectedView = ['/patient', '/doctor', '/chatbot'].includes(location.pathname);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-indigo-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-sm">
            <Activity size={18} />
          </span>
          <span>
            <span className="block text-lg font-black tracking-wide text-gray-900">MEDVISION</span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.28em] text-gray-500 md:block">
              {copy.nav.tagline}
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          {isProtectedView && (
            <>
              <span className="hidden max-w-[240px] truncate rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 md:inline-flex">
                {authUser?.displayName
                  ? `${authUser.displayName} · ${authUser.role ?? 'patient'}`
                  : authUser?.email ?? copy.nav.patientChip}
              </span>
              <button
                onClick={() => {
                  onLogout();
                  navigate('/login');
                }}
                className="hidden items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 md:inline-flex"
              >
                <LogOut size={14} />
                {copy.nav.logout}
              </button>
            </>
          )}

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:from-indigo-700 hover:to-violet-700"
              aria-haspopup="listbox"
              aria-expanded={isMenuOpen}
            >
              <Globe size={16} />
              <span className="hidden sm:inline">{copy.nav.languageLabel}</span>
              <ChevronDown size={14} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white p-1 shadow-lg max-h-96 overflow-y-auto">
                {[
                  { code: 'en', name: copy.nav?.languageNames?.en || 'English' },
                  { code: 'hi', name: copy.nav?.languageNames?.hi || 'हिंदी' },
                  { code: 'ta', name: copy.nav?.languageNames?.ta || 'தமிழ்' },
                  { code: 'te', name: copy.nav?.languageNames?.te || 'తెలుగు' },
                  { code: 'kn', name: copy.nav?.languageNames?.kn || 'ಕನ್ನಡ' },
                  { code: 'ml', name: copy.nav?.languageNames?.ml || 'മലയാളം' },
                  { code: 'mr', name: copy.nav?.languageNames?.mr || 'मराठी' },
                  { code: 'gu', name: copy.nav?.languageNames?.gu || 'ગુજરાતી' },
                  { code: 'bn', name: copy.nav?.languageNames?.bn || 'বাংলা' },
                  { code: 'pa', name: copy.nav?.languageNames?.pa || 'ਪੰਜਾਬੀ' },
                  { code: 'ur', name: copy.nav?.languageNames?.ur || 'اردو' },
                  { code: 'or', name: copy.nav?.languageNames?.or || 'ଓଡ଼ିଆ' }
                ].map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${language === lang.code ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

TopNav.propTypes = {
  language: PropTypes.oneOf(['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'ur', 'or']).isRequired,
  onLanguageChange: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  authUser: PropTypes.shape({
    email: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    loggedInAt: PropTypes.string
  }),
  copy: PropTypes.shape({
    nav: PropTypes.shape({
      tagline: PropTypes.string.isRequired,
      patientChip: PropTypes.string.isRequired,
      logout: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default TopNav;