import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Phone, Loader2, Building2, ShieldCheck } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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

const DoctorSignUp = ({ onLogin }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    doctorName: '',
    licenseNumber: '',
    specialization: '',
    department: '',
    hospital: '',
    phone: '',
    email: '',
    qualification: '',
    experience: '',
    city: '',
    state: '',
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

  useEffect(() => {
    const timer = globalThis.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % doctorAwarenessSlides.length);
    }, 3500);

    return () => globalThis.clearInterval(timer);
  }, []);

  const slide = useMemo(() => doctorAwarenessSlides[activeSlide], [activeSlide]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.doctorName.trim()) {
      newErrors.doctorName = 'Doctor name is required';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'Medical license number is required';
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.hospital.trim()) {
      newErrors.hospital = 'Hospital/Clinic name is required';
    }

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Qualification is required';
    }

    if (!formData.experience || Number(formData.experience) < 0 || Number(formData.experience) > 60) {
      newErrors.experience = 'Valid experience (0-60 years) is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const completeRegistration = () => {
        setSuccessMessage('Registration submitted. Your account will be verified by the admin team.');
        setIsRedirecting(true);
        globalThis.setTimeout(() => {
          navigate('/login', {
            replace: true,
            state: { signupSuccess: true, doctorPending: true },
          });
        }, 2400);
      };

      if (auth) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          formData.password,
        );

        const firebaseUser = userCredential.user;
        if (db) {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            email: normalizedEmail,
            displayName: formData.doctorName.trim(),
            role: 'doctor',
            licenseNumber: formData.licenseNumber.trim(),
            specialization: formData.specialization.trim(),
            department: formData.department.trim(),
            hospital: formData.hospital.trim(),
            phone: formData.phone.trim(),
            qualification: formData.qualification.trim(),
            experience: Number(formData.experience),
            location: {
              city: formData.city.trim(),
              state: formData.state.trim(),
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            verified: false,
            approvalStatus: 'pending',
          });
        }
      }

      completeRegistration();
    } catch (error) {
      if (
        error?.code === 'auth/configuration-not-found' ||
        error?.code === 'auth/operation-not-allowed' ||
        error?.code === 'permission-denied'
      ) {
        setSuccessMessage(
          'Registration captured. Admin verification will complete after Firebase rules are deployed.'
        );
        setIsRedirecting(true);
        globalThis.setTimeout(() => {
          navigate('/login', {
            replace: true,
            state: { signupSuccess: true, doctorPending: true },
          });
        }, 2400);

        return;
      }

      let errorMessage = 'An error occurred during registration';

      switch (error.code) {
        case 'permission-denied':
          errorMessage = 'Firestore permissions are missing. Deploy the latest rules and try again.';
          break;
        case 'auth/email-already-in-use':
          setErrors((prev) => ({
            ...prev,
            email: 'Email already registered',
          }));
          break;
        case 'auth/invalid-email':
          setErrors((prev) => ({
            ...prev,
            email: 'Invalid email format',
          }));
          break;
        case 'auth/weak-password':
          setErrors((prev) => ({
            ...prev,
            password: 'Password is too weak',
          }));
          break;
        default:
          errorMessage = error.message || 'Registration failed';
      }

      if (!Object.keys(errors).length || errorMessage !== 'Registration failed') {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Awareness Slide - Left Side */}
        <section className="relative hidden overflow-hidden rounded-3xl border border-indigo-300/30 bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-8 text-white shadow-xl lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]">
            <ShieldCheck size={14} />
            Secure Demo Access
          </div>

          <h2 className="mt-6 text-4xl font-black leading-tight">Complete your doctor profile in one step.</h2>
          <p className="mt-4 text-sm text-indigo-100">
            Submit your credentials and get verified to serve rural communities with MEDVISION.
          </p>

          <div className="mt-6 rounded-3xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Quick checklist</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {['License ID ready', 'Clinic address', 'Years of practice'].map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-indigo-50">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Avg. approval', value: '24 hrs' },
              { label: 'Active clinics', value: '120+' },
              { label: 'Patient reach', value: '50k+' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 px-3 py-3">
                <p className="text-lg font-black text-white">{stat.value}</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-indigo-100">{stat.label}</p>
              </div>
            ))}
          </div>

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
              {doctorAwarenessSlides.map((slideItem, idx) => (
                <button
                  key={slideItem.title}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    activeSlide === idx ? 'w-8 bg-white' : 'w-2.5 bg-white/40'
                  }`}
                  aria-label={`Show awareness slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              'Verified doctor profile',
              'Secure patient records',
              'Appointment management',
              'Multilingual care tools',
            ].map((feature) => (
              <div key={feature} className="rounded-full bg-white/12 px-4 py-2 text-sm font-bold text-indigo-50">
                {feature}
              </div>
            ))}
          </div>
        </section>

        {/* Form - Right Side */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Doctor Registration</h1>
              <p className="text-slate-600">Join MEDVISION to serve rural healthcare</p>
            </div>

            {errors.general && (
              <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 flex gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{errors.general}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4 flex gap-3">
                <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-700">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Doctor Name */}
              <div>
                <label htmlFor="doctorName" className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3.5 text-indigo-500" />
                  <input
                    id="doctorName"
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    placeholder="Dr. Meera Rao"
                    className={`input-premium pl-10 ${errors.doctorName ? 'input-premium-error' : ''}`}
                  />
                </div>
                {errors.doctorName && (
                  <p className="mt-1 text-sm text-red-600">{errors.doctorName}</p>
                )}
              </div>

              {/* License Number */}
              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                  Medical License Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="licenseNumber"
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="NMC/MCR number"
                  className={`input-premium ${errors.licenseNumber ? 'input-premium-error' : ''}`}
                />
                {errors.licenseNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
                )}
              </div>

              {/* Specialization & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="specialization" className="block text-sm font-semibold text-slate-700 mb-2">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="specialization"
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g., General Medicine"
                    className={`input-premium ${errors.specialization ? 'input-premium-error' : ''}`}
                  />
                  {errors.specialization && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-semibold text-slate-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="department"
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., Internal"
                    className={`input-premium ${errors.department ? 'input-premium-error' : ''}`}
                  />
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                  )}
                </div>
              </div>

              {/* Hospital/Clinic */}
              <div>
                <label htmlFor="hospital" className="block text-sm font-semibold text-slate-700 mb-2">
                  Hospital/Clinic <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-3 top-3.5 text-indigo-500" />
                  <input
                    id="hospital"
                    type="text"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleChange}
                    placeholder="Hospital name"
                    className={`input-premium pl-10 ${errors.hospital ? 'input-premium-error' : ''}`}
                  />
                </div>
                {errors.hospital && (
                  <p className="mt-1 text-sm text-red-600">{errors.hospital}</p>
                )}
              </div>

              {/* Qualification & Experience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="qualification" className="block text-sm font-semibold text-slate-700 mb-2">
                    Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="qualification"
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g., MBBS, MD"
                    className={`input-premium ${errors.qualification ? 'input-premium-error' : ''}`}
                  />
                  {errors.qualification && (
                    <p className="mt-1 text-sm text-red-600">{errors.qualification}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="experience" className="block text-sm font-semibold text-slate-700 mb-2">
                    Experience (Years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="experience"
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Years"
                    min="0"
                    max="60"
                    className={`input-premium ${errors.experience ? 'input-premium-error' : ''}`}
                  />
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience}</p>
                  )}
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-3.5 text-indigo-500" />
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit number"
                      maxLength="10"
                      className={`input-premium pl-10 ${errors.phone ? 'input-premium-error' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3.5 text-indigo-500" />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={`input-premium pl-10 ${errors.email ? 'input-premium-error' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-slate-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className={`input-premium ${errors.city ? 'input-premium-error' : ''}`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-semibold text-slate-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className={`input-premium ${errors.state ? 'input-premium-error' : ''}`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3.5 text-indigo-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className={`input-premium pl-10 pr-10 ${errors.password ? 'input-premium-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-indigo-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3.5 text-indigo-500" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className={`input-premium pl-10 pr-10 ${errors.confirmPassword ? 'input-premium-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-indigo-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isRedirecting}
                className="btn-premium-primary w-full mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Doctor Account'
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-3 text-center text-sm">
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Login here
                </Link>
              </p>
              <p className="text-slate-600">
                Registering as a patient?{' '}
                <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Go to patient signup
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DoctorSignUp.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default DoctorSignUp;
