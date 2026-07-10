import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import { useFirebaseOtp } from '../hooks/useFirebaseOtp';

// Inline SVGs representing lucide-react icons for zero-dependency builds
const UserIcon = (props) => (
  <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const CheckCircleIcon = (props) => (
  <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const HelpCircleIcon = (props) => (
  <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const UploadCloudIcon = (props) => (
  <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);
const ShieldIcon = (props) => (
  <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const CheckIcon = (props) => (
  <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);
const MailIcon = (props) => (
  <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const PhoneIcon = (props) => (
  <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 00.957.725H14a1 1 0 01.957.725l.548 2.2a1 1 0 00.94.725H20a2 2 0 012 2v3a2 2 0 01-2 2h-3.28a1 1 0 01-.94-.725l-.548-2.2a1 1 0 00-.957-.725H10a1 1 0 00-.957.725l-.548 2.2a1 1 0 00-.94.725H4a2 2 0 01-2-2V5z" />
  </svg>
);
const ArrowRightIcon = (props) => (
  <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default function VerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [agreement, setAgreement] = useState(true);
  const [emailReadOnly, setEmailReadOnly] = useState(false);
  const [phoneReadOnly, setPhoneReadOnly] = useState(false);

  // ID Upload State
  const [idType, setIdType] = useState('driver_license');
  const [idFile, setIdFile] = useState(null);
  const [idFileName, setIdFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Email OTP State
  const [emailSent, setEmailSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailTimer, setEmailTimer] = useState(0);

  const {
    phoneSent, 
    phoneOtp, 
    phoneVerified, 
    phoneError, 
    phoneTimer, 
    verifying, 
    sending, 
    setPhoneOtp,
    handleSendPhoneOtp, 
    handleVerifyPhoneOtp, 
    handleResendPhoneOtp
  } = useFirebaseOtp();

  // Auth and profile initialization
  useEffect(() => {
    async function init() {
      const urlToken = searchParams.get('authToken');
      if (urlToken) {
        localStorage.setItem('customer_token', urlToken);
      }
      
      const token = localStorage.getItem('customer_token');
      if (!token) {
        setLoading(false);
        navigate('/login');
        return;
      }
      
      try {
        const userRes = await apiClient.get('/customer/me');
        const userData = userRes.data?.data || userRes.data;
        setUser(userData);

        // Always prefill from userData first
        const emailVal = userData?.email || '';
        setEmailInput(emailVal);
        if (emailVal) {
          setEmailReadOnly(true);
        }

        const phoneVal = userData?.phone || userData?.mobile_number || '';
        setPhoneInput(phoneVal);
        if (phoneVal) {
          setPhoneReadOnly(true);
        }

        if (userData?.first_name) {
          setFirstName(userData.first_name);
        }
        if (userData?.last_name) {
          setLastName(userData.last_name);
        }
        
        // Load progress
        const res = await apiClient.get('/verification/progress');
        const progressData = res.data?.data || res.data;
        if (progressData) {
          const vData = progressData.verification_data || {};
          if (vData.first_name) setFirstName(vData.first_name);
          if (vData.last_name) setLastName(vData.last_name);
          if (vData.dob) setDob(vData.dob);
          if (vData.gender) setGender(vData.gender);
          if (vData.email) {
            setEmailInput(vData.email);
            setEmailReadOnly(true);
          }
          if (vData.phone) {
            setPhoneInput(vData.phone);
            setPhoneReadOnly(true);
          }
          
          if (progressData.document_type) {
            setIdType(progressData.document_type);
          }
          if (progressData.has_document) {
            setIdFileName('government_id_document');
          }
          
          // Check if already verified
          if (progressData.status === 'verified' || userData.verification_status === 'verified') {
            const cachedProfile = JSON.parse(localStorage.getItem('customer_profile') || '{}');
            cachedProfile.verification_status = 'verified';
            localStorage.setItem('customer_profile', JSON.stringify(cachedProfile));
            setLoading(false);
            navigate('/dashboard', { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          localStorage.removeItem('customer_token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [searchParams, navigate]);

  // Handle countdown timers
  useEffect(() => {
    let emailInterval;
    if (emailTimer > 0) {
      emailInterval = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
    }
    return () => {
      clearInterval(emailInterval);
    };
  }, [emailTimer]);

  // Handle file selection and upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!idType) {
      alert('Please select an ID type first.');
      return;
    }

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    // Check type: PNG, JPG, PDF
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file format. Only PNG, JPG, and PDF are accepted.');
      return;
    }

    setIdFile(file);
    setIdFileName(file.name);
    setUploading(true);
    setUploadProgress(30);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', idType);
      formData.append('document', file);
      formData.append('type', idType);

      await apiClient.post('/verification/document/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(Math.min(95, percent));
        }
      });
      setUploadProgress(100);
      alert('Document uploaded successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload document.');
      setIdFileName('');
      setIdFile(null);
    } finally {
      setUploading(false);
    }
  };

  // Handle Send Email OTP
  const handleSendEmailOtp = async () => {
    setEmailError('');
    if (!emailInput.trim()) {
      setEmailError('Please enter your email address.');
      return;
    }

    try {
      const payload = {
        type: 'email',
        email: emailInput.trim(),
        method: 'email',
      };
      await apiClient.post('/verification/otp/send', payload);
      setEmailSent(true);
      setEmailTimer(45);
      alert('Verification code sent to your email.');
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Failed to send email OTP.');
    }
  };

  // Handle Verify Email OTP
  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      alert('Please enter a 6-digit code.');
      return;
    }

    try {
      const payload = {
        code: emailOtp,
        otp: emailOtp,
        email: emailInput.trim(),
      };
      const res = await apiClient.post('/verification/otp/verify', payload);
      if (res.data?.success || res.status === 200) {
        setEmailVerified(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Email verification failed.');
    }
  };



  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !dob || !gender || !emailInput || !phoneInput) {
      alert('Please fill out all required fields.');
      return;
    }
    if (!idFileName) {
      alert('Please upload a copy of your identification document.');
      return;
    }
    if (!emailVerified) {
      alert('Please complete the Email verification step.');
      return;
    }
    if (!phoneVerified) {
      alert('Please complete the WhatsApp verification step.');
      return;
    }
    if (!agreement) {
      alert('You must confirm the legal agreement checkbox.');
      return;
    }

    setSubmitting(true);
    try {
      const finalData = {
        first_name: firstName,
        last_name: lastName,
        dob,
        gender,
        email: emailInput,
        phone: phoneInput,
      };

      // Save complete progress step 6 to trigger verified flag
      const res = await apiClient.post('/verification/progress', {
        step: 6,
        data: finalData
      });
      if (res.data?.success || res.success || res.status === 200) {
        // Update local storage customer profile cache
        const cachedProfile = JSON.parse(localStorage.getItem('customer_profile') || '{}');
        cachedProfile.verification_status = 'verified';
        localStorage.setItem('customer_profile', JSON.stringify(cachedProfile));

        // Dispatch storage event to sync sidebar immediately
        setTimeout(() => {
          window.dispatchEvent(new StorageEvent('storage', { key: 'customer_profile' }));
        }, 50);

        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit verification details.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCompletionPercentage = () => {
    let pct = 0;
    if (firstName && lastName && dob && gender) pct += 25;
    if (idFileName) pct += 25;
    if (emailVerified) pct += 25;
    if (phoneVerified) pct += 25;
    return pct;
  };

  const percentComplete = getCompletionPercentage();

  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.first_name && user?.last_name) return `${user.first_name} ${user.last_name}`;
    return 'New Customer';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d1b2a]"></div>
      </div>
    );
  }

  // Sidebar Steps
  const sidebarSteps = [
    { num: 1, title: 'Personal Info', desc: 'Legal name & details', done: !!(firstName && lastName && dob && gender) },
    { num: 2, title: 'Identity Verification', desc: 'Government-issued ID', done: !!idFileName },
    { num: 3, title: 'Contact Verification', desc: 'Email & WhatsApp checks', done: !!(emailVerified && phoneVerified) },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col font-sans text-slate-800 antialiased">
      {/* Brand Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="https://trakjobs.com" className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity">
            <span className="w-10 h-10 rounded-xl bg-[#0d1b2a] text-[#ffb800] flex items-center justify-center text-xl font-black shadow-md">T</span>
            <div>
              <span className="text-xl font-extrabold text-[#0d1b2a] tracking-tight">Trak<span className="text-[#ffb800]">Jobs</span></span>
              <span className="hidden sm:inline-block ml-3 px-2.5 py-1 bg-slate-100 text-[#0d1b2a] text-[10px] font-bold rounded-md uppercase tracking-wider">Verification Center</span>
            </div>
          </a>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-150">
            <ShieldIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider">End-to-end encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sticky Left Sidebar */}
          <aside className="lg:col-span-1 bg-[#0d1b2a] text-white rounded-3xl p-6 h-fit lg:sticky lg:top-28 shadow-xl flex flex-col justify-between">
            <div>
              {/* Profile Card */}
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 mb-8">
                <div className="w-10 h-10 rounded-full bg-[#ffb800] text-[#0d1b2a] flex items-center justify-center shrink-0 font-bold shadow-inner">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-extrabold text-sm truncate">{getDisplayName()}</p>
                  <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider">Verification profile</p>
                </div>
              </div>

              {/* Steps Progress */}
              <nav className="space-y-6">
                {sidebarSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 relative">
                    {/* Line Connector */}
                    {idx < sidebarSteps.length - 1 && (
                      <div className={`absolute left-4 top-8 w-0.5 h-10 -ml-[1px] ${step.done ? 'bg-[#ffb800]' : 'bg-white/15'}`} />
                    )}

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                      step.done 
                        ? 'bg-[#ffb800] text-[#0d1b2a] font-black' 
                        : 'bg-white/5 border border-white/20 text-white/50 font-bold'
                    } text-sm`}>
                      {step.done ? <CheckIcon className="w-4 h-4 animate-pulse" strokeWidth={3} /> : step.num}
                    </div>

                    <div>
                      <p className={`font-bold text-sm ${step.done ? 'text-white/90' : 'text-white/40'}`}>
                        {step.title}
                      </p>
                      <p className="text-[10px] text-white/30">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Support Box */}
            <div className="mt-12 pt-6 border-t border-white/10 bg-black/10 -mx-6 -mb-6 p-6 rounded-b-3xl">
              <div className="flex items-center gap-2 text-[#ffb800] mb-2">
                <HelpCircleIcon className="w-4 h-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Support assistance</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed mb-3">Need help completing verification? Get in touch.</p>
              <a href="mailto:support@trakjobs.com" className="text-white text-xs font-bold block hover:underline hover:text-[#ffb800] transition-all">support@trakjobs.com</a>
              <p className="text-white/70 text-xs mt-1 font-semibold">(972) 555-0199</p>
            </div>
          </aside>

          {/* Right Content Form Column */}
          <main className="lg:col-span-3 space-y-8">
            
            {/* Completion Percentage Progress Bar */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-[#0d1b2a] uppercase tracking-wider">Verification Completion</span>
                <span className="text-xs font-black text-[#ffb800]">{percentComplete}% Complete</span>
              </div>
              <div className="h-3 w-full bg-[#f0f2f5] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ffb800] transition-all duration-700 ease-out rounded-full" 
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>

            {/* Main Form Box */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Header Title Banner */}
              <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0d1b2a] text-[#ffb800] flex items-center justify-center shadow-md">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#0d1b2a]">Personal Information</h2>
                  <p className="text-xs text-slate-500">Provide legal information exactly as printed on your government-issued ID.</p>
                </div>
              </div>

              {/* Form Content padding */}
              <div className="p-8 space-y-8">
                
                {/* 2-Column Grid for Personal Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0d1b2a] tracking-wide uppercase">First Name <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. John" 
                      className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ffb800] focus:border-transparent text-sm transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0d1b2a] tracking-wide uppercase">Last Name <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Doe" 
                      className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ffb800] focus:border-transparent text-sm transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0d1b2a] tracking-wide uppercase">Date of Birth <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      type="date" 
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ffb800] focus:border-transparent text-sm transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0d1b2a] tracking-wide uppercase">Gender <span className="text-red-500">*</span></label>
                    <select 
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ffb800] focus:border-transparent text-sm transition-all shadow-sm bg-white"
                    >
                      <option value="" disabled>Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Email & Phone fields with Verified state indicator */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0d1b2a] tracking-wide uppercase">Registered Email Address</label>
                    <div className="relative">
                      <input 
                        disabled={emailReadOnly}
                        type="email" 
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className={`w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 text-sm shadow-inner ${
                          emailReadOnly ? 'bg-slate-50 text-slate-400' : 'bg-white text-slate-800'
                        }`}
                      />
                      {emailVerified && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center">
                          <CheckCircleIcon className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0d1b2a] tracking-wide uppercase">Registered WhatsApp Mobile</label>
                    <div className="relative">
                      <input 
                        disabled={phoneReadOnly}
                        type="tel" 
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className={`w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 text-sm shadow-inner ${
                          phoneReadOnly ? 'bg-slate-50 text-slate-400' : 'bg-white text-slate-800'
                        }`}
                        placeholder="Enter mobile number"
                      />
                      {phoneVerified && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 flex items-center">
                          <CheckCircleIcon className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Identification Verification File Upload Section */}
                <div className="pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-black text-[#0d1b2a] uppercase tracking-wider mb-1">Government ID Verification</h4>
                  <p className="text-xs text-slate-500 mb-6">Select your primary identification type and upload a clear scan of the document front side.</p>
                  
                  {/* Select ID Type Button Choice Row */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {['driver_license', 'passport', 'national_id'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setIdType(type)}
                        className={`h-12 rounded-xl border text-xs font-black transition-all ${
                          idType === type 
                            ? 'border-[#0d1b2a] bg-[#0d1b2a]/5 text-[#0d1b2a] shadow-sm' 
                            : 'border-slate-300 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {type === 'driver_license' && "Driver's License"}
                        {type === 'passport' && 'Passport'}
                        {type === 'national_id' && 'National ID Card'}
                      </button>
                    ))}
                  </div>

                  {/* Spacious Upload Frame */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 border-2 border-dashed border-slate-300 rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-[#f8fafc] hover:bg-white hover:border-[#ffb800] transition-all cursor-pointer relative group min-h-[220px]">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileUpload} 
                      />
                      
                      {!idFileName && !uploading && (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-4 text-slate-400 group-hover:text-[#ffb800] transition-transform group-hover:scale-105 duration-200">
                            <UploadCloudIcon className="w-8 h-8" />
                          </div>
                          <p className="text-sm font-bold text-[#0d1b2a]">Choose File or Drag & Drop</p>
                          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">PNG, JPG or PDF formats (Maximum file limit 5MB)</p>
                        </div>
                      )}

                      {uploading && (
                        <div className="w-full max-w-xs">
                          <p className="text-xs font-bold text-[#0d1b2a] mb-2 flex items-center justify-between">
                            <span>Uploading document...</span>
                            <span>{uploadProgress}%</span>
                          </p>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#ffb800] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        </div>
                      )}

                      {idFileName && !uploading && (
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-4 text-emerald-500">
                            <CheckCircleIcon className="w-8 h-8" strokeWidth={2.5} />
                          </div>
                          <p className="text-sm font-extrabold text-[#0d1b2a]">{idFileName}</p>
                          <p className="text-xs text-emerald-600 font-semibold mt-1">Upload verified successfully. Click or drag to replace.</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#f2f4f6] border border-slate-200 rounded-3xl p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Accepted IDs</span>
                        <ul className="space-y-3">
                          <li className="flex items-center gap-2.5 text-xs font-extrabold text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> State Driver's License
                          </li>
                          <li className="flex items-center gap-2.5 text-xs font-extrabold text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Government Passport
                          </li>
                          <li className="flex items-center gap-2.5 text-xs font-extrabold text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> National Identity Card
                          </li>
                        </ul>
                      </div>
                      <div className="pt-4 border-t border-slate-300 flex items-start gap-2.5 mt-6">
                        <ShieldIcon className="w-5 h-5 text-slate-400 shrink-0" />
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Your identity files are fully protected and stored using private AES-256 standard encryption.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Verification Section */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h4 className="text-sm font-black text-[#0d1b2a] uppercase tracking-wider">Email Verification</h4>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md uppercase tracking-wider">Required</span>
                  </div>
                  
                  {emailVerified ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 w-fit animate-fadeIn">
                      <CheckCircleIcon className="w-4 h-4" /> 
                      <span>Email Verified Successfully</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500">We will send a 6-digit confirmation code to your email <span className="font-bold text-[#0d1b2a]">{emailInput}</span></p>
                      <div className="flex flex-wrap items-center gap-3">
                        {!emailSent ? (
                          <button
                            type="button"
                            onClick={handleSendEmailOtp}
                            className="h-11 px-6 bg-[#0d1b2a] hover:bg-[#1a2c3f] text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                          >
                            <MailIcon className="w-4 h-4" />
                            Send Email OTP
                          </button>
                        ) : (
                          <div className="flex flex-wrap items-center gap-3">
                            <input 
                              type="text" 
                              maxLength={6}
                              placeholder="6-Digit Code"
                              value={emailOtp}
                              onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                              className="w-40 h-11 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ffb800] focus:border-transparent text-center text-sm font-extrabold tracking-widest"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyEmailOtp}
                              className="h-11 px-6 bg-[#22c55e] hover:bg-[#1bb853] text-white text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer"
                            >
                              Verify Code
                            </button>
                            <button
                              type="button"
                              disabled={emailTimer > 0}
                              onClick={handleSendEmailOtp}
                              className="h-11 px-5 border border-slate-300 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-50 transition-all disabled:opacity-55 cursor-pointer"
                            >
                              {emailTimer > 0 ? `Resend (${emailTimer}s)` : 'Resend Code'}
                            </button>
                          </div>
                        )}
                      </div>
                      {emailError && <p className="text-xs text-red-500 font-semibold">{emailError}</p>}
                    </div>
                  )}
                </div>

                {/* SMS Verification Section */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h4 className="text-sm font-black text-[#0d1b2a] uppercase tracking-wider">SMS Verification</h4>
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md uppercase tracking-wider">Required</span>
                  </div>
                  
                  {phoneVerified ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 w-fit animate-fadeIn">
                      <CheckCircleIcon className="w-4 h-4" /> 
                      <span>Mobile Number Verified Successfully</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500">We will send a 6-digit confirmation code via SMS to <span className="font-bold text-[#0d1b2a]">{phoneInput}</span></p>
                      <div className="flex flex-wrap items-center gap-3">
                        {!phoneSent ? (
                          <button
                            type="button"
                            onClick={() => handleSendPhoneOtp(phoneInput)}
                            disabled={sending || !phoneInput}
                            className="h-11 px-6 bg-[#0d1b2a] hover:bg-[#1a2c3f] text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-55"
                          >
                            {sending ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <PhoneIcon className="w-4 h-4" />
                                Send SMS OTP
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="flex flex-wrap items-center gap-3">
                            <input 
                              type="text" 
                              maxLength={6}
                              placeholder="6-Digit Code"
                              value={phoneOtp}
                              onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                              disabled={verifying}
                              className="w-40 h-11 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#ffb800] focus:border-transparent text-center text-sm font-extrabold tracking-widest disabled:bg-slate-100"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyPhoneOtp}
                              disabled={verifying || phoneOtp.length < 6}
                              className="h-11 px-6 bg-[#22c55e] hover:bg-[#1bb853] text-white text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {verifying ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                'Verify Code'
                              )}
                            </button>
                            <button
                              type="button"
                              disabled={phoneTimer > 0 || verifying}
                              onClick={() => handleResendPhoneOtp(phoneInput)}
                              className="h-11 px-5 border border-slate-300 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-50 transition-all disabled:opacity-55 cursor-pointer disabled:cursor-not-allowed"
                            >
                              {phoneTimer > 0 ? `Resend (${phoneTimer}s)` : 'Resend Code'}
                            </button>
                          </div>
                        )}
                      </div>
                      {phoneError && <p className="text-xs text-red-500 font-semibold">{phoneError}</p>}
                    </div>
                  )}
                </div>

                {/* Hidden reCAPTCHA Container */}
                <div id="recaptcha-container-otp" className="hidden" />

                {/* Agreement Checkbox Card */}
                <div className="flex items-start gap-4 p-5 bg-[#f8fafc] rounded-2xl border border-slate-200">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={agreement}
                    onChange={(e) => setAgreement(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-[#0d1b2a] focus:ring-[#ffb800] mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
                    I confirm that all provided information is accurate and matches my legal documentation. I agree to the <a className="text-[#0d1b2a] font-bold hover:underline" href="#">Terms of Service</a> and <a className="text-[#0d1b2a] font-bold hover:underline" href="#">Privacy Policy</a>.
                  </label>
                </div>

                {/* Action Row buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-slate-200">
                  <button 
                    type="button"
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-10 h-14 rounded-2xl border border-slate-300 text-slate-600 font-extrabold hover:bg-slate-50 transition-all text-sm shadow-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:flex-1 h-14 bg-[#ffb800] hover:bg-[#e0a300] text-[#0d1b2a] rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-md text-sm cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Submitting Details...' : 'Save & Continue'}
                    <ArrowRightIcon className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </form>
          </main>

        </div>

        {/* Outer footer */}
        <footer className="mt-16 flex flex-col md:flex-row justify-between items-center px-4 gap-6 border-t border-slate-200 pt-8">
          <p className="text-xs text-slate-400 font-medium">© 2026 TrakJobs Professional Services. All rights reserved.</p>
          <div className="flex gap-8">
            <a className="text-xs text-slate-400 hover:text-[#0d1b2a] transition-colors font-bold uppercase tracking-widest" href="#">Help Center</a>
            <a className="text-xs text-slate-400 hover:text-[#0d1b2a] transition-colors font-bold uppercase tracking-widest" href="#">Privacy Policy</a>
            <a className="text-xs text-slate-400 hover:text-[#0d1b2a] transition-colors font-bold uppercase tracking-widest" href="#">Contact Us</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
