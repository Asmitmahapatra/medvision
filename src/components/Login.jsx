import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AtSign, Loader2, LogIn, Lock, ShieldCheck, UserRound, UserCog, Eye, EyeOff } from 'lucide-react';
import BackButton from './BackButton';
import { getUserProfile, isValidEmail, loginWithEmail, logoutUser, resetPasswordWithEmail } from '../services/authService';

const DEMO_ACCOUNTS = {
  patient: {
    title: 'Patient demo',
    email: 'patient@demo.in',
    password: 'demo123',
  },
  doctor: {
    title: 'Doctor demo',
    email: 'doctor@demo.in',
    password: 'demo123',
  },
};

const awarenessSlides = [
  {
    title: 'Wash Hands for 20 Seconds',
    body: 'Clean hands with soap before meals and after using the toilet to reduce infections in children.',
    image:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Vaccination Saves Lives',
    body: 'Keep your child immunization schedule updated and carry vaccine records during doctor visits.',
    image:
      'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Drink Safe Water Daily',
    body: 'Use boiled or filtered water to prevent diarrhea, jaundice, and stomach-related illnesses.',
    image:
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
  },
];

const Login = ({ copy, onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const AUTH_USER_KEY = 'medvision-auth-user';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [activeRole, setActiveRole] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const fromPath = location.state?.from?.pathname || '/patient';

  useEffect(() => {
    const timer = globalThis.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % awarenessSlides.length);
    }, 3500);

    return () => globalThis.clearInterval(timer);
  }, []);

  const slide = useMemo(() => awarenessSlides[activeSlide], [activeSlide]);

  const applyDemoAccount = (role) => {
    const account = DEMO_ACCOUNTS[role];
    if (!account) {
      return;
    }

    setActiveRole(role);
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setInfo('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalized = email.trim();

    if (!isValidEmail(normalized)) {
      setError(copy.login.invalidEmail);
      return;
    }

    try {
      setIsSubmitting(true);
      setInfo('');
      const user = await loginWithEmail(normalized, password);
      const profile = await getUserProfile(user);
      const resolvedRole = profile?.role;

      if (!resolvedRole) {
        await logoutUser();
        setError(copy.login.roleMissing);
        return;
      }

      if (resolvedRole === 'doctor' && profile?.verified !== true) {
        await logoutUser();
        setError(copy.login.doctorPendingApproval ?? 'Doctor account pending approval. Please wait for verification.');
        return;
      }

      if (activeRole === 'doctor' && resolvedRole !== 'doctor') {
        await logoutUser();
        setError(copy.login.doctorOnlyError);
        return;
      }

      if (activeRole === 'patient' && resolvedRole !== 'patient') {
        await logoutUser();
        setError(copy.login.patientOnlyError);
        return;
      }

      const resolvedUser = {
        ...user,
        role: resolvedRole,
        verified: profile?.verified ?? null,
      };
      globalThis.localStorage?.setItem(AUTH_USER_KEY, JSON.stringify(resolvedUser));

      const hasProtectedSource = Boolean(location.state?.from?.pathname);
      let targetPath = resolvedRole === 'doctor' ? '/doctor' : '/patient';
      if (hasProtectedSource) {
        targetPath = fromPath;
      }

      onLogin(resolvedUser);
      navigate(targetPath, { replace: true });
    } catch (authError) {
      if (authError?.message === 'MISSING_PASSWORD') {
        setError(copy.login.passwordRequired);
      } else if (authError?.message === 'FIREBASE_NOT_CONFIGURED') {
        setError(copy.login.firebaseConfigError);
      } else if (authError?.message === 'TOO_MANY_REQUESTS') {
        setError(copy.login.tooManyRequests);
      } else if (authError?.message === 'INVALID_CREDENTIALS') {
        setError(copy.login.authFailed);
      } else {
        setError(copy.login.invalidEmail);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (isResetting) {
      return;
    }

    const normalized = email.trim();
    setError('');
    setInfo('');

    if (!isValidEmail(normalized)) {
      setError(copy.login.invalidEmail);
      return;
    }

    try {
      setIsResetting(true);
      await resetPasswordWithEmail(normalized);
      setInfo(copy.login.resetLinkSent);
    } catch (resetError) {
      if (resetError?.message === 'INVALID_EMAIL') {
        setError(copy.login.invalidEmail);
      } else if (resetError?.message === 'TOO_MANY_REQUESTS') {
        setError(copy.login.tooManyRequests);
      } else if (resetError?.message === 'FIREBASE_NOT_CONFIGURED') {
        setError(copy.login.firebaseConfigError);
      } else {
        setError(copy.login.resetFailed);
      }
    } finally {
      setIsResetting(false);
    }
  };

  const isEmailValid = email.trim() ? isValidEmail(email) : true;

  return (
    <main className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2 lg:gap-8">
        <section className="relative overflow-hidden rounded-3xl border border-indigo-200/40 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-8 text-white shadow-2xl transition-all duration-300 hover:shadow-2xl md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] border border-white/30 backdrop-blur-sm">
            <ShieldCheck size={16} />
            Secure Demo Access
          </div>

          <h2 className="mt-8 text-3xl md:text-4xl font-black leading-tight">Access Your Health Dashboard</h2>
          <p className="mt-3 text-sm text-indigo-100 leading-relaxed max-w-sm">
            Quick login with demo accounts or create your own. Your health, your way.
          </p>

          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-8 bg-gradient-to-r from-white to-white/50 rounded-full"></div>
              <p className="text-xs uppercase font-bold tracking-widest text-indigo-100">Daily Health Tips</p>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white">{slide.title}</h3>
            <div className="mt-4 h-48 overflow-hidden rounded-3xl border border-white/20 bg-indigo-900/40 shadow-lg shadow-indigo-950 group">
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="mt-4 rounded-2xl bg-white/15 p-5 backdrop-blur-sm border border-white/20">
              <p className="text-sm leading-6 text-indigo-50">{slide.body}</p>
            </div>

            <div className="mt-5 flex justify-center gap-2">
              {awarenessSlides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`transition-all duration-300 ${
                    activeSlide === index ? 'w-8 h-2 bg-white rounded-full' : 'w-2 h-2 bg-white/40 rounded-full hover:bg-white/60'
                  }`}
                  aria-label={`Show awareness slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase font-bold tracking-widest text-indigo-100 mb-3">Try Demo Accounts</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(DEMO_ACCOUNTS).map(([role, account]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => applyDemoAccount(role)}
                  className="rounded-2xl border border-white/30 bg-white/10 p-4 text-left transition-all duration-200 hover:bg-white/20 hover:border-white/50 hover:shadow-lg hover:shadow-indigo-800 active:scale-95"
                >
                  <p className="text-lg font-black">{account.title}</p>
                  <p className="mt-2 text-xs text-indigo-200 font-mono">{account.email}</p>
                  <p className="text-xs text-indigo-200 font-mono">pwd: {account.password}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-xs uppercase font-bold tracking-widest text-indigo-200 mb-4">Platform Features</p>
            <div className="grid gap-2">
              {['✓ AI symptom checker', '✓ Instant appointments', '✓ Medical records', '✓ Hindi & English chat'].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm text-indigo-50">
                  <span className="text-base">{feature.split(' ')[0]}</span>
                  <span>{feature.substring(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-sm font-bold text-white">🚨 Emergency Help</p>
            <p className="text-xs text-indigo-100 mt-2">Call <span className="font-black text-white text-lg">108</span> for immediate medical assistance</p>
          </div>
        </section>

        <section className="relative rounded-3xl border border-indigo-100/60 bg-white/98 p-6 shadow-xl backdrop-blur-sm md:p-8">
          <BackButton to="/" label="← Back" />
          <div className="mb-8 border-b border-indigo-100 pb-8">
            <h2 className="text-2xl font-black text-slate-900">Welcome Back</h2>
            <p className="mt-1 text-sm text-slate-500">Sign in to access your health dashboard</p>
          </div>

          <div className="inline-flex rounded-full bg-slate-100 p-1.5">
            <button
              type="button"
              className="rounded-full bg-white px-6 py-2 text-sm font-bold text-indigo-700 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              Login
            </button>
            <button
              type="button"
              className="rounded-full px-6 py-2 text-sm font-bold text-slate-500 transition-all duration-200 hover:text-indigo-700 hover:bg-slate-200"
              onClick={() => navigate('/signup')}
            >
              Register
            </button>
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">I am a</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActiveRole('patient')}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                  activeRole === 'patient'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-150 border border-slate-200'
                }`}
              >
                <UserRound size={16} />
                Patient
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('doctor')}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                  activeRole === 'doctor'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-150 border border-slate-200'
                }`}
              >
                <UserCog size={16} />
                Doctor
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2.5" htmlFor="email-input">
              {copy.login.emailLabel}
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-50/50 px-4 py-3 transition-all duration-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 hover:border-slate-300">
              <AtSign size={18} className="text-slate-400 flex-shrink-0" />
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) {
                    setError('');
                  }
                  if (info) {
                    setInfo('');
                  }
                }}
                placeholder={copy.login.emailPlaceholder}
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                autoComplete="email"
                required
                aria-invalid={!isEmailValid}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2.5" htmlFor="password-input">
              {copy.login.passwordLabel}
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-50/50 px-4 py-3 transition-all duration-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 hover:border-slate-300">
              <Lock size={18} className="text-slate-400 flex-shrink-0" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) {
                    setError('');
                  }
                  if (info) {
                    setInfo('');
                  }
                }}
                placeholder={copy.login.passwordPlaceholder}
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-slate-400 transition-colors duration-200 hover:text-indigo-600 flex-shrink-0"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {!isEmailValid && !error && (
              <p className="text-xs font-semibold text-amber-600 inline-flex items-center gap-1">
                <span>⚠</span> {copy.login.invalidEmail}
              </p>
            )}
            <div className="ml-auto">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="text-xs font-bold text-indigo-700 transition-colors duration-200 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isResetting ? copy.login.submitting : copy.login.forgotPassword}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200/50 bg-gradient-to-r from-red-50 to-red-50/50 px-4 py-3 text-xs font-semibold text-red-700 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-base mt-0.5">✕</span>
              <span>{error}</span>
            </div>
          )}
          {info && (
            <div className="rounded-2xl border border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-emerald-50/50 px-4 py-3 text-xs font-semibold text-emerald-700 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-base mt-0.5">✓</span>
              <span>{info}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 px-4 py-3.5 text-sm font-bold text-white transition-all duration-200 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none active:scale-95"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {isSubmitting ? copy.login.submitting : copy.login.submit}
          </button>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <p className="text-center text-xs text-slate-600 space-x-1">
              <span>Registering as a doctor?</span>
              <Link to="/doctor-signup" className="font-bold text-indigo-700 hover:text-indigo-800 transition-colors duration-200">
                Doctor signup →
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-slate-500">{copy.login.footer}</p>
        </form>
        </section>
      </div>
    </main>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
  copy: PropTypes.shape({
    login: PropTypes.shape({
      badge: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      emailLabel: PropTypes.string.isRequired,
      emailPlaceholder: PropTypes.string.isRequired,
      passwordLabel: PropTypes.string.isRequired,
      passwordPlaceholder: PropTypes.string.isRequired,
      passwordRequired: PropTypes.string.isRequired,
      invalidEmail: PropTypes.string.isRequired,
      authFailed: PropTypes.string.isRequired,
      tooManyRequests: PropTypes.string.isRequired,
      firebaseConfigError: PropTypes.string.isRequired,
      doctorOnlyError: PropTypes.string.isRequired,
      patientOnlyError: PropTypes.string.isRequired,
      doctorPendingApproval: PropTypes.string.isRequired,
      roleMissing: PropTypes.string.isRequired,
      forgotPassword: PropTypes.string.isRequired,
      resetLinkSent: PropTypes.string.isRequired,
      resetFailed: PropTypes.string.isRequired,
      submit: PropTypes.string.isRequired,
      submitting: PropTypes.string.isRequired,
      footer: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default Login;
