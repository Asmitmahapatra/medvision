import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TopNav from './components/TopNav';
import Dashboard from './components/Dashboard';
import HealthBot from './components/HealthBot';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import Login from './components/Login';
import SignUp from './components/SignUp';
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
  const isSignupRoute = location.pathname === '/signup';
  const showNav = !isLoginRoute && !isSignupRoute;

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
            path="/signup"
            element={
              authUser ? <Navigate to="/patient" replace /> : <SignUp language={language} onLogin={onLogin} />
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
        </Routes>
      </div>
    </div>
  );
}

AppContent.propTypes = {
  language: PropTypes.oneOf(['en', 'hi']).isRequired,
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