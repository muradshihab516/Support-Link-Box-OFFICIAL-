import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyLink } from '../../types';
import { 
  Flame, 
  Search, 
  Filter, 
  ExternalLink, 
  Check, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PlusCircle, 
  Sparkles,
  Share2,
  Flag,
  Eye,
  Zap,
  ChevronDown,
  Layers,
  Play,
  LayoutGrid,
  Image as ImageIcon,
  Video,
  Crown,
  ShieldCheck,
  Bell,
  Edit3,
  Trash2,
  Lock,
  Calendar,
  Palette,
  Sun,
  Moon
} from 'lucide-react';
import { LinkSubmissionModal } from './LinkSubmissionModal';
import { LinkEditModal } from './LinkEditModal';
import { ScheduledLinksModal } from './ScheduledLinksModal';
import { InAppPostViewerModal } from './InAppPostViewerModal';
import { PlaylistSupportSession } from './PlaylistSupportSession';
import { ReportModal } from './ReportModal';
import { ThemeSelectorModal } from '../theme/ThemeSelectorModal';
import { SponsoredBanner } from '../monetization/SponsoredBanner';
import { DisplayAdSlot } from '../monetization/DisplayAdSlot';
import confetti from 'canvas-confetti';
import { cleanAndFormatFacebookUrl, getFacebookAppUrl, getFacebookWebBrowserUrl } from '../../utils/facebookLinks';
import { LateAllDoneAdModal } from '../common/LateAllDoneAdModal';
import { SuspendedMemberNotice } from './SuspendedMemberNotice';
import { LateSupportReportModal } from './LateSupportReportModal';

interface DailyLinksViewProps {
  onNavigate?: (view: string) => void;
  onSubmitLink?: () => void;
  onOpenReport?: (linkInfo?: { id: string; number: number; member: string }) => void;
}

const PAGE_SIZE = 20;

