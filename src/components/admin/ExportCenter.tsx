import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Download, 
  Users, 
  Flame, 
  Trophy, 
  Snowflake, 
  DollarSign, 
  FileText,
  CheckCircle2
} from 'lucide-react';
import { exportToCSV } from '../../utils/helpers';

export const ExportCenter: React.FC = () => {
  const { members, dailyLinks, sponsors, revenueLogs, auditLogs, currentWeek } = useApp();

  const handleExportMembers = () => {
    const data = members.map(m => ({
      'Member #': m.memberNumber,
      Name: m.name,
      Username: `@${m.username}`,
      Email: m.email,
      Role: m.role,
      Status: m.status,
      'Links Submitted': m.linksSubmitted,
      'Supports Completed': m.supportsCompleted,
      'Completion %': m.completionRate,
      'Total Points': m.totalPoints,
      'Current Streak': m.currentStreak,
      'Inactivity Days': m.inactivityDays,
      'Warning Notices': m.warningCount,
      'Facebook URL': m.facebookUrl,
      'Joined At': m.joinedAt
    }));
    exportToCSV('Support_Link_Box_All_Members', data);
  };

  const handleExportTodayLinks = () => {
    const data = dailyLinks.map(l => ({
      'Link #': l.linkNumber,
      Member: l.memberName,
      Username: `@${l.memberUsername}`,
      'Post URL': l.postUrl,
      Caption: l.caption || '',
      'Supports Count': l.supportCount,
      'Submitted At': l.submittedAt
    }));
    exportToCSV('Today_Links_Submissions', data);
  };

  const handleExportLeaderboard = () => {
    const sorted = [...members].sort((a, b) => b.totalPoints - a.totalPoints);
    const data = sorted.map((m, idx) => ({
      Rank: idx + 1,
      Name: m.name,
      Username: `@${m.username}`,
      'Total Points': m.totalPoints,
      'Streak Days': m.currentStreak,
      'Completion Rate': `${m.completionRate}%`,
      Status: m.status
    }));
    exportToCSV(`Leaderboard_Week_${currentWeek}`, data);
  };

  const handleExportInactive = () => {
    const inactive = members.filter(m => m.status === 'inactive' || m.status === 'frozen' || m.inactivityDays >= 3);
    const data = inactive.map(m => ({
      'Member #': m.memberNumber,
      Name: m.name,
      Username: `@${m.username}`,
      Status: m.status,
      'Inactivity Days': m.inactivityDays,
      'Warning Count': m.warningCount,
      'Facebook URL': m.facebookUrl
    }));
    exportToCSV('Inactive_Frozen_Members', data);
  };

  const handleExportRevenue = () => {
    const data = [
      ...(sponsors || []).map(s => ({
        Type: 'Direct Sponsor',
        Partner: s.sponsorName,
        Amount: s.pricePaid,
        Currency: 'BDT',
        Status: s.status,
        Date: (s as any).createdAt || s.startDate
      })),
      ...(revenueLogs || []).map(l => ({
        Type: l.source,
        Partner: (l as any).notes || (l as any).note || (l as any).sponsorOrNetworkName,
        Amount: l.amount,
        Currency: l.currency,
        Status: 'Received',
        Date: l.date
      }))
    ];
    exportToCSV('Revenue_Ledger_Report', data);
  };

  const handleExportAuditLogs = () => {
    const data = auditLogs.map(l => ({
      Timestamp: l.timestamp,
      'Admin Name': l.adminName,
      Action: l.action,
      Details: l.details
    }));
    exportToCSV('Administrative_Audit_Logs', data);
  };

  const exportCards = [
    {
      title: 'Full Members Directory',
      desc: 'Export all 2,000+ members with status, links, points, streak, and profile URLs.',
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
      action: handleExportMembers,
      count: `${members.length} records`
    },
    {
      title: "Today's Link Exchange Feed",
      desc: 'All active submissions for today with supporter count and timestamps.',
      icon: Flame,
      color: 'text-orange-500',
      action: handleExportTodayLinks,
      count: `${dailyLinks.length} submitted links`
    },
    {
      title: `Week #${currentWeek} Leaderboard`,
      desc: 'Complete point rankings and streak metrics for the active championship cycle.',
      icon: Trophy,
      color: 'text-amber-500',
      action: handleExportLeaderboard,
      count: `${members.length} rankings`
    },
    {
      title: 'Inactive & Frozen Members',
      desc: 'Isolated member list for Messenger follow-up and unfreeze audits.',
      icon: Snowflake,
      color: 'text-blue-500',
      action: handleExportInactive,
      count: `${members.filter(m => m.status === 'inactive' || m.status === 'frozen').length} flagged`
    },
    {
      title: 'Revenue & Financial Ledger',
      desc: 'Direct sponsor earnings, Google AdSense estimates, and cash logs.',
      icon: DollarSign,
      color: 'text-emerald-500',
      action: handleExportRevenue,
      count: `${sponsors.length + revenueLogs.length} transactions`
    },
    {
      title: 'Administrative Audit History',
      desc: 'Immutable logs of member edits, status freezes, and notice broadcasts.',
      icon: FileText,
      color: 'text-purple-500',
      action: handleExportAuditLogs,
      count: `${auditLogs.length} actions logged`
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
          <Download className="w-6 h-6 text-indigo-400" />
          Data Export Center (CSV)
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          One-click universal data export for backup, Excel auditing, or community announcements.
        </p>
      </div>

      {/* Grid of Export Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportCards.map((card, idx) => {
          const Icon = card.icon;

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs flex flex-col justify-between space-y-4 hover:border-gray-700 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-[#0E0E10] border border-[#1E1E20] ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-gray-400 bg-[#0E0E10] border border-[#1E1E20] px-2 py-0.5 rounded-lg">
                    {card.count}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <button
                onClick={card.action}
                className="w-full py-2.5 px-4 bg-[#0E0E10] hover:bg-[#1E1E20] text-gray-300 hover:text-white border border-[#1E1E20] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV File</span>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
