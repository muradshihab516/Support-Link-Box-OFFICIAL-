import React from 'react';
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
  Sparkles 
} from 'lucide-react';
import { getStatusBadgeColor } from '../../utils/helpers';

interface MemberProfileViewProps {
  memberId?: string;
  onNavigate?: (view: string) => void;
  onOpenReport?: (linkInfo?: { id: string; number: number; member: string }) => void;
}

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({ memberId, onNavigate, onOpenReport }) => {
  const { currentUser, members, badges, supportRecords, dailyLinks } = useApp();

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

  // Recent supports done by this user
  const recentSupports = supportRecords
    .filter(r => r.supporterMemberId === targetMember.id)
    .slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      
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
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {targetMember.name}
              </h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border capitalize ${getStatusBadgeColor(targetMember.status)}`}>
                {targetMember.status}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                {targetMember.role.replace('_', ' ')}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-gray-400 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span>@{targetMember.username}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined {targetMember.joinedAt}
              </span>
            </div>

            <p className="text-xs text-gray-300 max-w-xl">
              Support Link Box active community member participating in daily Facebook engagement and post exchange.
            </p>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
              <a
                href={targetMember.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>View Facebook Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Current Rank</span>
          <div className="text-2xl font-bold text-amber-500 mt-1 flex items-center gap-1.5">
            <Trophy className="w-6 h-6 text-amber-500" />
            #{targetMember.currentRank}
          </div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">in 59th Week</span>
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

        {/* Activity & Health Summary */}
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">
            Community Standing & Health
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-[#0E0E10] border border-[#1E1E20] rounded-xl">
              <span className="text-gray-400">Links Submitted</span>
              <span className="font-bold text-white font-mono">{targetMember.linksSubmitted} links</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#0E0E10] border border-[#1E1E20] rounded-xl">
              <span className="text-gray-400">Inactivity Count</span>
              <span className="font-bold text-white font-mono">{targetMember.inactivityDays} days</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#0E0E10] border border-[#1E1E20] rounded-xl">
              <span className="text-gray-400">Official Warnings</span>
              <span className={`font-bold font-mono ${targetMember.warningCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {targetMember.warningCount} notices
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#0E0E10] border border-[#1E1E20] rounded-xl">
              <span className="text-gray-400">Account Safety</span>
              <span className="font-bold text-green-400">Good Standing</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
