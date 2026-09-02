import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Trophy, 
  Flame, 
  Medal, 
  Crown, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { SponsoredBanner } from '../monetization/SponsoredBanner';
import { DisplayAdSlot } from '../monetization/DisplayAdSlot';

interface LeaderboardViewProps {
  onNavigate?: (view: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onNavigate }) => {
  const { members, currentUser, sponsors, currentWeek } = useApp();
  const [timeframe, setTimeframe] = useState<'weekly' | 'daily' | 'monthly' | 'all_time'>('weekly');
  const [search, setSearch] = useState('');

  // Find leaderboard sponsor if any
  const lbSponsor = sponsors.find(s => s.packageType === 'leaderboard_sponsor' && s.status === 'active') || sponsors[0];

  // Sort members based on selected timeframe
  const sortedMembers = [...members].sort((a, b) => {
    if (timeframe === 'weekly') {
      if (b.weeklyPoints !== a.weeklyPoints) return b.weeklyPoints - a.weeklyPoints;
      return b.completionRate - a.completionRate;
    }
    if (timeframe === 'daily') {
      if (b.dailySupportsDone !== a.dailySupportsDone) return b.dailySupportsDone - a.dailySupportsDone;
      return b.completionRate - a.completionRate;
    }
    if (timeframe === 'monthly') {
      return (b.weeklyPoints * 4) - (a.weeklyPoints * 4);
    }
    // all_time
    return b.totalPoints - a.totalPoints;
  });

  const filteredMembers = sortedMembers.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.username.toLowerCase().includes(search.toLowerCase()) ||
    m.memberNumber.toString().includes(search)
  );

  const top3 = sortedMembers.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Community Leaderboard
            </h1>
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 font-bold text-xs rounded-full border border-amber-500/20">
              {typeof currentWeek === 'object' && currentWeek !== null ? (currentWeek as any).weekNumber : currentWeek || 59}th Week Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Top supporters earn weekly points, special profile badges, and sponsored prizes!
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex bg-[#131315] p-1 rounded-xl border border-[#1E1E20]">
          {(['weekly', 'daily', 'monthly', 'all_time'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors capitalize ${
                timeframe === tf
                  ? 'bg-[#1E1E20] text-indigo-400 shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tf.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* SPONSORED LEADERBOARD BANNER */}
      {lbSponsor && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-amber-500/20">
          <div className="flex items-center gap-3.5">
            {lbSponsor.imageUrl && (
              <img 
                src={lbSponsor.imageUrl} 
                alt={lbSponsor.title} 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover ring-2 ring-white/20 shrink-0" 
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-black font-black text-[9px] px-2 py-0.5 rounded tracking-wider uppercase">
                  🏆 OFFICIAL LEADERBOARD SPONSOR
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                {lbSponsor.title} — Powered by {lbSponsor.sponsorName}
              </h3>
              <p className="text-xs text-white/80 line-clamp-1">
                {lbSponsor.description}
              </p>
            </div>
          </div>

          <a
            href={lbSponsor.destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-gray-100 text-black font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            <span>Visit Sponsor Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* TOP 3 PODIUM */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* 2nd Place (Silver) */}
          <div className="order-2 md:order-1 rounded-2xl bg-[#131315] border border-[#1E1E20] p-5 text-center flex flex-col items-center justify-between shadow-xs">
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1E1E20] text-gray-300 font-bold text-sm shadow-xs">
                🥈 2nd
              </div>
              <div className="relative inline-block">
                <img 
                  src={top3[1].avatar} 
                  alt={top3[1].name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-gray-600 mx-auto" 
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{top3[1].name}</h3>
                <div className="text-xs text-gray-500">@{top3[1].username} • #{top3[1].memberNumber}</div>
              </div>
            </div>

            <div className="w-full mt-4 pt-3 border-t border-[#1E1E20] space-y-1">
              <div className="text-lg font-bold text-white">
                {timeframe === 'weekly' ? `${top3[1].weeklyPoints} Weekly Pts` : `${top3[1].totalPoints} Total Pts`}
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center gap-2">
                <span>{top3[1].completionRate}% Rate</span>
                <span>•</span>
                <span className="text-orange-500 font-semibold flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-orange-500" /> {top3[1].currentStreak}d
                </span>
              </div>
            </div>
          </div>

          {/* 1st Place (Gold Champion) */}
          <div className="order-1 md:order-2 rounded-2xl bg-gradient-to-b from-[#1E1E20] to-[#131315] border-2 border-amber-500/60 p-6 text-center flex flex-col items-center justify-between shadow-2xl relative -mt-2 md:-mt-4">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-black" /> Weekly Champion
            </div>

            <div className="space-y-2 mt-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-400 text-black font-black text-base shadow-sm">
                🥇 1st
              </div>
              <div className="relative inline-block">
                <img 
                  src={top3[0].avatar} 
                  alt={top3[0].name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-400 mx-auto shadow-md" 
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{top3[0].name}</h3>
                <div className="text-xs text-gray-400">@{top3[0].username} • #{top3[0].memberNumber}</div>
              </div>
            </div>

            <div className="w-full mt-4 pt-3 border-t border-amber-500/20 space-y-1">
              <div className="text-2xl font-bold text-amber-400">
                {timeframe === 'weekly' ? `${top3[0].weeklyPoints} Weekly Pts` : `${top3[0].totalPoints} Total Pts`}
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center gap-2">
                <span className="font-semibold text-green-400">{top3[0].completionRate}% Rate</span>
                <span>•</span>
                <span className="text-orange-500 font-bold flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" /> {top3[0].currentStreak}d streak
                </span>
              </div>
            </div>
          </div>

          {/* 3rd Place (Bronze) */}
          <div className="order-3 rounded-2xl bg-[#131315] border border-[#1E1E20] p-5 text-center flex flex-col items-center justify-between shadow-xs">
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-900/30 text-amber-400 font-bold text-sm shadow-xs">
                🥉 3rd
              </div>
              <div className="relative inline-block">
                <img 
                  src={top3[2].avatar} 
                  alt={top3[2].name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-amber-700/40 mx-auto" 
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{top3[2].name}</h3>
                <div className="text-xs text-gray-500">@{top3[2].username} • #{top3[2].memberNumber}</div>
              </div>
            </div>

            <div className="w-full mt-4 pt-3 border-t border-[#1E1E20] space-y-1">
              <div className="text-lg font-bold text-white">
                {timeframe === 'weekly' ? `${top3[2].weeklyPoints} Weekly Pts` : `${top3[2].totalPoints} Total Pts`}
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center gap-2">
                <span>{top3[2].completionRate}% Rate</span>
                <span>•</span>
                <span className="text-orange-500 font-semibold flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-orange-500" /> {top3[2].currentStreak}d
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Point System Explanation Box */}
      <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] text-xs text-gray-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">Point Scoring Rules:</span>
          <p className="text-gray-400">
            Weekly Champions: 1st (5 pts), 2nd (4 pts), 3rd (3 pts), 4th (2 pts), 5th (1 pt). Daily full support yields +1 point. A 7-day perfect streak yields +3 bonus points. Points determine leaderboard rankings and badge eligibility.
          </p>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-[#1E1E20] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white">
            All Community Members ({filteredMembers.length})
          </h3>
          <input
            type="text"
            placeholder="Search member name or @username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:border-indigo-500 text-white placeholder-gray-500 w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E0E10] text-gray-400 font-semibold border-b border-[#1E1E20]">
              <tr>
                <th className="py-3 px-4 w-14">Rank</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4 text-center">Links</th>
                <th className="py-3 px-4 text-center">Supports</th>
                <th className="py-3 px-4 text-center">Rate</th>
                <th className="py-3 px-4 text-center">Streak</th>
                <th className="py-3 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E20]">
              {filteredMembers.map((member, index) => {
                const rank = index + 1;
                const isCurrent = currentUser?.id === member.id;

                return (
                  <tr 
                    key={member.id}
                    className={`hover:bg-[#1E1E20]/50 transition-colors ${
                      isCurrent ? 'bg-indigo-500/10 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-300">
                      {rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : `#${rank}`}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-gray-700" 
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {member.name}
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-indigo-600 text-white rounded">You</span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            @{member.username} • #{member.memberNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-gray-300">
                      {member.linksSubmitted}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-gray-300">
                      {member.supportsCompleted}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        member.completionRate >= 95 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : member.completionRate >= 80 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {member.completionRate}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-orange-500 font-bold">
                        <Flame className="w-3.5 h-3.5 fill-orange-500" />
                        {member.currentStreak}d
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-sm text-indigo-400 font-mono">
                      {timeframe === 'weekly' ? member.weeklyPoints : member.totalPoints} Pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DisplayAdSlot format="leaderboard" />
    </div>
  );
};
