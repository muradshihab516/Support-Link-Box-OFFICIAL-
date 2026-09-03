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
  LayoutGrid
} from 'lucide-react';
import { LinkSubmissionModal } from './LinkSubmissionModal';
import { InAppPostViewerModal } from './InAppPostViewerModal';
import { TurboSupportRunner } from './TurboSupportRunner';
import { YouTubeStyleSupportSession } from './YouTubeStyleSupportSession';
import { ReportModal } from './ReportModal';
import { SponsoredBanner } from '../monetization/SponsoredBanner';
import { DisplayAdSlot } from '../monetization/DisplayAdSlot';
import confetti from 'canvas-confetti';
import { cleanAndFormatFacebookUrl } from '../../utils/facebookLinks';

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
    getTodaySupportStats, 
    markLinkSupported, 
    unmarkLinkSupported 
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'batch' | 'vip' | 'admin' | 'pending' | 'supported'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTurboRunner, setShowTurboRunner] = useState(false);
  const [selectedPostForInAppView, setSelectedPostForInAppView] = useState<DailyLink | null>(null);
  const [reportTarget, setReportTarget] = useState<{ linkId: string; name: string } | null>(null);

  // Optimistic UI state for instant checkmark feedback
  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, boolean>>({});

  // View Mode: Regular Card Grid vs YouTube Playlist Player Session
  const [viewMode, setViewMode] = useState<'grid' | 'youtube_player'>('grid');
  const [selectedPlayerLinkId, setSelectedPlayerLinkId] = useState<string | undefined>(undefined);

  // Pagination & Lazy-load state
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [batchRange, setBatchRange] = useState<'all' | '1-50' | '51-100' | '101-150' | '151-200'>('all');
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const stats = currentUser ? getTodaySupportStats(currentUser.id) : null;
  const supportedSet = useMemo(() => stats ? stats.supportedLinkIds : new Set<string>(), [stats]);

  // Reset pagination when search, filter, or batch changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, searchQuery, batchRange]);

  // Filter out currentUser's own link or flag it
  const eligibleLinks = useMemo(() => {
    return dailyLinks.filter(link => {
      const isOwn = currentUser ? link.memberId === currentUser.id : false;
      
      // Batch range filter
      if (batchRange === '1-50' && (link.linkNumber < 1 || link.linkNumber > 50)) return false;
      if (batchRange === '51-100' && (link.linkNumber < 51 || link.linkNumber > 100)) return false;
      if (batchRange === '101-150' && (link.linkNumber < 101 || link.linkNumber > 150)) return false;
      if (batchRange === '151-200' && (link.linkNumber < 151 || link.linkNumber > 200)) return false;

      // Search match
      const matchesSearch = 
        link.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.memberUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.caption && link.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
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

  // Render YouTube Style Player Session UI if selected
  if (viewMode === 'youtube_player') {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewMode('grid')}
            className="px-3.5 py-1.5 bg-[#141418] hover:bg-[#1E1E24] border border-[#24242E] text-gray-300 hover:text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            <span>← কার্ড গ্রিড ভিউতে ফিরুন</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">YouTube Style Support Session • Full Queue</span>
          </div>
        </div>

        <YouTubeStyleSupportSession
          initialLinkId={selectedPlayerLinkId}
          onClose={() => setViewMode('grid')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      
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
          {/* YouTube Style Player Mode Launch Button */}
          <button
            onClick={() => {
              setSelectedPlayerLinkId(undefined);
              setViewMode('youtube_player');
            }}
            className="px-3.5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-extrabold rounded-lg flex items-center gap-1.5 shadow-lg shadow-red-600/25 transition-transform active:scale-95"
            title="ইউটিউব ভিডিও + প্লেলিস্ট ইন্টারফেসে সাপোর্ট সেশন শুরু করুন"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>🎬 প্লেয়ার মোড (YouTube)</span>
          </button>

          <button
            onClick={() => setShowTurboRunner(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs sm:text-sm font-extrabold rounded-lg flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>⚡ টার্বো ফাস্ট</span>
          </button>

          {currentUser && !stats?.hasSubmittedToday ? (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-lg flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Submit Your Link
            </button>
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

      {/* Batch Jump Selector & Performance Notice */}
      <div className="bg-[#131315] border border-[#1E1E20] rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="font-semibold text-white">গ্রুপ ব্যাচ নেভিগেশন (দ্রুত জাম্প):</span>
          <span className="text-gray-500 hidden sm:inline">একসাথে সব না লোড করে দ্রুত লোড হচ্ছে</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'সব লিংক' },
            { id: '1-50', label: '#1-50 ব্যাচ' },
            { id: '51-100', label: '#51-100 ব্যাচ' },
            { id: '101-150', label: '#101-150 ব্যাচ' },
            { id: '151-200', label: '#151-200 ব্যাচ' },
          ].map(b => (
            <button
              key={b.id}
              onClick={() => setBatchRange(b.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${
                batchRange === b.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-[#1C1C20] text-gray-400 hover:text-white hover:bg-[#25252A]'
              }`}
            >
              {b.label}
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
              className={`rounded-2xl border transition-all duration-150 flex flex-col justify-between overflow-hidden shadow-xs ${
                isOwnLink
                  ? 'bg-indigo-500/5 border-indigo-500/30'
                  : isSupported
                  ? 'bg-green-500/5 border-green-500/30 ring-1 ring-green-500/20'
                  : 'bg-[#131315] border-[#1E1E20] hover:border-indigo-500/40'
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
                      <div className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                        {link.memberName}
                        {isOwnLink && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-indigo-600 text-white rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        @{link.memberUsername} • {link.submittedAt}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20 inline-block font-mono">
                      #{link.linkNumber}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {link.supportCount + (optimisticStatus[link.id] && !supportedSet.has(link.id) ? 1 : 0)} supports
                    </div>
                  </div>
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

                {/* Caption / Note */}
                <div className="p-3 bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-xs text-gray-300 min-h-[52px]">
                  {link.caption ? (
                    <p className="line-clamp-2 italic font-normal">
                      "{link.caption}"
                    </p>
                  ) : (
                    <span className="text-gray-500 italic">
                      Support exchange post on Facebook. React and comment!
                    </span>
                  )}
                </div>

                {/* Status Indicator Badge */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500 text-[11px]">Support Status:</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-all duration-200 ${
                    isOwnLink 
                      ? 'bg-[#1E1E20] text-gray-400'
                      : isSupported 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30 scale-105' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {isOwnLink ? 'Your Own Link' : isSupported ? '✓ Supported' : '○ Pending'}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions - Direct native <a> tag for native OS intent handling & App swipe */}
              <div className="p-3 sm:px-4 sm:py-3 bg-[#0E0E10] border-t border-[#1E1E20] flex items-center justify-between gap-2">
                
                {/* Direct Native Anchor - triggers native Facebook app or mobile browser reliably */}
                <a
                  href={directFbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 hover:text-blue-200 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                  title="সরাসরি ফেসবুক অ্যাপ বা ব্রাউজারে খুলুন (Swipe friendly)"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>ফেসবুকে খুলুন</span>
                </a>

                {/* Play in YouTube Player Session */}
                <button
                  onClick={() => {
                    setSelectedPlayerLinkId(link.id);
                    setViewMode('youtube_player');
                  }}
                  title="ইউটিউব স্টাইল প্লেয়ার সেশনে এই লিংকটি ওপেন করুন"
                  className="p-2 bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-300 hover:text-white text-xs font-bold rounded-lg flex items-center justify-center transition-colors"
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

                {/* Instant Optimistic Mark / Unmark Support Button */}
                {!isOwnLink ? (
                  <button
                    onClick={() => {
                      if (isSupported) {
                        handleUnmarkSupport(link.id);
                      } else {
                        handleMarkSupport(link.id);
                      }
                    }}
                    className={`py-2 px-3.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 shadow-xs ${
                      isSupported
                        ? 'bg-green-600 hover:bg-green-700 text-white ring-1 ring-green-400/40'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    }`}
                  >
                    {isSupported ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Supported</span>
                      </>
                    ) : (
                      <span>Mark Support</span>
                    )}
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-500 px-2">Own post</span>
                )}

                <button
                  onClick={() => setReportTarget({ linkId: link.id, name: link.memberName })}
                  title="Report link issue"
                  className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-[#1E1E20] transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
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

      {/* Turbo Fast Support Runner Modal */}
      <TurboSupportRunner
        isOpen={showTurboRunner}
        onClose={() => setShowTurboRunner(false)}
        allLinks={eligibleLinks}
      />

      {/* In-App Post Viewer Modal */}
      <InAppPostViewerModal
        isOpen={Boolean(selectedPostForInAppView)}
        onClose={() => setSelectedPostForInAppView(null)}
        currentLink={selectedPostForInAppView}
        allLinks={eligibleLinks}
        onSelectLink={link => setSelectedPostForInAppView(link)}
        onReportLink={(linkId, name) => setReportTarget({ linkId, name })}
      />

      {/* Submission Modal */}
      <LinkSubmissionModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
      />

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={Boolean(reportTarget)}
          onClose={() => setReportTarget(null)}
          targetLinkId={reportTarget.linkId}
          targetName={reportTarget.name}
        />
      )}
    </div>
  );
};
