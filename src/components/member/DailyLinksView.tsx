import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';
import { LinkSubmissionModal } from './LinkSubmissionModal';
import { InAppPostViewerModal } from './InAppPostViewerModal';
import { TurboSupportRunner } from './TurboSupportRunner';
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

  const stats = currentUser ? getTodaySupportStats(currentUser.id) : null;
  const supportedSet = stats ? stats.supportedLinkIds : new Set<string>();

  // Filter out currentUser's own link or flag it
  const eligibleLinks = dailyLinks.filter(link => {
    // If logged in, you don't support your own link
    const isOwn = currentUser ? link.memberId === currentUser.id : false;
    
    // Search match
    const matchesSearch = 
      link.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.memberUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (link.caption && link.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (link.badgeTitle && link.badgeTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      link.linkNumber.toString().includes(searchQuery);

    if (!matchesSearch) return false;

    const isSupported = supportedSet.has(link.id);

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

  const handleMarkSupport = (linkId: string) => {
    const res = markLinkSupported(linkId);
    if (res.success && stats && stats.pendingCount === 1) {
      // Last support completed! Fire celebration
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

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
            Exchange genuine reactions and comments on Facebook to maintain high community reach.
          </p>
        </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTurboRunner(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs sm:text-sm font-extrabold rounded-lg flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-transform active:scale-95 animate-pulse"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>⚡ টার্বো ফাস্ট সাপোর্ট (১ ক্লিকে)</span>
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

      {/* Support Status Tracker Bar for Current User */}
      {currentUser && stats && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto text-left">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Your Daily Support Status
            </div>
            <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
              <span>{stats.completedCount} of {stats.requiredCount} Supported</span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                stats.pendingCount === 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {stats.progressPercentage}%
              </span>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md hidden md:block">
            <div className="w-full bg-[#0A0A0B] rounded-full h-2.5 overflow-hidden border border-[#1E1E20]">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${stats.progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {stats.pendingCount > 0 ? (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                {stats.pendingCount} links remaining
              </span>
            ) : (
              <span className="text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 100% Completed
              </span>
            )}
          </div>
        </div>
      )}

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
            Pending ({stats?.pendingCount ?? 0})
          </button>
          <button
            onClick={() => setFilter('supported')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-1 ${
              filter === 'supported'
                ? 'bg-[#1E1E20] text-green-400 shadow-xs'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Supported ({stats?.completedCount ?? 0})
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

      {/* Daily Link Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eligibleLinks.map(link => {
          const isOwnLink = currentUser ? link.memberId === currentUser.id : false;
          const isSupported = supportedSet.has(link.id);

          return (
            <div
              key={link.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs ${
                isOwnLink
                  ? 'bg-indigo-500/5 border-indigo-500/30'
                  : isSupported
                  ? 'bg-green-500/5 border-green-500/20'
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
                      {link.supportCount} supports
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
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    isOwnLink 
                      ? 'bg-[#1E1E20] text-gray-400'
                      : isSupported 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {isOwnLink ? 'Your Own Link' : isSupported ? '✓ Supported' : '○ Pending'}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 sm:px-4 sm:py-3 bg-[#0E0E10] border-t border-[#1E1E20] flex items-center justify-between gap-2">
                
                <button
                  onClick={() => setSelectedPostForInAppView(link)}
                  className="flex-1 py-2 px-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>সাইটেই পোস্ট দেখুন</span>
                </button>

                <a
                  href={cleanAndFormatFacebookUrl(link.postUrl, 'm')}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Directly open on m.facebook in new tab"
                  className="p-2 bg-[#1E1E20] hover:bg-[#252528] border border-[#2A2A2D] text-gray-300 hover:text-white text-xs font-bold rounded-lg flex items-center justify-center transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {!isOwnLink ? (
                  <button
                    onClick={() => {
                      if (isSupported) {
                        unmarkLinkSupported(link.id);
                      } else {
                        handleMarkSupport(link.id);
                      }
                    }}
                    className={`py-2 px-3.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                      isSupported
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-lg shadow-indigo-600/20'
                    }`}
                  >
                    {isSupported ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Supported
                      </>
                    ) : (
                      'Mark Support'
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
