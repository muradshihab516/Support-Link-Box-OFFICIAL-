import React, { useState, useEffect } from 'react';
import { DailyLink } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Zap, 
  ExternalLink, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  MessageSquare, 
  Sparkles, 
  X,
  Timer,
  Award,
  Maximize2,
  Minimize2,
  Flame,
  Volume2
} from 'lucide-react';
import { SponsoredBanner } from '../monetization/SponsoredBanner';
import { DisplayAdSlot } from '../monetization/DisplayAdSlot';
import confetti from 'canvas-confetti';
import { cleanAndFormatFacebookUrl } from '../../utils/facebookLinks';

interface TurboSupportRunnerProps {
  isOpen: boolean;
  onClose: () => void;
  allLinks: DailyLink[];
  initialIndex?: number;
}

const FAST_COMMENTS = [
  'অসাধারণ পোস্ট ভাই! দারুণ লাগলো 👍❤️',
  'খুবই সুন্দর ও তথ্যবহুল পোস্ট! শুভকামনা রইলো 👏✨',
  'Great content! Keep up the good work 🔥',
  'Valuable insights, thanks for sharing 🙌',
  'অনেক সুন্দর শেয়ার! এগিয়ে যান 💪',
  'Superb post, thoroughly enjoyed reading this! 🌟'
];

