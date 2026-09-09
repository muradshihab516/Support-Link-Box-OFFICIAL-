import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Download, 
  Users, 
  Flame, 
  Trophy, 
  Snowflake, 
  DollarSign, 
  FileText,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  FileCode
} from 'lucide-react';
import { exportToCSV } from '../../utils/helpers';

export const ExportCenter: React.FC = () => {
  const { 
    members, 
    dailyLinks, 
    sponsors, 
    revenueLogs, 
    auditLogs, 
    currentWeek, 
    exportDataToGoogleSheetsArchive, 
    pointsHistory,
    exportGapCheckerMemberList 
  } = useApp();

  const [copiedTxt, setCopiedTxt] = useState(false);

  const handleExportGoogleSheetsArchive = () => {
    exportDataToGoogleSheetsArchive({ format: 'csv' });
  };

  const handleExportGapCheckerTxt = () => {
    exportGapCheckerMemberList('txt');
  };

  const handleExportGapCheckerCsv = () => {
    exportGapCheckerMemberList('csv');
  };

  const handleCopyGapCheckerList = () => {
    const activeNames = members
      .filter(m => m.status === 'active')
      .map(m => (m.facebookName || m.name).trim())
      .filter(Boolean);
    navigator.clipboard.writeText(activeNames.join('\n'));
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2000);
  };

  const handleExportMembers = () => {
    const data = members.map(m => ({
      'Member #': m.memberNumber,
      Name: m.name,
      'Facebook Name': m.facebookName || m.name,
      'Normalized Name': m.normalizedName || '',
      'Normalized FB ID': m.normalizedFbId || '',
      'Name Locked': m.nameLocked ? 'YES' : 'NO',
      'Name Mismatch': m.nameMismatchFlag ? 'YES' : 'NO',
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
      'Facebook Name': m.facebookName || m.name,
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
      'Facebook Name': m.facebookName || m.name,
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

  const activeMembersCount = members.filter(m => m.status === 'active').length;

  const exportCards = [
    {
      title: 'Google Sheets Storage Archive (.CSV)',
      desc: 'Complete storage-safe archive (Daily Links, Points History, Ad Rollups & Member snapshots) for Google Sheets / Excel.',
      icon: FileSpreadsheet,
      color: 'text-emerald-400',
      action: handleExportGoogleSheetsArchive,
      count: `${dailyLinks.length + pointsHistory.length} combined records`
    },
    {
      title: 'Full Members Directory',
      desc: 'Export all 2,000+ members with status, Facebook Identity, links, points, streak, and profile URLs.',
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
          Data Export Center & GapChecker Tools
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          One-click universal data export for GapChecker verification, Excel auditing, and community backups.
        </p>
      </div>

      {/* FEATURED: GAPCHECKER MEMBER DIRECTORY EXPORT */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-[#131315] to-[#131315] border-2 border-indigo-500/30 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-500 text-white font-bold text-[11px] rounded-full uppercase tracking-wider">
                Official Integration
              </span>
              <span className="text-xs font-mono text-indigo-300 font-semibold">
                {activeMembersCount} Active Members Ready
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              GapChecker Pro — Member Names Export
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              সাপ্তাহিক ও দৈনিক পোস্টের ফেসবুক কমেন্ট ভেরিফিকেশনের জন্য GapChecker-এ ব্যবহারের উপযুক্ত ফরম্যাটে সকল সক্রিয় সদস্যের ফেসবুক নামের তালিকা এক্সপোর্ট করুন। প্রতি লাইনে ১টি করে নাম থাকবে যা সরাসরি GapChecker ইনপুটে পেস্ট করা যাবে।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopyGapCheckerList}
              className="px-4 py-2.5 bg-[#0E0E10] hover:bg-[#1E1E20] border border-[#1E1E20] text-gray-200 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              {copiedTxt ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-indigo-400" />
                  <span>Copy Names ({activeMembersCount})</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportGapCheckerTxt}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <FileCode className="w-4 h-4" />
              <span>Export .TXT (One Per Line)</span>
            </button>

            <button
              onClick={handleExportGapCheckerCsv}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export .CSV (Full)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Standard Export Modules */}
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
