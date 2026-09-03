import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyLink } from '../../types';
import { 
  SkipBack, 
  SkipForward, 
  ExternalLink, 
  Check, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Copy, 
  MessageSquare, 
  Share2, 
  Layers, 
  Zap, 
  ChevronRight, 
  ChevronLeft,
  X,
  Flame,
  CheckCheck,
  RotateCcw,
  ArrowUpRight,
  ListFilter,
  UserCheck,
  PartyPopper,
  Trophy,
  ArrowRight,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cleanAndFormatFacebookUrl } from '../../utils/facebookLinks';

interface YouTubeStyleSupportSessionProps {
  initialLinkId?: string;
  onClose?: () => void;
}

// Preset suggested comments for instant copy-paste interaction
const COMMENT_SUGGESTIONS = [
  {
    id: 'c1',
    category: '🔥 Appreciation',
    textBn: 'অসাধারণ পোস্ট ভাই! আপনার লেখা সবসময় অনুপ্রেরণা দেয় ❤️',
    textEn: 'Outstanding post! Always inspiring and impactful 🔥'
  },
  {
    id: 'c2',
    category: '👏 Value & Insights',
    textBn: 'চমৎকার এবং তথ্যবহুল একটি পোস্ট! শেয়ার করার জন্য অনেক ধন্যবাদ 👏',
    textEn: 'Very informative and valuable post! Thanks for sharing 👍'
  },
  {
    id: 'c3',
    category: '🚀 Encouragement',
    textBn: 'দারুণ কাজ! নিয়মিত এমন মানসম্মত পোস্ট দেখতে চাই, এগিয়ে যান 🚀',
    textEn: 'Brilliant work! Keep pushing forward with quality content 🚀'
  },
  {
    id: 'c4',
    category: '💬 Engagement',
    textBn: 'একদম সঠিক পয়েন্ট তুলে ধরেছেন, ১০০% সহমত ভাই! 🙌',
    textEn: 'Completely agree with your points! Very well articulated 🙌'
  }
];

// Helper to find next pending link index in circular/sequential order
const findNextPendingLinkIndex = (
  fromIndex: number,
  links: DailyLink[],
  optimistic: Record<string, boolean>,
  supported: Set<string>,
  currentUserId?: string
): number => {
  const isPending = (link: DailyLink) => {
    if (currentUserId && link.memberId === currentUserId) return false;
    const isSupp = optimistic[link.id] !== undefined ? optimistic[link.id] : supported.has(link.id);
    return !isSupp;
  };

  // 1. Search forward from fromIndex + 1 to end
  for (let i = fromIndex + 1; i < links.length; i++) {
    if (isPending(links[i])) return i;
  }

  // 2. Wrap around from 0 to fromIndex - 1
  for (let i = 0; i < fromIndex; i++) {
    if (isPending(links[i])) return i;
  }

  return -1;
};

