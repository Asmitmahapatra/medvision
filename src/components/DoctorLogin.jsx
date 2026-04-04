import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Loader2, LogIn, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import BackButton from './BackButton';
import { getUserProfile, loginWithEmail } from '../services/authService';

const DEMO_DOCTOR_ACCOUNT = {
  licenseCode: 'DOC-DEMO-001',
  password: 'demo123',
};

const doctorAwarenessSlides = [
  {
    title: 'Serve Rural Communities',
    body: 'Reach patients in remote areas with tele-consults, quick follow-ups, and local health camps.',
    image: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Secure Patient Records',
    body: 'Access histories, prescriptions, and notes with consent-first sharing and audit trails.',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Smarter Scheduling',
    body: 'Handle triage, appointments, and follow-ups with reminders for patients and staff.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  },
];

const DoctorLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const AUTH_USER_KEY = 'medvision-auth-user';
  const [licenseCode, setLicenseCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const fromPath = location.state?.from?.pathname || '/doctor';

  useEffect(() => {
    const timer = globalThis.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % doctorAwarenessSlides.length);
    }, 3500);

    return () => globalThis.clearInterval(timer);
  }, []);

  const slide = useMemo(() => doctorAwarenessSlides[activeSlide], [activeSlide]);

  const applyDemoAccount = () => {
    setLicenseCode(DEMO_DOCTOR_ACCOUNT.licenseCode);
    setPassword(DEMO_DOCTOR_ACCOUNT.password);
    setError('');
    setInfo('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalizedLicense = licenseCode.trim().toUpperCase();

    if (!normalizedLicense) {
      setError('License code is required');
      return;
    }

    if (!password?.trim()) {
      setError('Password is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setInfo('');

      // Demo account check
      if (
        normalizedLicense === DEMO_DOCTOR_ACCOUNT.licenseCode.toUpperCase() &&
        password === DEMO_DOCTOR_ACCOUNT.password
      ) {
        const demoUser = {
          uid: 'demo-doctor-user',
          email: 'doctor@demo.in',
          displayName: 'Dr. Demo',
          licenseCode: normalizedLicense,
          loggedInAt: new Date().toISOString(),
          isDemoUser: true,
          role: 'doctor',
        };

        globalThis.localStorage?.setItem(AUTH_USER_KEY, JSON.stringify(demoUser));
        if (typeof onLogin === 'function') {
          onLogin(demoUser);
        }

        navigate(fromPath, { replace: true });
        return;
      }

      // For production, you would validate against a backend service
      // This is a simplified version - in production, hash passwords server-side
      setError('Invalid license code or password. Use DOC-DEMO-001 / demo123 for demo access.');
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl mb-4">
        <BackButton to="/" label="← Back to Home" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-5">
        {/* Left Panel - Awareness Slides */}
        <section className="relative overflow-hidden rounded-3xl border border-indigo-200/50 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-6 text-white shadow-xl md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Doctor Portal</p>
          </div>
          <h2 className="mt-2 text-2xl font-black">Secure Healthcare Access</h2>

          <div className="mt-5 h-44 overflow-hidden rounded-2xl border border-white/20 bg-indigo-900/20">
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover transition-transform duration-500"
            />
          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm transition-all duration-300">
            <p className="text-lg font-bold">{slide.title}</p>
            <p className="mt-2 text-sm leading-6 text-indigo-50">{slide.body}</p>
          </div>

          <div className="mt-5 flex gap-2">
            {doctorAwarenessSlides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  activeSlide === index ? 'w-8 bg-white' : 'w-2.5 bg-white/40'
                }`}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Demo Account Info */}
          <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.15em] text-amber-100 font-semibold">Demo Credentials</p>
            <p className="mt-2 text-sm text-amber-50">License Code: <span className="font-mono font-bold">DOC-DEMO-001</span></p>
            <p className="text-sm text-amber-50">Password: <span className="font-mono font-bold">demo123</span></p>
          </div>
        </section>

        {/* Right Panel - Login Form */}
        <section className="rounded-3xl border border-indigo-100/60 bg-white/95 p-6 shadow-xl md:col-span-3">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-6 w-6 text-indigo-600" />
            <h1 className="text-3xl font-black text-gray-900">Doctor Login</h1>
          </div>
          <p className="text-sm text-slate-600 mt-2">Secure access for licensed medical professionals</p>

          {error && (
            <div className="mb-6 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="h-5 w-5 flex-shrink-0 rounded-full bg-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {info && (
            <div className="mb-6 mt-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <Loader2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 animate-spin" />
              <p className="text-sm text-blue-800">{info}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Medical License Code</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3.5 h-5 w-5 text-indigo-400" />
                <input
                  type="text"
                  value={licenseCode}
                  onChange={(e) => {
                    setLicenseCode(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your medical license code"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                    error ? 'border-red-500' : 'border-slate-300'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-indigo-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your password"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-10 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                    error ? 'border-red-500' : 'border-slate-300'
                  }`}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-indigo-600 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 font-semibold text-white transition duration-200 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Doctor Login
                </>
              )}
            </button>

            <button
              type="button"
              onClick={applyDemoAccount}
              disabled={isSubmitting}
              className="mt-3 w-full rounded-xl border-2 border-indigo-200 px-4 py-2.5 font-semibold text-indigo-600 transition duration-200 hover:bg-indigo-50 disabled:opacity-50"
            >
              Use Demo Account
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/doctor-signup" className="font-semibold text-indigo-700 hover:text-indigo-800">
                Register as Doctor
              </Link>
            </p>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-center text-sm text-gray-600">
              Patient seeking care?{' '}
              <Link to="/login" className="font-semibold text-indigo-700 hover:text-indigo-800">
                Patient Login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

DoctorLogin.propTypes = {
  onLogin: PropTypes.func,
};

export default DoctorLogin;
