import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Trophy, 
  Award, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Zap,
  RotateCcw
} from 'lucide-react';
import { getRankBadge } from '../../utils/helpers';

export const WeeklyManagement: React.FC = () => {
  const { currentWeek, members, weeklyHistory, advanceWeek } = useApp();
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Top 5 members of current week
  const topContenders = [...members]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  const handleAdvance = () => {
    if (confirm(`Are you sure you want to finalize Week #${currentWeek} and award bonus points to the Top 5 leaders?`)) {
      setIsAdvancing(true);
      advanceWeek();
      setIsAdvancing(false);
      setSuccessMsg(`Week #${currentWeek} finalized successfully! Week #${currentWeek + 1} is now active.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Trophy className="w-6 h-6 text-amber-400" />
            Weekly Championship Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage weekly championship cycles, automated bonus distribution, and archival.
          </p>
        </div>

        <button
          onClick={handleAdvance}
          disabled={isAdvancing}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>{isAdvancing ? 'Finalizing...' : `Finalize & Advance to Week #${currentWeek + 1}`}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Active Week Status Card */}
      <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-6 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E1E20] pb-4">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Currently Running Cycle
            </span>
            <h2 className="text-2xl font-bold text-white mt-0.5 tracking-tight">
              Week #{currentWeek} Championship Session
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Competition
            </span>
          </div>
        </div>

        {/* Current Top 5 Preview with Bonus Formula */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Current Top 5 Contenders & Projected Bonus Points
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {topContenders.map((member, index) => {
              const bonus = index === 0 ? 100 : index === 1 ? 70 : index === 2 ? 50 : 30;

              return (
                <div 
                  key={member.id}
                  className="p-4 rounded-xl bg-[#0E0E10] border border-[#1E1E20] space-y-2 text-center relative overflow-hidden"
                >
                  <div className="absolute top-2 left-2 text-xs font-mono font-black text-gray-500">
                    {getRankBadge(index + 1)}
                  </div>

                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="w-12 h-12 rounded-full object-cover mx-auto ring-2 ring-indigo-500/30" 
                  />

                  <div>
                    <div className="font-bold text-xs text-white truncate">
                      {member.name}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {member.totalPoints} pts
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1E1E20]">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      +{bonus} Bonus Pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Automated Rules Checklist */}
        <div className="p-4 rounded-xl bg-[#0E0E10] border border-indigo-500/20 text-xs text-gray-300 space-y-2">
          <div className="font-bold text-indigo-300">
            What happens on "Finalize & Advance"?
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-400">
            <li>Awards 1st place (+100 pts + Top Performer badge), 2nd place (+70 pts), 3rd place (+50 pts), 4th-5th (+30 pts).</li>
            <li>Generates and stores the complete 59th Week Leaderboard snapshot in permanent history.</li>
            <li>Archives records and advances the live counter to Week #{currentWeek + 1}.</li>
          </ul>
        </div>
      </div>

      {/* Historical Archives */}
      <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-white">
          Championship History & Past Champions
        </h3>

        <div className="space-y-3">
          {weeklyHistory.map(session => (
            <div 
              key={session.id}
              className="p-4 rounded-xl bg-[#0E0E10] border border-[#1E1E20] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="font-bold text-xs text-white">
                  Week #{session.weekNumber} Session ({session.startDate} — {session.endDate})
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {session.totalParticipants} participants • {session.totalLinksExchanged} links exchanged
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-gray-500">Champion:</div>
                  <div className="text-xs font-bold text-amber-400">{session.topPerformerName}</div>
                </div>
                <div className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg">
                  {session.topPerformerPoints} pts
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
