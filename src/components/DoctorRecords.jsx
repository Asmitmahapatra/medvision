import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Award, Briefcase, Calendar, Clock, Heart, MapPin, Phone, Mail, 
  Star, CheckCircle2, Zap, Shield, Users, TrendingUp, GraduationCap,
  Stethoscope, FileText, ArrowRight, Download, Share2, BookOpen, 
  ChevronDown, Search, Filter, MessageCircle, AlertCircle, Verified,
  ThumbsUp, Eye, Lock, LogIn, Smile
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';

const DoctorRecords = ({ authUser = null }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');

  // Sample doctor data with enhanced patient-focused information
  const doctors = [
    {
      id: 1,
      name: 'Dr. Rajesh Kumar',
      specialty: 'Cardiology',
      experience: '12 years',
      rating: 4.9,
      reviews: 342,
      badge: 'Top Rated',
      qualifications: ['MD - Cardiology', 'MRCP', 'Fellowship in Interventional Cardiology'],
      location: 'Delhi Medical Center, New Delhi',
      phone: '+91 98765 43210',
      email: 'dr.rajesh@medvision.com',
      consultationFee: '₹500',
      availability: 'Mon-Fri, 10:00 AM - 6:00 PM',
      languages: ['English', 'Hindi'],
      registrationNo: 'MCI/MC-2012/45678',
      registrationYear: '2012',
      patients: '1200+',
      successRate: '98%',
      image: 'https://i.pravatar.cc/150?img=1',
      bio: 'Experienced cardiologist with specialization in interventional procedures and heart disease management.',
      services: [
        'General Cardiology Consultation',
        'ECG & Echocardiography',
        'Stress Testing',
        'Cardiac Rehabilitation'
      ],
      credentials: [
        { title: 'MD Cardiology', issuer: 'AIIMS Delhi', year: '2012' },
        { title: 'MRCP', issuer: 'Royal College of Physicians', year: '2014' },
        { title: 'Fellowship Interventional Cardiology', issuer: 'Apollo Hospitals', year: '2016' }
      ],
      testimonials: [
        { patient: 'Rajesh M.', rating: 5, text: 'Excellent care and very professional. Highly recommended!' },
        { patient: 'Priya S.', rating: 5, text: 'Dr. Kumar explained everything clearly. Very patient and caring.' }
      ],
      responseTime: '< 2 mins',
      nextAvailable: 'Today, 2:00 PM',
      verified: true,
      awards: ['Best Cardiologist 2023', 'Patient Choice Award', 'Excellence in Care']
    },
    {
      id: 2,
      name: 'Dr. Priya Sharma',
      specialty: 'Pediatrics',
      experience: '8 years',
      rating: 4.8,
      reviews: 267,
      badge: 'Most Trusted',
      qualifications: ['MBBS', 'MD - Pediatrics', 'Diploma in Child Health'],
      location: 'Rainbow Kids Hospital, Mumbai',
      phone: '+91 98765 43211',
      email: 'dr.priya@medvision.com',
      consultationFee: '₹400',
      availability: 'Mon-Sat, 2:00 PM - 8:00 PM',
      languages: ['English', 'Hindi', 'Marathi'],
      registrationNo: 'MCI/MC-2016/34567',
      registrationYear: '2016',
      patients: '850+',
      successRate: '99%',
      image: 'https://i.pravatar.cc/150?img=2',
      bio: 'Compassionate pediatrician dedicated to child health and developmental care.',
      services: [
        'General Pediatric Care',
        'Vaccination Guidance',
        'Developmental Assessment',
        'Allergy Management'
      ],
      credentials: [
        { title: 'MBBS', issuer: 'University of Mumbai', year: '2016' },
        { title: 'MD Pediatrics', issuer: 'University of Mumbai', year: '2019' },
        { title: 'Diploma in Child Health', issuer: 'Royal College', year: '2020' }
      ],
      testimonials: [
        { patient: 'Anjali K.', rating: 5, text: 'My children love visiting Dr. Priya. Very gentle and understanding!' },
        { patient: 'Vikram P.', rating: 5, text: 'Best pediatrician we found. Always available and helpful.' }
      ],
      responseTime: '< 1 min',
      nextAvailable: 'Today, 4:30 PM',
      verified: true,
      awards: ['Pediatrician of the Year 2023', 'Compassionate Care Award']
    },
    {
      id: 3,
      name: 'Dr. Amit Patel',
      specialty: 'Orthopedics',
      experience: '10 years',
      rating: 4.7,
      reviews: 298,
      badge: 'Highly Experienced',
      qualifications: ['MBBS', 'MS Orthopedics', 'Fellowship Sports Medicine'],
      location: 'Joint Care Center, Bangalore',
      phone: '+91 98765 43212',
      email: 'dr.amit@medvision.com',
      consultationFee: '₹450',
      availability: 'Tue-Sat, 3:00 PM - 7:00 PM',
      languages: ['English', 'Hindi', 'Gujarati'],
      registrationNo: 'MCI/MC-2014/23456',
      registrationYear: '2014',
      patients: '950+',
      successRate: '97%',
      image: 'https://i.pravatar.cc/150?img=3',
      bio: 'Expert orthopedic surgeon specializing in joint care and sports medicine.',
      services: [
        'Joint Consultation',
        'Sports Injury Management',
        'Orthopedic Surgery',
        'Physical Rehabilitation'
      ],
      credentials: [
        { title: 'MBBS', issuer: 'Bangalore Medical College', year: '2014' },
        { title: 'MS Orthopedics', issuer: 'Bangalore Medical College', year: '2017' },
        { title: 'Fellowship Sports Medicine', issuer: 'AIOS', year: '2019' }
      ],
      testimonials: [
        { patient: 'Rohan D.', rating: 5, text: 'Recovered from my injury in record time thanks to Dr. Amit!' },
        { patient: 'Neha S.', rating: 4.5, text: 'Professional, knowledgeable, and very caring about patient recovery.' }
      ],
      responseTime: '< 3 mins',
      nextAvailable: 'Tomorrow, 3:00 PM',
      verified: true,
      awards: ['Best Orthopedic Surgeon 2023', 'Sports Medicine Excellence']
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'All' || doctor.specialty === specialtyFilter;
    const matchesRating = ratingFilter === 'All' || doctor.rating >= parseFloat(ratingFilter);
    return matchesSearch && matchesSpecialty && matchesRating;
  });

  const specialties = ['All', ...new Set(doctors.map(d => d.specialty))];

  const DoctorDetailView = ({ doctor }) => (
    <div className="space-y-8">
      {/* Doctor Header Card with Premium Look */}
      <div className="rounded-2xl border-2 border-indigo-200/70 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 p-8 backdrop-blur-md overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-violet-600/5" />
        <div className="relative">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="relative">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="h-40 w-40 rounded-2xl border-4 border-white shadow-xl object-cover"
              />
              {doctor.verified && (
                <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                  <CheckCircle2 size={14} />
                  Verified
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-4xl font-bold text-slate-900">{doctor.name}</h2>
                    {doctor.badge && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1.5 text-xs font-bold text-amber-800 border border-amber-200">
                        <Star size={12} className="fill-amber-600" />
                        {doctor.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl text-indigo-600 font-bold mb-3">{doctor.specialty}</p>
                </div>
              </div>

              {/* Rating Section */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-indigo-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold text-slate-900">{doctor.rating}</span>
                  </div>
                  <p className="text-xs text-slate-600">{doctor.reviews} reviews</p>
                </div>
                <div className="text-center border-l border-r border-indigo-200">
                  <p className="text-2xl font-bold text-indigo-600">{doctor.experience}</p>
                  <p className="text-xs text-slate-600">Experience</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{doctor.successRate}</p>
                  <p className="text-xs text-slate-600">Success Rate</p>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed mb-3">{doctor.bio}</p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-slate-700 bg-white/50 px-3 py-2 rounded-lg">
                  <Clock size={16} className="text-indigo-600" />
                  <span className="text-sm font-medium">Response: {doctor.responseTime}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 bg-white/50 px-3 py-2 rounded-lg">
                  <Calendar size={16} className="text-indigo-600" />
                  <span className="text-sm font-medium">Available: {doctor.nextAvailable}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      {doctor.testimonials && doctor.testimonials.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ThumbsUp size={24} className="text-indigo-600" />
            Patient Reviews
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {doctor.testimonials.map((testimonial, idx) => (
              <div key={idx} className="rounded-xl border border-indigo-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-3 italic">"{testimonial.text}"</p>
                <p className="text-sm font-semibold text-slate-600">— {testimonial.patient}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Awards Section */}
      {doctor.awards && doctor.awards.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award size={24} className="text-indigo-600" />
            Awards & Recognition
          </h3>
          <div className="grid gap-3">
            {doctor.awards.map((award, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
                  <Award size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{award}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact & Consultation Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Phone size={20} className="text-indigo-600" />
            Contact Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Phone</p>
              <p className="text-slate-900 font-medium">{doctor.phone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Email</p>
              <p className="text-slate-900 font-medium break-all">{doctor.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Location</p>
              <p className="text-slate-900 font-medium flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-indigo-600" />
                {doctor.location}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-600" />
            Consultation Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Consultation Fee</p>
              <p className="text-2xl font-bold text-indigo-600">{doctor.consultationFee}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Availability</p>
              <p className="text-slate-900 font-medium flex items-center gap-2">
                <Clock size={16} className="text-indigo-600" />
                {doctor.availability}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Languages</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {doctor.languages.map((lang, idx) => (
                  <span key={idx} className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Stethoscope size={20} className="text-indigo-600" />
          Services Offered
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          {doctor.services.map((service, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
              <CheckCircle2 size={18} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-900 font-medium">{service}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Credentials */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Award size={20} className="text-indigo-600" />
          Professional Credentials
        </h3>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-700">Registration Number</span>
              <span className="text-indigo-600 font-bold">{doctor.registrationNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Registration Year</span>
              <span className="text-slate-900 font-medium">{doctor.registrationYear}</span>
            </div>
          </div>

          {doctor.credentials.map((cred, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap size={18} className="text-indigo-600" />
                  {cred.title}
                </h4>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">{cred.year}</span>
              </div>
              <p className="text-sm text-slate-700">Issued by <span className="font-semibold">{cred.issuer}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => navigate('/patient/book-appointment')}
          className="flex-1 group relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-violet-700 px-6 py-3 font-semibold text-white shadow-lg transition duration-300 hover:shadow-xl hover:scale-105">
          <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition duration-300" />
          <span className="relative flex items-center justify-center gap-2">
            <Calendar size={18} />
            Book Appointment
          </span>
        </button>
        <button 
          onClick={() => {
            alert(`Message with ${doctor.name} - Coming soon!\n\nDoctor Phone: ${doctor.phone}\nDoctor Email: ${doctor.email}`);
          }}
          className="flex-1 group relative overflow-hidden rounded-lg border-2 border-indigo-600 px-6 py-3 font-semibold text-indigo-600 transition duration-300 hover:bg-indigo-50">
          <span className="relative flex items-center justify-center gap-2">
            <MessageCircle size={18} />
            Send Message
          </span>
        </button>
        <button 
          onClick={() => {
            const profileUrl = `${window.location.origin}/doctors-directory`;
            navigator.clipboard.writeText(profileUrl).then(() => {
              alert(`Profile link copied to clipboard!\n${profileUrl}`);
            });
          }}
          className="flex-1 group relative overflow-hidden rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition duration-300 hover:bg-gray-50">
          <span className="relative flex items-center justify-center gap-2">
            <Share2 size={18} />
            Share Profile
          </span>
        </button>
      </div>
    </div>
  );

  const DoctorCard = ({ doctor }) => {
    const handleCardClick = () => {
      if (!authUser) {
        setSelectedDoctor(doctor);
      } else {
        setSelectedDoctor(doctor);
      }
    };

    return (
      <div
        onClick={handleCardClick}
        className={`group rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm transition duration-300 ${
          authUser 
            ? 'cursor-pointer hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1' 
            : 'cursor-pointer hover:shadow-lg'
        }`}
      >
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100">
          <img
            src={doctor.image}
            alt={doctor.name}
            className={`h-full w-full object-cover transition duration-300 ${authUser ? 'group-hover:scale-110' : ''}`}
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent transition duration-300 ${authUser ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`} />
          
          {/* Badge */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
              <Star size={12} className="fill-white" />
              {doctor.rating}
            </span>
          </div>

          {/* Verified Badge */}
          {doctor.verified && (
            <div className="absolute bottom-4 right-4">
              <div className="flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-green-600">
                <CheckCircle2 size={14} />
                Verified
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="mb-3">
            <h3 className={`text-xl font-bold text-slate-900 transition ${authUser ? 'group-hover:text-indigo-600' : ''}`}>{doctor.name}</h3>
            <p className="text-base text-indigo-600 font-semibold">{doctor.specialty}</p>
          </div>

          {/* Key Stats - Limited for non-authenticated users */}
          <div className="mb-5 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Briefcase size={14} className="text-indigo-600 flex-shrink-0" />
              <span>{doctor.experience}</span>
            </div>
            {authUser && (
              <>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users size={14} className="text-indigo-600 flex-shrink-0" />
                  <span>{doctor.patients} patients</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <TrendingUp size={14} className="text-indigo-600 flex-shrink-0" />
                  <span>{doctor.successRate} success rate</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock size={14} className="text-indigo-600 flex-shrink-0" />
                  <span>{doctor.responseTime} response time</span>
                </div>
              </>
            )}
          </div>

          {/* Rating Distribution */}
          <div className="mb-5 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">{doctor.reviews} Patient Reviews</span>
              <span className="text-yellow-600 font-bold">{doctor.rating}★</span>
            </div>
          </div>

          {authUser ? (
            <button className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-violet-700 px-4 py-3 font-semibold text-white transition duration-300 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 group/btn">
              <Eye size={16} className="group-hover/btn:translate-x-0.5 transition" />
              View Full Profile
              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition" />
            </button>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate('/signup');
              }}
              className="w-full rounded-lg border-2 border-indigo-600 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3 font-semibold text-indigo-700 transition duration-300 hover:bg-indigo-100 flex items-center justify-center gap-2">
              <Lock size={16} />
              Register to View More
            </button>
          )}
        </div>
      </div>
    );
  };

  if (selectedDoctor) {
    // Check if user is authenticated
    if (!authUser) {
      return (
        <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-violet-50/20 to-slate-50 flex items-center justify-center">
          <div className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <BackButton to="/doctors-directory" label="Back to Directory" />
              
              <div className="mt-8 rounded-2xl border-2 border-indigo-300 bg-gradient-to-br from-indigo-50/80 to-violet-50/60 p-12 text-center shadow-2xl">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 p-6">
                    <Lock size={48} className="text-white" />
                  </div>
                </div>
                
                <h2 className="mb-4 text-4xl font-bold text-slate-900">Registration Required</h2>
                <p className="mb-8 text-lg text-slate-700 leading-relaxed">
                  To view detailed doctor profiles, book appointments, and access full medical information, please create a free account first. It takes less than 2 minutes!
                </p>
                
                {/* Doctor Preview Card */}
                <div className="mb-10 rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={selectedDoctor.image}
                      alt={selectedDoctor.name}
                      className="h-20 w-20 rounded-full border-2 border-indigo-300 object-cover"
                    />
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-slate-900">{selectedDoctor.name}</h3>
                      <p className="text-indigo-600 font-semibold">{selectedDoctor.specialty}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-slate-900">{selectedDoctor.rating}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{selectedDoctor.bio}</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full group relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-violet-700 px-8 py-4 font-bold text-white shadow-lg transition duration-300 hover:shadow-xl hover:scale-105"
                  >
                    <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition duration-300" />
                    <span className="relative flex items-center justify-center gap-2">
                      <Smile size={20} />
                      Register as Patient
                      <ArrowRight size={20} />
                    </span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full rounded-lg border-2 border-indigo-600 px-8 py-4 font-bold text-indigo-600 transition duration-300 hover:bg-indigo-50"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <LogIn size={20} />
                      Already have an account? Login
                    </div>
                  </button>
                </div>
                
                <p className="mt-6 text-sm text-slate-600">
                  After registration, you'll have access to:
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                    <span>Book appointments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                    <span>View full profiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                    <span>Message doctors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                    <span>Save preferences</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-violet-50/20 to-slate-50">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <BackButton to="/doctors-directory" label="Back to Directory" />
            <div className="mt-6">
              <DoctorDetailView doctor={selectedDoctor} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-violet-50/20 to-slate-50">
      {/* Fixed Background Orbs */}
      <div className="fixed inset-0 -z-20 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-bl from-indigo-400/20 via-violet-300/15 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-violet-400/20 via-indigo-300/15 to-transparent blur-3xl" />
      </div>

      <div className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-12">
            <BackButton to="/" label="← Back to Home" />
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-700">
                  <Stethoscope size={24} className="text-white" />
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-slate-900">
                  Find Your Doctor
                </h1>
              </div>
              <p className="text-lg text-slate-700 max-w-3xl">
                Browse our network of certified, verified medical professionals. All our doctors are thoroughly vetted with authentic patient reviews and verified credentials.
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mb-12 grid gap-4 md:grid-cols-4">
            {[
              { icon: Shield, label: 'Verified Credentials', value: '100%' },
              { icon: Users, label: 'Patient Reviews', value: '500+' },
              { icon: Award, label: 'Expert Doctors', value: '50+' },
              { icon: Heart, label: 'Patient Satisfaction', value: '98%' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="rounded-lg border border-indigo-200/50 bg-white/70 backdrop-blur-sm p-4 text-center shadow-sm hover:shadow-md transition">
                  <Icon size={24} className="mx-auto mb-2 text-indigo-600" />
                  <p className="text-xl font-bold text-indigo-600 mb-1">{item.value}</p>
                  <p className="text-xs font-semibold text-slate-600">{item.label}</p>
                </div>
              );
            })}
          </div>

          {/* Registration Banner for Non-Authenticated Users */}
          {!authUser && (
            <div className="mb-12 rounded-2xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-100/80 via-violet-100/80 to-pink-100/80 p-8 shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Smile size={28} className="text-indigo-600" />
                    Unlock Full Doctor Profiles
                  </h3>
                  <p className="text-slate-700 mb-3">
                    Register as a patient to view complete doctor profiles, read patient testimonials, check availability, and book appointments instantly. It's free and takes less than 2 minutes!
                  </p>
                  <div className="flex gap-2">
                    <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-sm font-medium text-slate-700">See full credentials & experience</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-sm font-medium text-slate-700">Book appointments directly</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-sm font-medium text-slate-700">Message doctors & get responses</span>
                  </div>
                </div>
                <div className="flex gap-3 md:flex-col flex-shrink-0">
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-semibold transition duration-300 hover:shadow-lg hover:scale-105"
                  >
                    Register Now
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 rounded-lg border-2 border-indigo-600 text-indigo-600 font-semibold transition duration-300 hover:bg-indigo-50"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter Section */}
          <div className="mb-12 space-y-4">
            <div className="rounded-xl border border-indigo-200/50 bg-white/80 backdrop-blur-md p-6 shadow-lg">
              <div className="grid gap-4 md:grid-cols-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Search size={16} />
                    Search Doctor or Specialty
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Cardiology, Dr. Kumar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                  />
                </div>

                {/* Specialty Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Filter size={16} />
                    Specialty
                  </label>
                  <select
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                  >
                    {specialties.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Star size={16} />
                    Minimum Rating
                  </label>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
                  >
                    <option value="All">All Ratings</option>
                    <option value="4.5">4.5+ stars</option>
                    <option value="4.7">4.7+ stars</option>
                    <option value="4.9">4.9+ stars</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 text-sm text-slate-600 font-medium">
                Showing {filteredDoctors.length} of {doctors.length} doctors
              </div>
            </div>
          </div>

          {/* Doctors Grid */}
          {filteredDoctors.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 p-12 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-indigo-400" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No doctors found</h3>
              <p className="text-slate-600">Try adjusting your filters to see more results</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

DoctorRecords.propTypes = {
  authUser: PropTypes.shape({
    id: PropTypes.string,
    email: PropTypes.string,
    displayName: PropTypes.string,
    role: PropTypes.string
  })
};

export default DoctorRecords;