export const TurboSupportRunner: React.FC<TurboSupportRunnerProps> = ({
  isOpen,
  onClose,
  allLinks,
  initialIndex = 0
}) => {
  const { 
    currentUser, 
    markLinkSupported, 
    unmarkLinkSupported, 
    getTodaySupportStats 
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [copiedComment, setCopiedComment] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [secondsOnSite, setSecondsOnSite] = useState(0);
  const [autoNext, setAutoNext] = useState(true);
  const [openMode, setOpenMode] = useState<'m' | 'mbasic' | 'www'>('m');
  const [optimisticSupportedIds, setOptimisticSupportedIds] = useState<Record<string, boolean>>({});

  // Track session duration (Time on Site for Ad revenue)
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsOnSite(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  if (!isOpen || allLinks.length === 0) return null;

  const currentLink = allLinks[currentIndex] || allLinks[0];
  const stats = currentUser ? getTodaySupportStats(currentUser.id) : null;
  const isOriginallySupported = stats?.supportedLinkIds.has(currentLink.id) ?? false;
  const isSupported = optimisticSupportedIds[currentLink.id] !== undefined 
    ? optimisticSupportedIds[currentLink.id] 
    : isOriginallySupported;
  const isOwnLink = currentUser ? currentLink.memberId === currentUser.id : false;

  const totalEligible = allLinks.length;
  const supportedCount = (stats?.completedCount || 0) + Object.keys(optimisticSupportedIds).filter(id => !stats?.supportedLinkIds.has(id)).length;
  const progressPercent = totalEligible > 0 ? Math.round((supportedCount / totalEligible) * 100) : 0;

  const handleCopyLink = () => {
    const cleanUrl = cleanAndFormatFacebookUrl(currentLink.postUrl, openMode);
    navigator.clipboard.writeText(cleanUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyComment = (comment: string) => {
    navigator.clipboard.writeText(comment);
    setCopiedComment(comment);
    setTimeout(() => setCopiedComment(null), 2500);
  };

  const handleMarkAndNext = () => {
    if (!isSupported && !isOwnLink) {
      // 1. Instant optimistic update
      setOptimisticSupportedIds(prev => ({ ...prev, [currentLink.id]: true }));

      try {
        if ('vibrate' in navigator) navigator.vibrate(25);
      } catch {}

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });

      // 2. Background async write
      setTimeout(() => {
        markLinkSupported(currentLink.id);
      }, 0);
    }

    if (autoNext && currentIndex < allLinks.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0C] text-white animate-in fade-in duration-200">
      
      {/* Top Runner Header */}
      <header className="px-4 sm:px-6 py-3 bg-[#121215] border-b border-[#222226] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <Zap className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-white">টার্বো ফাস্ট সাপোর্ট মোড</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold rounded-full border border-emerald-500/30 animate-pulse">
                SUPER FAST
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              অ্যাপ পরিবর্তন ছাড়াই ব্রাউজারে দ্রুত সাপোর্ট সম্পন্ন করুন ও সাইটে লাইভ পয়েন্ট অর্জন করুন
            </p>
          </div>
        </div>

        {/* Live Session Time & Progress */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#18181D] rounded-xl border border-[#26262B] text-xs">
            <Timer className="w-4 h-4 text-indigo-400" />
            <span className="text-gray-400">সাইটে সময়:</span>
            <span className="font-mono font-bold text-amber-400">{formatTime(secondsOnSite)}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#18181D] px-3 py-1.5 rounded-xl border border-[#26262B]">
            <span className="text-xs font-bold text-gray-300 font-mono">
              {currentIndex + 1} / {totalEligible}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1C1C22] hover:bg-rose-500/20 hover:text-rose-400 text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-[#1A1A1E]">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${Math.max(5, ((currentIndex + 1) / totalEligible) * 100)}%` }}
        />
      </div>

      {/* Main Runner Workspace */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-5xl mx-auto w-full flex flex-col justify-between gap-6">
        
        {/* Top Sponsor/Ad Banner - Guarantees High Ad Visibility while member works */}
        <div className="w-full">
          <SponsoredBanner position="leaderboard_sponsor" />
        </div>

        {/* Current Active Task Card */}
        <div className="bg-[#141417] border border-[#25252A] rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
          
          {/* Member Info Header */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-[#202024]">
            <div className="flex items-center gap-3">
              <img 
                src={currentLink.memberAvatar} 
                alt={currentLink.memberName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/40"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-base sm:text-lg text-white">
                    {currentLink.memberName}
                  </h2>
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-lg font-mono">
                    #{currentLink.linkNumber}
                  </span>
                  {currentLink.badgeTitle && (
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${
                      currentLink.category === 'vip'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : currentLink.category === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {currentLink.badgeTitle}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  @{currentLink.memberUsername} • {currentLink.submittedAt}
                </div>
              </div>
            </div>

            {/* Quick Action Options */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">ব্রাউজার মোড:</span>
              <button
                onClick={() => setOpenMode('m')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  openMode === 'm'
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#202024] text-gray-400 hover:text-white'
                }`}
                title="Loads standard mobile web version"
              >
                🌐 m.facebook.com
              </button>
              <button
                onClick={() => setOpenMode('mbasic')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  openMode === 'mbasic'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-[#202024] text-gray-400 hover:text-white'
                }`}
                title="Ultra-fast basic mode that prevents App popups"
              >
                ⚡ mbasic (Lite Browser)
              </button>
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#202024] text-gray-300 hover:text-white flex items-center gap-1"
                title="Copy clean browser URL"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'কপি হয়েছে!' : 'লিংক কপি'}</span>
              </button>
            </div>
          </div>

          {/* Android In-Browser Guide Notice */}
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-200/90 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <span>💡 ব্রাউজারে সরাসরি খোলার নিয়ম (App পপ-আপ বন্ধ করতে):</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              যদি আপনার ফোনে <b>"Complete action using Facebook Lite"</b> পপ-আপ আসে এবং আপনি <b>ব্রাউজারেই</b> খুলতে চান:
              <br />
              👉 উপরে <b>⚡ mbasic</b> মোড সিলেক্ট করতে পারেন, অথবা ফোনের <b>Settings ➔ Apps ➔ Facebook Lite ➔ "Open by default" বা "Opening links"</b> অপশনে গিয়ে <b>"Open supported links" বন্ধ (Off)</b> করে দিন। এরপর থেকে প্রতিবার কোনো বাধা ছাড়াই ব্রাউজারেই পোস্ট খুলবে!
            </p>
          </div>

          {/* Instructions Box */}
          <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                  টাস্ক রিকুয়েস্ট (Task Requirement)
                </div>
                <p className="text-sm font-semibold text-white mt-0.5">
                  {currentLink.caption ? `"${currentLink.caption}"` : 'React + Positive Comment'}
                </p>
              </div>
            </div>

            {/* Big Launch Button - Native anchor for reliable mobile app intent and swipe navigation */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={cleanAndFormatFacebookUrl(currentLink.postUrl, openMode)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-transform active:scale-95 shrink-0"
              >
                <span>{openMode === 'mbasic' ? '⚡ mbasic-এ পোস্ট খুলুন' : '🌐 ফেসবুক অ্যাপ/ব্রাউজারে খুলুন'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* One Click Fast Comment Templates */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5 font-bold text-gray-200">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                এক ক্লিকে কমেন্ট কপি করে পেস্ট করুন:
              </span>
              <span>ক্লিক করলেই কপি হবে</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FAST_COMMENTS.map((comm, idx) => {
                const isCopied = copiedComment === comm;
                return (
                  <button
                    key={idx}
                    onClick={() => handleCopyComment(comm)}
                    className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 ${
                      isCopied
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-[#18181D] border-[#26262B] text-gray-300 hover:bg-[#202026] hover:border-indigo-500/40'
                    }`}
                  >
                    <span className="truncate">{comm}</span>
                    <span className="shrink-0 p-1.5 rounded-lg bg-[#24242A] text-gray-300">
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {copiedComment && (
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4" />
                কমেন্ট কপি হয়েছে! ফেসবুক ট্যাবে গিয়ে পেস্ট (Ctrl+V) করে রিঅ্যাক্ট দিন।
              </div>
            )}
          </div>

        </div>

        {/* In-feed Ad banner to monetize while supporting */}
        <div className="w-full">
          <DisplayAdSlot format="horizontal_banner" />
        </div>

      </div>

      {/* Sticky Bottom Control Bar */}
      <footer className="px-4 sm:px-6 py-4 bg-[#121215] border-t border-[#222226] flex items-center justify-between gap-3 shrink-0">
        
        {/* Previous Button */}
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 rounded-xl bg-[#1C1C22] hover:bg-[#24242C] disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">আগের পোস্ট</span>
        </button>

        {/* Center Main Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAndNext}
            className={`px-6 py-3 font-bold text-sm sm:text-base rounded-xl flex items-center gap-2 shadow-lg transition-transform active:scale-95 ${
              isSupported
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSupported ? '✓ সম্পন্ন হয়েছে' : 'সাপোর্ট করেছি & পরের পোস্ট'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Next Button */}
        <button
          onClick={() => setCurrentIndex(prev => Math.min(allLinks.length - 1, prev + 1))}
          disabled={currentIndex >= allLinks.length - 1}
          className="px-4 py-2.5 rounded-xl bg-[#1C1C22] hover:bg-[#24242C] disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
        >
          <span className="hidden sm:inline">পরের পোস্ট</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </footer>

    </div>
  );
};
