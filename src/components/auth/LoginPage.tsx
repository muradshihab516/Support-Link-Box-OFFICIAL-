import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  KeyRound, 
  UserPlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Link as LinkIcon, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Upload, 
  Camera, 
  ExternalLink, 
  Clock, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { validateAndExtractFacebookId, normalizeFacebookName } from '../../utils/facebookIdentity';
import { NeonButterfly } from './NeonButterfly';

interface LoginPageProps {
  onSuccess?: () => void;
  onLoginSuccess?: () => void;
  onBrowseAsGuest?: () => void;
  onNavigate?: (view: string) => void;
  initialTab?: 'login' | 'register';
  isModal?: boolean;
  onClose?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onLoginSuccess,
  onBrowseAsGuest,
  onNavigate,
  initialTab = 'login',
  isModal = false,
  onClose
}) => {
  const handleSuccess = () => {
    if (onLoginSuccess) onLoginSuccess();
    if (onSuccess) onSuccess();
  };
  const { members, loginWithEmailAndPassword, registerMember, currentUser } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState(() => {
    try {
      return localStorage.getItem('slb_last_logged_email') || '';
    } catch {
      return '';
    }
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<{ message: string; isPending?: boolean } | null>(null);
  const [loginSuccess, setLoginSuccess] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Registration form state
  const [facebookName, setFacebookName] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarInputMode, setAvatarInputMode] = useState<'upload' | 'url'>('upload');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [regErrorMsg, setRegErrorMsg] = useState('');
  const [regSubmittedData, setRegSubmittedData] = useState<{ name: string; memberNumber?: number } | null>(null);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Facebook Profile Link Validation
  const fbValidation = useMemo(() => {
    if (!facebookUrl.trim()) return null;
    return validateAndExtractFacebookId(facebookUrl);
  }, [facebookUrl]);

  // Live Duplicate Check for Normalized FB ID
  const duplicateFbMember = useMemo(() => {
    if (!fbValidation?.isValid || !fbValidation.normalizedFbId) return null;
    return members.find(m => 
      m.normalizedFbId && m.normalizedFbId.toLowerCase() === fbValidation.normalizedFbId!.toLowerCase()
    );
  }, [fbValidation, members]);

  // Live Duplicate Check for Email
  const duplicateEmailMember = useMemo(() => {
    if (!regEmail.trim()) return null;
    return members.find(m => m.email.toLowerCase() === regEmail.trim().toLowerCase());
  }, [regEmail, members]);

  // Handle local image file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setRegErrorMsg('ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
        setRegErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess('');
    setIsSubmittingLogin(true);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError({ message: 'ইমেইল এবং পাসওয়ার্ড উভয়ই পূরণ করুন।' });
      setIsSubmittingLogin(false);
      return;
    }

    // Attempt login
    const res = loginWithEmailAndPassword(loginEmail.trim(), loginPassword.trim());
    setIsSubmittingLogin(false);

    if (res.success) {
      setLoginSuccess(res.message);
      if (rememberMe) {
        try {
          localStorage.setItem('slb_last_logged_email', loginEmail.trim());
        } catch {}
      }
      setTimeout(() => {
        handleSuccess();
        if (onClose) onClose();
      }, 900);
    } else {
      const isPending = res.message.includes('Pending Approval') || res.message.includes('এপ্রুভালের');
      setLoginError({ 
        message: res.message, 
        isPending 
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg('');
    setIsSubmittingReg(true);

    // 1. Real Facebook Name
    if (!facebookName.trim()) {
      setRegErrorMsg('ফেসবুকে হুবহু যে নাম আছে সেটি প্রদান করুন।');
      setIsSubmittingReg(false);
      return;
    }

    // 2. Real Facebook URL
    if (!facebookUrl.trim()) {
      setRegErrorMsg('ফেসবুক প্রোফাইল লিংক প্রদান করা বাধ্যতামূলক।');
      setIsSubmittingReg(false);
      return;
    }

    if (!fbValidation || !fbValidation.isValid) {
      setRegErrorMsg(fbValidation?.error || 'সঠিক ফেসবুক প্রোফাইল লিংক প্রদান করুন।');
      setIsSubmittingReg(false);
      return;
    }

    if (duplicateFbMember) {
      setRegErrorMsg(`এই ফেসবুক প্রোফাইল দিয়ে ইতিমধ্যে সদস্য #${duplicateFbMember.memberNumber} (${duplicateFbMember.name}) নিবন্ধিত আছে! একই ফেসবুক প্রোফাইল দিয়ে একাধিক অ্যাকাউন্ট খোলা সম্পূর্ণ নিষিদ্ধ।`);
      setIsSubmittingReg(false);
      return;
    }

    // 3. Email & Password
    if (!regEmail.trim()) {
      setRegErrorMsg('বৈধ ইমেইল ঠিকানা প্রদান করুন।');
      setIsSubmittingReg(false);
      return;
    }

    if (duplicateEmailMember) {
      setRegErrorMsg(`"${regEmail.trim()}" ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট নিবন্ধিত রয়েছে। অনুগ্রহ করে লগইন করুন।`);
      setIsSubmittingReg(false);
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setRegErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      setIsSubmittingReg(false);
      return;
    }

    // 4. Real Profile Picture (Check avatar)
    const finalAvatar = avatarPreview.trim() || avatarUrlInput.trim();
    if (!finalAvatar) {
      setRegErrorMsg('আপনার আসল প্রোফাইল ছবি আপলোড করা আবশ্যক (অ্যাডমিন ভেরিফিকেশনের জন্য প্রয়োজন)।');
      setIsSubmittingReg(false);
      return;
    }

    // Submit registration request (will be pending approval)
    const res = registerMember({
      name: facebookName.trim(),
      facebookName: facebookName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      facebookUrl: facebookUrl.trim(),
      avatar: finalAvatar
    });

    setIsSubmittingReg(false);

    if (res.success) {
      setRegSubmittedData({
        name: facebookName.trim(),
        memberNumber: res.member?.memberNumber
      });
      // Save last email
      try {
        localStorage.setItem('slb_last_logged_email', regEmail.trim());
      } catch {}
    } else {
      setRegErrorMsg(res.message);
    }
  };

  return (
    <div className={`relative w-full ${isModal ? 'p-2 sm:p-4' : 'min-h-screen py-8 px-4 flex flex-col items-center justify-center'}`}>
      
      {/* Ambient background glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[250px] bg-indigo-600/10 blur-[100px] rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[250px] bg-purple-600/10 blur-[110px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto">
        
        {/* ============================================================== */}
        {/* 3D NEON HEADER WITH ANIMATED NEON BUTTERFLY                    */}
        {/* ============================================================== */}
        <div className="text-center mb-6 sm:mb-8 relative flex flex-col items-center justify-center">
          
          {/* Butterfly 1: Gracefully hovering top-right of Support Link Box */}
          <div className="absolute -top-6 sm:-top-8 right-2 sm:right-8 z-20 pointer-events-none">
            <NeonButterfly 
              size={52} 
              variant="cyan" 
              flightDuration={3.6} 
              flutterSpeed={0.3} 
            />
          </div>

          {/* Butterfly 2: Smaller violet butterfly hovering on the left side */}
          <div className="absolute -top-3 sm:-top-4 left-4 sm:left-10 z-20 pointer-events-none hidden xs:block">
            <NeonButterfly 
              size={40} 
              variant="purple" 
              flightDuration={4.4} 
              flutterSpeed={0.34} 
              delay={0.8}
            />
          </div>

          {/* Glowing neon badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[11px] font-semibold tracking-wide uppercase shadow-[0_0_12px_rgba(6,182,212,0.3)] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>সাপোর্ট লিংক বক্স নেটওয়ার্ক</span>
          </div>

          {/* 3D NEON TEXT: "Support Link Box" */}
          <div className="relative inline-block my-1 px-4">
            <h1 
              id="neon-support-link-box-title"
              className="text-3xl sm:text-5xl font-extrabold tracking-wide text-white uppercase font-sans select-none neon-title-3d transition-all"
              style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                letterSpacing: '0.05em'
              }}
            >
              Support Link Box
            </h1>

            {/* Subtle neon light reflection bar below text */}
            <div className="w-48 sm:w-64 h-[2px] mx-auto mt-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#00f2fe]" />
          </div>

          <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-400 mt-2 max-w-md mx-auto px-4 font-normal">
            বিশ্বস্ত ফেসবুক কমিউনিটি • রিয়েল আইডি ভেরিফিকেশন ও পারস্পরিক সমর্থন
          </p>
        </div>

        {/* ============================================================== */}
        {/* MAIN AUTHENTICATION CARD                                      */}
        {/* ============================================================== */}
        <div className="bg-slate-900/85 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 sm:p-7 shadow-[0_0_35px_rgba(8,145,178,0.2)] text-white relative overflow-hidden">
          
          {/* Subtle top neon ambient bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8]" />

          {/* Navigation Tabs */}
          <div className="flex bg-slate-950/70 p-1.5 rounded-xl border border-slate-800 mb-6 gap-1">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                tab === 'login'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>লগইন (Login)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('register');
                setRegErrorMsg('');
                setRegSubmittedData(null);
              }}
              className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                tab === 'register'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>নতুন সদস্য নিবন্ধন (Register)</span>
            </button>
          </div>

          {/* ============================================================ */}
          {/* TAB 1: LOGIN VIEW                                            */}
          {/* ============================================================ */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Error Alert with Special Handling for Pending Approval */}
              {loginError && (
                <div 
                  className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-3 border ${
                    loginError.isPending
                      ? 'bg-amber-950/70 border-amber-500/60 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-rose-950/70 border-rose-500/60 text-rose-200'
                  }`}
                >
                  {loginError.isPending ? (
                    <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <span className="font-bold block">
                      {loginError.isPending ? 'অ্যাডমিন অনুমোদনের অপেক্ষায় রয়েছে' : 'লগইন ব্যর্থ হয়েছে'}
                    </span>
                    <p className="leading-relaxed text-xs">
                      {loginError.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Login Success Notification */}
              {loginSuccess && (
                <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/60 rounded-xl text-xs sm:text-sm text-emerald-200 flex items-center gap-2.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="font-medium">{loginSuccess}</span>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ইমেইল ঠিকানা (Email Address) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. emon@supportlinkbox.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white placeholder:text-slate-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  পাসওয়ার্ড (Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="আপনার গোপন পাসওয়ার্ড দিন"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white placeholder:text-slate-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox ("একবার লগইন করলে তথ্য ব্রাউজারে সেভ রেখো") */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-400/40"
                  />
                  <span>ব্রাউজারে লগইন তথ্য সেভ রাখুন (Remember Me)</span>
                </label>
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingLogin}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSubmittingLogin ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}</span>
                </button>
              </div>

              {/* Quick Sample Accounts (For easy 1-click test verification) */}
              <div className="border-t border-slate-800/80 pt-4 mt-4">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  দ্রুত টেস্ট অ্যাকাউন্ট (১-ক্লিক লগইন):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('emon@supportlinkbox.com');
                      setLoginPassword('123456');
                      setLoginError(null);
                    }}
                    className="p-2.5 text-left bg-slate-950/70 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-[11px] transition-all group"
                  >
                    <div className="font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
                      <span>এডমিন (Md Emon)</span>
                      <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 text-[9px] rounded font-mono">Admin</span>
                    </div>
                    <span className="text-slate-400 text-[10px] block mt-0.5 font-mono">emon@supportlinkbox.com</span>
                    <span className="text-slate-500 text-[9px] block">পাসওয়ার্ড: 123456</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('tanvir.h@gmail.com');
                      setLoginPassword('123456');
                      setLoginError(null);
                    }}
                    className="p-2.5 text-left bg-slate-950/70 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-[11px] transition-all group"
                  >
                    <div className="font-bold text-white group-hover:text-indigo-300 flex items-center justify-between">
                      <span>মেম্বার (Tanvir Hasan)</span>
                      <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 text-[9px] rounded font-mono">Member</span>
                    </div>
                    <span className="text-slate-400 text-[10px] block mt-0.5 font-mono">tanvir.h@gmail.com</span>
                    <span className="text-slate-500 text-[9px] block">পাসওয়ার্ড: 123456</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* TAB 2: REGISTRATION VIEW (USER REQUESTED FLOW)               */}
          {/* ============================================================ */}
          {tab === 'register' && (
            <div>
              {/* Submission Success Screen */}
              {regSubmittedData ? (
                <div className="text-center py-6 px-3 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-amber-500/20 border border-amber-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                    <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      আবেদন সফলভাবে জমা হয়েছে!
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed max-w-md mx-auto">
                      ধন্যবাদ <strong>{regSubmittedData.name}</strong>। আপনার রেজিস্ট্রেশন আবেদনটি অ্যাডমিন অনুমোদনের জন্য অপেক্ষমাণ (Pending Approval) তালিকায় রাখা হয়েছে।
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto">
                    <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      পরবর্তী পদক্ষেপ (Next Steps):
                    </div>
                    <ul className="text-slate-300 space-y-1.5 list-disc pl-4">
                      <li>অ্যাডমিন আপনার দেওয়া আসল ফেসবুক প্রোফাইল ও তথ্য যাচাই করবেন।</li>
                      <li>অনুমোদন দেওয়ার পর আপনি আপনার প্রদত্ত <strong>ইমেইল ও পাসওয়ার্ড</strong> দিয়ে যেকোনো সময় সরাসরি লগইন করতে পারবেন।</li>
                      <li>তথ্য ব্রাউজারে সংরক্ষিত থাকবে, ফলে বারবার লগইন করার ঝামেলা হবে না।</li>
                    </ul>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setRegSubmittedData(null);
                        setTab('login');
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                      লগইন পেজে ফিরে যান
                    </button>
                    {onClose && (
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm rounded-xl transition-colors"
                      >
                        বন্ধ করুন
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  
                  {/* Informational Banner on the Approval Flow */}
                  <div className="p-3 bg-cyan-950/50 border border-cyan-500/40 rounded-xl text-xs text-cyan-200 leading-relaxed flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-cyan-300">অ্যাডমিন অনুমোদন প্রক্রিয়া:</span>
                      তথ্য জমা দিলে তা অ্যাডমিন ভেরিফিকেশনে যাবে। অ্যাডমিন অনুমোদন (Approve) দিলে আপনি পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।
                    </div>
                  </div>

                  {/* Error banner */}
                  {regErrorMsg && (
                    <div className="p-3 bg-rose-950/70 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{regErrorMsg}</span>
                    </div>
                  )}

                  {/* 1. Facebook এর আসল নাম */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ১. ফেসবুকের আসল নাম (Real Facebook Name) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="হুবহু ফেসবুকে যা আছে, যেমন: Tanvir Hasan বা Md Shihab"
                        value={facebookName}
                        onChange={e => setFacebookName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/80 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white placeholder:text-slate-500 transition-all"
                      />
                    </div>
                    {facebookName && (
                      <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                        <span>GapChecker Normalized:</span>
                        <code className="px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded font-mono font-bold">
                          {normalizeFacebookName(facebookName) || 'none'}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* 2. Email + Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        ২. ইমেইল ঠিকানা (Email) *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. name@mail.com"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white placeholder:text-slate-500"
                        />
                      </div>
                      {duplicateEmailMember && (
                        <span className="text-[10px] text-rose-400 block mt-0.5">এই ইমেইল ইতিমধ্যে ব্যবহৃত।</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        পাসওয়ার্ড (Password) *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="কমপক্ষে ৬ অক্ষর"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white placeholder:text-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3. আসল লিংক (Real Facebook Profile Link) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ৩. আসল ফেসবুক লিংক (Real Profile Link) *
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        required
                        placeholder="https://www.facebook.com/profile.php?id=... অথবা ইউজারনেম"
                        value={facebookUrl}
                        onChange={e => setFacebookUrl(e.target.value)}
                        className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-950/80 border rounded-xl focus:outline-none focus:ring-2 text-white placeholder:text-slate-500 transition-all ${
                          fbValidation?.isShareLink
                            ? 'border-rose-500 focus:ring-rose-500/30'
                            : fbValidation?.isValid
                              ? 'border-emerald-500 focus:ring-emerald-500/30'
                              : 'border-slate-700/80 focus:border-cyan-400 focus:ring-cyan-500/30'
                        }`}
                      />
                    </div>

                    {/* Feedback on Facebook link */}
                    {fbValidation && (
                      <div className="mt-2">
                        {fbValidation.isShareLink ? (
                          <div className="p-2.5 bg-rose-950/70 border border-rose-500/60 rounded-lg text-xs text-rose-200">
                            <strong>শেয়ার লিংক (/share/...) নিষিদ্ধ:</strong> প্রোফাইল লিংক দিতে হবে। ফেসবুক অ্যাপের ৩-ডট মেনু থেকে আসল প্রোফাইল লিংক কপি করুন।
                          </div>
                        ) : fbValidation.isValid ? (
                          <div className="flex items-center justify-between p-2 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-xs">
                            <span className="text-emerald-300 font-medium flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              বৈধ ফেসবুক আইডি সনাক্ত হয়েছে
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-900/80 text-emerald-200 font-mono font-bold rounded text-[11px]">
                              ID: {fbValidation.normalizedFbId}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-rose-400 block mt-1">
                            {fbValidation.error}
                          </span>
                        )}
                      </div>
                    )}

                    {duplicateFbMember && (
                      <div className="mt-2 p-2 bg-amber-950/70 border border-amber-500/60 rounded-lg text-xs text-amber-200">
                        সতর্কতা: এই ফেসবুক আইডি দিয়ে ইতিমধ্যে সদস্য #{duplicateFbMember.memberNumber} নিবন্ধিত রয়েছে।
                      </div>
                    )}
                  </div>

                  {/* 4. আসল প্রোফাইল পিকচার (Real Profile Picture) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      ৪. আসল প্রোফাইল পিকচার (Real Profile Picture) *
                    </label>

                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center gap-4">
                        {/* Avatar Live Circular Preview with Neon Ring */}
                        <div className="relative group shrink-0">
                          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)] bg-slate-900 flex items-center justify-center">
                            {avatarPreview ? (
                              <img
                                src={avatarPreview}
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Camera className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                            )}
                          </div>
                          {avatarPreview && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 shadow">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Upload / URL Selector */}
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setAvatarInputMode('upload');
                                fileInputRef.current?.click();
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                                avatarInputMode === 'upload'
                                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <Upload className="w-3.5 h-3.5" />
                              ফাইল আপলোড
                            </button>

                            <button
                              type="button"
                              onClick={() => setAvatarInputMode('url')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                                avatarInputMode === 'url'
                                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                              ছবি URL
                            </button>
                          </div>

                          {avatarInputMode === 'upload' ? (
                            <div>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-2 px-3 border border-dashed border-cyan-500/50 hover:border-cyan-400 rounded-lg text-left text-xs text-slate-300 hover:text-white flex items-center justify-between bg-slate-900/50 transition-colors"
                              >
                                <span>{avatarPreview ? 'অন্য ছবি পরিবর্তন করুন' : 'ডিভাইস থেকে ছবি বেছে নিন'}</span>
                                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                              </button>
                            </div>
                          ) : (
                            <input
                              type="url"
                              placeholder="ছবির ডিরেক্ট URL পেস্ট করুন"
                              value={avatarUrlInput}
                              onChange={e => {
                                setAvatarUrlInput(e.target.value);
                                setAvatarPreview(e.target.value);
                              }}
                              className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                            />
                          )}

                          <span className="text-[10px] text-slate-400 block">
                            আপনার স্পষ্ট আসল ছবি দিন, ভেরিফিকেশনে এডমিন এটি ফেসবুক প্রোফাইলের সাথে মিলিয়ে দেখবেন।
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Registration Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmittingReg || Boolean(duplicateFbMember || (fbValidation && !fbValidation.isValid))}
                      className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isSubmittingReg ? 'আবেদন জমা হচ্ছে...' : 'আবেদন জমা দিন (অ্যাডমিন অনুমোদনের জন্য)'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Guest / Close Link if applicable */}
          {!isModal && onBrowseAsGuest && (
            <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
              <button
                type="button"
                onClick={onBrowseAsGuest}
                className="text-xs text-slate-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
              >
                <span>লগইন ছাড়া গেস্ট হিসেবে ব্রাউজ করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="text-center mt-6 text-[11px] text-slate-400">
          সাপোর্ট লিংক বক্স — বিশ্বস্ত ফেসবুক ইউজারদের সহযোগিতামূলক কমিউনিটি প্ল্যাটফর্ম
        </div>
      </div>
    </div>
  );
};