export const DailyLinksView: React.FC<DailyLinksViewProps> = ({ onNavigate, onSubmitLink, onOpenReport }) => {
  const { 
    currentUser, 
    dailyLinks, 
    reports,
    scheduledLinks,
    latePenalties,
    lateSupportReports,
    canMemberSubmitLateReportToday,
    getMemberActiveLateReport,
    getTodaySupportStats, 
    markLinkSupported, 
    unmarkLinkSupported,
    removeDailyLink,
    completeLateAllDone,
    darkMode,
    toggleDarkMode,
    activeTheme
  } = useApp();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';

  const [filter, setFilter] = useState<'all' | 'batch' | 'vip' | 'admin' | 'pending' | 'supported'>('all');
  const [selectedPart, setSelectedPart] = useState<'all' | number>('all');
  const [editingLink, setEditingLink] = useState<DailyLink | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showScheduledModal, setShowScheduledModal] = useState(false);
  const [showPenaltyAdModal, setShowPenaltyAdModal] = useState(false);
  const [showLateReportModal, setShowLateReportModal] = useState(false);
  const [showThemeSelectorModal, setShowThemeSelectorModal] = useState(false);
  const [selectedPostForInAppView, setSelectedPostForInAppView] = useState<DailyLink | null>(null);
  const [reportTarget, setReportTarget] = useState<{ linkId: string; name: string; number?: number; memberId?: string; url?: string } | null>(null);

  const activeLateReport = currentUser ? getMemberActiveLateReport(currentUser.id) : null;

  // Dynamic available parts based on 20 links per part
  const availableParts = useMemo(() => {
    const maxLinkNum = dailyLinks.reduce((max, l) => Math.max(max, l.linkNumber || 0), 0);
    const count = Math.max(1, Math.ceil(Math.max(dailyLinks.length, maxLinkNum) / 20));
    const list: { partNumber: number; label: string; count: number }[] = [];
    for (let i = 1; i <= count; i++) {
      const start = (i - 1) * 20 + 1;
      const end = i * 20;
      const pad = (n: number) => n.toString().padStart(2, '0');
      const partCount = dailyLinks.filter(l => (l.partNumber === i) || (Math.ceil((l.linkNumber || 1) / 20) === i)).length;
      list.push({
        partNumber: i,
        label: `Part ${i} (${pad(start)}–${pad(end)})`,
        count: partCount
      });
    }
    return list;
  }, [dailyLinks]);

  // Optimistic UI state for instant checkmark feedback
  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, boolean>>({});

  // View Mode: Playlist Support Session (Default) vs Card Grid
  const [viewMode, setViewModeState] = useState<'playlist' | 'grid'>(() => {
    try {
      const saved = localStorage.getItem('slb_daily_links_view_mode');
      if (saved === 'grid' || saved === 'playlist') return saved;
    } catch {}
    return 'playlist';
  });

  const setViewMode = (mode: 'playlist' | 'grid') => {
    setViewModeState(mode);
    try {
      localStorage.setItem('slb_daily_links_view_mode', mode);
    } catch {}
  };
  const [selectedPlayerLinkId, setSelectedPlayerLinkId] = useState<string | undefined>(undefined);

  // Pagination & Lazy-load state
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [batchRange, setBatchRange] = useState<'all' | '1-50' | '51-100' | '101-150' | '151-200'>('all');
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const stats = currentUser ? getTodaySupportStats(currentUser.id) : null;
  const supportedSet = useMemo(() => stats ? stats.supportedLinkIds : new Set<string>(), [stats]);

  // Reset pagination when search, filter, or part changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, searchQuery, selectedPart]);

  // Filter out currentUser's own link or flag it
  const eligibleLinks = useMemo(() => {
    return dailyLinks.filter(link => {
      const isOwn = currentUser ? link.memberId === currentUser.id : false;
      
      // Part filter (20 links per Part)
      if (selectedPart !== 'all') {
        const linkPart = link.partNumber || Math.max(1, Math.ceil((link.linkNumber || 1) / 20));
        if (linkPart !== selectedPart) return false;
      }

      // Search match
      const matchesSearch = 
        link.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.memberUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.caption && link.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (link.instruction && link.instruction.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (link.postType && link.postType.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (link.badgeTitle && link.badgeTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        link.linkNumber.toString().includes(searchQuery);

      if (!matchesSearch) return false;

      // Calculate effective support state with optimistic overrides
      const isSupported = optimisticStatus[link.id] !== undefined
        ? optimisticStatus[link.id]
        : supportedSet.has(link.id);

      if (filter === 'pending') {
        return !isSupported && !isOwn;
      }
      if (filter === 'supported') {
        return isSupported;
      }
      if (filter === 'batch') {
        return link.category === 'batch' || (!link.category && link.linkNumber >= 101 && link.linkNumber <= 123);
      }
      if (filter === 'vip') {
        return link.category === 'vip';
      }
      if (filter === 'admin') {
        return link.category === 'admin';
      }
      return true;
    });
  }, [dailyLinks, currentUser, batchRange, searchQuery, optimisticStatus, supportedSet, filter]);

  // Paginated/Lazy slice of links to render smoothly
  const displayedLinks = useMemo(() => {
    return eligibleLinks.slice(0, visibleCount);
  }, [eligibleLinks, visibleCount]);

  const hasMore = visibleCount < eligibleLinks.length;

  // IntersectionObserver for seamless infinite scrolling
  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + PAGE_SIZE, eligibleLinks.length));
        }
      },
      { rootMargin: '250px' }
    );

    const target = sentinelRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, eligibleLinks.length]);

  // Instant Optimistic Support Handler (0ms UI lag)
  const handleMarkSupport = (linkId: string) => {
    // 1. Instant UI update in the current animation frame
    setOptimisticStatus(prev => ({ ...prev, [linkId]: true }));

    // Optional subtle haptic pulse for mobile touch confirmation
    try {
      if ('vibrate' in navigator) navigator.vibrate(25);
    } catch {}

    // Check if celebration trigger
    const effectivePending = (stats?.pendingCount ?? 1) - 1;
    if (effectivePending <= 0) {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // 2. Background async persistence without blocking the UI thread
    setTimeout(() => {
      markLinkSupported(linkId);
    }, 0);
  };

  const handleUnmarkSupport = (linkId: string) => {
    setOptimisticStatus(prev => ({ ...prev, [linkId]: false }));
    setTimeout(() => {
      unmarkLinkSupported(linkId);
    }, 0);
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
  const effectivePendingCount = Math.max(0, (stats?.pendingCount ?? 0) - optimisticPendingAdjustment);
  const effectiveProgressPercent = (stats?.requiredCount && stats.requiredCount > 0)
    ? Math.min(100, Math.round((effectiveCompletedCount / stats.requiredCount) * 100))
    : 0;

  const renderTopThemeBar = () => (
    <div className={`w-full p-3.5 sm:p-4 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300 ${
      darkMode 
        ? 'bg-[#121217]/85 border-white/10 text-white' 
        : 'bg-white/85 border-slate-200 text-slate-900 shadow-slate-200/50'
    }`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        
        {/* Left: Active Theme Info & View Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>ওয়ালপেপার:</span>
          <span className="font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
            {activeTheme?.banglaName || 'ডিফল্ট'}
          </span>
          {viewMode === 'playlist' ? (
            <button
              onClick={() => setViewMode('grid')}
              className="ml-2 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors"
            >
              <LayoutGrid className="w-3 h-3 text-indigo-400" />
              <span>কার্ড গ্রিড</span>
            </button>
          ) : (
            <button
              onClick={() => setViewMode('playlist')}
              className="ml-2 px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors"
            >
              <Play className="w-3 h-3 text-indigo-400" />
              <span>সাপোর্ট প্লেলিস্ট</span>
            </button>
          )}
        </div>

        {/* Center: "Support Link Box" prominent centered title as requested */}
        <div className="text-center px-2 flex-1">
          <div className="inline-flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300 bg-clip-text text-transparent uppercase font-mono">
              Support Link Box
            </h2>
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          </div>
          <p className={`text-[11px] font-medium tracking-wide ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
            সবার উপরে ডে/ডার্ক টগল • মাঝে সাপোর্ট লিংক বক্স • মন মতো থিম নির্বাচন
          </p>
        </div>

        {/* Right: Dark / Day Toggle & Theme Gallery Button */}
        <div className="flex items-center justify-center gap-2 shrink-0">
          {/* Dark / Day Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              darkMode 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 shadow-xs' 
                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-xs'
            }`}
            title={darkMode ? "ডে মোডে যান (Day Mode)" : "ডার্ক মোডে যান (Dark Mode)"}
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>ডে মোড</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>ডার্ক মোড</span>
              </>
            )}
          </button>

          {/* Theme Selector Modal Trigger */}
          <button
            onClick={() => setShowThemeSelectorModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-95"
            title="ওয়ালপেপার ও ব্যাকগ্রাউন্ড থিম নির্বাচন করুন"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>থিম পরিবর্তন</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Render Playlist Support Session UI if selected
  if (viewMode === 'playlist') {
    return (
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-5 space-y-4">
        {renderTopThemeBar()}

        <PlaylistSupportSession
          initialLinkId={selectedPlayerLinkId}
          onClose={() => setViewMode('grid')}
        />

        {/* Theme Presets & Wallpaper Gallery Modal */}
        <ThemeSelectorModal
          isOpen={showThemeSelectorModal}
          onClose={() => setShowThemeSelectorModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      
      {/* Topmost Theme & Day/Night Toggle Bar with Centered "Support Link Box" */}
      {renderTopThemeBar()}
      
      {/* Suspended Member Notice */}
      {currentUser && currentUser.status === 'suspended' && (
        <SuspendedMemberNotice />
      )}

      {/* Temp Removed Member Banner */}
      {currentUser && currentUser.status === 'temp_removed' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#1c140d] to-[#16120e] border-2 border-amber-500/50 shadow-xl space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-[10px] font-bold uppercase tracking-wider">
                    Temp Removed
                  </span>
                  <span className="text-xs text-amber-300/80">দেরিতে অল ডান ও সাপোর্ট পেন্ডিং</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  আপনি লিংক বক্স থেকে সাময়িকভাবে রিমুভ অবস্থায় আছেন
                </h3>
              </div>
            </div>

            {effectivePendingCount === 0 ? (
              <button
                onClick={() => {
                  completeLateAllDone(currentUser.id);
                  setShowPenaltyAdModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Re-Activate করুন ({currentUser.requiredAdsCount || 1} টি Ad দেখুন)</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold text-center shrink-0">
                আগে বাকি {effectivePendingCount} টি সাপোর্ট সম্পন্ন করুন
              </span>
            )}
          </div>

          <p className="text-xs text-amber-200/90 leading-relaxed">
            রাত ১২:০০ টার ডেডলাইনে All Done না করায় আপনার অ্যাকাউন্টটি সাময়িক রিমুভ করা হয়েছে। যতক্ষণ না আপনি সমস্ত সাপোর্ট সম্পন্ন করবেন, ততক্ষণ ঐ দিনের লিংকগুলো আপনার সামনেই থাকবে। সব সাপোর্ট শেষ করে উপরের বাটনে চাপুন এবং রিওয়ার্ডেড বিজ্ঞাপন দেখে অ্যাকাউন্ট সচল (Active) করুন।
          </p>
        </div>
      )}

      {/* Late Support Active Grace Status Banner */}
      {currentUser && activeLateReport && (
        activeLateReport.status === 'pending' ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#1a1710] to-[#141418] border border-amber-500/40 shadow-lg space-y-2 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-[10px] font-bold uppercase tracking-wider">
                      Late Support Grace Window
                    </span>
                    <span className="text-xs text-amber-300/80">Ad Punishment ছাড় প্রাপ্ত</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                    আপনার দেরিতে সাপোর্টের আবেদন কার্যকর রয়েছে (২৪ ঘণ্টা রিকভারি সময়)
                  </h3>
                </div>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className="text-xs font-bold text-amber-400 bg-black/40 px-3 py-1 rounded-lg border border-amber-500/30">
                  {Math.max(0, Math.ceil((activeLateReport.recoveryDeadlineTimestamp - Date.now()) / (1000 * 60 * 60)))} ঘণ্টা গ্রেস বাকি
                </span>
              </div>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              দেরিতে সাপোর্টের আবেদন নথিভুক্ত থাকায় রাত ১২:০০ টার ডেডলাইনে কোনো Ads বা সাময়িক রিমুভ হয়নি। ২৪ ঘণ্টার মধ্যে বাকি সাপোর্টগুলো সম্পন্ন করে All Done করুন, তাহলে কোনো Ads দেখা ছাড়াই অ্যাকাউন্ট এবং লিংক সাবমিশন সচল থাকবে।
            </p>
          </div>
        ) : activeLateReport.status === 'completed_in_grace' ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-lg space-y-1 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>অভিনন্দন! ২৪ ঘণ্টার গ্রেস সময়ের মধ্যে All Done সফলভাবে সম্পন্ন হয়েছে</span>
            </div>
            <p className="text-xs text-emerald-200/80">
              দেরিতে সাপোর্টের আবেদন থাকায় আপনার কোনো Ad punishment হয়নি। স্বাভাবিক নিয়মে আপনার লিঙ্ক এবং কার্যক্রম সক্রিয় রয়েছে।
            </p>
          </div>
        ) : activeLateReport.status === 'recovery_expired' ? (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 shadow-lg space-y-1 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-rose-300 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>২৪ ঘণ্টার গ্রেস সময়সীমা অতিক্রম হয়েছে (Approval Pending)</span>
            </div>
            <p className="text-xs text-rose-200/80">
              নির্ধারিত ২৪ ঘণ্টার মধ্যে All Done না করায় অ্যাকাউন্টটি Approval Pending অবস্থায় রয়েছে। অ্যাডমিন ম্যানুয়ালি রিভিউ করে সক্রিয় করবেন।
            </p>
          </div>
        ) : null
      )}

      {/* Revoked Link Submission Permission Banner */}
      {currentUser && currentUser.canSubmitLink === false && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <strong className="text-white block text-sm">🔒 আপনার লিংক সাবমিট করার ক্ষমতা সাময়িকভাবে স্থগিত রয়েছে</strong>
              <span className="text-red-300/90">কারণ: {currentUser.canSubmitLinkRevokeReason || 'প্রশাসনিক নির্দেশনা ও প্ল্যাটফর্ম রুলস ভঙ্গের কারণে'}</span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 font-bold shrink-0 self-start sm:self-auto">
            Submission Disabled
          </span>
        </div>
      )}

      {/* Header & Submit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Today's Daily Links ({dailyLinks.length})
            </h1>
            <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 font-bold text-xs rounded-full border border-indigo-500/20">
              28 Aug 2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Exchange genuine reactions and comments on Facebook. Native intent click opens Facebook app instantly!
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Playlist Support Session Launch Button */}
          <button
            onClick={() => {
              setSelectedPlayerLinkId(undefined);
              setViewMode('playlist');
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-extrabold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-transform active:scale-95"
            title="প্লেলিস্ট আকারে দ্রুত সাপোর্ট সেশন শুরু করুন"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>▶ প্লেলিস্ট সাপোর্ট সেশন</span>
          </button>

          {/* Scheduled Links Button */}
          <button
            onClick={() => setShowScheduledModal(true)}
            className="px-3.5 py-2.5 bg-[#141418] hover:bg-[#1E1E24] border border-[#24242E] hover:border-indigo-500/40 text-indigo-300 hover:text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="শিডিউল করা লিংকসমূহ দেখুন ও পরিচালনা করুন"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>শিডিউল তালিকা</span>
            {scheduledLinks.filter(s => (isAdmin || s.memberId === currentUser?.id) && s.status === 'scheduled').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                {scheduledLinks.filter(s => (isAdmin || s.memberId === currentUser?.id) && s.status === 'scheduled').length}
              </span>
            )}
          </button>

          {/* Late Support Report Trigger / Active Grace Badge */}
          {currentUser && (
            activeLateReport && activeLateReport.status === 'pending' ? (
              <button
                onClick={() => setShowLateReportModal(true)}
                className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                title="লেট সাপোর্ট গ্রেস উইন্ডো কার্যকর আছে (২৪ ঘণ্টার মধ্যে All Done সম্পন্ন করুন)"
              >
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Grace Active</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLateReportModal(true)}
                className="px-3.5 py-2.5 bg-[#141418] hover:bg-[#1E1E24] border border-amber-500/30 hover:border-amber-500/60 text-amber-300 hover:text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                title="দেরিতে সাপোর্টের আবেদন করুন (রাত ১২:০০ টার আগে)"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Report Late Support</span>
              </button>
            )
          )}

          {currentUser && !stats?.hasSubmittedToday ? (
            currentUser.canSubmitLink === false ? (
              <div 
                className="px-4 py-2.5 bg-gray-800/80 text-gray-500 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 cursor-not-allowed border border-gray-700/60"
                title="অ্যাডমিন কর্তৃক আপনার লিংক সাবমিট করার অনুমতি স্থগিত রয়েছে"
              >
                <Lock className="w-4 h-4 text-gray-500" />
                <span>লিংক সাবমিশন স্থগিত</span>
              </div>
            ) : currentUser.status === 'temp_removed' ? (
              <div 
                className="px-4 py-2.5 bg-amber-950/40 text-amber-400 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 cursor-not-allowed border border-amber-500/30"
                title="সাময়িক রিমুভ অবস্থায় লিংক সাবমিট করা যাবে না"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>সাময়িক রিমুভ (Locked)</span>
              </div>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-lg flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Your Link
              </button>
            )
          ) : (
            <div className="text-xs px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Your Link #{stats?.submittedLink?.linkNumber} is Active
            </div>
          )}
        </div>
      </div>

      {/* Top Banner Sponsor */}
      <SponsoredBanner position="top_banner" />

      {/* Support Status Tracker Bar for Current User with Instant Optimistic Progress */}
      {currentUser && stats && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto text-left">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Your Daily Support Status
            </div>
            <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
              <span>{effectiveCompletedCount} of {stats.requiredCount} Supported</span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-bold transition-colors ${
                effectivePendingCount === 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {effectiveProgressPercent}%
              </span>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md hidden md:block">
            <div className="w-full bg-[#0A0A0B] rounded-full h-2.5 overflow-hidden border border-[#1E1E20]">
              <div
                className="bg-gradient-to-r from-indigo-500 to-green-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${effectiveProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {effectivePendingCount > 0 ? (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                {effectivePendingCount} links remaining
              </span>
            ) : (
              <span className="text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 100% Completed
              </span>
            )}
          </div>
        </div>
      )}

      {/* Part System (20 Links per Part) Navigation */}
      <div className="bg-[#131315] border border-[#1E1E20] rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-white">পার্ট নির্বাচন (প্রতি ২০টি লিংক = ১ পার্ট):</span>
          <span className="text-gray-500 hidden sm:inline">১-২০ Part 1, ২১-৪০ Part 2, ৪১-৬০ Part 3</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          <button
            onClick={() => setSelectedPart('all')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${
              selectedPart === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-[#1C1C20] text-gray-400 hover:text-white hover:bg-[#25252A]'
            }`}
          >
            সব পার্ট ({dailyLinks.length})
          </button>
          {availableParts.map(p => (
            <button
              key={p.partNumber}
              onClick={() => setSelectedPart(p.partNumber)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                selectedPart === p.partNumber
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-[#1C1C20] text-gray-300 hover:text-white hover:bg-[#25252A]'
              }`}
            >
              <span>{p.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedPart === p.partNumber ? 'bg-black/30 text-white' : 'bg-[#2A2A30] text-gray-400'
              }`}>
                {p.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tab Buttons */}
        <div className="flex bg-[#131315] p-1 rounded-xl border border-[#1E1E20] overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#1E1E20] text-white shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            All Links ({dailyLinks.length})
          </button>
          <button
            onClick={() => setFilter('batch')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === 'batch'
                ? 'bg-[#1E1E20] text-emerald-400 shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🔰 Batch ({dailyLinks.filter(l => l.category === 'batch' || (!l.category && l.linkNumber >= 101 && l.linkNumber <= 123)).length})
          </button>
          <button
            onClick={() => setFilter('admin')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === 'admin'
                ? 'bg-[#1E1E20] text-purple-400 shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            👑 Admin ({dailyLinks.filter(l => l.category === 'admin').length})
          </button>
          <button
            onClick={() => setFilter('vip')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === 'vip'
                ? 'bg-[#1E1E20] text-amber-400 shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🏆 VIP ({dailyLinks.filter(l => l.category === 'vip').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-1 ${
              filter === 'pending'
                ? 'bg-[#1E1E20] text-amber-400 shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Pending ({effectivePendingCount})
          </button>
          <button
            onClick={() => setFilter('supported')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-1 ${
              filter === 'supported'
                ? 'bg-[#1E1E20] text-green-400 shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Supported ({effectiveCompletedCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search member, caption, #ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#131315] border border-[#1E1E20] rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-gray-500 shadow-xs"
          />
        </div>
      </div>

      {/* Render Counter Bar */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span>
          দেখাচ্ছে <strong className="text-white">{displayedLinks.length}</strong> / {eligibleLinks.length} টি লিংক
          {eligibleLinks.length > displayedLinks.length && ' (স্মুথ পারফরম্যান্সের জন্য ২০টি করে লোড হচ্ছে)'}
        </span>
        {hasMore && (
          <button 
            onClick={() => setVisibleCount(eligibleLinks.length)}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline text-[11px]"
          >
            একসাথে সবগুলো ({eligibleLinks.length}) লোড করুন
          </button>
        )}
      </div>

      {/* Daily Link Cards Grid (Lazy-Loaded / Paginated) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedLinks.map(link => {
          const isOwnLink = currentUser ? link.memberId === currentUser.id : false;
          // Calculate instant effective support state
          const isSupported = optimisticStatus[link.id] !== undefined
            ? optimisticStatus[link.id]
            : supportedSet.has(link.id);

          const directFbUrl = cleanAndFormatFacebookUrl(link.postUrl, 'm');

          return (
            <div
              key={link.id}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg backdrop-blur-md ${
                darkMode
                  ? isOwnLink
                    ? 'bg-indigo-950/40 border-indigo-500/40 shadow-indigo-500/10'
                    : isSupported
                    ? 'bg-emerald-950/25 border-emerald-500/30 shadow-emerald-500/10'
                    : 'bg-[#131317]/85 border-white/10 hover:border-indigo-500/40 hover:bg-[#181822]/90'
                  : isOwnLink
                    ? 'bg-indigo-50/90 border-indigo-300 shadow-indigo-500/10'
                    : isSupported
                    ? 'bg-emerald-50/90 border-emerald-300 shadow-emerald-500/10'
                    : 'bg-white/90 border-slate-200 hover:border-indigo-400 hover:bg-white shadow-slate-200/50'
              }`}
            >
              <div className="p-4 sm:p-5 space-y-3 flex-1">
                {/* Top Member Info & Link # */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={link.memberAvatar} 
                      alt={link.memberName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-700 shrink-0" 
                    />
                    <div className="min-w-0">
                      <div className={`text-xs sm:text-sm font-bold truncate flex items-center gap-1.5 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {link.memberName}
                        {isOwnLink && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-indigo-600 text-white rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] truncate ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                        @{link.memberUsername} • {link.submittedAt}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">
                        Part {link.partNumber || Math.ceil(link.linkNumber / 20)}
                      </span>
                      <div className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20 inline-block font-mono">
                        #{link.linkNumber}
                      </div>
                    </div>
                    <div className={`text-[10px] mt-0.5 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      {link.supportCount + (optimisticStatus[link.id] && !supportedSet.has(link.id) ? 1 : 0)} supports
                    </div>
                  </div>
                </div>

                {/* Badges: Post Type, Category, Proxy attribution */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Post Type Badge */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    link.postType === 'video'
                      ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                      : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                  }`}>
                    {link.postType === 'video' ? (
                      <><Video className="w-3 h-3" /> ভিডিও (Video)</>
                    ) : (
                      <><ImageIcon className="w-3 h-3" /> ফটো (Photo)</>
                    )}
                  </span>

                  {/* Category Badge */}
                  {link.category && link.category !== 'member' && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      link.category === 'vip' ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' :
                      link.category === 'admin' ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300' :
                      'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    }`}>
                      {link.category === 'vip' && <Crown className="w-3 h-3" />}
                      {link.category === 'admin' && <ShieldCheck className="w-3 h-3" />}
                      {link.category === 'notice' && <Bell className="w-3 h-3" />}
                      <span className="capitalize">{link.category}</span>
                    </span>
                  )}

                  {/* Admin Proxy attribution */}
                  {link.isSubmittedByAdmin && (
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-md text-[10px] font-bold">
                      👤 Admin Proxy ({link.submittedByAdminName || 'Admin'})
                    </span>
                  )}
                </div>

                {/* Badge title if exists */}
                {link.badgeTitle && (
                  <div className="flex items-center">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border truncate max-w-full ${
                      link.category === 'vip'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : link.category === 'admin'
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {link.badgeTitle}
                    </span>
                  </div>
                )}

                {/* Centered "Support Link Box" header & Caption / Note */}
                <div className={`p-3 sm:p-4 rounded-xl border text-xs text-center flex flex-col items-center justify-center min-h-[60px] space-y-2 transition-colors ${
                  darkMode 
                    ? 'bg-[#0E0E12]/80 border-white/5 text-gray-200' 
                    : 'bg-slate-50/90 border-slate-200 text-slate-700'
                }`}>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400">
                    <span>Support Link Box</span>
                    <span>•</span>
                    <span className="font-mono">#{link.linkNumber}</span>
                  </div>

                  {link.caption ? (
                    <p className="line-clamp-2 italic font-medium text-center max-w-md mx-auto">
                      "{link.caption}"
                    </p>
                  ) : (
                    <span className={`italic text-center text-xs ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                      Support exchange post on Facebook. React and comment!
                    </span>
                  )}

                  {/* Support Instruction if provided */}
                  {link.instruction && (
                    <div className="pt-1.5 border-t border-white/5 w-full text-center">
                      <span className="text-[10px] font-bold text-indigo-400 inline-flex items-center gap-1 justify-center">
                        🎯 দিকনির্দেশনা:
                      </span>
                      <p className="text-[11px] text-indigo-300 mt-0.5 line-clamp-2 text-center font-medium">
                        {link.instruction}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Indicator Badge - Centered */}
                <div className="flex items-center justify-center gap-2 text-xs pt-1">
                  <span className={`${darkMode ? 'text-gray-400' : 'text-slate-500'} text-[11px]`}>Support Status:</span>
                  <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full transition-all duration-200 ${
                    isOwnLink 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : isSupported 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 scale-105' 
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                  }`}>
                    {isOwnLink ? 'Your Own Link' : isSupported ? '✓ Supported' : '○ Pending'}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions - Direct native <a> tag for native OS intent handling & App swipe */}
              <div className={`p-3 sm:px-4 sm:py-3 border-t flex items-center justify-between gap-2 ${
                darkMode ? 'bg-[#0E0E12]/90 border-white/5' : 'bg-slate-50/90 border-slate-200'
              }`}>
                
                {/* Native App Link */}
                <a
                  href={getFacebookAppUrl(link.postUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-2.5 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 hover:text-blue-200 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors active:scale-95"
                  title="সরাসরি ফেসবুক অ্যাপে খুলুন"
                >
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                  <span>📱 অ্যাপ</span>
                </a>

                {/* Safe Web Browser Link (mbasic - stops app redirect) */}
                <a
                  href={getFacebookWebBrowserUrl(link.postUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-2.5 bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors active:scale-95"
                  title="কোনো অ্যাপ ওপেন না হয়ে সরাসরি ব্রাউজারে চলবে"
                >
                  <span>🌐 ব্রাউজার</span>
                </a>

                {/* Open in Playlist Support Session */}
                <button
                  onClick={() => {
                    setSelectedPlayerLinkId(link.id);
                    setViewMode('playlist');
                  }}
                  title="প্লেলিস্ট সেশনে ওপেন করুন"
                  className="p-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold rounded-lg flex items-center justify-center transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>

                {/* Optional In-app preview */}
                <button
                  onClick={() => setSelectedPostForInAppView(link)}
                  title="অ্যাপের ভেতরেই প্রিভিউ দেখুন"
                  className="p-2 bg-[#1E1E20] hover:bg-[#252528] border border-[#2A2A2D] text-gray-300 hover:text-white text-xs font-bold rounded-lg flex items-center justify-center transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                </button>

                {/* Action Button: Peer links go to Playlist Support Session with verified return flow */}
                {!isOwnLink ? (
                  <button
                    onClick={() => {
                      setSelectedPlayerLinkId(link.id);
                      setViewMode('playlist');
                    }}
                    className={`py-2 px-3.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 shadow-xs ${
                      isSupported
                        ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                        : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-600/20'
                    }`}
                    title={isSupported ? 'সাপোর্ট সম্পন্ন হয়েছে (ক্লিক করে প্লেলিস্টে দেখতে পারেন)' : 'সাপোর্ট করতে প্লেলিস্টে যান'}
                  >
                    {isSupported ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>সাপোর্টেড</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        <span>সাপোর্ট দিন ▶</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <a
                      href={getFacebookAppUrl(link.postUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-purple-200 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                      title="নিজের লিংকটি ফেসবুক অ্যাপ বা ব্রাউজারে টেস্ট করুন"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>চেক</span>
                    </a>

                    {(() => {
                      const deadline = link.editableUntil || (link.submittedAtTimestamp ? link.submittedAtTimestamp + 120000 : 0);
                      const canEdit = deadline > 0 && Date.now() < deadline;
                      return canEdit ? (
                        <button
                          onClick={() => setEditingLink(link)}
                          className="py-2 px-2.5 bg-indigo-600/25 hover:bg-indigo-600/35 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors animate-pulse"
                          title="২ মিনিটের এডিট উইন্ডো সক্রিয় আছে"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>এডিট (২মি)</span>
                        </button>
                      ) : (
                        <span 
                          className="py-2 px-2 bg-[#1A1A1D] border border-[#26262B] text-gray-500 text-[11px] font-semibold rounded-lg flex items-center gap-1"
                          title="২ মিনিট পার হয়ে যাওয়ায় মেম্বার কর্তৃক আর এডিট বা ডিলিট সম্ভব নয়"
                        >
                          <Lock className="w-3 h-3 text-gray-500" />
                          <span>লকড</span>
                        </span>
                      );
                    })()}
                  </div>
                )}

                {/* Admin Edit/Remove Controls for any link */}
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingLink(link)}
                      className="p-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-white rounded-lg text-xs transition-colors"
                      title="Admin Edit Link"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`এডমিন হিসেবে #${link.linkNumber} (${link.memberName}) এর লিংকটি ডিলিট করতে চান?`)) {
                          removeDailyLink(link.id);
                        }
                      }}
                      className="p-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 hover:text-white rounded-lg text-xs transition-colors"
                      title="Admin Remove Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setReportTarget({ 
                    linkId: link.id, 
                    name: link.memberName,
                    number: link.linkNumber,
                    memberId: link.memberId,
                    url: link.postUrl
                  })}
                  title="Report a Problem / সমস্যা রিপোর্ট"
                  className="py-2 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 hover:text-rose-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden xl:inline text-[11px]">রিপোর্ট</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sentinel & Lazy Load More Buttons */}
      {hasMore && (
        <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVisibleCount(prev => Math.min(prev + PAGE_SIZE, eligibleLinks.length))}
              className="px-6 py-2.5 bg-[#18181C] hover:bg-[#202026] border border-[#26262D] hover:border-indigo-500/50 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-md"
            >
              <span>আরো ২০টি লিংক লোড করুন (বাকি {eligibleLinks.length - displayedLinks.length}টি)</span>
              <ChevronDown className="w-4 h-4 text-indigo-400" />
            </button>

            <button
              onClick={() => setVisibleCount(eligibleLinks.length)}
              className="px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs sm:text-sm rounded-xl transition-all"
            >
              সবগুলো লোড করুন
            </button>
          </div>
          <p className="text-[11px] text-gray-500">
            স্ক্রোল করলেই স্বয়ংক্রিয়ভাবে পরবর্তী ২০টি কার্ড চলে আসবে
          </p>
        </div>
      )}

      {eligibleLinks.length === 0 && (
        <div className="p-8 text-center bg-[#131315] rounded-2xl border border-[#1E1E20]">
          <div className="text-3xl mb-2">🔍</div>
          <div className="text-sm font-bold text-white">No links found</div>
          <p className="text-xs text-gray-500 mt-1">Try switching tabs or adjusting your search term.</p>
        </div>
      )}

      {/* Mid-content Display Ad */}
      <DisplayAdSlot format="in_feed" />

      {/* In-App Post Viewer Modal */}
      <InAppPostViewerModal
        isOpen={Boolean(selectedPostForInAppView)}
        onClose={() => setSelectedPostForInAppView(null)}
        currentLink={selectedPostForInAppView}
        allLinks={eligibleLinks}
        onSelectLink={link => setSelectedPostForInAppView(link)}
        onReportLink={(linkId, name) => setReportTarget({ linkId, name })}
      />

      {/* Scheduled Links Modal */}
      <ScheduledLinksModal
        isOpen={showScheduledModal}
        onClose={() => setShowScheduledModal(false)}
        onOpenScheduleNew={() => {
          setShowScheduledModal(false);
          setShowSubmitModal(true);
        }}
      />

      {/* Submission Modal */}
      <LinkSubmissionModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
      />

      {/* Link Edit Modal (2-Minute Member Window / Unlimited Admin Override) */}
      {editingLink && (
        <LinkEditModal
          link={editingLink}
          isOpen={Boolean(editingLink)}
          onClose={() => setEditingLink(null)}
        />
      )}

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={Boolean(reportTarget)}
          onClose={() => setReportTarget(null)}
          targetLinkId={reportTarget.linkId}
          targetName={reportTarget.name}
          targetMemberId={reportTarget.memberId}
          prefilledLinkInfo={{
            id: reportTarget.linkId,
            number: reportTarget.number || 1,
            member: reportTarget.name,
            url: reportTarget.url
          }}
        />
      )}

      {/* Late All Done Rewarded Ad Recovery Modal */}
      <LateAllDoneAdModal
        isOpen={showPenaltyAdModal}
        onClose={() => setShowPenaltyAdModal(false)}
      />

      {/* Late Support Report Submission Modal */}
      <LateSupportReportModal
        isOpen={showLateReportModal}
        onClose={() => setShowLateReportModal(false)}
      />

      {/* Theme Presets & Wallpaper Gallery Modal */}
      <ThemeSelectorModal
        isOpen={showThemeSelectorModal}
        onClose={() => setShowThemeSelectorModal(false)}
      />
    </div>
  );
};
