import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Send, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Image as ImageIcon, 
  Video, 
  UserCheck, 
  Sparkles, 
  ShieldCheck, 
  Crown, 
  Bell,
  HelpCircle,
  Search,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { checkBangladeshSubmissionWindow } from '../../utils/bangladeshTime';
import { PostContentType, LinkCategoryType } from '../../types';

interface LinkSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTargetMemberId?: string;
  initialCategory?: LinkCategoryType;
}

export const LinkSubmissionModal: React.FC<LinkSubmissionModalProps> = ({ 
  isOpen, 
  onClose,
  initialTargetMemberId,
  initialCategory = 'member'
}) => {
  const { 
    currentUser, 
    members, 
    dailyLinks, 
    settings, 
    submitDailyLink 
  } = useApp();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';

  // Form states
  const [postUrl, setPostUrl] = useState('');
  const [postType, setPostType] = useState<PostContentType>('photo');
  const [caption, setCaption] = useState('');
  const [instruction, setInstruction] = useState('');
  const [category, setCategory] = useState<LinkCategoryType>(initialCategory);
  
  // Admin Proxy states
  const [isProxyMode, setIsProxyMode] = useState(Boolean(initialTargetMemberId));
  const [targetMemberId, setTargetMemberId] = useState<string>(initialTargetMemberId || '');
  const [memberSearch, setMemberSearch] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string; linkNumber?: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time window status (Bangladesh Time)
  const [bdWindow, setBdWindow] = useState(() => 
    checkBangladeshSubmissionWindow(
      settings.submissionWindowStart || '10:00',
      settings.submissionWindowEnd || '16:50',
      settings.submissionWindowEnabled !== false,
      settings.submissionOpen !== false
    )
  );

  // Refresh BD time check every 15 seconds while open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setBdWindow(
        checkBangladeshSubmissionWindow(
          settings.submissionWindowStart || '10:00',
          settings.submissionWindowEnd || '16:50',
          settings.submissionWindowEnabled !== false,
          settings.submissionOpen !== false
        )
      );
    }, 15000);
    return () => clearInterval(interval);
  }, [isOpen, settings]);

  // Sync initial target member and category when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTargetMemberId) {
        setIsProxyMode(true);
        setTargetMemberId(initialTargetMemberId);
      }
      if (initialCategory) {
        setCategory(initialCategory);
      }
      setStatusMsg(null);
    }
  }, [isOpen, initialTargetMemberId, initialCategory]);

  if (!isOpen || !currentUser) return null;

  // Selected member (either proxy target or current user)
  const effectiveTargetMember = isProxyMode && targetMemberId 
    ? members.find(m => m.id === targetMemberId) || currentUser 
    : currentUser;

  // Check if effective target member already submitted today
  const existingToday = dailyLinks.find(l => 
    l.memberId === effectiveTargetMember.id && 
    (!l.category || l.category === 'member')
  );

  // Filter members for proxy search
  const filteredProxyMembers = members.filter(m => 
    m.status !== 'removed' &&
    (m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
     m.username.toLowerCase().includes(memberSearch.toLowerCase()))
  ).slice(0, 10);

  // Quick instruction presets
  const instructionPresets = [
    { label: '❤️ Love React + কমেন্ট', text: 'অনুগ্রহ করে লাভ রিয়েক্ট (❤️) এবং পোস্ট সম্পর্কিত অর্থপূর্ণ কমেন্ট করবেন।' },
    { label: '🎬 সম্পূর্ণ ভিডিও + Like', text: 'ভিডিওটি অন্তত ১ মিনিট সম্পূর্ণ দেখে লাইক ও মতামত কমেন্ট করবেন।' },
    { label: '🥰 Care React + সুন্দর কমেন্ট', text: 'কেয়ার রিয়েক্ট (🥰) দিয়ে সুন্দর একটি ইতিবাচক মন্তব্য করবেন।' },
    { label: '🔄 Like + Share', text: 'লাইক দিয়ে টাইমলাইনে বা যেকোনো গ্রুপে শেয়ার করে সাপোর্ট করবেন।' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!postUrl.trim()) {
      setStatusMsg({ type: 'error', text: 'অনুগ্রহ করে ফেসবুক পোস্ট লিংক প্রদান করুন।' });
      return;
    }

    if (isProxyMode && !targetMemberId) {
      setStatusMsg({ type: 'error', text: 'এডমিন হিসেবে কার পক্ষ থেকে লিংক দিচ্ছেন তা সিলেক্ট করুন।' });
      return;
    }

    setIsSubmitting(true);

    const res = submitDailyLink(postUrl.trim(), caption.trim(), {
      postType,
      instruction: instruction.trim(),
      category: isAdmin ? category : 'member',
      targetMemberId: isProxyMode ? targetMemberId : undefined
    });

    setIsSubmitting(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message, linkNumber: res.linkNumber });
      confetti({
        particleCount: 55,
        spread: 65,
        origin: { y: 0.65 }
      });
      setTimeout(() => {
        setPostUrl('');
        setCaption('');
        setInstruction('');
        setStatusMsg(null);
        onClose();
      }, 2200);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  // Determine if submission is permitted for this user
  const isSpecialCategory = category === 'admin' || category === 'vip' || category === 'notice';
  const canSubmitTimeWise = isAdmin || isSpecialCategory || bdWindow.isOpenNow;
  const isAlreadySubmitted = !isAdmin && !isSpecialCategory && Boolean(existingToday);
  const isSubmitDisabled = isSubmitting || !postUrl.trim() || (!canSubmitTimeWise && !isAdmin) || isAlreadySubmitted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[#131315] rounded-2xl shadow-2xl border border-[#1E1E20] w-full max-w-xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E1E20] flex items-center justify-between bg-[#0E0E10] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {isAdmin && isProxyMode ? "মেম্বারের হয়ে লিংক সাবমিশন" : "আজকের ফেসবুক লিংক সাবমিট করুন"}
                </h3>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                    Admin Overrides
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                একজন মেম্বার একদিনে ১টি লিংক দিতে পারবেন • মিউচুয়াল সাপোর্ট কমিউনিটি
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1E1E20] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">

          {/* Bangladesh Time Window Indicator Banner */}
          <div className={`p-3 sm:p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
            bdWindow.isOpenNow 
              ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
              : isAdmin
                ? 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
          }`}>
            <div className="flex items-start gap-2.5">
              <Clock className={`w-4 h-4 mt-0.5 shrink-0 ${
                bdWindow.isOpenNow ? 'text-emerald-400' : isAdmin ? 'text-amber-400' : 'text-rose-400'
              }`} />
              <div>
                <div className="flex items-center gap-2 font-bold text-xs">
                  <span>বাংলাদেশ সময়: {bdWindow.currentFormattedBangla} ({bdWindow.currentFormatted12h})</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-bold ${
                    bdWindow.isOpenNow ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {bdWindow.statusBadgeText}
                  </span>
                </div>
                <div className="text-[11px] opacity-90 mt-0.5">
                  {bdWindow.statusMessageBengali}
                </div>
                <div className="text-[10px] opacity-75 mt-0.5">
                  নির্ধারিত সাবমিশন উইন্ডো: সকাল {bdWindow.formattedStart12h} হতে বিকেল {bdWindow.formattedEnd12h} পর্যন্ত (BST)
                </div>
              </div>
            </div>

            {isAdmin && (
              <span className="shrink-0 px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] rounded font-bold">
                Admin 24/7 Access
              </span>
            )}
          </div>

          {/* Feedback message */}
          {statusMsg && (
            <div className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">{statusMsg.text}</div>
                {statusMsg.type === 'success' && (
                  <div className="text-[11px] text-emerald-400/80 mt-0.5">
                    আপনার পোস্টটি সফলভাবে লিস্টেড হয়েছে! রাত ১১:৫৯ এর পূর্বে বাকি সকল লিংক সাপোর্ট করুন।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warning if already submitted today */}
          {isAlreadySubmitted && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  You have already submitted a link today (Link #{existingToday?.linkNumber}). একজন মেম্বার একদিনে সর্বোচ্চ ১টি লিংক দিতে পারেন।
                </span>
              </div>
              <a 
                href={existingToday?.postUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="shrink-0 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] rounded-lg font-bold transition-colors"
              >
                View #{existingToday?.linkNumber}
              </a>
            </div>
          )}

          {/* Admin Override Controls: Mode & Category Selection */}
          {isAdmin && (
            <div className="p-3.5 bg-[#0E0E10] rounded-xl border border-[#1E1E20] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  এডমিন অপশন (Admin Control)
                </span>
                <span className="text-[10px] text-gray-500">যেকোনো সময় যেকোনো লিংক দেওয়ার অনুমতিপ্রাপ্ত</span>
              </div>

              {/* Mode Switch: Self vs Proxy vs Special */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsProxyMode(false);
                    setTargetMemberId('');
                    setCategory('member');
                  }}
                  className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border ${
                    !isProxyMode && category === 'member'
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-[#18181B] text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  আমার নিজের লিংক (Self)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProxyMode(true);
                    setCategory('member');
                  }}
                  className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border ${
                    isProxyMode
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-[#18181B] text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  মেম্বারের হয়ে দিন (Proxy)
                </button>
              </div>

              {/* Special Category Tabs for Admins */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] text-gray-400 font-semibold mr-1">লিংক ধরন:</span>
                {(['member', 'admin', 'vip', 'notice'] as LinkCategoryType[]).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition-colors border ${
                      category === cat
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                        : 'bg-[#18181B] text-gray-400 border-[#1E1E20] hover:text-gray-200'
                    }`}
                  >
                    {cat === 'member' && 'Member Link'}
                    {cat === 'admin' && '🛡️ Admin Link'}
                    {cat === 'vip' && '👑 VIP Link'}
                    {cat === 'notice' && '📢 Notice Link'}
                  </button>
                ))}
              </div>

              {/* Proxy Member Selector when isProxyMode is true */}
              {isProxyMode && (
                <div className="pt-2 border-t border-[#1E1E20] space-y-2">
                  <label className="block text-[11px] font-bold text-gray-300">
                    কোন মেম্বারের পক্ষ থেকে লিংক দিচ্ছেন? *
                  </label>
                  
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="মেম্বারের নাম বা ইউজারনেম দিয়ে খুঁজুন..."
                      value={memberSearch}
                      onChange={e => setMemberSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#18181B] border border-[#27272A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {filteredProxyMembers.map(m => {
                      const isSel = targetMemberId === m.id;
                      const hasLinkToday = dailyLinks.some(l => l.memberId === m.id && (!l.category || l.category === 'member'));
                      return (
                        <div
                          key={m.id}
                          onClick={() => setTargetMemberId(m.id)}
                          className={`p-2 rounded-lg flex items-center justify-between cursor-pointer border transition-colors ${
                            isSel 
                              ? 'bg-indigo-600/15 border-indigo-500/50 text-white' 
                              : 'bg-[#18181B]/60 border-transparent hover:bg-[#1E1E20] text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-xs">{m.name}</span>
                              <span className="text-[10px] text-gray-400 ml-1.5">@{m.username}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {hasLinkToday && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded">
                                Has link today
                              </span>
                            )}
                            {isSel && <Check className="w-4 h-4 text-indigo-400" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Member Identity Card (Auto-filled from Profile) */}
          <div className="p-3.5 bg-[#0E0E10] rounded-xl border border-[#1E1E20] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={effectiveTargetMember.avatar} 
                alt={effectiveTargetMember.name} 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20" 
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-xs sm:text-sm">
                    {effectiveTargetMember.name}
                  </span>
                  <span className="px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded text-[10px] font-mono">
                    ID #{effectiveTargetMember.memberNumber || effectiveTargetMember.id.slice(-4)}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center gap-2">
                  <span>@{effectiveTargetMember.username}</span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> আইডি হতে স্বয়ংক্রিয়ভাবে প্রাপ্ত
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && isProxyMode && (
              <span className="text-[10px] px-2 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg font-bold">
                Proxy Target
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Post Type Selector (Photo vs Video) */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center justify-between">
                <span>পোস্টের ধরন সিলেক্ট করুন (Post Type) *</span>
                <span className="text-[11px] text-gray-500 font-normal">ফটো নাকি ভিডিও</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPostType('photo')}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    postType === 'photo'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-xs'
                      : 'bg-[#0E0E10] border-[#1E1E20] text-gray-400 hover:text-gray-200 hover:border-gray-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    postType === 'photo' ? 'bg-indigo-600 text-white' : 'bg-[#18181B] text-gray-400'
                  }`}>
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs">ফটো / পোস্ট (Photo)</div>
                    <div className="text-[10px] text-gray-500">ছবি বা স্ট্যাটাস পোস্ট</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPostType('video')}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    postType === 'video'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-xs'
                      : 'bg-[#0E0E10] border-[#1E1E20] text-gray-400 hover:text-gray-200 hover:border-gray-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    postType === 'video' ? 'bg-indigo-600 text-white' : 'bg-[#18181B] text-gray-400'
                  }`}>
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs">ভিডিও / রিলস (Video)</div>
                    <div className="text-[10px] text-gray-500">রিলস বা ভিডিও কনটেন্ট</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Post Caption */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center justify-between">
                <span>পোস্টের ক্যাপশন (Post Caption)</span>
                <span className="text-[10px] text-gray-500 font-normal">{caption.length}/200</span>
              </label>
              <textarea
                maxLength={200}
                rows={2}
                placeholder="আপনার ফেসবুক পোস্টের মূল ক্যাপশন বা সংক্ষিপ্ত বিবরণ লিখুন..."
                value={caption}
                onChange={e => setCaption(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600 resize-none"
              />
            </div>

            {/* Instruction for Supporters */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-300">
                  সাপোর্টারদের জন্য ইন্সট্রাকশন (Instruction)
                </label>
                <span className="text-[10px] text-gray-500">অন্যরা কী রিঅ্যাক্ট/কমেন্ট করবে</span>
              </div>

              {/* Preset quick chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {instructionPresets.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setInstruction(preset.text)}
                    className="px-2 py-0.5 bg-[#18181B] hover:bg-indigo-600/20 text-gray-300 hover:text-indigo-300 border border-[#27272A] rounded-full text-[10px] transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <textarea
                maxLength={180}
                rows={2}
                placeholder="যেমন: লাভ রিয়েক্ট ও ভিডিও সম্পর্কিত মন্তব্য করবেন..."
                value={instruction}
                onChange={e => setInstruction(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600 resize-none"
              />
            </div>

            {/* Facebook Post Link */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 flex items-center justify-between">
                <span>ফেসবুক পোস্ট লিংক (Facebook Link) *</span>
                <span className="text-[10px] text-gray-500 font-normal">পোস্ট অবশ্যই পাবলিক হতে হবে</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://facebook.com/yourprofile/posts/123456789"
                  value={postUrl}
                  onChange={e => setPostUrl(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600 font-mono"
                />
                <span className="absolute right-3 top-2.5 text-gray-500 text-xs">
                  🌐
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                সাপোর্টেড: facebook.com/posts, fb.watch, facebook.com/reel, বা গ্রুপ পোস্টের পাবলিক লিংক।
              </p>
            </div>

            {/* Fair community rule reminder */}
            <div className="p-3 bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-xs text-gray-400 flex items-start gap-2">
              <span className="text-amber-400 text-sm leading-none mt-0.5">⚖️</span>
              <div>
                <strong className="text-gray-200">ফেয়ার পলিসি নিয়ম:</strong> লিংক সাবমিট করার পর আজকের সকল সক্রিয় মেম্বারের পোস্ট রাত ১১:৫৯ এর পূর্বে সাপোর্ট করা বাধ্যতামূলক।
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#1E1E20]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#1E1E20] rounded-lg transition-colors"
              >
                বাতিল করুন
              </button>

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
              >
                <Send className="w-4 h-4" />
                {isSubmitting 
                  ? 'যাচাই করা হচ্ছে...' 
                  : isAdmin && isProxyMode
                    ? `সাবমিট করুন (${effectiveTargetMember.name})`
                    : "আজকের লিংক সাবমিট করুন"
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
