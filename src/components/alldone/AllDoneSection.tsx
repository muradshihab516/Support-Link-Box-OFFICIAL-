import React, { useState, useEffect, useMemo } from 'react';
import { useApp, isStaffOrAdminMember } from '../../context/AppContext';
import { AllDoneRecord, AltIdDisclosure } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  Trophy, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Check, 
  Send, 
  Flame, 
  Users, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  Info,
  Medal,
  Award,
  Zap,
  ArrowRight,
  Lock,
  X
} from 'lucide-react';
import { getBangladeshTimeInfo, formatTimeTo12Hour } from '../../utils/bangladeshTime';

interface AllDoneSectionProps {
  onNavigate?: (view: string) => void;
}

export const AllDoneSection: React.FC<AllDoneSectionProps> = ({ onNavigate }) => {
  const { 
    currentUser, 
    allDoneRecords, 
    altIdDisclosures, 
    settings, 
    checkAllDoneEligibility, 
    submitAllDone,
    getTodaySupportStats,
    darkMode 
  } = useApp();

  const [bdCurrentTime, setBdCurrentTime] = useState<string>('');
  const [bdCurrentDate, setBdCurrentDate] = useState<string>('');
  const [countdownString, setCountdownString] = useState<string>('');
  const [isWindowCurrentlyOpen, setIsWindowCurrentlyOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRank, setFilterRank] = useState<'all' | 'top5' | 'alt_id'>('all');

  // Submit Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [confirmedSupport, setConfirmedSupport] = useState<boolean>(false);
  const [hasAltIds, setHasAltIds] = useState<boolean>(false);
  const [altIdNames, setAltIdNames] = useState<string>('');
  const [altIdLinks, setAltIdLinks] = useState<string>('');
  const [userMessage, setUserMessage] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<string>('');
  const [lastSubmissionResult, setLastSubmissionResult] = useState<{
    isTop5?: boolean;
    rank?: number | null;
    pointsAwarded?: number;
  } | null>(null);

  // Live Bangladesh Time Clock & Window Countdown
  useEffect(() => {
    const updateTime = () => {
      const info = getBangladeshTimeInfo();
      setBdCurrentTime(formatTimeTo12Hour(info.time24));
      setBdCurrentDate(info.dateIso);
      if (!selectedDate) {
        setSelectedDate(info.dateIso);
      }

      const windowStart = settings.allDoneStartTime || '17:00'; // 5:00 PM BST
      const [startH, startM] = windowStart.split(':').map(Number);
      const currentTotalSeconds = info.hours * 3600 + info.minutes * 60 + info.seconds;
      const startTotalSeconds = startH * 3600 + startM * 60;

      if (currentTotalSeconds >= startTotalSeconds) {
        setIsWindowCurrentlyOpen(true);
        setCountdownString('উইন্ডো উন্মুক্ত');
      } else {
        setIsWindowCurrentlyOpen(false);
        const diff = startTotalSeconds - currentTotalSeconds;
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        setCountdownString(`${h} ঘণ্টা ${m} মিনিট ${s} সেকেন্ড`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [settings.allDoneStartTime, selectedDate]);

  // Eligibility Info for current user
  const eligibility = useMemo(() => {
    if (!currentUser) return null;
    return checkAllDoneEligibility(currentUser.id);
  }, [currentUser, checkAllDoneEligibility, allDoneRecords]);

  // Support Stats for current user
  const supportStats = useMemo(() => {
    if (!currentUser) return null;
    return getTodaySupportStats(currentUser.id);
  }, [currentUser, getTodaySupportStats]);

  const isStaff = isStaffOrAdminMember(currentUser);

  // Today's user record if submitted
  const currentUserTodayRecord = useMemo(() => {
    if (!currentUser || !bdCurrentDate) return null;
    return allDoneRecords.find(
      r => r.memberId === currentUser.id && r.date === bdCurrentDate
    );
  }, [currentUser, bdCurrentDate, allDoneRecords]);

  // Submissions for the selected date
  const recordsForSelectedDate = useMemo(() => {
    const targetDate = selectedDate || bdCurrentDate;
    return allDoneRecords
      .filter(r => r.date === targetDate)
      .sort((a, b) => a.submittedAtTimestamp - b.submittedAtTimestamp);
  }, [allDoneRecords, selectedDate, bdCurrentDate]);

  // Top 5 Fastest Supporters for the selected date
  const top5Fastest = useMemo(() => {
    return recordsForSelectedDate
      .filter(r => typeof r.fastestRank === 'number' && r.fastestRank >= 1 && r.fastestRank <= 5)
      .sort((a, b) => (a.fastestRank || 99) - (b.fastestRank || 99));
  }, [recordsForSelectedDate]);

  // Filtered Submissions Feed
  const filteredRecords = useMemo(() => {
    return recordsForSelectedDate.filter(r => {
      if (filterRank === 'top5' && (!r.fastestRank || r.fastestRank > 5)) {
        return false;
      }
      if (filterRank === 'alt_id' && (!r.otherIds && !r.otherIdLinks)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.memberName.toLowerCase().includes(q);
        const matchesNum = String(r.memberNumber).includes(q);
        const matchesMsg = (r.message || '').toLowerCase().includes(q);
        if (!matchesName && !matchesNum && !matchesMsg) return false;
      }
      return true;
    });
  }, [recordsForSelectedDate, filterRank, searchQuery]);

  // Total Points Distributed Today
  const totalPointsDistributed = useMemo(() => {
    return recordsForSelectedDate.reduce((sum, r) => sum + (r.basePoints || 3) + (r.bonusPoints || 0), 0);
  }, [recordsForSelectedDate]);

  // Handle Form Open
  const handleOpenSubmitModal = () => {
    setConfirmedSupport(false);
    setHasAltIds(false);
    setAltIdNames('');
    setAltIdLinks('');
    setUserMessage('');
    setSubmitError('');
    setSubmitSuccess('');
    setLastSubmissionResult(null);
    setIsSubmitModalOpen(true);
  };

  // Handle Submit All Done
  const handleSubmitAllDoneAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitError('');
    setSubmitSuccess('');

    if (!confirmedSupport) {
      setSubmitError('অনুগ্রহ করে নিশ্চিত করুন যে আপনি আজকের সকল লিংকে সাপোর্ট প্রদান করেছেন।');
      return;
    }

    if (hasAltIds && !altIdNames.trim()) {
      setSubmitError('আপনি অল্টারনেটিভ আইডি সিলেক্ট করেছেন। অনুগ্রহ করে আইডির নাম লিখুন।');
      return;
    }

    const res = submitAllDone({
      memberId: currentUser.id,
      message: userMessage.trim(),
      otherIds: hasAltIds ? altIdNames.trim() : undefined,
      otherIdLinks: hasAltIds ? altIdLinks.trim() : undefined
    });

    if (res.success) {
      setSubmitSuccess(res.message);
      setLastSubmissionResult({
        isTop5: res.isTop5,
        rank: res.rank,
        pointsAwarded: res.pointsAwarded
      });
      setTimeout(() => {
        setIsSubmitModalOpen(false);
      }, 2500);
    } else {
      setSubmitError(res.message);
    }
  };

  // Bonus Points Tier Helper
  const getRankBadgeInfo = (rank: number | null | undefined) => {
    switch (rank) {
      case 1:
        return {
          title: '১ম স্থান (1st Champion)',
          bonus: '+10 pts',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/20',
          podiumBg: 'from-amber-600/30 to-amber-950/40 border-amber-500/40',
          icon: '🥇'
        };
      case 2:
        return {
          title: '২য় স্থান (2nd Runner-up)',
          bonus: '+8 pts',
          bg: 'bg-slate-300/20 text-slate-200 border-slate-400/50 shadow-slate-400/20',
          podiumBg: 'from-slate-500/30 to-slate-900/40 border-slate-400/40',
          icon: '🥈'
        };
      case 3:
        return {
          title: '৩য় স্থান (3rd Place)',
          bonus: '+6 pts',
          bg: 'bg-amber-700/20 text-amber-400 border-amber-700/50 shadow-amber-700/20',
          podiumBg: 'from-amber-800/30 to-amber-950/40 border-amber-700/40',
          icon: '🥉'
        };
      case 4:
        return {
          title: '৪র্থ স্থান (4th Place)',
          bonus: '+4 pts',
          bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          podiumBg: 'from-indigo-900/30 to-slate-950/40 border-indigo-500/30',
          icon: '4️⃣'
        };
      case 5:
        return {
          title: '৫ম স্থান (5th Place)',
          bonus: '+2 pts',
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          podiumBg: 'from-purple-900/30 to-slate-950/40 border-purple-500/30',
          icon: '5️⃣'
        };
      default:
        return null;
    }
  };

  return (
    <div id="all-done-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Top Banner & Bangladesh Time Live Window Info */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-950/50 to-slate-900/90 border border-emerald-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Daily All Done Submission
              </span>

              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-900/80 text-gray-300 border border-slate-700/50 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{bdCurrentTime || 'Loading...'} BST</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />
              দৈনিক অল ডান (All Done) সাবমিশন ও র‍্যাংক
            </h1>
            
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              আজকের সকল মেম্বারের লিংকে সাপোর্ট সম্পন্ন করার পর এখানে অল ডান জমা দিন। প্রতিদিন বিকেল {formatTimeTo12Hour(settings.allDoneStartTime || '17:00')} BST-তে উইন্ডো উন্মুক্ত হয়।
            </p>
          </div>

          {/* Live Window State Badge & Submission Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 backdrop-blur-md ${
              isWindowCurrentlyOpen
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
            }`}>
              <div className={`w-3 h-3 rounded-full ${isWindowCurrentlyOpen ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider">
                  {isWindowCurrentlyOpen ? 'উইন্ডো উন্মুক্ত (Open)' : 'উইন্ডো বন্ধ (Closed)'}
                </div>
                <div className="text-xs font-semibold">
                  {isWindowCurrentlyOpen ? 'এখনই সাবমিট করতে পারেন' : `বাকি: ${countdownString}`}
                </div>
              </div>
            </div>

            {currentUser && !currentUserTodayRecord && (eligibility?.canSubmit || isStaff) && (
              <button
                id="btn-open-alldone-modal"
                onClick={handleOpenSubmitModal}
                className="px-5 py-3 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-emerald-600/30 transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>All Done জমা দিন</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User's Personal Status Today */}
      {currentUser && (
        <div className="rounded-xl border bg-[#131317] border-[#22222A] p-5 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left: Current Member Info & Status */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="relative">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#2E2E38]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-white font-bold text-base">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                {currentUserTodayRecord && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-white tracking-tight">
                    {currentUser.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-[#1C1C24] text-indigo-300 border border-[#2A2A36]">
                    #{currentUser.memberNumber}
                  </span>
                  {isStaff && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      অ্যাডমিন অ্যাকাউন্ট (সাপোর্ট ছাড়)
                    </span>
                  )}
                </div>

                {/* Status description */}
                {currentUserTodayRecord ? (
                  <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    আজকের All Done সম্পন্ন হয়েছে ({currentUserTodayRecord.submittedTimeBst})। 
                    {currentUserTodayRecord.fastestRank && (
                      <span className="text-amber-400">
                        🏆 আপনি {currentUserTodayRecord.fastestRank}ম স্থান অর্জন করে +{currentUserTodayRecord.bonusPoints} বোনাস পয়েন্ট পেয়েছেন!
                      </span>
                    )}
                  </p>
                ) : eligibility?.canSubmit ? (
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    আপনার সকল সাপোর্ট সম্পন্ন হয়েছে! দ্রুত অল ডান জমা দিয়ে টপ ৫ বোনাস জিতে নিন।
                  </p>
                ) : (
                  <p className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    {eligibility?.reason}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Quick Action / Status Badge */}
            <div className="flex items-center gap-2 self-start md:self-center">
              {currentUserTodayRecord ? (
                <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>+{ (currentUserTodayRecord.basePoints || 3) + (currentUserTodayRecord.bonusPoints || 0) } Points Earned</span>
                </div>
              ) : supportStats && supportStats.pendingCount > 0 && !isStaff ? (
                <button
                  onClick={() => onNavigate && onNavigate('daily_links')}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>সাপোর্ট বাকি ({supportStats.pendingCount}) • লিংক দেখুন</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (eligibility?.canSubmit || isStaff) ? (
                <button
                  onClick={handleOpenSubmitModal}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                >
                  সাবমিট করুন
                </button>
              ) : (
                <div className="px-3 py-1.5 rounded-lg bg-[#1E1E24] border border-[#2A2A35] text-gray-400 text-xs font-medium flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>৫:০০ টায় বাটন আসবে</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Top 5 Fastest Supporters Podium / Hall of Fame */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              🏆 আজকের দ্রুততম ৫ জন সাপোর্টার (Fastest Supporters)
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            স্পেশাল বোনাস: ১ম +১০, ২য় +৮, ৩য় +৬, ৪র্থ +৪, ৫ম +২ পয়েন্ট
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(rankNumber => {
            const champion = top5Fastest.find(r => r.fastestRank === rankNumber);
            const rankInfo = getRankBadgeInfo(rankNumber);

            if (champion) {
              return (
                <div
                  key={rankNumber}
                  className={`rounded-xl border p-4 bg-gradient-to-b ${rankInfo?.podiumBg} backdrop-blur-md shadow-lg space-y-2.5 relative overflow-hidden transform hover:-translate-y-0.5 transition-transform`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{rankInfo?.icon}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${rankInfo?.bg}`}>
                      {rankInfo?.bonus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {champion.memberAvatar ? (
                      <img
                        src={champion.memberAvatar}
                        alt={champion.memberName}
                        className="w-9 h-9 rounded-full object-cover border border-[#3A3A46]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-900/60 flex items-center justify-center text-white font-bold text-xs">
                        {champion.memberName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {champion.memberName}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        #{champion.memberNumber}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-300">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {champion.submittedTimeBst}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Verified
                    </span>
                  </div>
                </div>
              );
            }

            // Empty Slot (waiting for supporters)
            return (
              <div
                key={rankNumber}
                className="rounded-xl border border-dashed border-[#282832] bg-[#121216]/50 p-4 space-y-2.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg opacity-40">{rankInfo?.icon}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {rankInfo?.bonus}
                  </span>
                </div>
                <div className="text-center py-2">
                  <div className="text-xs font-semibold text-gray-400">
                    {rankNumber === 1 ? '১ম স্থান খালি' : rankNumber === 2 ? '২য় স্থান খালি' : rankNumber === 3 ? '৩য় স্থান খালি' : `${rankNumber}ম স্থান খালি`}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-0.5">
                    সাপোর্ট শেষ করে অল ডান দিন
                  </div>
                </div>
                <div className="h-4"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Statistics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#141418] border border-[#22222A] p-4 rounded-xl space-y-1">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>মোট All Done আজ</span>
          </div>
          <div className="text-xl font-extrabold text-white">
            {recordsForSelectedDate.length} জন
          </div>
        </div>

        <div className="bg-[#141418] border border-[#22222A] p-4 rounded-xl space-y-1">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>টপ ৫ চ্যাম্পিয়ন</span>
          </div>
          <div className="text-xl font-extrabold text-amber-300">
            {top5Fastest.length} / 5
          </div>
        </div>

        <div className="bg-[#141418] border border-[#22222A] p-4 rounded-xl space-y-1">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>বিতরণকৃত পয়েন্ট</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-400">
            +{totalPointsDistributed} pts
          </div>
        </div>

        <div className="bg-[#141418] border border-[#22222A] p-4 rounded-xl space-y-1">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>১ম সাবমিশন সময়</span>
          </div>
          <div className="text-sm font-extrabold text-purple-300 truncate font-mono">
            {recordsForSelectedDate[0]?.submittedTimeBst || 'এখনো হয়নি'}
          </div>
        </div>
      </div>

      {/* Public Submissions Live Feed */}
      <div className="space-y-4">
        
        {/* Controls: Search, Filter Tabs & Date */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#131317] border border-[#22222A] p-3 rounded-xl">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterRank('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterRank === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#1E1E26]'
              }`}
            >
              সকল সাবমিশন ({recordsForSelectedDate.length})
            </button>
            <button
              onClick={() => setFilterRank('top5')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                filterRank === 'top5'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-amber-400 hover:bg-[#1E1E26]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              টপ ৫ ({top5Fastest.length})
            </button>
            <button
              onClick={() => setFilterRank('alt_id')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                filterRank === 'alt_id'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-purple-400 hover:bg-[#1E1E26]'
              }`}
            >
              অল্টারনেটিভ আইডি সহ
            </button>
          </div>

          {/* Search Box & Date */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="মেম্বার বা আইডি নম্বর খুঁজুন..."
                className="w-full bg-[#1A1A22] text-gray-200 placeholder-gray-500 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-[#282830] focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submissions Table / Cards */}
        <div className="rounded-xl border border-[#22222A] bg-[#121216] overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-gray-600 mx-auto opacity-40" />
              <div className="text-sm font-semibold text-gray-300">কোনো All Done রেকর্ড পাওয়া যায়নি</div>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                আজ এখনো পর্যন্ত কেউ সাবমিট করেনি অথবা আপনার সার্চ ফিল্টারের সাথে মেলেনি।
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#1E1E26]">
              {filteredRecords.map((record, index) => {
                const rankInfo = getRankBadgeInfo(record.fastestRank);
                const isCurrentUser = currentUser?.id === record.memberId;

                return (
                  <div
                    key={record.id}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                      isCurrentUser ? 'bg-indigo-950/20' : 'hover:bg-[#16161C]'
                    }`}
                  >
                    {/* Left: Supporter Details */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="relative shrink-0">
                        {record.memberAvatar ? (
                          <img
                            src={record.memberAvatar}
                            alt={record.memberName}
                            className="w-10 h-10 rounded-full object-cover border border-[#2E2E38]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-900/60 flex items-center justify-center text-white font-bold text-xs">
                            {record.memberName.charAt(0)}
                          </div>
                        )}
                        {rankInfo && (
                          <div className="absolute -top-1.5 -left-1.5 text-base">
                            {rankInfo.icon}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">
                            {record.memberName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[11px] font-mono bg-[#1E1E28] text-indigo-300 border border-[#2C2C3A]">
                            #{record.memberNumber}
                          </span>
                          {rankInfo && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${rankInfo.bg}`}>
                              {rankInfo.title} ({rankInfo.bonus})
                            </span>
                          )}
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-600 text-white">
                              আপনি
                            </span>
                          )}
                        </div>

                        {/* Optional Message or Alt IDs */}
                        {record.message && (
                          <div className="text-xs text-gray-300 italic">
                            "{record.message}"
                          </div>
                        )}

                        {record.otherIds && (
                          <div className="text-[11px] text-purple-300 flex items-center gap-1.5 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40 w-fit">
                            <Users className="w-3 h-3 text-purple-400" />
                            <span>অল্টারনেটিভ আইডি: {record.otherIds}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Submission Timestamp & Points Pill */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-xs font-mono font-semibold text-gray-300 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {record.submittedTimeBst}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {record.date}
                        </div>
                      </div>

                      <div className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                        +{ (record.basePoints || 3) + (record.bonusPoints || 0) } pts
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Interactive All Done Submission Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#141418] border border-[#282832] rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#22222A] flex items-center justify-between bg-gradient-to-r from-emerald-950/40 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">দৈনিক All Done ঘোষণা দিন</h3>
                  <p className="text-xs text-gray-400">বাংলাদেশ সময়: {bdCurrentTime} BST</p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#202028]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmitAllDoneAction} className="p-6 space-y-4">
              
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    আলহামদুলিল্লাহ! অল ডান গৃহীত হয়েছে।
                  </div>
                  {lastSubmissionResult?.isTop5 && (
                    <div className="text-amber-300 font-semibold">
                      🎉 আপনি {lastSubmissionResult.rank}ম স্থান অর্জন করে বোনাসসহ মোট +{lastSubmissionResult.pointsAwarded} পয়েন্ট পেয়েছেন!
                    </div>
                  )}
                </div>
              )}

              {/* Bonus Promotion Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 space-y-1 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Fastest Supporters Bonus Program</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  আজকে এখনো পর্যন্ত {top5Fastest.length} জন টপ সাপোর্টার অল ডান দিয়েছেন। আপনি দ্রুত সাবমিট করলে শীর্ষ ৫ জনের একজন হিসেবে বিশেষ বোনাস পয়েন্ট পাবেন!
                </p>
              </div>

              {/* Mandatory Confirmation Checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#181820] border border-[#262630] cursor-pointer hover:border-[#343440] transition-colors">
                <input
                  type="checkbox"
                  checked={confirmedSupport}
                  onChange={e => setConfirmedSupport(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded bg-[#20202A] border-gray-600 focus:ring-emerald-500"
                />
                <div className="text-xs text-gray-300 leading-relaxed">
                  <span className="font-semibold text-white">সততা ও নিয়ম মেনে সাপোর্ট সম্পন্ন করেছি: </span>
                  আমি আজকের বিকেল ৫:০০ টা পর্যন্ত জমা হওয়া সকল এডমিন ও মেম্বার লিংকে নিয়মমাফিক সাপোর্ট প্রদান করেছি।
                </div>
              </label>

              {/* Action Buttons: Submit First */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!confirmedSupport}
                  className="w-full py-3 px-5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All Done Submit করুন</span>
                </button>
              </div>

              {/* Directly under the Submit Button: "আপনি কি অন্য আইডি দিয়ে সাপোর্ট কমপ্লিট করেছেন?" Toggle & Two Textboxes */}
              <div className="p-3.5 rounded-xl bg-[#181820] border border-[#262630] space-y-3">
                <div 
                  onClick={() => setHasAltIds(!hasAltIds)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>আপনি কি অন্য আইডি দিয়ে সাপোর্ট কমপ্লিট করেছেন?</span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      ক্লিক করলে আইডির নাম ও প্রোফাইল লিংক প্রদানের বক্স ওপেন হবে।
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasAltIds}
                    onChange={e => setHasAltIds(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded bg-[#20202A] border-gray-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>

                {hasAltIds && (
                  <div className="space-y-3 pt-2 border-t border-[#262630] animate-fade-in">
                    {/* Box 1 (উপরে): ঐ আইডি বা আইডিগুলোর নাম */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-purple-300">
                        ঐ আইডি বা আইডিগুলোর নাম *
                      </label>
                      <input
                        type="text"
                        value={altIdNames}
                        onChange={e => setAltIdNames(e.target.value)}
                        placeholder="যেমন: MD Emon (Second ID), Emon Khan"
                        className="w-full bg-[#131318] text-white text-xs rounded-lg px-3 py-2 border border-[#2E2E3A] focus:outline-none focus:border-purple-500"
                        required={hasAltIds}
                      />
                    </div>

                    {/* Box 2 (নিচেরটায়): আইডি লিংক */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400">
                        আইডি লিংক
                      </label>
                      <input
                        type="text"
                        value={altIdLinks}
                        onChange={e => setAltIdLinks(e.target.value)}
                        placeholder="https://facebook.com/your-alt-profile"
                        className="w-full bg-[#131318] text-white text-xs rounded-lg px-3 py-2 border border-[#2E2E3A] focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Message / Feedback */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">
                  আজকের মন্তব্য বা বার্তা (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={userMessage}
                  onChange={e => setUserMessage(e.target.value)}
                  placeholder="যেমন: আলহামদুলিল্লাহ আজকের সব সাপোর্ট সম্পন্ন করেছি।"
                  className="w-full bg-[#181820] text-white text-xs rounded-lg px-3 py-2 border border-[#262630] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Close Button */}
              <div className="pt-2 border-t border-[#22222A] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#202028]"
                >
                  বাতিল
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