export const YouTubeStyleSupportSession: React.FC<YouTubeStyleSupportSessionProps> = ({
  initialLinkId,
  onClose
}) => {
  const { 
    currentUser, 
    dailyLinks, 
    getTodaySupportStats, 
    markLinkSupported, 
    unmarkLinkSupported 
  } = useApp();

  // Filter state for playlist
  const [playlistFilter, setPlaylistFilter] = useState<'all' | 'pending' | 'supported'>('all');
  const [copiedCommentId, setCopiedCommentId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  
  // Auto-advance toggle (Auto-mark + Auto-next when returning from Facebook)
  const [autoAdvanceOnReturn, setAutoAdvanceOnReturn] = useState(true);

  // Return toast notice
  const [returnNotice, setReturnNotice] = useState<{
    type: 'success' | 'warning' | 'completed';
    message: string;
  } | null>(null);

  // All completed view state
  const [isAllSessionCompleted, setIsAllSessionCompleted] = useState(false);

  // Optimistic UI state for instant 0ms checkmark reflection
  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, boolean>>({});

  const stats = currentUser ? getTodaySupportStats(currentUser.id) : null;
  const supportedSet = useMemo(() => stats ? stats.supportedLinkIds : new Set<string>(), [stats]);

  // All eligible links (sorted by linkNumber)
  const sortedLinks = useMemo(() => {
    return [...dailyLinks].sort((a, b) => a.linkNumber - b.linkNumber);
  }, [dailyLinks]);

  // Current playing link index
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (initialLinkId) {
      const foundIndex = sortedLinks.findIndex(l => l.id === initialLinkId);
      if (foundIndex !== -1) return foundIndex;
    }
    // Default to first pending link if available
    if (currentUser && stats) {
      const firstPendingIndex = sortedLinks.findIndex(l => !stats.supportedLinkIds.has(l.id) && l.memberId !== currentUser.id);
      if (firstPendingIndex !== -1) return firstPendingIndex;
    }
    return 0;
  });

  const activeLink = sortedLinks[currentIndex] || sortedLinks[0];

  // Ref to track pending return state
  const pendingSessionRef = useRef<{
    linkId: string;
    linkNumber: number;
    startTime: number;
  } | null>(null);

  // Ref to playlist container and active item for auto-scrolling
  const playlistContainerRef = useRef<HTMLDivElement | null>(null);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll the active playlist item into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentIndex]);

  // Keyboard navigation shortcuts: Left Arrow (Prev), Right Arrow (Next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, sortedLinks.length]);

  // Calculate optimistic state for active link
  const isActiveSupported = activeLink ? (
    optimisticStatus[activeLink.id] !== undefined
      ? optimisticStatus[activeLink.id]
      : supportedSet.has(activeLink.id)
  ) : false;

  const isOwnLink = currentUser && activeLink ? activeLink.memberId === currentUser.id : false;

  // Filtered playlist links
  const filteredPlaylist = useMemo(() => {
    return sortedLinks.filter(link => {
      const isSupp = optimisticStatus[link.id] !== undefined
        ? optimisticStatus[link.id]
        : supportedSet.has(link.id);

      if (playlistFilter === 'pending') {
        return !isSupp && (!currentUser || link.memberId !== currentUser.id);
      }
      if (playlistFilter === 'supported') {
        return isSupp;
      }
      return true;
    });
  }, [sortedLinks, optimisticStatus, supportedSet, playlistFilter, currentUser]);

  // =========================================================================
  // AUTO-ADVANCE FLOW: Return Detection & Auto-Mark Logic
  // When member clicks "Support Now / Let's Go", a timestamp is recorded.
  // When they return (visibilitychange / window focus) after at least 3 seconds,
  // the current link is automatically marked as Supported and the player
  // automatically advances to the next pending link!
  // =========================================================================
  useEffect(() => {
    const handleReturnCheck = () => {
      if (document.visibilityState === 'hidden') return;

      // Retrieve pending session from ref or fallback sessionStorage
      let session = pendingSessionRef.current;
      if (!session) {
        try {
          const stored = sessionStorage.getItem('slb_pending_support_session');
          if (stored) session = JSON.parse(stored);
        } catch {}
      }

      if (!session) return;

      // Clear immediately to prevent double firing
      pendingSessionRef.current = null;
      try {
        sessionStorage.removeItem('slb_pending_support_session');
      } catch {}

      // Calculate time spent outside on Facebook
      const elapsedSeconds = (Date.now() - session.startTime) / 1000;

      // Safeguard: must have spent at least 3 seconds on Facebook
      if (elapsedSeconds >= 3) {
        const completedLinkId = session.linkId;
        const completedLinkNumber = session.linkNumber;

        // 1. Instant optimistic update
        setOptimisticStatus(prev => ({ ...prev, [completedLinkId]: true }));

        // 2. Haptic & Confetti feedback
        try {
          if ('vibrate' in navigator) navigator.vibrate([25, 35, 25]);
        } catch {}

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });

        // 3. Async background write
        setTimeout(() => {
          markLinkSupported(completedLinkId);
        }, 0);

        // 4. Auto advance to next pending link
        if (autoAdvanceOnReturn) {
          const updatedOptimistic = { ...optimisticStatus, [completedLinkId]: true };
          const nextIdx = findNextPendingLinkIndex(
            currentIndex,
            sortedLinks,
            updatedOptimistic,
            supportedSet,
            currentUser?.id
          );

          if (nextIdx !== -1) {
            const nextLink = sortedLinks[nextIdx];
            setCurrentIndex(nextIdx);
            setReturnNotice({
              type: 'success',
              message: `✅ লিংক #${completedLinkNumber} সাপোর্ট হয়েছে! পরবর্তী লিংক #${nextLink.linkNumber} রেডি।`
            });
          } else {
            // All links finished!
            setIsAllSessionCompleted(true);
            setReturnNotice({
              type: 'completed',
              message: `🎉 অভিনন্দন! আজকের সকল লিংক সাপোর্ট করা সম্পন্ন হয়েছে!`
            });
            confetti({
              particleCount: 120,
              spread: 100,
              origin: { y: 0.5 }
            });
          }
        } else {
          setReturnNotice({
            type: 'success',
            message: `✅ লিংক #${completedLinkNumber} সাপোর্ট সম্পন্ন হয়েছে!`
          });
        }

        setTimeout(() => {
          setReturnNotice(null);
        }, 4000);
      } else {
        // Returned too fast (under 3s safeguard)
        setReturnNotice({
          type: 'warning',
          message: `⚠️ খুব দ্রুত ফিরে এসেছেন (কমপক্ষে ৩-৪ সেকেন্ড ফেসবুকে লাইক/কমেন্ট করে ফিরে আসুন)।`
        });
        setTimeout(() => {
          setReturnNotice(null);
        }, 3500);
      }
    };

    document.addEventListener('visibilitychange', handleReturnCheck);
    window.addEventListener('focus', handleReturnCheck);

    return () => {
      document.removeEventListener('visibilitychange', handleReturnCheck);
      window.removeEventListener('focus', handleReturnCheck);
    };
  }, [currentIndex, sortedLinks, optimisticStatus, supportedSet, currentUser, autoAdvanceOnReturn]);

  // Click handler for "Support Now / Let's Go" button
  const handleSupportNowClick = () => {
    if (!activeLink || isOwnLink) return;

    const sessionData = {
      linkId: activeLink.id,
      linkNumber: activeLink.linkNumber,
      startTime: Date.now()
    };
    pendingSessionRef.current = sessionData;
    try {
      sessionStorage.setItem('slb_pending_support_session', JSON.stringify(sessionData));
    } catch {}
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < sortedLinks.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSelectLink = (linkId: string) => {
    const targetIdx = sortedLinks.findIndex(l => l.id === linkId);
    if (targetIdx !== -1) {
      setCurrentIndex(targetIdx);
      setIsAllSessionCompleted(false);
    }
  };

  // Manual toggle for support button
  const handleToggleSupport = (linkId: string) => {
    const isCurrentlySupported = optimisticStatus[linkId] !== undefined
      ? optimisticStatus[linkId]
      : supportedSet.has(linkId);

    if (isCurrentlySupported) {
      // Unmark
      setOptimisticStatus(prev => ({ ...prev, [linkId]: false }));
      setTimeout(() => {
        unmarkLinkSupported(linkId);
      }, 0);
    } else {
      // Mark as supported
      setOptimisticStatus(prev => ({ ...prev, [linkId]: true }));
      
      try {
        if ('vibrate' in navigator) navigator.vibrate(25);
      } catch {}

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      setTimeout(() => {
        markLinkSupported(linkId);
      }, 0);

      // Advance to next pending link if enabled
      if (autoAdvanceOnReturn) {
        const updatedOptimistic = { ...optimisticStatus, [linkId]: true };
        const nextIdx = findNextPendingLinkIndex(
          currentIndex,
          sortedLinks,
          updatedOptimistic,
          supportedSet,
          currentUser?.id
        );

        if (nextIdx !== -1) {
          setTimeout(() => {
            setCurrentIndex(nextIdx);
          }, 350);
        } else {
          setIsAllSessionCompleted(true);
        }
      }
    }
  };

  const handleCopyLink = () => {
    if (!activeLink) return;
    const cleanUrl = cleanAndFormatFacebookUrl(activeLink.postUrl, 'm');
    navigator.clipboard.writeText(cleanUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyComment = (commentId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommentId(commentId);
    setTimeout(() => setCopiedCommentId(null), 2200);
  };

  // Optimistic calculation for header tracker bar
  const optimisticPendingAdjustment = useMemo(() => {
    return Object.entries(optimisticStatus).reduce((acc, [id, val]) => {
      const originallySupported = supportedSet.has(id);
      if (val && !originallySupported) return acc + 1;
      if (!val && originallySupported) return acc - 1;
      return acc;
    }, 0);
  }, [optimisticStatus, supportedSet]);

  const effectiveCompletedCount = Math.max(0, (stats?.completedCount ?? 0) + optimisticPendingAdjustment);
  const effectiveTotal = stats?.requiredCount || sortedLinks.length;
  const effectiveProgressPercent = effectiveTotal > 0
    ? Math.min(100, Math.round((effectiveCompletedCount / effectiveTotal) * 100))
    : 0;

  const directFbUrl = activeLink ? cleanAndFormatFacebookUrl(activeLink.postUrl, 'm') : '#';

  // Find what the next upcoming pending link is (for preview/hint on the button)
  const nextPendingLink = useMemo(() => {
    const nextIdx = findNextPendingLinkIndex(
      currentIndex,
      sortedLinks,
      optimisticStatus,
      supportedSet,
      currentUser?.id
    );
    return nextIdx !== -1 ? sortedLinks[nextIdx] : null;
  }, [currentIndex, sortedLinks, optimisticStatus, supportedSet, currentUser]);

  if (!activeLink) {
    return (
      <div className="p-8 text-center text-gray-400">
        কোনো লিংক পাওয়া যায়নি।
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] max-w-7xl mx-auto rounded-2xl overflow-hidden bg-[#0A0A0C] border border-[#1E1E22] shadow-2xl relative">
      
      {/* Dynamic Return Floating Banner / Toast */}
      {returnNotice && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce border backdrop-blur-md transition-all">
          {returnNotice.type === 'success' && (
            <div className="bg-emerald-600/95 text-white border-emerald-400/40 flex items-center gap-2 px-3 py-1 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-200" />
              <span>{returnNotice.message}</span>
            </div>
          )}
          {returnNotice.type === 'warning' && (
            <div className="bg-amber-600/95 text-white border-amber-400/40 flex items-center gap-2 px-3 py-1 rounded-lg">
              <span>{returnNotice.message}</span>
            </div>
          )}
          {returnNotice.type === 'completed' && (
            <div className="bg-indigo-600/95 text-white border-indigo-400/40 flex items-center gap-2 px-3 py-1 rounded-lg">
              <PartyPopper className="w-4 h-4 text-amber-300" />
              <span>{returnNotice.message}</span>
            </div>
          )}
        </div>
      )}

      {/* Top Session Bar (YouTube Queue Header) */}
      <div className="px-4 py-3 bg-[#111114] border-b border-[#1E1E22] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 font-black text-xs shrink-0">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                Support Player Session
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded uppercase tracking-wider">
                  Auto-Advance
                </span>
              </span>
            </div>
            <div className="text-[11px] text-gray-400 flex items-center gap-2">
              <span>{effectiveCompletedCount} / {effectiveTotal} সম্পন্ন ({effectiveProgressPercent}%)</span>
              <span className="text-gray-600">•</span>
              <span className="text-indigo-400 font-semibold">লিংক #{activeLink.linkNumber} একটিভ</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="hidden md:flex flex-col items-end gap-1 flex-1 max-w-xs">
          <div className="w-full bg-[#1A1A20] rounded-full h-2 overflow-hidden border border-[#26262F]">
            <div 
              className="bg-gradient-to-r from-red-500 via-indigo-500 to-green-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${effectiveProgressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500 font-medium">
            ফেসবুক থেকে ফিরে এলে অটোমেটিক পরের লিংক লোড হবে ⚡
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Auto-Advance Toggle */}
          <button
            onClick={() => setAutoAdvanceOnReturn(!autoAdvanceOnReturn)}
            className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
              autoAdvanceOnReturn 
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' 
                : 'bg-[#18181C] border-[#222228] text-gray-400 hover:text-white'
            }`}
            title="ফেসবুক থেকে ফিরে এলে স্বয়ংক্রিয়ভাবে পরবর্তী লিংক লোড হবে"
          >
            <RotateCcw className={`w-3 h-3 ${autoAdvanceOnReturn ? 'text-indigo-400 animate-spin-reverse' : 'text-gray-500'}`} />
            <span className="hidden sm:inline">অটো-নেক্সট:</span>
            <span>{autoAdvanceOnReturn ? 'অন' : 'অফ'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#202026] rounded-lg transition-colors"
              title="প্লেয়ার বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Top Display (~50% screen height) + Bottom Playlist (YouTube Queue) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* =========================================================================
            1. TOP / MAIN DISPLAY (Player Stage ~50% screen height)
            ========================================================================= */}
        <div className="flex-shrink-0 bg-gradient-to-b from-[#131317] to-[#0D0D10] border-b border-[#1E1E22] p-4 sm:p-5 overflow-y-auto max-h-[55vh] min-h-[40vh] flex flex-col justify-between">
          
          {isAllSessionCompleted ? (
            /* Celebratory All Completed Screen */
            <div className="p-6 text-center space-y-4 my-auto">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  আজকের সকল লিংক সফলভাবে সম্পন্ন হয়েছে! 🎉
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-md mx-auto">
                  আপনি আজকের সব যোগ্য লিংকে সাপোর্ট সম্পন্ন করেছেন। আপনার ডেডিকেশনের জন্য ধন্যবাদ!
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsAllSessionCompleted(false)}
                  className="px-4 py-2 bg-[#1C1C22] hover:bg-[#25252D] border border-[#2E2E38] text-gray-300 hover:text-white text-xs font-bold rounded-xl transition-colors"
                >
                  প্লেলিস্ট রিভিউ করুন
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-transform active:scale-95"
                  >
                    ড্যাশবোর্ডে ফিরুন
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Stage Header: Category, Serial Number, Support State */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-wider px-2.5 py-1 rounded-md bg-red-600 text-white shadow-xs">
                    LINK #{activeLink.linkNumber.toString().padStart(2, '0')}
                  </span>
                  
                  {activeLink.category && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {activeLink.category}
                    </span>
                  )}

                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    {activeLink.submittedAt}
                  </span>
                </div>

                {/* Status Badge */}
                <div>
                  {isOwnLink ? (
                    <span className="text-xs font-bold px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-full">
                      আপনার নিজের লিংক
                    </span>
                  ) : isActiveSupported ? (
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>✓ Supported</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      <span>Pending Support</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Member Details & Post Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-indigo-600/20 shrink-0">
                    {activeLink.memberName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                        {activeLink.memberName}
                      </h2>
                      {activeLink.badgeTitle && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#202028] text-indigo-300 border border-[#2D2D38]">
                          {activeLink.badgeTitle}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                      <span>@{activeLink.memberUsername}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-amber-400/90 font-semibold">{activeLink.supportCount + (isActiveSupported && !supportedSet.has(activeLink.id) ? 1 : 0)} supports so far</span>
                    </div>
                  </div>
                </div>

                {/* Copy Post URL button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 bg-[#1C1C22] hover:bg-[#25252D] border border-[#2B2B36] text-gray-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="লিংক কপি করুন"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>লিংক কপি</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Post Caption / Details if present */}
              {activeLink.caption && (
                <div className="mt-3 p-2.5 bg-[#0E0E12] border border-[#1A1A22] rounded-xl text-xs text-gray-300 leading-relaxed max-w-3xl">
                  <span className="text-gray-500 font-semibold mr-1.5">পোস্ট নোট:</span>
                  "{activeLink.caption}"
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              2 & 3. CONTROLS: PREVIOUS, PROMINENT "SUPPORT NOW / LET'S GO", NEXT
              ========================================================================= */}
          <div className="pt-4 mt-3 border-t border-[#1C1C22] space-y-3">
            
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`p-3 sm:px-4 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border transition-all active:scale-95 shrink-0 ${
                  currentIndex === 0
                    ? 'bg-[#121215] border-[#1C1C22] text-gray-600 cursor-not-allowed'
                    : 'bg-[#1A1A20] hover:bg-[#22222B] border-[#2A2A35] text-gray-200 hover:text-white shadow-md'
                }`}
                title="আগের লিংক (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* ⭐ PROMINENT "SUPPORT NOW / LET'S GO" BUTTON (THE LARGEST BUTTON) ⭐
                  Direct native anchor with target="_blank" and onClick session tracking */}
              <a
                href={directFbUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSupportNowClick}
                className="flex-1 py-3.5 sm:py-4 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition-all duration-150 active:scale-[0.98] border border-blue-400/30 group"
                title="সরাসরি ফেসবুক অ্যাপ অথবা ব্রাউজারে পোস্টটি ওপেন করুন"
              >
                <span className="text-lg">🔥</span>
                <span className="tracking-wide">Support Now / Let's Go</span>
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={currentIndex === sortedLinks.length - 1}
                className={`p-3 sm:px-4 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border transition-all active:scale-95 shrink-0 ${
                  currentIndex === sortedLinks.length - 1
                    ? 'bg-[#121215] border-[#1C1C22] text-gray-600 cursor-not-allowed'
                    : 'bg-[#1A1A20] hover:bg-[#22222B] border-[#2A2A35] text-gray-200 hover:text-white shadow-md'
                }`}
                title="পরের লিংক (Right Arrow)"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Mark Supported / Completed Button */}
              {!isOwnLink && (
                <button
                  onClick={() => handleToggleSupport(activeLink.id)}
                  className={`px-3.5 sm:px-5 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 shrink-0 border ${
                    isActiveSupported
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/50 ring-2 ring-emerald-500/30'
                      : 'bg-[#1F1F26] hover:bg-[#282833] text-gray-200 border-[#2E2E3C] hover:border-emerald-500/40'
                  }`}
                  title="সাপোর্ট সম্পন্ন হলে মার্ক করুন"
                >
                  {isActiveSupported ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span className="hidden sm:inline">Supported</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-gray-400" />
                      <span>মার্ক সাপোর্ট</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Hint for Next upcoming pending link */}
            {nextPendingLink && (
              <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                  পরবর্তী রেডি লিংক: <strong className="text-gray-300">#{nextPendingLink.linkNumber} ({nextPendingLink.memberName})</strong>
                </span>
                <span className="text-indigo-400 font-semibold">
                  ফিরে আসলেই স্বয়ংক্রিয়ভাবে লোড হবে
                </span>
              </div>
            )}

            {/* =========================================================================
                8. FUTURE-READY SECTION: COMMENT SUGGESTIONS / SUGGESTED COMMENTS
                Modular component area to copy quality Facebook comments with 1-click!
                ========================================================================= */}
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>কমেন্ট সাজেশন (১-ক্লিকে কপি করুন)</span>
                  <span className="text-[10px] text-gray-500">
                    {isCommentsOpen ? '▲ লুকান' : '▼ দেখুন'}
                  </span>
                </button>
                <span className="text-[11px] text-gray-500">ফেসবুকে মানসম্মত কমেন্ট করার রেডিমেড টেমপ্লেট</span>
              </div>

              {isCommentsOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-1">
                  {COMMENT_SUGGESTIONS.map(comment => {
                    const isCopied = copiedCommentId === comment.id;
                    return (
                      <div
                        key={comment.id}
                        className="bg-[#0B0B0E] border border-[#1C1C24] hover:border-indigo-500/30 p-2.5 rounded-xl flex items-center justify-between gap-2 group transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold text-indigo-400/80 mb-0.5">
                            {comment.category}
                          </div>
                          <p className="text-xs text-gray-200 truncate">
                            {comment.textBn}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopyComment(comment.id, comment.textBn)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 transition-all active:scale-95 ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#181820] hover:bg-indigo-600/20 text-gray-300 hover:text-indigo-300 border border-[#252530]'
                          }`}
                          title="কমেন্টটি কপি করুন"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-white" />
                              <span>কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>কপি</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* =========================================================================
            4 & 5. BOTTOM PLAYLIST (YOUTUBE QUEUE STYLE LIST)
            ========================================================================= */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0D]">
          
          {/* Playlist Queue Header & Filters */}
          <div className="px-4 py-2.5 bg-[#0F0F13] border-b border-[#1A1A20] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block animate-ping" />
                সাপোর্ট প্লেলিস্ট কিউ
              </span>
              <span className="text-xs text-gray-500 font-bold">
                ({filteredPlaylist.length} টি লিংক)
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#15151A] p-1 rounded-lg border border-[#202028]">
              <button
                onClick={() => setPlaylistFilter('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  playlistFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                সবগুলো
              </button>
              <button
                onClick={() => setPlaylistFilter('pending')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  playlistFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setPlaylistFilter('supported')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  playlistFilter === 'supported'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Supported ✓
              </button>
            </div>
          </div>

          {/* Scrollable Playlist Queue (YouTube Playlist rows) */}
          <div 
            ref={playlistContainerRef}
            className="flex-1 overflow-y-auto divide-y divide-[#15151C] p-2 space-y-1"
          >
            {filteredPlaylist.map((link) => {
              const isCurrentPlaying = link.id === activeLink.id;
              const isSupp = optimisticStatus[link.id] !== undefined
                ? optimisticStatus[link.id]
                : supportedSet.has(link.id);
              const isOwn = currentUser ? link.memberId === currentUser.id : false;

              return (
                <button
                  key={link.id}
                  ref={isCurrentPlaying ? activeItemRef : null}
                  onClick={() => handleSelectLink(link.id)}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl flex items-center justify-between gap-3 transition-all duration-150 group border ${
                    isCurrentPlaying
                      ? 'bg-[#1C1C24] border-indigo-500/60 shadow-md ring-1 ring-indigo-500/40'
                      : isSupp
                      ? 'bg-emerald-950/15 border-emerald-500/20 hover:bg-emerald-950/25 hover:border-emerald-500/40'
                      : 'bg-[#0E0E12] border-[#181820] hover:bg-[#15151B] hover:border-[#262632]'
                  }`}
                >
                  {/* Left: Serial Number & Equalizer/Indicator */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {isCurrentPlaying ? (
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-1 bg-red-500 h-3 animate-pulse rounded-full" />
                          <span className="w-1 bg-indigo-500 h-4 animate-bounce rounded-full" />
                          <span className="w-1 bg-red-500 h-2 animate-pulse rounded-full" />
                        </div>
                      ) : (
                        <span className={`text-xs font-black font-mono ${
                          isSupp ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'
                        }`}>
                          {link.linkNumber.toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>

                    {/* Member Name & Status Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-bold truncate ${
                          isCurrentPlaying 
                            ? 'text-white' 
                            : isSupp 
                            ? 'text-emerald-200' 
                            : 'text-gray-300 group-hover:text-white'
                        }`}>
                          {link.memberName}
                        </span>

                        {isCurrentPlaying && (
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.2 bg-red-600 text-white rounded">
                            Playing
                          </span>
                        )}

                        {isOwn && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded">
                            You
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-gray-500 truncate mt-0.5 flex items-center gap-2">
                        <span>@{link.memberUsername}</span>
                        {link.caption && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[160px] sm:max-w-xs">{link.caption}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Color-Coded Status (Pending vs Supported ✓) */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isOwn ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#181820] text-gray-400">
                        Your Link
                      </span>
                    ) : isSupp ? (
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-xs">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Supported ✓</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Pending
                      </span>
                    )}

                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      isCurrentPlaying ? 'text-indigo-400 translate-x-0.5' : 'text-gray-600 group-hover:text-gray-400'
                    }`} />
                  </div>
                </button>
              );
            })}

            {filteredPlaylist.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-xs">
                এই ফিল্টারে কোনো লিংক পাওয়া যায়নি।
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
