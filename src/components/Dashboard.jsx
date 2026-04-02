import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  ArrowRight, Calendar, FileText, MessageCircle, Siren, Stethoscope,
  Heart, Users, TrendingUp, Shield, Zap, Award, Clock, MapPin, CheckCircle2,
  Smartphone, BarChart3, Lock, Sparkles, LineChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ copy }) => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-indigo-50 via-violet-50/20 to-slate-50">
      {/* Modern Animated Background Orbs */}
      <div className="fixed inset-0 -z-20 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-bl from-indigo-400/20 via-violet-300/15 to-transparent blur-3xl"
             style={{ transform: `translateY(${scrollY * 0.3}px)` }} />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-violet-400/20 via-indigo-300/15 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gradient-to-br from-pink-200/15 via-violet-200/10 to-transparent blur-3xl"
             style={{ transform: `translate(-50%, calc(33% + ${scrollY * -0.2}px))` }} />
      </div>

      {/* Hero Section - Professional Medical Design */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Premium Badge */}
          <div className="mb-12 flex justify-center animate-fade-in-scale">
            <div className="group inline-flex items-center gap-3 rounded-full border border-indigo-200/60 bg-gradient-to-r from-indigo-50/80 via-violet-50/60 to-pink-50/70 px-6 py-3 backdrop-blur-md shadow-lg transition hover:border-indigo-300/80 hover:shadow-xl hover:scale-105">
              <Sparkles size={18} className="text-indigo-600 animate-smooth-pulse" />
              <span className="bg-gradient-to-r from-indigo-700 to-pink-600 bg-clip-text text-sm font-bold text-transparent">
                {copy.dashboard.badge}
              </span>
              <Heart size={18} className="text-pink-500" />
            </div>
          </div>

          {/* Main Heading - Modern Premium */}
          <div className="text-center">
            <h1 className="mb-6 text-premium-heading text-6xl sm:text-7xl lg:text-8xl font-black leading-tight tracking-tight animate-slide-in-down">
              {copy.dashboard.heroTitle}
            </h1>

            <p className="mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-slate-700 sm:text-xl font-medium animate-slide-in-up">
              {copy.dashboard.heroSubtitle}
            </p>

            {/* Professional CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-5">
              <button
                onClick={() => navigate('/signup')}
                className="btn-premium-primary"
              >
                <span className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition duration-300" />
                <span className="relative flex items-center gap-2">
                  {copy.dashboard.startDemo}
                  <ArrowRight size={18} className="transition duration-300 group-hover:translate-x-1" />
                </span>
              </button>
              <button
                onClick={() => navigate('/chatbot')}
                className="btn-premium-secondary"
              >
                <MessageCircle size={18} />
                {copy.dashboard.seeFeatures}
              </button>
            </div>
          </div>

          {/* Professional Stats Cards */}
          <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, label: 'Active Patients', value: '2.5K+', gradient: 'from-indigo-600 to-violet-700', lightGradient: 'from-indigo-50/60 to-violet-50/60' },
              { icon: Calendar, label: 'Appointments', value: '890', gradient: 'from-violet-600 to-pink-700', lightGradient: 'from-violet-50/60 to-pink-50/60' },
              { icon: Clock, label: 'Response Time', value: '<2min', gradient: 'from-pink-600 to-indigo-700', lightGradient: 'from-pink-50/60 to-indigo-50/60' },
              { icon: TrendingUp, label: 'Success Rate', value: '98%', gradient: 'from-indigo-700 to-violet-800', lightGradient: 'from-indigo-50/60 to-violet-50/60' }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="card-premium animate-float-up" style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stat.lightGradient} opacity-0 group-hover:opacity-60 transition duration-300`} />
                  <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-teal-600 opacity-5 group-hover:opacity-8 transition duration-300" />
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} p-3 shadow-lg mb-4 group-hover:scale-110 transition duration-300`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm font-medium text-slate-600 mt-2">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section - Modern Premium Grid */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8 xl:px-12 bg-gradient-to-br from-transparent via-indigo-50/15 to-transparent">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-5xl font-bold text-premium-heading sm:text-6xl leading-tight">
              Healthcare Made Simple
            </h2>
            <div className="mx-auto mb-6 h-1.5 w-24 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full" />
            <p className="text-lg text-slate-600">Comprehensive tools for modern healthcare delivery</p>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MessageCircle,
                title: copy.dashboard.featureOneTitle,
                desc: copy.dashboard.featureOneText,
                gradient: 'from-indigo-600 to-violet-700',
                bgGradient: 'from-indigo-50/60 to-violet-50/60',
                number: '01'
              },
              {
                icon: Calendar,
                title: copy.dashboard.featureTwoTitle,
                desc: copy.dashboard.featureTwoText,
                gradient: 'from-violet-600 to-pink-700',
                bgGradient: 'from-violet-50/60 to-pink-50/60',
                number: '02'
              },
              {
                icon: FileText,
                title: copy.dashboard.featureThreeTitle,
                desc: copy.dashboard.featureThreeText,
                gradient: 'from-pink-600 to-indigo-700',
                bgGradient: 'from-pink-50/60 to-indigo-50/60',
                number: '03'
              },
              {
                icon: Heart,
                title: 'Health Monitoring',
                desc: 'Real-time vitals tracking and instant alerts',
                gradient: 'from-indigo-600 to-emerald-700',
                bgGradient: 'from-indigo-50/60 to-emerald-50/60',
                number: '04'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                desc: 'End-to-end encrypted medical records',
                gradient: 'from-violet-700 to-indigo-700',
                bgGradient: 'from-violet-50/60 to-indigo-50/60',
                number: '05'
              },
              {
                icon: Award,
                title: 'Certified Doctors',
                desc: 'Verified medical professionals available',
                gradient: 'from-pink-600 to-violet-700',
                bgGradient: 'from-pink-50/60 to-violet-50/60',
                number: '06'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="card-premium animate-float-up" style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-50 transition duration-300 rounded-xl`} />

                  <div className="absolute top-8 right-8 text-5xl font-bold opacity-5 group-hover:opacity-8 transition text-slate-900">
                    {feature.number}
                  </div>

                  <div className="relative">
                    <div className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} p-3 shadow-lg mb-6 group-hover:scale-110 transition duration-300`}>
                      <Icon size={28} className="text-white" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-slate-900">{feature.title}</h3>
                    <p className="text-slate-600 text-base leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Flow - Modern Premium Timeline */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8 xl:px-12 bg-gradient-to-br from-transparent via-violet-50/15 to-transparent">
        <div className="mx-auto max-w-5xl">
          <div className="mb-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-100/60 via-violet-100/60 to-pink-100/60 px-5 py-2.5 mb-6 backdrop-blur-md border border-indigo-200/50">
              <Zap size={18} className="text-indigo-700" />
              <span className="text-sm font-bold text-indigo-800">{copy.dashboard.flowTag}</span>
            </div>
            <h2 className="mb-6 text-5xl font-bold text-premium-heading">
              {copy.dashboard.flowLabel}
            </h2>
            <div className="mx-auto mb-6 h-1.5 w-24 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full" />
            <p className="text-lg text-slate-600">{copy.dashboard.flowTitle}</p>
          </div>

          {/* Timeline Steps - Professional */}
          <div className="space-y-5">
            {copy.dashboard.flowSteps.map((step, index) => {
              const colors = [
                { step: 'from-teal-600 to-blue-700', line: 'from-teal-400/50' },
                { step: 'from-blue-600 to-cyan-700', line: 'from-blue-400/50' },
                { step: 'from-cyan-600 to-teal-700', line: 'from-cyan-400/50' },
                { step: 'from-teal-700 to-blue-800', line: 'from-teal-400/50' }
              ];
              const color = colors[index % colors.length];
              return (
                <div
                  key={step}
                  className="card-premium animate-float-up" style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-6">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color.step} text-sm font-bold text-white shadow-lg group-hover:scale-110 transition duration-300`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-lg font-semibold text-slate-900 leading-relaxed">{step}</p>
                    </div>
                    <CheckCircle2 size={24} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition duration-300 flex-shrink-0 mt-1 stroke-2" />
                  </div>

                  {index < copy.dashboard.flowSteps.length - 1 && (
                    <div className={`absolute left-6 top-full h-5 w-0.5 bg-gradient-to-b ${color.line} to-transparent`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modern Medical Info Cards */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8 xl:px-12 bg-gradient-to-br from-transparent via-indigo-50/15 to-transparent">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2">
            {/* Emergency Card */}
            <div className="group relative rounded-3xl border border-red-300/40 bg-gradient-to-br from-red-50/60 to-orange-50/40 p-12 backdrop-blur-md transition duration-300 hover:border-red-400/50 hover:bg-gradient-to-br hover:from-red-50/80 hover:to-orange-50/60 hover:shadow-xl overflow-hidden animate-fade-in-scale">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/3 to-orange-600/3 rounded-3xl" />
              <div className="relative">
                <div className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-600 p-4 shadow-lg mb-6 group-hover:scale-110 transition duration-300">
                  <Siren size={32} className="text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-red-900">{copy.dashboard.emergencyTitle}</h3>
                <p className="text-red-800 text-base leading-relaxed mb-6">{copy.dashboard.emergencyText}</p>
                <div className="flex items-center gap-3 text-sm font-bold text-red-700">
                  <Zap size={18} />
                  Available 24/7 Worldwide
                </div>
              </div>
            </div>

            {/* Records Card */}
            <div className="group relative rounded-3xl border border-indigo-300/40 bg-gradient-to-br from-indigo-50/60 to-violet-50/40 p-12 backdrop-blur-md transition duration-300 hover:border-indigo-400/50 hover:bg-gradient-to-br hover:from-indigo-50/80 hover:to-violet-50/60 hover:shadow-xl overflow-hidden animate-fade-in-scale" style={{ animationDelay: '100ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/3 to-violet-600/3 rounded-3xl" />
              <div className="relative">
                <div className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 p-4 shadow-lg mb-6 group-hover:scale-110 transition duration-300">
                  <Stethoscope size={32} className="text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-indigo-900">{copy.dashboard.recordsTitle}</h3>
                <p className="text-indigo-800 text-base leading-relaxed mb-6">{copy.dashboard.recordsText}</p>
                <div className="flex items-center gap-3 text-sm font-bold text-indigo-700">
                  <Lock size={18} />
                  HIPAA Compliant & Encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Trust Section */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8 xl:px-12 bg-gradient-to-br from-transparent via-pink-50/15 to-transparent">
        <div className="mx-auto max-w-5xl">
          <div className="card-premium-lg p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/3 via-violet-600/3 to-pink-600/3 rounded-3xl" />
            <div className="relative">
              <h2 className="mb-6 text-center text-5xl font-bold text-premium-heading">
                Trusted by Healthcare Professionals
              </h2>
              <p className="text-center text-lg text-slate-700 mb-14 font-medium">Used by 500+ clinics serving millions of patients</p>

              <div className="grid gap-10 sm:grid-cols-3">
                {[
                  { value: '2.5K+', label: 'Active Patients', icon: Users, gradient: 'from-indigo-600 to-violet-700' },
                  { value: '500+', label: 'Partner Clinics', icon: Award, gradient: 'from-violet-600 to-pink-700' },
                  { value: '98%', label: 'Patient Satisfaction', icon: TrendingUp, gradient: 'from-pink-600 to-indigo-700' }
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={idx} className="text-center group animate-float-up" style={{ animationDelay: `${idx * 100}ms` }}>
                      <div className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} p-4 mb-6 group-hover:scale-110 transition duration-300 shadow-lg`}>
                        <ItemIcon size={32} className="text-white" />
                      </div>
                      <p className={`text-4xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-2`}>{item.value}</p>
                      <p className="text-sm font-medium text-slate-600">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Final CTA Section */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8 xl:px-12 bg-gradient-to-br from-transparent via-indigo-50/15 to-transparent">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50/60 via-violet-50/40 to-pink-50/30 p-16 backdrop-blur-md text-center relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/3 via-violet-600/3 to-pink-600/3 rounded-3xl" />
            <div className="relative">
              <h3 className="mb-8 text-4xl font-bold text-premium-heading sm:text-5xl">
                Ready to Transform Healthcare?
              </h3>
              <p className="mb-12 text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
                Join thousands of healthcare professionals using MEDVISION to deliver better patient care every day.
              </p>

              <button
                onClick={() => navigate('/patient')}
                className="btn-premium-primary"
              >
                <span className="relative flex items-center gap-2">
                  Get Started Now
                  <ArrowRight size={20} className="transition duration-300 group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

Dashboard.propTypes = {
  copy: PropTypes.shape({
    dashboard: PropTypes.shape({
      badge: PropTypes.string.isRequired,
      heroTitle: PropTypes.string.isRequired,
      heroSubtitle: PropTypes.string.isRequired,
      startDemo: PropTypes.string.isRequired,
      seeFeatures: PropTypes.string.isRequired,
      featureOneTitle: PropTypes.string.isRequired,
      featureOneText: PropTypes.string.isRequired,
      featureTwoTitle: PropTypes.string.isRequired,
      featureTwoText: PropTypes.string.isRequired,
      featureThreeTitle: PropTypes.string.isRequired,
      featureThreeText: PropTypes.string.isRequired,
      flowLabel: PropTypes.string.isRequired,
      flowTag: PropTypes.string.isRequired,
      flowTitle: PropTypes.string.isRequired,
      flowSteps: PropTypes.arrayOf(PropTypes.string).isRequired,
      emergencyTitle: PropTypes.string.isRequired,
      emergencyText: PropTypes.string.isRequired,
      recordsTitle: PropTypes.string.isRequired,
      recordsText: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default Dashboard;