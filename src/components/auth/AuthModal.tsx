import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  User, 
  Shield, 
  KeyRound, 
  UserPlus, 
  Check, 
  Sparkles, 
  ExternalLink, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Link as LinkIcon, 
  Info,
  CheckCircle2,
  Lock,
  Mail,
  Upload,
  Camera,
  Clock
} from 'lucide-react';
import { validateAndExtractFacebookId, normalizeFacebookName } from '../../utils/facebookIdentity';
import { NeonButterfly } from './NeonButterfly';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'switch';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { members, currentUser, loginAs, logout, loginWithEmailAndPassword, registerMember } = useApp();
  const [tab, setTab] = useState<'login' | 'register' | 'switch'>(initialTab);
  
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
  const [loginError, setLoginError] = useState<{ message: string; isPending?: boolean } | null>(null);
  const [loginSuccess, setLoginSuccess] = useState('');

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
  const [searchMember, setSearchMember] = useState('');

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError({ message: 'ইমেইল এবং পাসওয়ার্ড উভয়ই পূরণ করুন।' });
      return;
    }

    const res = loginWithEmailAndPassword(loginEmail.trim(), loginPassword.trim());
    if (res.success) {
      setLoginSuccess(res.message);
      try {
        localStorage.setItem('slb_last_logged_email', loginEmail.trim());
      } catch {}
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      const isPending = res.message.includes('Pending Approval') || res.message.includes('এপ্রুভালের');
      setLoginError({ message: res.message, isPending });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrorMsg('');

    // 1. Real Facebook Name
    if (!facebookName.trim()) {
      setRegErrorMsg('ফেসবুকে হুবহু যে নাম আছে সেটি প্রদান করুন।');
      return;
    }

    // 2. Real Facebook Profile Link
    if (!facebookUrl.trim()) {
      setRegErrorMsg('ফেসবুক প্রোফাইল লিংক প্রদান করা বাধ্যতামূলক।');
      return;
    }

    if (!fbValidation || !fbValidation.isValid) {
      setRegErrorMsg(fbValidation?.error || 'সঠিক ফেসবুক প্রোফাইল লিংক প্রদান করুন।');
      return;
    }

    if (duplicateFbMember) {
      setRegErrorMsg(`এই ফেসবুক প্রোফাইল দিয়ে ইতিমধ্যে সদস্য #${duplicateFbMember.memberNumber} (${duplicateFbMember.name}) নিবন্ধিত আছে! একই ফেসবুক প্রোফাইল দিয়ে একাধিক অ্যাকাউন্ট খোলা সম্পূর্ণ নিষিদ্ধ।`);
      return;
    }

    // 3. Email & Password
    if (!regEmail.trim()) {
      setRegErrorMsg('বৈধ ইমেইল ঠিকানা প্রদান করুন।');
      return;
    }

    if (duplicateEmailMember) {
      setRegErrorMsg(`"${regEmail.trim()}" ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট নিবন্ধিত রয়েছে।`);
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setRegErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    // 4. Real Profile Picture
    const finalAvatar = avatarPreview.trim() || avatarUrlInput.trim();
    if (!finalAvatar) {
      setRegErrorMsg('আপনার আসল প্রোফাইল ছবি আপলোড করা আবশ্যক (অ্যাডমিন ভেরিফিকেশনের জন্য প্রয়োজন)।');
      return;
    }

    const res = registerMember({
      name: facebookName.trim(),
      facebookName: facebookName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      facebookUrl: facebookUrl.trim(),
      avatar: finalAvatar
    });

    if (res.success) {
      setRegSubmittedData({
        name: facebookName.trim(),
        memberNumber: res.member?.memberNumber
      });
      try {
        localStorage.setItem('slb_last_logged_email', regEmail.trim());
      } catch {}
    } else {
      setRegErrorMsg(res.message);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchMember.toLowerCase()) || 
    (m.facebookName && m.facebookName.toLowerCase().includes(searchMember.toLowerCase())) ||
    m.username.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.memberNumber.toString().includes(searchMember) ||
    m.email.toLowerCase().includes(searchMember.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.25)] w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col relative text-white">
        
        {/* Top ambient glowing neon strip */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8]" />

        {/* 3D Neon Header with Flying Neon Butterfly */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 relative overflow-hidden">
          
          {/* Flying Neon Butterfly top right */}
          <div className="absolute top-2 right-12 pointer-events-none z-10">
            <NeonButterfly size={42} variant="cyan" flutterSpeed={0.32} flightDuration={3.5} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span 
                className="text-base sm:text-xl font-extrabold uppercase tracking-wide text-white font-sans neon-title-3d"
                style={{ letterSpacing: '0.04em' }}
              >
                Support Link Box
              </span>
            </div>
            <p className="text-[11px] text-cyan-300/80 mt-0.5 font-medium">
              3D অথেন্টিকেশন পোর্টাল • রিয়েল ফেসবুক আইডি ও সিকিউর লগইন
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-950/70 p-1.5 m-3 rounded-xl border border-slate-800 gap-1">
          <button
            onClick={() => { setTab('login'); setLoginError(null); }}
            className={`flex-1 py-2 px-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'login'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            লগইন (Login)
          </button>

          <button
            onClick={() => { setTab('register'); setRegErrorMsg(''); setRegSubmittedData(null); }}
            className={`flex-1 py-2 px-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            রেজিস্ট্রেশন
          </button>

          <button
            onClick={() => setTab('switch')}
            className={`flex-1 py-2 px-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'switch'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            কুইক সুইচ
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              
              {loginError && (
                <div 
                  className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                    loginError.isPending
                      ? 'bg-amber-950/70 border-amber-500/60 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-rose-950/70 border-rose-500/60 text-rose-200'
                  }`}
                >
                  {loginError.isPending ? (
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <span className="font-bold block">
                      {loginError.isPending ? 'অ্যাডমিন অনুমোদনের অপেক্ষায় রয়েছে' : 'লগইন ব্যর্থ হয়েছে'}
                    </span>
                    <p className="leading-relaxed text-[11px]">{loginError.message}</p>
                  </div>
                </div>
              )}

              {loginSuccess && (
                <div className="p-3 bg-emerald-950/70 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 font-medium flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{loginSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  পাসওয়ার্ড (Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    placeholder="আপনার গোপন পাসওয়ার্ড (ডেমো: 123456)"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white"
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

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  লগইন করুন
                </button>
              </div>

              {/* Quick Sample Login Options */}
              <div className="border-t border-slate-800 pt-3">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  দ্রুত টেস্ট অ্যাকাউন্ট (১-ক্লিক পূরণ):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('emon@supportlinkbox.com');
                      setLoginPassword('123456');
                      setLoginError(null);
                    }}
                    className="p-2 text-left bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-[11px] transition-colors"
                  >
                    <span className="font-bold block text-white">Admin (Md Emon)</span>
                    <span className="text-slate-400 text-[10px]">emon@supportlinkbox.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('tanvir.h@gmail.com');
                      setLoginPassword('123456');
                      setLoginError(null);
                    }}
                    className="p-2 text-left bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-[11px] transition-colors"
                  >
                    <span className="font-bold block text-white">Member (Tanvir)</span>
                    <span className="text-slate-400 text-[10px]">tanvir.h@gmail.com</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'register' && (
            <div>
              {regSubmittedData ? (
                <div className="text-center py-6 px-3 space-y-4">
                  <div className="w-14 h-14 bg-amber-500/20 border border-amber-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <Clock className="w-7 h-7 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">আবেদন সফলভাবে জমা হয়েছে!</h4>
                    <p className="text-xs text-amber-200/90 mt-1 max-w-sm mx-auto">
                      ধন্যবাদ {regSubmittedData.name}। আপনার রেজিস্ট্রেশন আবেদনটি অ্যাডমিন অনুমোদনের জন্য অপেক্ষমাণ (Pending Approval) রয়েছে। অ্যাডমিন অনুমোদন দিলে আপনি লগইন করতে পারবেন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRegSubmittedData(null);
                      setTab('login');
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl shadow transition-all"
                  >
                    লগইন পেজে যান
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  
                  {/* Approval notice */}
                  <div className="p-3 bg-cyan-950/50 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>অ্যাডমিন অনুমোদন আবশ্যক:</strong> তথ্য জমা দিলে তা অ্যাডমিন পর্যালোচনায় যাবে। অ্যাডমিন অনুমোদন (Approve) দিলে আপনি পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।
                    </div>
                  </div>

                  {regErrorMsg && (
                    <div className="p-3 bg-rose-950/70 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
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
                        placeholder="ফেসবুকে হুবহু যে নাম আছে, যেমন: Tanvir Hasan"
                        value={facebookName}
                        onChange={e => setFacebookName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 text-white"
                      />
                    </div>
                    {facebookName && (
                      <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                        <span>GapChecker Normalized:</span>
                        <code className="px-1 py-0.2 bg-slate-800 text-cyan-300 rounded font-mono">
                          {normalizeFacebookName(facebookName) || 'none'}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* 2. Email + Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        ২. ইমেইল ঠিকানা *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="name@mail.com"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegPassword ? "text" : "password"}
                          required
                          minLength={6}
                          placeholder="৬+ অক্ষর"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white"
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
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white"
                      />
                    </div>

                    {fbValidation && (
                      <div className="mt-1.5">
                        {fbValidation.isShareLink ? (
                          <div className="p-2 bg-rose-950/70 border border-rose-500/50 rounded-lg text-[11px] text-rose-200">
                            শেয়ার লিংক (/share/...) নিষিদ্ধ। প্রোফাইলের ৩-ডট মেনু থেকে আসল লিংক কপি করুন।
                          </div>
                        ) : fbValidation.isValid ? (
                          <div className="p-1.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-[11px] text-emerald-300 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> বৈধ আইডি সনাক্ত
                            </span>
                            <span className="font-mono font-bold text-white text-[10px]">
                              ID: {fbValidation.normalizedFbId}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-rose-400 block">{fbValidation.error}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 4. আসল প্রোফাইল পিকচার (Real Profile Picture) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ৪. আসল প্রোফাইল পিকচার (Real Profile Picture) *
                    </label>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)] bg-slate-900 flex items-center justify-center">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        {avatarPreview && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAvatarInputMode('upload');
                              fileInputRef.current?.click();
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border ${
                              avatarInputMode === 'upload'
                                ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <Upload className="w-3 h-3" /> ফাইল আপলোড
                          </button>
                          <button
                            type="button"
                            onClick={() => setAvatarInputMode('url')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border ${
                              avatarInputMode === 'url'
                                ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <LinkIcon className="w-3 h-3" /> ইমেজ URL
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
                              className="w-full py-1.5 px-2.5 border border-dashed border-cyan-500/50 hover:border-cyan-400 rounded-lg text-left text-[11px] text-slate-300 flex items-center justify-between bg-slate-900/50"
                            >
                              <span>{avatarPreview ? 'ছবি পরিবর্তন করুন' : 'ডিভাইস থেকে আসল ছবি নির্বাচন করুন'}</span>
                              <Upload className="w-3 h-3 text-cyan-400" />
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
                            className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={Boolean(duplicateFbMember || (fbValidation && !fbValidation.isValid))}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <UserPlus className="w-4 h-4" />
                      আবেদন জমা দিন (অ্যাডমিন অনুমোদনের জন্য)
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: QUICK SWITCH */}
          {tab === 'switch' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  বর্তমান লগইন আইডি:
                </span>
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400">
                      {currentUser.facebookName || currentUser.name} (#{currentUser.memberNumber})
                    </span>
                    <button
                      onClick={logout}
                      className="text-[10px] px-2 py-0.5 bg-rose-950 border border-rose-800 text-rose-300 font-semibold rounded hover:bg-rose-900"
                    >
                      লগআউট
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">লগইন করা নেই</span>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="সদস্য নাম, আইডি নম্বর বা ইমেইল দিয়ে খুঁজুন..."
                  value={searchMember}
                  onChange={e => setSearchMember(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white"
                />
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {filteredMembers.map(m => {
                  const isCurrent = currentUser?.id === m.id;
                  const isPending = m.status === 'pending_approval';
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        loginAs(m.id);
                        onClose();
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-cyan-950/60 border-cyan-400'
                          : isPending
                            ? 'bg-amber-950/40 border-amber-700/60 hover:bg-amber-950/60'
                            : 'bg-slate-950 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={m.avatar} 
                          alt={m.name} 
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700" 
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white flex items-center gap-1.5 truncate">
                            <span className="truncate">{m.facebookName || m.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">#{m.memberNumber}</span>
                            {isPending && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold">
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                            <span>{m.email}</span>
                            <span>•</span>
                            <span className="capitalize font-medium text-cyan-400">
                              {m.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1 shrink-0">
                          <Check className="w-3.5 h-3.5" /> সক্রিয়
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 hover:text-cyan-400 shrink-0">
                          লগইন →
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
