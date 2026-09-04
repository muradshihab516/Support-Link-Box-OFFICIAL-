import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyLink } from '../../types';
import { 
  ExternalLink, 
  Check, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Copy, 
  MessageSquare, 
  Zap, 
  ChevronRight, 
  ChevronLeft,
  X,
  Flame,
  CheckCheck,
  RotateCcw,
  ListFilter,
  Trophy,
  Smartphone,
  Globe,
  Share2,
  AlertTriangle,
  Flag,
  Image as ImageIcon,
  Video,
  Crown,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getFacebookAppUrl, 
  getFacebookWebBrowserUrl 
} from '../../utils/facebookLinks';
import { ReportModal } from './ReportModal';

interface PlaylistSupportSessionProps {
  initialLinkId?: string;
  onClose?: () => void;
}

// Ready-to-copy authentic comments
const COMMENT_SUGGESTIONS = [
  {
    id: 'c1',
    category: '🔥 প্রশংসা',
    textBn: 'অসাধারণ পোস্ট ভাই! আপনার লেখা সবসময় অনুপ্রেরণা দেয় ❤️',
  },
  {
    id: 'c2',
    category: '👏 মূল্যায়ন',
    textBn: 'চমৎকার এবং তথ্যবহুল একটি পোস্ট! শেয়ার করার জন্য অনেক ধন্যবাদ 👏',
  },
  {
    id: 'c3',
    category: '🚀 অনুপ্রেরণা',
    textBn: 'দারুণ কাজ! নিয়মিত এমন মানসম্মত পোস্ট দেখতে চাই, এগিয়ে যান 🚀',
  },
  {
    id: 'c4',
    category: '💬 মতামত',
    textBn: 'একদম সঠিক পয়েন্ট তুলে ধরেছেন, ১০০% সহমত ভাই! 🙌',
  }
];

// Helper to find next pending link index in circular order
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

interface PendingSupportRecord {
  linkId: string;
  linkNumber: number;
  openedAt: number;
  fromIndex: number;
  requiredDurationSec: number;
}

// Default minimum dwell times on Facebook (enforced via active countdown):
// 7 seconds for regular / photo posts
// 8 seconds for video posts
// Admin can adjust these in Settings Admin
const DEFAULT_PHOTO_DWELL_SECONDS = 7;
const DEFAULT_VIDEO_DWELL_SECONDS = 8;

