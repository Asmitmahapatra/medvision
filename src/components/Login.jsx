import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AtSign, Loader2, LogIn, Lock, ShieldCheck, UserRound, UserCog, Eye, EyeOff } from 'lucide-react';
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
    <main className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50 px-4 py-10 md:px-8 md:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.14),transparent_36%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.12),transparent_32%)]" />

      <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2">
        <section className="relative overflow-hidden rounded-3xl border border-indigo-300/30 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-8 text-white shadow-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]">
            <ShieldCheck size={14} />
            Secure Demo Access
          </div>

          <h2 className="mt-6 text-4xl font-black leading-tight">Enter the patient or doctor flow in one step.</h2>
          <p className="mt-4 text-sm text-indigo-100">
            Use the demo accounts below or create a new profile. This login is intentionally basic for hackathon speed.
          </p>

          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Health Awareness</p>
            <h3 className="mt-2 text-2xl font-black">Daily Care Tips for Families</h3>
            <div className="mt-4 h-44 overflow-hidden rounded-3xl border border-white/20 bg-indigo-900/20">
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full object-cover transition-transform duration-500"
              />
            </div>

            <div className="mt-4 rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
              <p className="text-2xl font-black text-white">{slide.title}</p>
              <p className="mt-2 text-sm leading-6 text-indigo-100">{slide.body}</p>
            </div>

            <div className="mt-4 flex gap-2">
              {awarenessSlides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    activeSlide === index ? 'w-8 bg-white' : 'w-2.5 bg-white/40'
                  }`}
                  aria-label={`Show awareness slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Object.entries(DEMO_ACCOUNTS).map(([role, account]) => (
              <button
                key={role}
                type="button"
                onClick={() => applyDemoAccount(role)}
                className="rounded-2xl border border-white/20 bg-white/10 p-4 text-left transition hover:scale-[1.01] hover:bg-white/15"
              >
                <p className="text-xl font-black">{account.title}</p>
                <p className="mt-1 text-sm font-semibold text-indigo-100">{account.email} / {account.password}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {['AI symptom analysis', 'Appointment booking', 'Medical record timeline', 'Hindi and English chatbot'].map((feature) => (
              <div key={feature} className="rounded-full bg-white/12 px-4 py-2 text-sm font-bold text-indigo-50">
                {feature}
              </div>
            ))}
          </div>

          <p className="mt-10 text-lg font-bold text-indigo-50">Emergency help: <span className="underline">Call 108</span></p>
        </section>

        <section className="rounded-3xl border border-indigo-100/60 bg-white/95 p-6 shadow-xl md:p-8">
          <div className="rounded-2xl bg-slate-100 p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                className="rounded-xl bg-white px-4 py-2 text-base font-black text-indigo-700 shadow-sm"
              >
                Login
              </button>
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-base font-black text-slate-500 transition hover:text-indigo-700"
                onClick={() => navigate('/signup')}
              >
                Register
              </button>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveRole('patient')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                activeRole === 'patient'
                  ? 'bg-indigo-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserRound size={14} />
              Patient
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('doctor')}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                activeRole === 'doctor'
                  ? 'bg-indigo-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserCog size={14} />
              Doctor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="email-input">
            {copy.login.emailLabel}
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
            <AtSign size={16} className="text-slate-500" />
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
              className="w-full bg-transparent text-sm text-slate-800 outline-none"
              autoComplete="email"
              required
              aria-invalid={!isEmailValid}
            />
          </div>

          <label className="block text-sm font-semibold text-gray-700" htmlFor="password-input">
            {copy.login.passwordLabel}
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
            <Lock size={16} className="text-slate-500" />
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
              className="w-full bg-transparent text-sm text-slate-800 outline-none"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-slate-500 transition hover:text-indigo-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {!isEmailValid && !error && (
            <p className="text-xs font-semibold text-amber-700">{copy.login.invalidEmail}</p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isResetting}
              className="text-xs font-bold text-indigo-700 transition hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isResetting ? copy.login.submitting : copy.login.forgotPassword}
            </button>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-black text-white transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {isSubmitting ? copy.login.submitting : copy.login.submit}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="block w-full text-center text-sm font-bold text-indigo-700 transition hover:text-indigo-800"
          >
            Back to landing page
          </button>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-center text-xs text-slate-600">
              Registering as a doctor?{' '}
              <Link to="/doctor-signup" className="font-bold text-indigo-700 hover:text-indigo-800">
                Doctor signup
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
