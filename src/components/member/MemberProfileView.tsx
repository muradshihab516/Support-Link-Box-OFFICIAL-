import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Flame, 
  Trophy, 
  Award, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Share2, 
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  Edit,
  ShieldCheck,
  Check,
  X,
  FileCode,
  KeyRound
} from 'lucide-react';
import { getStatusBadgeColor } from '../../utils/helpers';
import { normalizeFacebookName } from '../../utils/facebookIdentity';

interface MemberProfileViewProps {
  memberId?: string;
  onNavigate?: (view: string) => void;
  onOpenReport?: (linkInfo?: { id: string; number: number; member: string }) => void;
}

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({ memberId, onNavigate, onOpenReport }) => {
  const { 
    currentUser, 
    members, 
    badges, 
    supportRecords, 
    dailyLinks,
    nameChangeRequests,
    requestNameChange,
    toggleMemberNameLock,
    toggleMemberNameMismatch
  } = useApp();

  const [showChangeModal, setShowChangeModal] = useState(false);
  const [requestedNameInput, setRequestedNameInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [requestMsg, setRequestMsg] = useState('');
  const [requestError, setRequestError] = useState('');

  const targetMember = memberId 
    ? members.find(m => m.id === memberId) 
    : currentUser;

  if (!targetMember) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 text-center text-slate-500">
        Member not found.
      </div>
    );
  }

  const isOwner = currentUser?.id === targetMember.id;
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  // Member's name change requests
  const memberRequests = nameChangeRequests.filter(r => r.memberId === targetMember.id);
  const pendingRequest = memberRequests.find(r => r.status === 'pending');

  const handleOpenNameChange = () => {
    setRequestedNameInput(targetMember.facebookName || targetMember.name);
    setReasonInput('');
    setRequestMsg('');
    setRequestError('');
    setShowChangeModal(true);
  };

  const handleSubmitNameChange = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError('');
    setRequestMsg('');

    if (!requestedNameInput.trim()) {
      setRequestError('নতুন ফেসবুক নাম প্রদান করুন।');
      return;
    }

    const res = requestNameChange({
      memberId: targetMember.id,
      requestedName: requestedNameInput.trim(),
      reason: reasonInput.trim()
    });

    if (res.success) {
      setRequestMsg(res.message);
      setTimeout(() => {
        setShowChangeModal(false);
      }, 1500);
    } else {
      setRequestError(res.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      
      {/* NAME MISMATCH WARNING BANNER (GapChecker Alert) */}
      {targetMember.nameMismatchFlag && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-300 text-xs sm:text-sm space-y-2 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>সতর্কবার্তা: GapChecker ফেসবুক নামের অমিল শনাক্ত করেছে!</span>
          </div>
          <p className="leading-relaxed text-gray-300 text-xs">
            ফেসবুক পোস্টে করা কমেন্ট এবং আপনার সাপোর্ট লিংক বক্সে সংরক্ষিত নামের মধ্যে অমিল ধরা পড়েছে। এর ফলে সাপ্তাহিক সাপোর্ট ভেরিফিকেশনে আপনার কমেন্ট গণনা নাও হতে পারে। অনুগ্রহ করে আপনার ফেসবুক প্রোফাইলের নামের সাথে মিল রেখে সঠিক নাম সেট করুন অথবা নাম পরিবর্তনের আবেদন করুন।
          </p>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="rounded-2xl bg-[#131315] border border-[#1E1E20] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          <div className="relative">
            <img 
              src={targetMember.avatar} 
              alt={targetMember.name} 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-[#1E1E20] shadow-md"
            />
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-indigo-600 text-white font-mono font-bold text-xs rounded-lg shadow-sm">
              #{targetMember.memberNumber}
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>{targetMember.facebookName || targetMember.name}</span>
                {targetMember.nameLocked && (
                  <span title="Facebook name is verified & locked by Admin" className="inline-flex">
                    <Lock className="w-4 h-4 text-indigo-400" />
                  </span>
                )}
              </h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border capitalize ${getStatusBadgeColor(targetMember.status)}`}>
                {targetMember.status}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                {targetMember.role.replace('_', ' ')}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-gray-400 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span>{targetMember.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined {targetMember.joinedAt}
              </span>
            </div>

            {/* GapChecker & Facebook Identity Box */}
            <div className="pt-2 p-3 bg-[#0E0E10] border border-[#1E1E20] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-gray-300">
                <span className="font-semibold text-gray-400">Facebook Identity:</span>
                <span className="px-2 py-0.5 bg-[#18181B] text-white font-bold rounded">
                  {targetMember.facebookName || targetMember.name}
                </span>
                {targetMember.normalizedName && (
                  <span className="px-2 py-0.5 bg-[#18181B] text-gray-400 font-mono text-[11px] rounded">
                    Norm: {targetMember.normalizedName}
                  </span>
                )}
                {targetMember.normalizedFbId && (
                  <span className="px-2 py-0.5 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] rounded">
                    FB ID: {targetMember.normalizedFbId}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {targetMember.facebookUrl && (
                  <a
                    href={targetMember.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {/* Name Change Request Button */}
                {(isOwner || isAdmin) && (
                  <button
                    onClick={handleOpenNameChange}
                    className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    <span>নাম পরিবর্তনের আবেদন</span>
                  </button>
                )}

                {/* Admin Quick Lock Toggle */}
                {isAdmin && (
                  <button
                    onClick={() => toggleMemberNameLock(targetMember.id)}
                    className="p-1.5 bg-[#18181B] hover:bg-[#202024] text-gray-300 rounded-lg border border-[#27272A] transition-colors"
                    title={targetMember.nameLocked ? "Unlock Name" : "Lock Name"}
                  >
                    {targetMember.nameLocked ? <Lock className="w-3.5 h-3.5 text-indigo-400" /> : <Unlock className="w-3.5 h-3.5 text-gray-400" />}
                  </button>
                )}
              </div>
            </div>

            {/* Supabase Technical Identity (authUserId) Badge */}
            <div className="text-[11px] text-gray-500 flex items-center justify-center sm:justify-start gap-2 pt-1 font-mono">
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>Auth UUID:</span>
              <code className="text-gray-400 bg-[#0E0E10] px-1.5 py-0.5 rounded">
                {targetMember.authUserId || `user_${targetMember.id}`}
              </code>
              <span className="text-[10px] text-emerald-500 font-sans font-medium">✓ Technical RLS Anchor</span>
            </div>

          </div>
        </div>
      </div>

      {/* Pending Name Change Request Notice */}
      {pendingRequest && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <strong>নাম পরিবর্তনের আবেদন বিবেচনাধীন:</strong> আপনি "{pendingRequest.requestedName}" নামে পরিবর্তনের আবেদন করেছেন। অ্যাডমিন অনুমোদনের পর নাম আপডেট হবে।
            </div>
          </div>
          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-200 font-bold rounded uppercase text-[10px]">
            Pending
          </span>
        </div>
      )}

      {/* Profile Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Current Rank</span>
          <div className="text-2xl font-bold text-amber-500 mt-1 flex items-center gap-1.5">
            <Trophy className="w-6 h-6 text-amber-500" />
            #{targetMember.currentRank}
          </div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Championship Ranking</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Points</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {targetMember.totalPoints}
          </div>
          <span className="text-[10px] text-indigo-400 font-semibold mt-0.5 block">+{targetMember.weeklyPoints} this week</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Support Rate</span>
          <div className="text-2xl font-bold text-green-400 mt-1">
            {targetMember.completionRate}%
          </div>
          <span className="text-[10px] text-green-400 font-semibold mt-0.5 block">
            {targetMember.supportsCompleted} posts supported
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Active Streak</span>
          <div className="text-2xl font-bold text-orange-500 mt-1 flex items-center gap-1">
            <Flame className="w-6 h-6 fill-orange-500" />
            {targetMember.currentStreak}d
          </div>
          <span className="text-[10px] text-orange-500 font-semibold mt-0.5 block">
            Best record: {targetMember.longestStreak} days
          </span>
        </div>
      </div>

      {/* Account Details & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Unlocked Badges */}
        <div className="lg:col-span-2 bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              Earned Badges & Medals ({targetMember.badges.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map(badge => {
              const hasBadge = targetMember.badges.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    hasBadge
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-[#0E0E10] border-[#1E1E20] opacity-40 grayscale'
                  }`}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-bold text-white">{badge.name}</div>
                  <div className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">
                    {badge.description}
                  </div>
                  {hasBadge && (
                    <span className="inline-block text-[9px] font-bold text-green-400 mt-1 uppercase">
                      ✓ Earned
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Identity & Support Governance Card */}
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Identity Verification Status
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-[#0E0E10] border border-[#1E1E20] rounded-xl">
              <span className="text-gray-400">Name Lock Status</span>
              <span className={`font-bold flex items-center gap-1 ${targetMember.nameLocked ? 'text-indigo-400' : 'text-gray-400'}`}>
                {targetMember.nameLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {targetMember.nameLocked ? 'লকড (সুরক্ষিত)' : 'আনলকড'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#0E0E10] border border-[#1E1E20] rounded-xl">
              <span className="text-gray-400">GapChecker Compatibility</span>
              <span className="font-bold text-emerald-400 font-mono">100% Ready</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#0E0E10] border border-[#1E1E20] rounded-xl">
              <span className="text-gray-400">Links Submitted</span>
              <span className="font-bold text-white font-mono">{targetMember.linksSubmitted} links</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#0E0E10] border border-[#1E1E20] rounded-xl">
              <span className="text-gray-400">Official Notices</span>
              <span className={`font-bold font-mono ${targetMember.warningCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {targetMember.warningCount} notices
              </span>
            </div>
          </div>

          {/* Past Name Requests History */}
          {memberRequests.length > 0 && (
            <div className="pt-2 border-t border-[#1E1E20] space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                নাম পরিবর্তনের ইতিহাস
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {memberRequests.map(r => (
                  <div key={r.id} className="p-2 bg-[#0E0E10] rounded-lg border border-[#1E1E20] text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate max-w-[120px]">{r.requestedName}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                        r.status === 'approved' ? 'text-emerald-400 bg-emerald-500/10' :
                        r.status === 'rejected' ? 'text-rose-400 bg-rose-500/10' :
                        'text-amber-400 bg-amber-500/10'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    {r.adminNote && (
                      <p className="text-gray-500 text-[10px]">
                        নোট: {r.adminNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* REQUEST NAME CHANGE MODAL */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#131315] rounded-2xl shadow-2xl border border-[#1E1E20] w-full max-w-md p-5 space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-400" />
                ফেসবুক নাম পরিবর্তনের আবেদন
              </h3>
              <button 
                onClick={() => setShowChangeModal(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{requestMsg}</span>
              </div>
            )}

            {requestError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{requestError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitNameChange} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  বর্তমান নাম:
                </label>
                <div className="p-2.5 bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-xs text-gray-400">
                  {targetMember.facebookName || targetMember.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  অনুরোধকৃত নতুন ফেসবুক নাম (Exact Facebook Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ফেসবুকে হুবহু যেভাবে নাম আছে সেটি দিন"
                  value={requestedNameInput}
                  onChange={e => setRequestedNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
                {requestedNameInput && (
                  <div className="mt-1 text-[11px] text-gray-500">
                    GapChecker Normalized: <span className="text-indigo-400 font-mono">{normalizeFacebookName(requestedNameInput)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  নাম পরিবর্তনের কারণ (Reason)
                </label>
                <textarea
                  rows={2}
                  placeholder="যেমন: ফেসবুকে নামের পদবি পরিবর্তন করেছি / আসল নামে ভুল ছিল"
                  value={reasonInput}
                  onChange={e => setReasonInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-[11px] text-indigo-300 leading-relaxed">
                ℹ️ নাম পরিবর্তন করলে অ্যাডমিন প্যানেলে আবেদন জমা হবে। অ্যাডমিন পর্যালোচনা করে অনুমোদন দিলে আপনার ফেসবুক নাম আপডেট হবে এবং পরবর্তীতে সাপোর্ট গণনা সঠিক থাকবে।
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowChangeModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-600/20"
                >
                  আবেদন জমা দিন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
