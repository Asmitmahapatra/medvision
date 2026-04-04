import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TopNav from './components/TopNav';
import Dashboard from './components/Dashboard';
import HealthBot from './components/HealthBot';
import MultilingualHealthChat from './components/MultilingualHealthChat';
import PatientDashboard from './components/PatientDashboard';
import AppointmentBookingPage from './components/AppointmentBookingPage';
import AppointmentsRecordsPage from './components/AppointmentsRecordsPage';
import DoctorDashboard from './components/DoctorDashboard';
import DoctorRecords from './components/DoctorRecords';
import Login from './components/Login';
import SignUp from './components/SignUp';
import DoctorSignUp from './components/DoctorSignUp';
import DoctorLogin from './components/DoctorLogin';
import { translations } from './i18n';
import { getAuthUser, logoutUser } from './services/authService';

function ProtectedRoute({ isAuthenticated, userRole, allowedRoles = null, children }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const normalizedRole = typeof userRole === 'string' ? userRole.toLowerCase() : '';
    if (!allowedRoles.includes(normalizedRole)) {
      const fallbackPath = normalizedRole === 'doctor' ? '/doctor' : '/patient';
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return children;
}

ProtectedRoute.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  userRole: PropTypes.string,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node.isRequired
};

ProtectedRoute.defaultProps = {
  userRole: '',
  allowedRoles: null,
};

function AppContent({ language, copy, onLanguageChange, authUser = null, onLogin, onLogout }) {
  const location = useLocation();
  const isLoginRoute = location.pathname === '/login';
  const isDoctorLoginRoute = location.pathname === '/doctor-login';
  const isSignupRoute = location.pathname === '/signup';
  const isDoctorSignupRoute = location.pathname === '/doctor-signup';
  const showNav = !isLoginRoute && !isSignupRoute && !isDoctorLoginRoute && !isDoctorSignupRoute;

  return (
    <div className="min-h-screen bg-brand-bg text-gray-800 font-sans pb-20">
      {showNav && (
        <TopNav
          language={language}
          onLanguageChange={onLanguageChange}
          copy={copy}
          authUser={authUser}
          onLogout={onLogout}
        />
      )}

      <div key={location.pathname} className="route-transition">
        <Routes location={location}>
          <Route path="/" element={<Dashboard copy={copy} />} />
          <Route
            path="/login"
            element={
              authUser ? <Navigate to="/patient" replace /> : <Login copy={copy} onLogin={onLogin} language={language} />
            }
          />
          <Route
            path="/doctor-login"
            element={
              authUser ? <Navigate to="/doctor" replace /> : <DoctorLogin onLogin={onLogin} />
            }
          />
          <Route
            path="/signup"
            element={
              authUser ? <Navigate to="/patient" replace /> : <SignUp language={language} onLogin={onLogin} />
            }
          />
          <Route
            path="/doctor-signup"
            element={
              authUser ? <Navigate to="/doctor" replace /> : <DoctorSignUp language={language} onLogin={onLogin} />
            }
          />
          <Route
            path="/patient"
            element={(
              <ProtectedRoute isAuthenticated={Boolean(authUser)} userRole={authUser?.role}>
                <PatientDashboard copy={copy} language={language} />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/doctor"
            element={(
              <ProtectedRoute isAuthenticated={Boolean(authUser)} userRole={authUser?.role} allowedRoles={['doctor']}>
                <DoctorDashboard authUser={authUser} />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/chatbot"
            element={(
              <ProtectedRoute isAuthenticated={Boolean(authUser)} userRole={authUser?.role}>
                <HealthBot copy={copy} />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/patient/book-appointment"
            element={(
              <ProtectedRoute isAuthenticated={Boolean(authUser)} userRole={authUser?.role}>
                <AppointmentBookingPage
                  doctors={[
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
                  ]}
                  profile={{
                    name: 'Sunita Devi',
                    village: 'Bihara Khurd',
                    ageGender: '36 / Female',
                    language: 'hi',
                  }}
                  copy={copy}
                  onBookingSubmit={() => {}}
                />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/patient/health-records"
            element={(
              <ProtectedRoute isAuthenticated={Boolean(authUser)} userRole={authUser?.role}>
                <AppointmentsRecordsPage
                  appointments={[
                    {
                      id: 'appt-1',
                      doctor: 'Dr. Meera Rao',
                      speciality: 'General Medicine',
                      notes: 'Fever, sore throat, body weakness',
                      status: 'pending',
                      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    },
                  ]}
                  records={[
                    {
                      id: 'rec-1',
                      diagnosis: 'Mild viral infection',
                      doctor: 'Dr. Meera Rao',
                      department: 'General Medicine',
                      date: '2026-03-28',
                      symptoms: 'Cough and mild fever',
                      prescription: 'Rest, warm fluids, paracetamol after food if fever is present',
                      notes: 'Follow up if symptoms persist for more than 5 days',
                    },
                  ]}
                  copy={copy}
                  onReschedule={() => {}}
                  onChatDoctor={() => {}}
                />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/health-chat"
            element={(
              <ProtectedRoute isAuthenticated={Boolean(authUser)} userRole={authUser?.role}>
                <MultilingualHealthChat
                  copy={copy}
                  language={language}
                  onLanguageChange={onLanguageChange}
                  userProfile={{
                    name: authUser?.displayName || 'User',
                  }}
                />
              </ProtectedRoute>
            )}
          />
          <Route path="/doctors-directory" element={<DoctorRecords authUser={authUser} />} />
        </Routes>
      </div>
    </div>
  );
}

AppContent.propTypes = {
  language: PropTypes.oneOf(['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'ur', 'or']).isRequired,
  onLanguageChange: PropTypes.func.isRequired,
  authUser: PropTypes.shape({
    email: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    loggedInAt: PropTypes.string
  }),
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  copy: PropTypes.shape({
    nav: PropTypes.object.isRequired,
    dashboard: PropTypes.object.isRequired,
    patient: PropTypes.object.isRequired,
    healthBot: PropTypes.object.isRequired,
    login: PropTypes.object.isRequired
  }).isRequired
};

function App() {
  const [authUser, setAuthUser] = useState(() => getAuthUser());
  const [language, setLanguage] = useState(() => {
    if (globalThis.window === undefined) {
      return 'en';
    }

    const savedLanguage = globalThis.localStorage.getItem('medvision-language');
    return savedLanguage && translations[savedLanguage] ? savedLanguage : 'en';
  });

  useEffect(() => {
    globalThis.localStorage.setItem('medvision-language', language);
  }, [language]);

  const copy = translations[language] ?? translations.en;

  const handleLanguageChange = (nextLanguage) => {
    if (translations[nextLanguage]) {
      setLanguage(nextLanguage);
    }
  };

  const handleLogin = (user) => {
    setAuthUser(user);
  };

  const handleLogout = async () => {
    await logoutUser();
    setAuthUser(null);
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent
        language={language}
        copy={copy}
        onLanguageChange={handleLanguageChange}
        authUser={authUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </Router>
  );
}

export default App;