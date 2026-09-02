import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyLink } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  Flame, 
  Trophy, 
  Award, 
  ArrowRight, 
  PlusCircle, 
  Link as LinkIcon, 
  AlertCircle, 
  ExternalLink, 
  Check, 
  Sparkles, 
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Eye
} from 'lucide-react';
import { LinkSubmissionModal } from './LinkSubmissionModal';
import { InAppPostViewerModal } from './InAppPostViewerModal';
import { TurboSupportRunner } from './TurboSupportRunner';
import { SponsoredBanner } from '../monetization/SponsoredBanner';
import { DisplayAdSlot } from '../monetization/DisplayAdSlot';
import { ReportModal } from './ReportModal';

interface MemberDashboardProps {
  onNavigate: (view: string) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({ onNavigate }) => {
  const { 
    currentUser, 
    dailyLinks, 
    notices, 
    getTodaySupportStats, 
    markLinkSupported,
    badges 
  } = useApp();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTurboRunner, setShowTurboRunner] = useState(false);
  const [selectedPostForInAppView, setSelectedPostForInAppView] = useState<DailyLink | null>(null);
  const [reportTarget, setReportTarget] = useState<{ linkId: string; name: string } | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Welcome to Support Link Box</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">Please log in to manage your daily tasks, submit links, and view your progress.</p>
        <button
          onClick={() => onNavigate('landing')}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          View Public Page / Log In
        </button>
      </div>
    );
  }

  const stats = getTodaySupportStats(currentUser.id);

  // Active notices for this user
  const userNotices = notices.filter(n => 
    n.active && (n.targetMemberId === currentUser.id || n.targetMemberId === 'all')
  );

  // Today's peer links preview (max 5 for dashboard)
  const peerLinks = dailyLinks.filter(l => l.memberId !== currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome, {currentUser.name}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              #{currentUser.memberNumber}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Support Link Box Community • 59th Week Championship Session
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!stats.hasSubmittedToday ? (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Submit Today's Link
            </button>
          ) : (
            <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Link #{stats.submittedLink?.linkNumber} Submitted
            </div>
          )}
        </div>
      </div>

      {/* Warning / Notice Banner (if any) */}
      {userNotices.length > 0 && (
        <div className="space-y-2">
          {userNotices.map(notice => (
            <div 
              key={notice.id}
              className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
                notice.type === 'kickout_warning'
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                  : notice.type === 'alert_warning'
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
                  : notice.type === 'simple_warning'
                  ? 'bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-900 text-orange-800 dark:text-orange-200'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900 text-indigo-800 dark:text-indigo-200'
              }`}
            >
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-current" />
              <div className="flex-1 min-w-0">
                <div className="font-bold">{notice.title}</div>
                <div className="text-xs mt-0.5 opacity-90">{notice.message}</div>
                <div className="text-[10px] mt-1 opacity-70">Issued by: {notice.issuedBy} • {notice.issuedAt}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VERY IMPORTANT UX REQUIREMENT: TODAY'S TASK HERO CARD */}
      <section className="bg-gradient-to-br from-[#1E1E20] to-[#131315] p-6 sm:p-7 rounded-2xl border border-indigo-500/20 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-4 max-w-xl flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Today's Task</h2>
                <p className="text-sm text-gray-400">Deadline: <span className="text-indigo-300 font-mono">11:59:59 PM BST</span></p>
              </div>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full font-bold uppercase tracking-widest">
                Required
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex-1 h-3 bg-[#0A0A0B] rounded-full overflow-hidden border border-[#1E1E20]">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(stats.progressPercentage, 4)}%` }}
                />
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-bold text-white leading-none">
                  {stats.completedCount} / {stats.requiredCount}
                </span>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Supports Completed</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    {stats.pendingCount > 0 ? `${stats.pendingCount} Supports Remaining` : 'All Daily Supports Done!'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {stats.pendingCount > 0 ? 'Finish these before midnight to maintain your streak!' : 'Great job! Your daily streak is preserved.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onNavigate('daily_links')}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
                >
                  <span>{stats.pendingCount > 0 ? 'Continue Supporting' : 'View Feed'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Submission status box */}
          <div className="shrink-0 flex flex-col gap-3 sm:w-60 bg-[#0A0A0B] p-4 rounded-xl border border-[#1E1E20]">
            <div className="text-xs text-gray-400 font-semibold">Your Daily Submission</div>
            {stats.hasSubmittedToday ? (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Link #{stats.submittedLink?.linkNumber} Live
                </div>
                <div className="text-[11px] text-gray-400 mt-1 truncate">
                  {stats.submittedLink?.caption || stats.submittedLink?.postUrl}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-semibold">
                  ⚠ No link submitted yet today
                </div>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Submit Today's Link
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        
        <div className="bg-[#131315] p-4 rounded-xl border border-[#1E1E20]">
          <p className="text-xs text-gray-500 mb-1">Today's Link</p>
          <p className="text-2xl font-bold text-white">
            {stats.hasSubmittedToday ? `#${stats.submittedLink?.linkNumber}` : 'None'}
            <span className={`text-xs ml-1.5 font-medium ${stats.hasSubmittedToday ? 'text-green-500' : 'text-amber-500'}`}>
              {stats.hasSubmittedToday ? '✓ Active' : 'Pending'}
            </span>
          </p>
        </div>

        <div className="bg-[#131315] p-4 rounded-xl border border-[#1E1E20]">
          <p className="text-xs text-gray-500 mb-1">Completion Rate</p>
          <p className="text-2xl font-bold text-indigo-400">
            {stats.progressPercentage}%
            <span className="text-gray-500 text-xs font-normal ml-1.5">{stats.completedCount}/{stats.requiredCount}</span>
          </p>
        </div>

        <div className="bg-[#131315] p-4 rounded-xl border border-[#1E1E20]">
          <p className="text-xs text-gray-500 mb-1">Pending Supports</p>
          <p className="text-2xl font-bold text-white">
            {stats.pendingCount}
            <span className="text-orange-500 text-xs font-normal ml-1.5">due 11:59PM</span>
          </p>
        </div>

        <div className="bg-[#131315] p-4 rounded-xl border border-[#1E1E20]">
          <p className="text-xs text-gray-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-500">
            {stats.completedCount}
            <span className="text-gray-500 text-xs font-normal ml-1.5">verified</span>
          </p>
        </div>

        <div className="bg-[#131315] p-4 rounded-xl border border-[#1E1E20]">
          <p className="text-xs text-gray-500 mb-1">Total Points</p>
          <p className="text-2xl font-bold text-white">
            {currentUser.totalPoints}
            <span className="text-indigo-400 text-xs font-normal ml-1.5">+{currentUser.weeklyPoints} wk</span>
          </p>
        </div>

        <div className="bg-[#131315] p-4 rounded-xl border border-[#1E1E20]">
          <p className="text-xs text-gray-500 mb-1">Global Rank</p>
          <p className="text-2xl font-bold text-white">
            #{currentUser.currentRank}
            <span className="text-indigo-400 text-xs font-normal ml-1.5">Top 1%</span>
          </p>
        </div>

        <div className="bg-[#131315] p-4 rounded-xl border border-[#1E1E20] col-span-2 sm:col-span-4 lg:col-span-1">
          <p className="text-xs text-gray-500 mb-1">Daily Streak</p>
          <p className="text-2xl font-bold text-orange-500 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
            {currentUser.currentStreak}d
            <span className="text-gray-500 text-xs font-normal ml-1">Max {currentUser.longestStreak}d</span>
          </p>
        </div>

      </div>

      {/* Sponsored Dashboard Banner */}
      <SponsoredBanner position="dashboard_banner" />

      {/* Today's Link Feed (Quick Preview with Support action) */}
      <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Today's Community Links ({peerLinks.length})
            </h3>
            <p className="text-xs text-gray-400">
              Exchange reactions and comments on Facebook to maintain high community engagement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTurboRunner(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-extrabold rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-transform active:scale-95 animate-pulse"
            >
              <span>⚡ টার্বো ফাস্ট সাপোর্ট</span>
            </button>

            <button
              onClick={() => onNavigate('daily_links')}
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
            >
              View All ({peerLinks.length}) <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {peerLinks.slice(0, 6).map(link => {
            const isSupported = stats.supportedLinkIds.has(link.id);

            return (
              <div
                key={link.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSupported
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-[#0E0E10] border-[#1E1E20] hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={link.memberAvatar} 
                      alt={link.memberName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-700" 
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {link.memberName}
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                          #{link.linkNumber}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500">
                        @{link.memberUsername} • {link.submittedAt}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSupported 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {isSupported ? '✓ Supported' : '○ Pending'}
                  </span>
                </div>

                {link.caption && (
                  <p className="text-xs text-gray-300 mb-3 line-clamp-2 italic">
                    "{link.caption}"
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-[#1E1E20]">
                  <button
                    onClick={() => setSelectedPostForInAppView(link)}
                    className="flex-1 py-1.5 px-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>সাইটেই দেখুন</span>
                  </button>

                  <a
                    href={link.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Directly open on Facebook in new tab"
                    className="p-1.5 bg-[#1E1E20] hover:bg-[#252528] text-gray-400 hover:text-white text-xs font-semibold rounded-lg flex items-center justify-center transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => markLinkSupported(link.id)}
                    disabled={isSupported}
                    className={`py-1.5 px-3.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
                      isSupported
                        ? 'bg-green-600 text-white cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-xs'
                    }`}
                  >
                    {isSupported ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Done
                      </>
                    ) : (
                      'Mark Support'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Earned Badges & Community Gamification */}
      <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-4 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            Your Badges & Achievements
          </h3>
          <span className="text-xs text-gray-500">
            {currentUser.badges.length} of {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {badges.map(badge => {
            const isUnlocked = currentUser.badges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  isUnlocked
                    ? 'bg-[#0E0E10] border-indigo-500/30 shadow-xs'
                    : 'bg-[#0A0A0B] border-[#1E1E20] opacity-40 grayscale'
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-bold text-white line-clamp-1">{badge.name}</div>
                <div className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">
                  {badge.description}
                </div>
                {isUnlocked && (
                  <span className="inline-block text-[9px] font-bold text-green-400 mt-1 uppercase">
                    ✓ Unlocked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* In-feed Display Ad Slot */}
      <DisplayAdSlot format="horizontal_banner" />

      {/* Turbo Fast Support Runner Modal */}
      <TurboSupportRunner
        isOpen={showTurboRunner}
        onClose={() => setShowTurboRunner(false)}
        allLinks={peerLinks}
      />

      {/* In-App Post Viewer Modal */}
      <InAppPostViewerModal
        isOpen={Boolean(selectedPostForInAppView)}
        onClose={() => setSelectedPostForInAppView(null)}
        currentLink={selectedPostForInAppView}
        allLinks={peerLinks}
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