export const PlaylistSupportSession: React.FC<PlaylistSupportSessionProps> = ({
  initialLinkId,
  onClose
}) => {
  const { 
    currentUser, 
    dailyLinks, 
    reports,
    settings,
    getTodaySupportStats, 
    markLinkSupported, 
    unmarkLinkSupported 
  } = useApp();

  // Filter state for playlist
  const [playlistFilter, setPlaylistFilter] = useState<'all' | 'pending' | 'supported'>('all');
  const [copiedCommentId, setCopiedCommentId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // Preferred opening mode: 'app' (Facebook native app) vs 'web' (Browser mbasic - stops app redirect)
  const [openMode, setOpenMode] = useState<'app' | 'web'>(() => {
    try {
      const saved = localStorage.getItem('slb_preferred_open_mode');
      if (saved === 'web' || saved === 'app') return saved;
    } catch {}
    return 'app';
  });

  // Auto-advance toggle (Auto-next when support returns)
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Status banner notice
  const [statusNotice, setStatusNotice] = useState<{
    type: 'success' | 'info' | 'completed' | 'warning';
    message: string;
  } | null>(null);

  // All completed view state
  const [isAllSessionCompleted, setIsAllSessionCompleted] = useState(false);

  // Optimistic UI state for instant 0ms checkmark reflection
  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, boolean>>({});

  // Pending return state (strictly ONLY populated when member clicks "Support Now")
  const [pendingSupport, setPendingSupport] = useState<PendingSupportRecord | null>(null);
  const pendingSupportRef = useRef<PendingSupportRecord | null>(null);

  // Active countdown seconds remaining
  const [countdownRemaining, setCountdownRemaining] = useState<number>(0);

  useEffect(() => {
    pendingSupportRef.current = pendingSupport;
  }, [pendingSupport]);

  // Live timer countdown ticker for pending support
  useEffect(() => {
    if (!pendingSupport) {
      setCountdownRemaining(0);
      return;
    }

    const updateTimer = () => {
      const elapsedSec = (Date.now() - pendingSupport.openedAt) / 1000;
      const left = Math.max(0, Math.ceil(pendingSupport.requiredDurationSec - elapsedSec));
      setCountdownRemaining(left);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 250);
    return () => clearInterval(timerInterval);
  }, [pendingSupport]);

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
    // Check saved index from localStorage to resume where user left off
    try {
      const savedIdx = localStorage.getItem('slb_playlist_active_index');
      if (savedIdx !== null) {
        const parsed = parseInt(savedIdx, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < sortedLinks.length) {
          return parsed;
        }
      }
    } catch {}
    // Default to first pending link if available
    if (currentUser && stats) {
      const firstPendingIndex = sortedLinks.findIndex(l => !stats.supportedLinkIds.has(l.id) && l.memberId !== currentUser.id);
      if (firstPendingIndex !== -1) return firstPendingIndex;
    }
    return 0;
  });

  useEffect(() => {
    try {
      localStorage.setItem('slb_playlist_active_index', currentIndex.toString());
    } catch {}
  }, [currentIndex]);

  const activeLink = sortedLinks[currentIndex] || sortedLinks[0];

  // Ref to playlist active item for auto-scrolling
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

  // Save openMode preference
  const handleSetOpenMode = (mode: 'app' | 'web') => {
    setOpenMode(mode);
    try {
      localStorage.setItem('slb_preferred_open_mode', mode);
    } catch {}
  };

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

  // Next upcoming pending link
  const nextPendingIndex = useMemo(() => {
    return findNextPendingLinkIndex(
      currentIndex,
      sortedLinks,
      optimisticStatus,
      supportedSet,
      currentUser?.id
    );
  }, [currentIndex, sortedLinks, optimisticStatus, supportedSet, currentUser]);

  const nextPendingLink = nextPendingIndex !== -1 ? sortedLinks[nextPendingIndex] : null;

  // =========================================================================
  // COMPLETE SUPPORT & AUTO-ADVANCE UPON RETURN
  // =========================================================================
  const completeSupportAndAdvance = useCallback((
    linkId: string,
    linkNumber: number,
    originIndex: number
  ) => {
    pendingSupportRef.current = null;
    setPendingSupport(null);
    try {
      localStorage.removeItem('slb_pending_support');
      sessionStorage.removeItem('slb_pending_support');
    } catch {}

    // Mark as supported
    setOptimisticStatus(prev => ({ ...prev, [linkId]: true }));
    markLinkSupported(linkId);

    try {
      if ('vibrate' in navigator) navigator.vibrate([35, 45, 35]);
    } catch {}

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    // Advance to next pending link if autoAdvance is on
    if (autoAdvance) {
      const nextIdx = findNextPendingLinkIndex(
        originIndex,
        sortedLinks,
        { ...optimisticStatus, [linkId]: true },
        supportedSet,
        currentUser?.id
      );

      if (nextIdx !== -1) {
        const nextLinkItem = sortedLinks[nextIdx];
        setCurrentIndex(nextIdx);
        setStatusNotice({
          type: 'success',
          message: `✅ লিংক #${linkNumber} সাপোর্ট সফল! পরবর্তী লিংক #${nextLinkItem.linkNumber} লোড করা হয়েছে।`
        });
      } else {
        setIsAllSessionCompleted(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 }
        });
        setStatusNotice({
          type: 'completed',
          message: `🎉 আজকের সব লিংকে সাপোর্ট দেওয়া সম্পন্ন হয়েছে!`
        });
      }
    } else {
      setStatusNotice({
        type: 'success',
        message: `✅ লিংক #${linkNumber} সাপোর্ট সফলভাবে সম্পন্ন হয়েছে!`
      });
    }

    setTimeout(() => {
      setStatusNotice(null);
    }, 4500);
  }, [autoAdvance, sortedLinks, optimisticStatus, supportedSet, currentUser, markLinkSupported]);

  // =========================================================================
  // SAFEGUARDED RETURN & COUNTDOWN DETECTOR
  // 1. pendingSupport is strictly active ONLY after clicking "Support Now"
  // 2. Requires full dwell time (15s for photo, 25s for video, or Admin setting)
  // 3. Returning earlier (e.g. within 2 seconds) CANNOT complete the support!
  //    It prompts member to spend required time on Facebook to like & comment.
  // 4. Once countdown completes, auto-advance triggers on return or user can tap confirm.
  // =========================================================================
  useEffect(() => {
    const checkAndTriggerReturn = () => {
      const pending = pendingSupportRef.current;
      if (!pending) return;

      const elapsedSec = (Date.now() - pending.openedAt) / 1000;
      const remainingSec = Math.max(0, Math.ceil(pending.requiredDurationSec - elapsedSec));

      // 1. If user returned before the countdown completed (e.g. within 2 seconds):
      // STRICTLY BLOCK COMPLETION! Show friendly alert and instruction.
      if (remainingSec > 0) {
        setStatusNotice({
          type: 'warning',
          message: `⏳ অনুগ্রহ করে ফেসবুকে পোস্টে লাইক ও কমেন্ট করুন! আর ${remainingSec} সেকেন্ড পর সাপোর্ট সম্পন্ন নিশ্চিত হবে।`
        });
        return;
      }

      // 2. Countdown has completed (elapsedSec >= requiredDurationSec):
      // If autoAdvance is enabled and user returns after the required duration, complete & advance!
      if (autoAdvance) {
        completeSupportAndAdvance(pending.linkId, pending.linkNumber, pending.fromIndex);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndTriggerReturn();
      }
    };

    const handleWindowFocus = () => {
      checkAndTriggerReturn();
    };

    const handlePageShow = () => {
      checkAndTriggerReturn();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [completeSupportAndAdvance, autoAdvance]);

  // Restore pending session if page reloaded on return (with duration safeguard)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('slb_pending_support') || sessionStorage.getItem('slb_pending_support');
      if (saved) {
        const parsed = JSON.parse(saved) as PendingSupportRecord;
        if (parsed && parsed.linkId) {
          const requiredSec = parsed.requiredDurationSec || DEFAULT_PHOTO_DWELL_SECONDS;
          const elapsedSec = (Date.now() - parsed.openedAt) / 1000;
          // If stored more than 15 minutes ago, consider stale and clean up
          if (elapsedSec > 900) {
            localStorage.removeItem('slb_pending_support');
            sessionStorage.removeItem('slb_pending_support');
          } else {
            // Restore pending record without premature auto-completion
            setPendingSupport(parsed);
            pendingSupportRef.current = parsed;
          }
        }
      }
    } catch {}
  }, []);

  // Manual confirm: Validates countdown before allowing completion
  const handleManualReturnConfirm = () => {
    const pending = pendingSupportRef.current;
    if (!pending) return;

    const elapsedSec = (Date.now() - pending.openedAt) / 1000;
    const remainingSec = Math.max(0, Math.ceil(pending.requiredDurationSec - elapsedSec));

    if (remainingSec > 0) {
      setStatusNotice({
        type: 'warning',
        message: `⚠️ সময় বাকি আছে! ফেসবুকে পোস্টে লাইক ও কমেন্ট করুন (আর ${remainingSec} সেকেন্ড বাকি)।`
      });
      return;
    }

    completeSupportAndAdvance(pending.linkId, pending.linkNumber, pending.fromIndex);
  };

  // Explicit cancel pending support countdown
  const handleCancelPending = () => {
    cancelPendingReturnIfAny();
    setStatusNotice({
      type: 'info',
      message: 'ℹ️ সাপোর্ট কাউন্টডাউন বাতিল করা হয়েছে।'
    });
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // =========================================================================
  // CORE LINK LAUNCH ENGINE
  // Own link: Opens so member can verify post
  // Peer link: Opens & initiates pending countdown tracking
  // =========================================================================
  const handleLaunchSupport = (modeToUse: 'app' | 'web') => {
    if (!activeLink) return;

    const targetUrl = modeToUse === 'web' 
      ? getFacebookWebBrowserUrl(activeLink.postUrl) 
      : getFacebookAppUrl(activeLink.postUrl);

    // If this is the member's own link
    if (isOwnLink) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setStatusNotice({
        type: 'info',
        message: `👁️ আপনার নিজের লিংক #${activeLink.linkNumber} ওপেন করা হয়েছে। চেক করে নিন।`
      });
      setTimeout(() => setStatusNotice(null), 4000);
      return;
    }

    // Determine dwell duration based on post type and admin settings:
    const requiredDurationSec = activeLink.postType === 'video'
      ? (settings?.videoSupportDwellSeconds || DEFAULT_VIDEO_DWELL_SECONDS)
      : (settings?.minSupportDwellSeconds || DEFAULT_PHOTO_DWELL_SECONDS);

    const currentLinkId = activeLink.id;
    const currentLinkNum = activeLink.linkNumber;

    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    const newPending: PendingSupportRecord = {
      linkId: currentLinkId,
      linkNumber: currentLinkNum,
      openedAt: Date.now(),
      fromIndex: currentIndex,
      requiredDurationSec
    };

    setPendingSupport(newPending);
    pendingSupportRef.current = newPending;
    setCountdownRemaining(requiredDurationSec);

    try {
      localStorage.setItem('slb_pending_support', JSON.stringify(newPending));
      sessionStorage.setItem('slb_pending_support', JSON.stringify(newPending));
    } catch {}

    setStatusNotice({
      type: 'info',
      message: `⏳ লিংক #${currentLinkNum} ফেসবুকে ওপেন হয়েছে! পোস্টে লাইক ও কমেন্ট করে ${requiredDurationSec} সেকেন্ড অপেক্ষা করুন।`
    });
    setTimeout(() => setStatusNotice(null), 5000);
  };

  // Navigation handlers: cancel pending session if user manually navigates away
  const cancelPendingReturnIfAny = () => {
    if (pendingSupportRef.current) {
      pendingSupportRef.current = null;
      setPendingSupport(null);
      try {
        localStorage.removeItem('slb_pending_support');
        sessionStorage.removeItem('slb_pending_support');
      } catch {}
    }
  };

  const handlePrevious = () => {
    cancelPendingReturnIfAny();
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    cancelPendingReturnIfAny();
    if (currentIndex < sortedLinks.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSelectLink = (linkId: string) => {
    cancelPendingReturnIfAny();
    const targetIdx = sortedLinks.findIndex(l => l.id === linkId);
    if (targetIdx !== -1) {
      setCurrentIndex(targetIdx);
      setIsAllSessionCompleted(false);
    }
  };

  const handleCopyLink = () => {
    if (!activeLink) return;
    const cleanUrl = getFacebookAppUrl(activeLink.postUrl);
    navigator.clipboard.writeText(cleanUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyComment = (commentId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommentId(commentId);
    setTimeout(() => setCopiedCommentId(null), 2000);
  };

  // Progress stats calculation
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

  if (!activeLink) {
    return (
      <div className="p-8 text-center text-gray-400 bg-[#0E0E12] rounded-2xl border border-[#1E1E24]">
        আজকের জন্য কোনো লিংক পাওয়া যায়নি।
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto rounded-2xl overflow-hidden bg-[#0A0A0D] border border-[#1E1E24] shadow-2xl relative">
      
      {/* =========================================================================
          TOP NOTIFICATION BANNER (Floating Feedback with Safeguard Alert Styling)
          ========================================================================= */}
      {statusNotice && (
        <div className="absolute top-14 left-4 right-4 z-40 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200">
          <div className={`font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border ${
            statusNotice.type === 'warning'
              ? 'bg-amber-600/95 text-amber-50 border-amber-400/60 shadow-amber-900/50'
              : statusNotice.type === 'info'
              ? 'bg-indigo-600/95 text-white border-indigo-400/60 shadow-indigo-900/50'
              : statusNotice.type === 'completed'
              ? 'bg-purple-600/95 text-white border-purple-400/60 shadow-purple-900/50'
              : 'bg-emerald-600/95 text-white border-emerald-400/60 shadow-emerald-900/50'
          }`}>
            <span>{statusNotice.message}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          1. COMPACT TOP HEADER BAR (Status & Mode Controls)
          ========================================================================= */}
      <div className="px-3 sm:px-4 py-2.5 bg-[#121216] border-b border-[#1C1C22] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate">
                সাপোর্ট সেশন
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                প্লেলিস্ট
              </span>
            </div>
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 truncate">
              <span>{effectiveCompletedCount}/{effectiveTotal} সম্পন্ন ({effectiveProgressPercent}%)</span>
              <span className="text-gray-600">•</span>
              <span className="text-indigo-400 font-semibold truncate">লিংক #{activeLink.linkNumber} একটিভ</span>
            </div>
          </div>
        </div>

        {/* Global Mini Progress Bar */}
        <div className="hidden sm:flex flex-col items-end gap-1 flex-1 max-w-[180px]">
          <div className="w-full bg-[#1A1A22] rounded-full h-1.5 overflow-hidden border border-[#252530]">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${effectiveProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Controls: Auto-Advance Toggle & Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border transition-colors ${
              autoAdvance 
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' 
                : 'bg-[#18181F] border-[#24242F] text-gray-400 hover:text-white'
            }`}
            title="সাপোর্টে চাপ দিলে স্বয়ংক্রিয়ভাবে পরবর্তী লিংক লোড হবে"
          >
            <RotateCcw className={`w-3 h-3 ${autoAdvance ? 'text-indigo-400' : 'text-gray-500'}`} />
            <span className="hidden xs:inline">অটো-লোড:</span>
            <span>{autoAdvance ? 'অন' : 'অফ'}</span>
          </button>

          {onClose && (
            <button
              onClick={() => {
                cancelPendingReturnIfAny();
                onClose();
              }}
              className="p-1 text-gray-400 hover:text-white hover:bg-[#1E1E26] rounded-lg transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. COMPACT ACTIVE LINK DISPLAY (Fixed Proportion, No Bloated Height!)
          ========================================================================= */}
      <div className="shrink-0 bg-gradient-to-b from-[#131318] to-[#0E0E12] border-b border-[#1E1E24] p-3 sm:p-4">
        {isAllSessionCompleted ? (
          /* All Completed Screen */
          <div className="py-4 text-center space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                আজকের সকল লিংক সফলভাবে সম্পন্ন হয়েছে! 🎉
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                আপনি আজকের সব লিংকে সফলভাবে সাপোর্ট দিয়েছেন। দারুণ পারফরম্যান্স!
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => setIsAllSessionCompleted(false)}
                className="px-3.5 py-1.5 bg-[#1C1C24] hover:bg-[#252532] border border-[#2B2B38] text-gray-300 hover:text-white text-xs font-bold rounded-xl transition-colors"
              >
                প্লেলিস্ট রিভিউ করুন
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  ড্যাশবোর্ডে ফিরুন
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            
            {/* Top Sub-Row: Serial, Category, Time, and Status */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black tracking-wider px-2 py-0.5 rounded-md bg-indigo-600 text-white shadow-xs">
                  লিংক #{activeLink.linkNumber.toString().padStart(2, '0')}
                </span>
                
                {/* Post Type Badge */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                  activeLink.postType === 'video'
                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                    : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                }`}>
                  {activeLink.postType === 'video' ? <><Video className="w-3 h-3" /> ভিডিও</> : <><ImageIcon className="w-3 h-3" /> ফটো</>}
                </span>

                {activeLink.category && activeLink.category !== 'member' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    {activeLink.category === 'vip' && <Crown className="w-3 h-3" />}
                    {activeLink.category === 'admin' && <ShieldCheck className="w-3 h-3" />}
                    {activeLink.category}
                  </span>
                )}

                {activeLink.isSubmittedByAdmin && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    👤 Proxy: {activeLink.submittedByAdminName || 'Admin'}
                  </span>
                )}

                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  {activeLink.submittedAt}
                </span>
              </div>

              {/* Status Badge */}
              <div>
                {isOwnLink ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-full">
                    আপনার নিজের লিংক
                  </span>
                ) : isActiveSupported ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full flex items-center gap-1">
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                    <span>✓ সাপোর্টেড</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                    <span>পেন্ডিং সাপোর্ট</span>
                  </span>
                )}
              </div>
            </div>

            {/* Member Info Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                  {activeLink.memberName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                      {activeLink.memberName}
                    </h2>
                    {activeLink.badgeTitle && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-[#1C1C24] text-indigo-300 border border-[#2B2B36] shrink-0">
                        {activeLink.badgeTitle}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1.5 truncate">
                    <span>@{activeLink.memberUsername}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-amber-400/90 font-semibold">{activeLink.supportCount + (isActiveSupported && !supportedSet.has(activeLink.id) ? 1 : 0)} সাপোর্ট</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Copy & Report a Problem */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Report a Problem Button */}
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="এই লিংকে কোনো সমস্যা থাকলে রিপোর্ট জানান"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[11px] hidden xs:inline">Report a Problem</span>
                  <span className="text-[11px] xs:hidden">রিপোর্ট</span>
                </button>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-[#181820] hover:bg-[#20202B] border border-[#272734] text-gray-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="লিংক কপি করুন"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[11px]">কপি</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Active Link Warning if problems reported by other members */}
            {(() => {
              const activeReports = reports.filter(r => r.targetLinkId === activeLink.id && (r.status === 'open' || r.status === 'pending'));
              if (activeReports.length === 0) return null;
              const reasonsList = activeReports.flatMap(r => r.reasons || [r.description]).slice(0, 2);
              return (
                <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-center justify-between gap-2 text-xs text-rose-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">
                      <strong>সতর্কতা:</strong> {activeReports.length} জন সমস্যা জানিয়েছেন ({reasonsList.join(', ')})
                    </span>
                  </div>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="text-[11px] font-bold text-rose-200 hover:text-white underline shrink-0"
                  >
                    রিপোর্ট দিন
                  </button>
                </div>
              );
            })()}

            {/* Supporter Instruction / Direction if present */}
            {activeLink.instruction && (
              <div className="px-2.5 py-1.5 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-xs text-indigo-200 leading-snug flex items-start gap-1.5">
                <span className="font-bold text-indigo-400 shrink-0">🎯 দিকনির্দেশনা:</span>
                <span className="font-medium">{activeLink.instruction}</span>
              </div>
            )}

            {/* Post Caption / Note if present (Compact 1-liner) */}
            {activeLink.caption && (
              <div className="px-2.5 py-1.5 bg-[#0A0A0E] border border-[#1A1A22] rounded-lg text-xs text-gray-300 leading-snug truncate">
                <span className="text-gray-500 font-semibold mr-1">ক্যাপশন:</span>
                "{activeLink.caption}"
              </div>
            )}

            {/* =========================================================================
                DUAL SYSTEM CONTROLS (App Mode vs Web Browser Mode)
                ========================================================================= */}
            <div className="pt-1 space-y-2">
              
              {/* Method Switcher Header: Choose App vs Web Browser */}
              <div className="flex items-center justify-between text-[11px] px-0.5">
                <span className="text-gray-400 font-medium">লিংক ওপেন মাধ্যম:</span>
                <div className="flex items-center gap-1 bg-[#0D0D12] p-0.5 rounded-lg border border-[#1E1E26]">
                  <button
                    onClick={() => handleSetOpenMode('app')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors ${
                      openMode === 'app'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>ফেসবুক অ্যাপ</span>
                  </button>
                  <button
                    onClick={() => handleSetOpenMode('web')}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors ${
                      openMode === 'web'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="অ্যাপ ওপেন না হয়ে সরাসরি ব্রাউজারে চলবে"
                  >
                    <Globe className="w-3 h-3" />
                    <span>ওয়েব ব্রাউজার</span>
                  </button>
                </div>
              </div>

              {/* Primary & Secondary Action Row */}
              <div className="flex items-center gap-2">
                
                {/* Previous Button */}
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className={`p-2.5 sm:px-3 sm:py-2.5 rounded-xl text-xs font-bold flex items-center justify-center border transition-all active:scale-95 shrink-0 ${
                    currentIndex === 0
                      ? 'bg-[#101014] border-[#181820] text-gray-600 cursor-not-allowed'
                      : 'bg-[#181820] hover:bg-[#20202B] border-[#262633] text-gray-200 hover:text-white'
                  }`}
                  title="পূর্ববর্তী লিংক"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* =========================================================================
                    ACTION BUTTONS:
                    Case 1: User's Own Link -> Let them open & check their post anytime
                    Case 2: Peer's Link -> Go button opens FB, marks supported upon return
                    ========================================================================= */}
                {isOwnLink ? (
                  <>
                    {/* Own Post Check & Test Button */}
                    <button
                      onClick={() => handleLaunchSupport(openMode)}
                      className="flex-1 py-2.5 sm:py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-150 active:scale-[0.98] border bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400/30 shadow-purple-600/25"
                      title="আপনার নিজের পোস্টটি ফেসবুক অ্যাপ বা ব্রাউজারে ওপেন করে পরীক্ষা করুন"
                    >
                      <ExternalLink className="w-4 h-4 text-purple-200" />
                      <span className="tracking-wide">নিজের লিংক ওপেন ও চেক করুন</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-bold uppercase tracking-wider hidden sm:inline">
                        {openMode === 'web' ? 'ওয়েব মোড' : 'অ্যাপ মোড'}
                      </span>
                    </button>

                    {/* Quick Switch Alternative for Own Link */}
                    <button
                      onClick={() => handleLaunchSupport(openMode === 'app' ? 'web' : 'app')}
                      className="hidden xs:flex px-2.5 py-2.5 sm:py-3 rounded-xl text-xs font-bold items-center gap-1.5 bg-[#181822] hover:bg-[#20202E] border border-[#2A2A38] text-gray-300 hover:text-white transition-colors shrink-0"
                      title={openMode === 'app' ? 'ব্রাউজারে টেস্ট করুন' : 'ফেসবুক অ্যাপে টেস্ট করুন'}
                    >
                      {openMode === 'app' ? (
                        <>
                          <Globe className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[11px]">ব্রাউজারে যান</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-[11px]">অ্যাপে যান</span>
                        </>
                      )}
                    </button>
                  </>
                ) : pendingSupport?.linkId === activeLink.id ? (
                  /* Active Pending Support Countdown / Confirmation Card */
                  <div className={`flex-1 p-2 sm:p-2.5 rounded-xl border transition-all duration-300 shadow-xl ${
                    countdownRemaining > 0 
                      ? 'bg-gradient-to-r from-amber-500/15 via-[#16161F] to-amber-500/10 border-amber-500/35'
                      : 'bg-gradient-to-r from-emerald-500/20 via-[#16161F] to-emerald-500/15 border-emerald-500/40'
                  }`}>
                    <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5">
                      {/* Left: Animated Status & Timer */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        {countdownRemaining > 0 ? (
                          <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                            <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-gray-800 stroke-current"
                                strokeWidth="3.5"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="text-amber-400 stroke-current transition-all duration-300"
                                strokeDasharray={`${Math.round(((pendingSupport.requiredDurationSec - countdownRemaining) / pendingSupport.requiredDurationSec) * 100)}, 100`}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <span className="absolute font-mono font-black text-xs text-amber-300">
                              {countdownRemaining}
                            </span>
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                            <Check className="w-5 h-5 text-emerald-400" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="text-xs font-black flex items-center gap-1.5 truncate">
                            {countdownRemaining > 0 ? (
                              <>
                                <span className="text-amber-300">⏳ ফেসবুকে সাপোর্ট চলছে...</span>
                                <span className="font-mono text-amber-400 text-[10px] bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/25">
                                  {countdownRemaining}s বাকি
                                </span>
                              </>
                            ) : (
                              <span className="text-emerald-300 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                সময় সম্পন্ন হয়েছে! সাপোর্ট নিশ্চিত করুন
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate mt-0.5">
                            {countdownRemaining > 0 
                              ? `পোস্টে লাইক ও কমেন্ট দিন। সময় পূর্ণ হওয়া পর্যন্ত অপেক্ষা করুন।`
                              : `লাইক/কমেন্ট শেষে কনফার্ম করতে বাটনে চাপুন।`}
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 justify-end">
                        {countdownRemaining > 0 ? (
                          <>
                            {/* Disabled waiting indicator */}
                            <button
                              disabled
                              className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-not-allowed opacity-90"
                              title={`কাউন্টডাউন চলছে: আর ${countdownRemaining} সেকেন্ড অপেক্ষা করুন`}
                            >
                              <Clock className="w-3 h-3 animate-spin" />
                              <span>অপেক্ষা ({countdownRemaining}s)</span>
                            </button>

                            {/* Re-open FB button */}
                            <button
                              onClick={() => handleLaunchSupport(openMode)}
                              className="p-1.5 bg-[#20202A] hover:bg-[#282836] border border-gray-700 text-gray-300 hover:text-white rounded-lg text-xs transition-colors"
                              title="ফেসবুক পেজ আবার খুলুন"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            {/* Cancel button */}
                            <button
                              onClick={handleCancelPending}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 rounded-lg text-xs transition-colors"
                              title="কাউন্টডাউন বাতিল করুন"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Ready to Confirm Button */}
                            <button
                              onClick={handleManualReturnConfirm}
                              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-black rounded-lg shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 active:scale-95 transition-all animate-pulse"
                              title="সাপোর্ট নিশ্চিত করে পরবর্তী লিংকে এগিয়ে যান"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>সাপোর্ট সম্পন্ন করেছি ▶</span>
                            </button>

                            {/* Cancel button */}
                            <button
                              onClick={handleCancelPending}
                              className="p-2 bg-[#20202A] hover:bg-[#282836] border border-gray-700 text-gray-400 hover:text-white rounded-lg text-xs transition-colors"
                              title="বাতিল করুন"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : isActiveSupported ? (
                  /* Already supported status */
                  <>
                    <div className="flex-1 py-2.5 sm:py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                      <span>এই লিংকে সাপোর্ট দেওয়া সম্পন্ন হয়েছে ✓</span>
                    </div>
                    <button
                      onClick={() => handleLaunchSupport(openMode)}
                      className="hidden xs:flex px-2.5 py-2.5 sm:py-3 rounded-xl text-xs font-bold items-center gap-1.5 bg-[#181822] hover:bg-[#20202E] border border-[#2A2A38] text-gray-300 hover:text-white transition-colors shrink-0"
                      title="পুনরায় পোস্টটি খুলুন"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[11px]">আবার খুলুন</span>
                    </button>
                  </>
                ) : (
                  /* Primary Support Now / Let's Go Button */
                  <>
                    <button
                      onClick={() => handleLaunchSupport(openMode)}
                      className={`flex-1 py-2.5 sm:py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-150 active:scale-[0.98] border ${
                        openMode === 'web'
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white border-indigo-400/30 shadow-indigo-600/25'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-400/30 shadow-blue-600/25'
                      }`}
                      title={openMode === 'web' ? 'ওয়েব ব্রাউজারে পোস্ট ওপেন হবে' : 'ফেসবুক অ্যাপে পোস্ট ওপেন হবে'}
                    >
                      <span className="text-base">🔥</span>
                      <span className="tracking-wide">Support Now / Let's Go</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/15 font-bold uppercase tracking-wider hidden sm:inline">
                        {openMode === 'web' ? 'ওয়েব মোড' : 'অ্যাপ মোড'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </button>

                    {/* Direct Alternative Button (Switch between App or Web in 1-click) */}
                    <button
                      onClick={() => handleLaunchSupport(openMode === 'app' ? 'web' : 'app')}
                      className="hidden xs:flex px-2.5 py-2.5 sm:py-3 rounded-xl text-xs font-bold items-center gap-1.5 bg-[#181822] hover:bg-[#20202E] border border-[#2A2A38] text-gray-300 hover:text-white transition-colors shrink-0"
                      title={openMode === 'app' ? 'অ্যাপ ছাড়া সরাসরি ব্রাউজারে খুলুন (mbasic)' : 'ফেসবুক অ্যাপে খুলুন'}
                    >
                      {openMode === 'app' ? (
                        <>
                          <Globe className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[11px]">ব্রাউজারে যান</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-[11px]">অ্যাপে যান</span>
                        </>
                      )}
                    </button>
                  </>
                )}

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  disabled={currentIndex === sortedLinks.length - 1}
                  className={`p-2.5 sm:px-3 sm:py-2.5 rounded-xl text-xs font-bold flex items-center justify-center border transition-all active:scale-95 shrink-0 ${
                    currentIndex === sortedLinks.length - 1
                      ? 'bg-[#101014] border-[#181820] text-gray-600 cursor-not-allowed'
                      : 'bg-[#181820] hover:bg-[#20202B] border-[#262633] text-gray-200 hover:text-white'
                  }`}
                  title="পরবর্তী লিংক"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

              </div>

              {/* Informative Sub-Indicator */}
              {isOwnLink ? (
                <div className="p-2.5 bg-purple-500/10 border border-purple-500/25 rounded-xl flex items-center gap-2 text-xs text-purple-300">
                  <span className="text-sm shrink-0">💡</span>
                  <span><strong>আপনার নিজের পোস্ট:</strong> কেউ যদি জানায় লিংকে সমস্যা বা পেজ লোড হচ্ছে না, তবে ওপরের বাটন দিয়ে আপনি নিজেই ফেসবুক অ্যাপ বা ব্রাউজারে পোস্টটি টেস্ট করতে পারবেন।</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5 px-0.5">
                  {nextPendingLink ? (
                    <span className="truncate">
                      পরবর্তী লিংক: <strong className="text-gray-300 font-semibold">#{nextPendingLink.linkNumber} ({nextPendingLink.memberName})</strong>
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">সব লিংক সম্পন্ন হয়েছে!</span>
                  )}
                  <span className="text-gray-400 text-[10px] hidden sm:inline">
                    {openMode === 'web' 
                      ? '🌐 ব্রাউজার মোড: ফেসবুক অ্যাপ ওপেন হবে না' 
                      : '📱 অ্যাপ মোড: ফেসবুক অ্যাপে নিয়ে যাবে'}
                  </span>
                </div>
              )}

              {/* Fast Comments Expandable Drawer */}
              <div>
                <button
                  onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>রেডিমেড কমেন্ট টেমপ্লেট {isCommentsOpen ? '▲' : '▼'}</span>
                </button>

                {isCommentsOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
                    {COMMENT_SUGGESTIONS.map(c => {
                      const isCopied = copiedCommentId === c.id;
                      return (
                        <div
                          key={c.id}
                          className="bg-[#09090C] border border-[#1A1A24] p-2 rounded-lg flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-indigo-400 block">{c.category}</span>
                            <p className="text-[11px] text-gray-200 truncate">{c.textBn}</p>
                          </div>
                          <button
                            onClick={() => handleCopyComment(c.id, c.textBn)}
                            className={`px-2 py-1 rounded text-[10px] font-bold shrink-0 flex items-center gap-1 ${
                              isCopied ? 'bg-emerald-600 text-white' : 'bg-[#181822] text-gray-300 border border-[#252534]'
                            }`}
                          >
                            {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? 'কপি' : 'কপি'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>

      {/* =========================================================================
          3. BOTTOM PLAYLIST QUEUE (Fluid, Smooth, Well-Proportioned)
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0D]">
        
        {/* Playlist Filter Sub-Bar */}
        <div className="px-3 sm:px-4 py-2 bg-[#0E0E12] border-b border-[#1A1A22] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
            <ListFilter className="w-3.5 h-3.5 text-indigo-400" />
            <span>প্লেলিস্ট তালিকা ({filteredPlaylist.length})</span>
          </div>

          <div className="flex items-center gap-1 bg-[#14141A] p-0.5 rounded-lg border border-[#20202A]">
            <button
              onClick={() => setPlaylistFilter('all')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                playlistFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              সব ({sortedLinks.length})
            </button>
            <button
              onClick={() => setPlaylistFilter('pending')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                playlistFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              বাকি
            </button>
            <button
              onClick={() => setPlaylistFilter('supported')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                playlistFilter === 'supported'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              সাপোর্টেড
            </button>
          </div>
        </div>

        {/* Scrollable Playlist Rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#14141A] p-2 space-y-1">
          {filteredPlaylist.map((link) => {
            const isSelected = link.id === activeLink.id;
            const isSupp = optimisticStatus[link.id] !== undefined
              ? optimisticStatus[link.id]
              : supportedSet.has(link.id);
            const isUserOwn = currentUser && link.memberId === currentUser.id;

            return (
              <button
                key={link.id}
                ref={isSelected ? activeItemRef : null}
                onClick={() => handleSelectLink(link.id)}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-[#181822] border border-indigo-500/40 shadow-sm'
                    : 'hover:bg-[#121217] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Serial Number Badge */}
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                    isSelected 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-[#181820] text-gray-400'
                  }`}>
                    #{link.linkNumber.toString().padStart(2, '0')}
                  </span>

                  {/* Member Avatar */}
                  <div className="w-7 h-7 rounded-lg bg-[#20202C] text-gray-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {link.memberName.charAt(0)}
                  </div>

                  {/* Title & Info */}
                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {link.memberName}
                      </span>
                      {isUserOwn && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-semibold shrink-0">
                          আপনার
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                      {link.category || 'Facebook Post'} • {link.submittedAt}
                    </div>
                  </div>
                </div>

                {/* Status Icon */}
                <div className="shrink-0 flex items-center gap-2">
                  {isUserOwn ? (
                    <span className="text-[10px] text-indigo-400 font-medium">নিজস্ব</span>
                  ) : isSupp ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>✓</span>
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400/80 inline-block" title="পেন্ডিং" />
                  )}

                  {isSelected && (
                    <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider hidden sm:inline">
                      ▶ বাজছে
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Report a Problem Modal */}
      {activeLink && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          targetLinkId={activeLink.id}
          targetMemberId={activeLink.memberId}
          prefilledLinkInfo={{
            id: activeLink.id,
            number: activeLink.linkNumber,
            member: activeLink.memberName,
            url: activeLink.postUrl
          }}
        />
      )}

    </div>
  );
};
