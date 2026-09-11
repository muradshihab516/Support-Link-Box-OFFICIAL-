import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Trophy, 
  Sparkles, 
  AlertTriangle, 
  Users, 
  Check, 
  ExternalLink,
  Lock,
  ChevronDown,
  ChevronUp,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useApp, isStaffOrAdminMember } from '../../context/AppContext';
import { getBangladeshTimeInfo, formatTimeTo12Hour } from '../../utils/bangladeshTime';

interface DailyAllDoneBoxProps {
  onNavigate?: (view: string) => void;
  onScrollToPending?: () => void;
  compact?: boolean;
}

export const DailyAllDoneBox: React.FC<DailyAllDoneBoxProps> = ({
  onNavigate,
  onScrollToPending,
  compact = false
}) => {
  const { 
    currentUser, 
    settings, 
    getTodaySupportStats, 
    allDoneRecords, 
    submitAllDone,
    isMemberAllDoneToday
  } = useApp();

  // Realtime Bangladesh Time State
  const [bdInfo, setBdInfo] = useState(() => getBangladeshTimeInfo());
  const [countdownStr, setCountdownStr] = useState('');
  const [hoursLeft, setHoursLeft] = useState(0);
  const [minsLeft, setMinsLeft] = useState(0);
  const [secsLeft, setSecsLeft] = useState(0);
  const [isWindowOpen, setIsWindowOpen] = useState(false);

  // Form State
  const [hasAltIds, setHasAltIds] = useState(false);
  const [altIdNames, setAltIdNames] = useState('');
  const [altIdLinks, setAltIdLinks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showAltDetails, setShowAltDetails] = useState(false);

  // Admin/Tester time override for previewing both before 5 PM and after 5 PM
  const [simulateAfter5PM, setSimulateAfter5PM] = useState<boolean | null>(null);

  const isStaff = isStaffOrAdminMember(currentUser);
  const windowStart = settings.allDoneStartTime || '17:00'; // Default 5:00 PM BST
  const [startH, startM] = windowStart.split(':').map(Number);

  // Clock ticker & countdown update
  useEffect(() => {
    const updateTime = () => {
      const info = getBangladeshTimeInfo();
      setBdInfo(info);

      const currentTotalSec = info.hours * 3600 + info.minutes * 60 + info.seconds;
      const startTotalSec = startH * 3600 + startM * 60;

      if (currentTotalSec >= startTotalSec) {
        setIsWindowOpen(true);
        setHoursLeft(0);
        setMinsLeft(0);
        setSecsLeft(0);
        setCountdownStr('উইন্ডো উন্মুক্ত');
      } else {
        setIsWindowOpen(false);
        const diffSec = startTotalSec - currentTotalSec;
        const h = Math.floor(diffSec / 3600);
        const m = Math.floor((diffSec % 3600) / 60);
        const s = diffSec % 60;
        setHoursLeft(h);
        setMinsLeft(m);
        setSecsLeft(s);
        setCountdownStr(`${h} ঘণ্টা ${m} মিনিট ${s} সেকেন্ড`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [startH, startM]);

  // Determine effective window state (supports tester toggle if specified)
  const effectiveWindowOpen = simulateAfter5PM !== null ? simulateAfter5PM : isWindowOpen;

  // Support Stats
  const stats = currentUser ? getTodaySupportStats(currentUser.id) : null;
  const pendingCount = isStaff ? 0 : (stats?.pendingCount ?? 0);
  const completedCount = stats?.completedCount ?? 0;
  const requiredCount = stats?.requiredCount ?? 0;
  // A to Z link support completion: strictly all required links must be supported
  const allLinksSupported = isStaff 
    ? true 
    : (requiredCount > 0 ? (pendingCount === 0 && completedCount >= requiredCount) : false);

  // User submission status today
  const targetDate = bdInfo.dateIso;
  const alreadyDone = currentUser ? isMemberAllDoneToday(currentUser.id, targetDate) : false;
  const userRecord = currentUser 
    ? allDoneRecords.find(r => r.memberId === currentUser.id && r.date === targetDate) 
    : null;

  // Today's All Done records count & top 5 positions
  const todayRecords = useMemo(() => {
    return allDoneRecords.filter(r => r.date === targetDate);
  }, [allDoneRecords, targetDate]);

  const currentRankPosition = todayRecords.length + 1;
  const isTop5Available = currentRankPosition <= 5;
  const potentialBonus = isTop5Available 
    ? (settings.pointRules?.fastestSupporterTiers || [10, 8, 6, 4, 2])[currentRankPosition - 1] || 0
    : 0;

  // Handle All Done Submit Action
  const handleSubmitAllDone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) return;
    setFeedback(null);

    // Validate alternative ID if checked
    if (hasAltIds && !altIdNames.trim()) {
      setFeedback({
        type: 'error',
        message: 'অনুগ্রহ করে আপনি যে অন্য ফেসবুক আইডি(সমূহ) দিয়ে সাপোর্ট করেছেন তার নাম লিখুন।'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = submitAllDone({
        memberId: currentUser.id,
        otherIds: hasAltIds ? altIdNames.trim() : undefined,
        otherIdLinks: hasAltIds ? altIdLinks.trim() : undefined,
        bypassTimeCheckForTest: simulateAfter5PM === true
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'সাবমিট করার সময় একটি ত্রুটি ঘটেছে। পুনরায় চেষ্টা করুন।'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  // Render 1: Already Submitted All Done Today
  if (alreadyDone && userRecord) {
    return (
      <div className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0D1F17] via-[#101815] to-[#121415] border border-emerald-500/40 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  আজকের All Done সম্পন্ন হয়েছে!
                </h3>
                {userRecord.fastestRank ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    #{userRecord.fastestRank} Fastest Champion
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    ✓ ভেরিফাইড
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                জমা দেওয়ার সময়: {userRecord.submittedTimeBst} • অর্জিত পয়েন্ট: +{(userRecord.basePoints || 3) + (userRecord.bonusPoints || 0)} pts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                onClick={() => onNavigate('all_done')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <span>আজকের লিডারবোর্ড</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {userRecord.otherIds && (
          <div className="text-xs p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 text-emerald-300/90 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400 shrink-0" />
            <span>ব্যবহৃত অল্টারনেটিভ আইডি: <strong>{userRecord.otherIds}</strong></span>
          </div>
        )}
      </div>
    );
  }

  // Render 2: All links completed BUT it is BEFORE 5:00 PM BST (Waiting for link submission cutoff)
  if (allLinksSupported && !effectiveWindowOpen) {
    const formattedWaitTime = hoursLeft > 0 
      ? `${hoursLeft} ঘণ্টা ${minsLeft} মিনিট` 
      : `${minsLeft} মিনিট ${secsLeft} সেকেন্ড`;

    return (
      <div className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1C180E] via-[#161410] to-[#121216] border-2 border-amber-500/40 shadow-xl space-y-4 animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-amber-200">
                  এখনো {hoursLeft > 0 ? `${hoursLeft} ঘণ্টা ` : ''}{minsLeft} মিনিট সময় বাকি আছে!
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  বাকিদের লিংক সাবমিশন চলছে
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                আপনি বর্তমানের সব লিংকে সাপোর্ট করেছেন। অনুগ্রহ করে বিকেল ৫:০০ টা পর্যন্ত বাকি মেম্বারদের লিংক সাবমিট করা পর্যন্ত অপেক্ষা করুন।
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 bg-black/40 px-3.5 py-2 rounded-xl border border-amber-500/30">
            <span className="text-[10px] text-gray-400 block">অল ডান শুরু হবে:</span>
            <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
              বিকেল {formatTimeTo12Hour(windowStart)} BST
            </span>
          </div>
        </div>

        {/* Informative Explanation Card */}
        <div className="p-3.5 rounded-xl bg-black/50 border border-amber-500/20 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              লিংক টাইম শেষ হওয়ার পরপরই All Done Submit বাটন ক্লিকেবল হবে
            </span>
            <span className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              কাউন্টডাউন: {countdownStr}
            </span>
          </div>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            বিকেল ৫:০০ টা পর্যন্ত মেম্বার ও এডমিনরা নতুন লিংক দিতে পারবেন। ৫:০০ টায় লিংক সাবমিশন লক হওয়ার সাথে সাথেই এখানে <strong>All Done Submit বাটন উন্মুক্ত হবে</strong>। তখন যে আগে ক্লিক করবে, প্রথম ৫ জন বেশি বোনাস পয়েন্ট পাবেন এবং নোটিশ বোর্ডে তাদের নাম Congratulations জানিয়ে ঘোষণা করা হবে! 🔥
          </p>
        </div>

        {/* Informative Status Badge instead of showing a disabled button */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>নোট:</strong> A to Z সকল লিংকে সাপোর্ট সম্পন্ন হয়েছে। বিকেল ৫:০০ টা বাজার সাথে সাথে এখানে স্বয়ংক্রিয়ভাবে <strong>All Done Submit বাটন</strong> উন্মুক্ত হবে।
          </span>
        </div>

        {/* Tester / Admin Simulation Toggle */}
        {isStaff && (
          <div className="pt-1 flex items-center justify-between text-[11px] text-gray-400 border-t border-amber-500/10">
            <span>এডমিন টেস্ট মোড (৫:০০ টার পরের অবস্থা দেখতে চান?):</span>
            <button
              onClick={() => setSimulateAfter5PM(true)}
              className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-[10px] font-bold"
            >
              টেস্ট: ৫:০০ টা পরের All Done বাটন অন করুন
            </button>
          </div>
        )}
      </div>
    );
  }

  // Render 3: AFTER 5:00 PM BST AND ALL links supported! (ACTIVE ALL DONE SUBMIT WINDOW)
  if (allLinksSupported && effectiveWindowOpen) {
    return (
      <div className="w-full p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0F2218] via-[#121C16] to-[#14151B] border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/40 space-y-4 animate-in fade-in">
        
        {/* Header Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0 shadow-lg shadow-emerald-500/20 animate-pulse">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  আপনার সকল লিংকে সাপোর্ট করা শেষ হয়েছে!
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-bounce">
                  অল ডান সাবমিট করুন
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                বিকেল ৫:০০ টা পর্যন্ত জমা পড়া সমস্ত এডমিন ও মেম্বার লিংকে আপনার সাপোর্ট শতভাগ সম্পন্ন হয়েছে।
              </p>
            </div>
          </div>

          {/* Fastest Supporter Rank & Points Tier Live Badge */}
          <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 rounded-xl px-4 py-2 shrink-0 text-left sm:text-right">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Fastest Rank: #{currentRankPosition}</span>
            </div>
            <span className="text-[11px] text-gray-300 block font-mono mt-0.5">
              এখন সাবমিট করলে: <strong className="text-amber-400">+{3 + potentialBonus} pts</strong>
            </span>
          </div>
        </div>

        {/* Feedback Messages */}
        {feedback && (
          <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
          }`}>
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
        )}

        {/* Fastest Supporters Live Incentive Banner */}
        <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            <span>প্রথম ৫ জনের জন্য বিশেষ বোনাস পয়েন্ট (১ম: +১০, ২য়: +৮, ৩য়: +৬, ৪র্থ: +৪, ৫ম: +২)</span>
          </div>
          <span className="text-gray-400 text-[11px]">
            আজকে ইতোমধ্যে {todayRecords.length} জন অল ডান দিয়েছেন
          </span>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmitAllDone} className="space-y-4 pt-1">
          
          {/* Main Prominent Clickable All Done Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 active:scale-[0.99] transition-all"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Clock className="w-5 h-5 animate-spin" />
                যাচাই ও সাবমিট হচ্ছে...
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>All Done সাবমিট করুন (ক্লিক করুন)</span>
                <Sparkles className="w-4 h-4 text-amber-950 animate-pulse" />
              </>
            )}
          </button>

          {/* Under the Submit Button: "আপনি কি অন্য আইডি দিয়ে সাপোর্ট কমপ্লিট করেছেন?" Toggle & Two Textboxes */}
          <div className="rounded-xl bg-[#131718] border border-[#232F28] p-3 sm:p-4 space-y-3 transition-colors">
            <div 
              onClick={() => {
                const next = !hasAltIds;
                setHasAltIds(next);
                if (next) setShowAltDetails(true);
              }}
              className="flex items-center justify-between cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="alt-id-checkbox-main"
                  checked={hasAltIds}
                  onChange={(e) => {
                    setHasAltIds(e.target.checked);
                    if (e.target.checked) setShowAltDetails(true);
                  }}
                  className="w-4 h-4 text-emerald-500 rounded bg-black/40 border-gray-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label 
                  htmlFor="alt-id-checkbox-main" 
                  className="text-xs sm:text-sm font-bold text-gray-200 group-hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  আপনি কি অন্য আইডি দিয়ে সাপোর্ট কমপ্লিট করেছেন?
                </label>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAltDetails(!showAltDetails);
                }}
                className="text-gray-400 hover:text-white p-1 rounded-md text-xs flex items-center gap-1"
              >
                <span className="text-[11px] text-gray-400 hidden sm:inline">
                  {hasAltIds ? 'বক্স ওপেন আছে' : 'ক্লিক করে তথ্য দিন'}
                </span>
                {showAltDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* When clicked/checked: opens two text boxes */}
            {hasAltIds && (
              <div className="pt-2 border-t border-[#232F28] space-y-3 animate-in fade-in slide-in-from-top-1">
                <p className="text-[11px] text-emerald-300/80">
                  নিচে আপনার বিকল্প ফেসবুক আইডির নাম ও লিংক উল্লেখ করুন যাতে এডমিন এবং পোস্টদাতা সঠিক সাপোর্ট ভেরিফাই করতে পারেন।
                </p>

                {/* Box 1 (উপরে): ঐ আইডি বা আইডিগুলোর নাম */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <span>১. ঐ আইডি বা আইডিগুলোর নাম *</span>
                    <span className="text-[10px] text-gray-400 font-normal">(উপরে নাম লিখুন)</span>
                  </label>
                  <input
                    type="text"
                    value={altIdNames}
                    onChange={(e) => setAltIdNames(e.target.value)}
                    placeholder="যেমন: MD Hasan Ali (2nd ID) বা একাধিক আইডি নাম"
                    className="w-full bg-black/60 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-emerald-500/30 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-all placeholder:text-gray-600"
                    required={hasAltIds}
                  />
                </div>

                {/* Box 2 (নিচেরটায়): আইডি লিংক */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <span>২. আইডি লিংক</span>
                    <span className="text-[10px] text-gray-400 font-normal">(নিচেরটায় প্রোফাইল লিংক দিন)</span>
                  </label>
                  <input
                    type="text"
                    value={altIdLinks}
                    onChange={(e) => setAltIdLinks(e.target.value)}
                    placeholder="যেমন: https://www.facebook.com/hasan.profile.link"
                    className="w-full bg-black/60 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-[#2E3832] focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Admin reset test simulation */}
        {simulateAfter5PM !== null && (
          <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1">
            <span>সিমুলেশন সক্রিয় রয়েছে</span>
            <button
              onClick={() => setSimulateAfter5PM(null)}
              className="text-amber-400 hover:underline"
            >
              স্বাভাবিক সময়ে ফিরুন
            </button>
          </div>
        )}
      </div>
    );
  }

  // Render 4: AFTER 5:00 PM BST, BUT member STILL has pending links!
  if (!allLinksSupported && effectiveWindowOpen) {
    return (
      <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#181512] to-[#141416] border border-amber-500/30 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                আপনার এখনো {pendingCount}টি লিংকে সাপোর্ট করা বাকি আছে
              </h3>
              <p className="text-xs text-amber-300/90 mt-0.5">
                A to Z সকল লিংকে ক্লিক করে সাপোর্ট সম্পন্ন করলে তবেই All Done সাবমিট বাটন শো হবে। তার আগে কোনো বাটন শো হবে না।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onScrollToPending && (
              <button
                onClick={onScrollToPending}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>বাকি লিংকগুলো সাপোর্ট দিন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>সাপোর্ট অগ্রগতি: {completedCount}/{requiredCount} সম্পন্ন</span>
            <span className="font-mono text-amber-400 font-bold">{Math.round((completedCount / (requiredCount || 1)) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((completedCount / (requiredCount || 1)) * 100))}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Render 5: BEFORE 5:00 PM BST AND member has pending links (regular daytime ongoing state)
  return (
    <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-[#121217] border border-[#202028] shadow-md space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">দৈনিক সাপোর্ট চলছে</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-semibold">
                বিকেল ৫:০০ টায় অল ডান শুরু
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              এখন পর্যন্ত জমা হওয়া {completedCount}/{requiredCount} টি লিংকে সাপোর্ট সম্পন্ন হয়েছে। বাকি আছে {pendingCount} টি।
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-[11px] font-mono text-gray-400">
            বাকি সময়: <strong className="text-indigo-300">{hoursLeft > 0 ? `${hoursLeft}ঘ ` : ''}{minsLeft}মি</strong>
          </span>
        </div>
      </div>

      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.round((completedCount / (requiredCount || 1)) * 100))}%` }}
        />
      </div>
    </div>
  );
};
