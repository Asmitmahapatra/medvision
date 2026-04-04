import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, MapPin, Phone, Loader2 } from 'lucide-react';
import BackButton from './BackButton';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { translations } from '../i18n';

const AUTH_USER_KEY = 'medvision-auth-user';

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

const SignUp = ({ language = 'en', onLogin }) => {
  const navigate = useNavigate();
  const copy = translations[language] ?? translations.en;
  const signupCopy = copy.signup ?? translations.en.signup;

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    bloodGroup: '',
    isDiabetic: '',
    isPhysicallyDisabled: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectCount, setRedirectCount] = useState(3);

  useEffect(() => {
    const timer = globalThis.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % awarenessSlides.length);
    }, 3500);

    return () => globalThis.clearInterval(timer);
  }, []);

  const slide = useMemo(() => awarenessSlides[activeSlide], [activeSlide]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = signupCopy.nameRequired || 'Name is required';
    }

    if (!formData.age || Number(formData.age) < 0 || Number(formData.age) > 120) {
      newErrors.age = signupCopy.ageInvalid;
    }

    if (!formData.gender) {
      newErrors.gender = signupCopy.genderRequired || 'Gender is required';
    }

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = signupCopy.phoneInvalid;
    }

    if (!formData.bloodGroup) {
      newErrors.bloodGroup = signupCopy.bloodGroupRequired || 'Blood Group is required';
    }

    if (!formData.isDiabetic) {
      newErrors.isDiabetic = signupCopy.diabeticRequired || 'Diabetic status is required';
    }

    if (!formData.isPhysicallyDisabled) {
      newErrors.isPhysicallyDisabled = signupCopy.disabledRequired || 'Physical disability status is required';
    }

    if (!formData.village.trim()) {
      newErrors.village = signupCopy.villageRequired;
    }

    if (!formData.district.trim()) {
      newErrors.district = signupCopy.districtRequired;
    }

    if (!formData.state.trim()) {
      newErrors.state = signupCopy.stateRequired;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = signupCopy.pincodeInvalid;
    }

    if (!formData.email) {
      newErrors.email = signupCopy.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = signupCopy.invalidEmail;
    }

    if (!formData.password) {
      newErrors.password = copy.login.passwordRequired;
    } else if (formData.password.length < 6) {
      newErrors.password = signupCopy.passwordMin;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = signupCopy.confirmPasswordRequired;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = signupCopy.passwordMismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const localFallbackUser = {
        uid: `local-${Date.now()}`,
        email: normalizedEmail,
        displayName: formData.name.trim(),
        loggedInAt: new Date().toISOString(),
        isDemoUser: true,
        role: 'patient',
      };

      const completeRegistration = (user) => {
        globalThis.localStorage?.setItem(AUTH_USER_KEY, JSON.stringify(user));
        if (typeof onLogin === 'function') {
          onLogin(user);
        }

        setSuccessMessage(signupCopy.successRedirecting);
        setIsRedirecting(true);
        setRedirectCount(3);

        const intervalId = globalThis.setInterval(() => {
          setRedirectCount((prev) => {
            if (prev <= 1) {
              globalThis.clearInterval(intervalId);
              navigate('/patient', {
                replace: true,
                state: { signupSuccess: true },
              });
              return 0;
            }
            return prev - 1;
          });
        }, 800);
      };

      let user = null;

      if (auth) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          formData.password,
        );

        const firebaseUser = userCredential.user;
        user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? normalizedEmail,
          displayName: formData.name.trim(),
          loggedInAt: new Date().toISOString(),
          role: 'patient',
        };

        if (db) {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            email: normalizedEmail,
            displayName: formData.name.trim(),
            role: 'patient',
            name: formData.name.trim(),
            age: Number(formData.age),
            gender: formData.gender.trim(),
            phone: formData.phone.trim(),
            bloodGroup: formData.bloodGroup.trim(),
            isDiabetic: formData.isDiabetic === 'yes',
            isPhysicallyDisabled: formData.isPhysicallyDisabled === 'yes',
            address: {
              village: formData.village.trim(),
              district: formData.district.trim(),
              state: formData.state.trim(),
              pincode: formData.pincode.trim(),
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        user = localFallbackUser;
      }

      completeRegistration(user);
    } catch (error) {
      if (
        error?.code === 'auth/configuration-not-found' ||
        error?.code === 'auth/operation-not-allowed'
      ) {
        const normalizedEmail = formData.email.trim().toLowerCase();
        const localUser = {
          uid: `local-${Date.now()}`,
          email: normalizedEmail,
          displayName: formData.name.trim(),
          loggedInAt: new Date().toISOString(),
          isDemoUser: true,
          role: 'patient',
        };

        globalThis.localStorage?.setItem(AUTH_USER_KEY, JSON.stringify(localUser));
        if (typeof onLogin === 'function') {
          onLogin(localUser);
        }

        setSuccessMessage(`${signupCopy.successRedirecting} (Offline mode)`);
        setIsRedirecting(true);
        setRedirectCount(3);

        const intervalId = globalThis.setInterval(() => {
          setRedirectCount((prev) => {
            if (prev <= 1) {
              globalThis.clearInterval(intervalId);
              navigate('/patient', {
                replace: true,
                state: { signupSuccess: true },
              });
              return 0;
            }
            return prev - 1;
          });
        }, 800);

        return;
      }

      let errorMessage = 'An error occurred during sign up';

      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrors((prev) => ({
            ...prev,
            email: signupCopy.emailExists,
          }));
          break;
        case 'auth/invalid-email':
          setErrors((prev) => ({
            ...prev,
            email: signupCopy.invalidEmail,
          }));
          break;
        case 'auth/weak-password':
          setErrors((prev) => ({
            ...prev,
            password: signupCopy.weakPassword,
          }));
          break;
        default:
          errorMessage = error.message || signupCopy.genericError;
      }

      if (!Object.keys(errors).length || errorMessage !== signupCopy.genericError) {
        setErrors((prev) => ({
          ...prev,
          general: errorMessage,
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl mb-4">
        <BackButton to="/" label="← Back to Home" />
      </div>
      <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-5">
        <section className="relative overflow-hidden rounded-3xl border border-indigo-200/50 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-6 text-white shadow-xl md:col-span-2">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Health Awareness</p>
          <h2 className="mt-2 text-2xl font-black">Daily Care Tips for Families</h2>
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
            {awarenessSlides.map((item, index) => (
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
        </section>

        <section className="rounded-3xl border border-indigo-100/60 bg-white/95 p-6 shadow-xl md:col-span-3">
          <h1 className="text-premium-heading text-3xl font-black">{signupCopy.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{signupCopy.subtitle}</p>

          {successMessage && (
            <div className="mb-6 mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {isRedirecting && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-800">
                <Loader2 className="h-4 w-4 animate-spin" />
                {signupCopy.redirectingLabel}
              </div>
              <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white">
                {redirectCount}s
              </span>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-indigo-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-xl border py-2 pl-10 pr-4 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                    errors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Age *</label>
              <input
                type="number"
                name="age"
                placeholder="Enter your age"
                value={formData.age}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                  errors.age ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                  errors.gender ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Blood Group *</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                  errors.bloodGroup ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select Blood Group</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
              {errors.bloodGroup && <p className="mt-1 text-sm text-red-600">{errors.bloodGroup}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Diabetic *</label>
              <select
                name="isDiabetic"
                value={formData.isDiabetic}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                  errors.isDiabetic ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {errors.isDiabetic && <p className="mt-1 text-sm text-red-600">{errors.isDiabetic}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Physically Disabled *</label>
              <select
                name="isPhysicallyDisabled"
                value={formData.isPhysicallyDisabled}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                  errors.isPhysicallyDisabled ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              {errors.isPhysicallyDisabled && <p className="mt-1 text-sm text-red-600">{errors.isPhysicallyDisabled}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-indigo-400" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full rounded-xl border py-2 pl-10 pr-4 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                    errors.phone ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Village *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-indigo-400" />
                <input
                  type="text"
                  name="village"
                  placeholder="Enter village name"
                  value={formData.village}
                  onChange={handleChange}
                  className={`w-full rounded-xl border py-2 pl-10 pr-4 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                    errors.village ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.village && <p className="mt-1 text-sm text-red-600">{errors.village}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">District *</label>
              <input
                type="text"
                name="district"
                placeholder="Enter district"
                value={formData.district}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                  errors.district ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">State *</label>
              <input
                type="text"
                name="state"
                placeholder="Enter state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                  errors.state ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">PIN Code *</label>
              <input
                type="text"
                name="pincode"
                placeholder="Enter 6-digit PIN code"
                value={formData.pincode}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                  errors.pincode ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-indigo-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-xl border py-2 pl-10 pr-4 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                    errors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-indigo-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-xl border py-2 pl-10 pr-10 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                    errors.password ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-indigo-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-xl border py-2 pl-10 pr-10 outline-none transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-indigo-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 font-semibold text-white transition duration-200 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-70 md:col-span-2"
            >
              {isLoading ? signupCopy.registeringButton : signupCopy.registerButton}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            {signupCopy.alreadyHaveAccount}{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-semibold text-indigo-700 hover:text-indigo-800"
            >
              {signupCopy.loginCta}
            </button>
          </p>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-center text-sm text-gray-600">
              Registering as a doctor?{' '}
              <Link to="/doctor-signup" className="font-semibold text-indigo-700 hover:text-indigo-800">
                Go to doctor signup
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

SignUp.propTypes = {
  language: PropTypes.oneOf(['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'ur', 'or']),
  onLogin: PropTypes.func,
};

export default SignUp;
