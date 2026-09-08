import React, { useState } from 'react';
import { 
  Gavel, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Play, 
  Settings, 
  RefreshCw, 
  UserX, 
  UserCheck, 
  PhoneCall, 
  Plus, 
  Trash2, 
  Download, 
  ExternalLink,
  Search,
  Filter,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminSupportLink, LatePenaltyRecord, Member } from '../../types';

export const PunishmentManagement: React.FC = () => {
  const {
    members,
    latePenalties,
    adminSupportLinks,
    settings,
    updateSettings,
    toggleMemberLinkSubmitPermission,
    adminReactivateMember,
    adminWaivePenalty,
    runAutoAdminPunishmentCheck,
    addOrUpdateAdminSupportLink,
    deleteAdminSupportLink,
    deletePenaltyRecord,
    currentUser
  } = useApp();

  // Tabs within Punishment Management
  const [activeTab, setActiveTab] = useState<'logs' | 'permissions' | 'support_links' | 'settings'>('logs');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [memberSearch, setMemberSearch] = useState<string>('');

  // Revoke modal state
  const [revokeModalMember, setRevokeModalMember] = useState<Member | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>('');

  // Add/Edit Admin Support Link Modal state
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [supportFormData, setSupportFormData] = useState<Partial<AdminSupportLink>>({
    platformName: 'Facebook Messenger',
    supportUrl: '',
    displayLabel: '',
    notes: '',
    isActive: true
  });

  // Settings local state
  const [configSettings, setConfigSettings] = useState({
    punishmentEnabled: settings.punishmentEnabled !== false,
    allDoneDeadlineTime: settings.allDoneDeadlineTime || '00:00',
    lateRecoveryEndTime: settings.lateRecoveryEndTime || '10:00',
    lateRecoveryDurationHours: settings.lateRecoveryDurationHours || 10,
    adsPerLateHour: settings.adsPerLateHour || 1,
    maxPenaltyAdsCap: settings.maxPenaltyAdsCap || 5,
    adNetworkType: settings.adNetworkType || 'rewarded_simulator'
  });

  // Simulator status message
  const [simulatorFeedback, setSimulatorFeedback] = useState<string | null>(null);

  // Metrics
  const tempRemovedCount = members.filter(m => m.status === 'temp_removed').length;
  const suspendedCount = members.filter(m => m.status === 'suspended').length;
  const revokedPermissionCount = members.filter(m => m.canSubmitLink === false).length;
  const reactivatedCount = latePenalties.filter(p => p.status === 'reactivated' || p.status === 'admin_waived').length;

  // Filtered penalties
  const filteredPenalties = latePenalties.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.memberName.toLowerCase().includes(q) || p.memberUsername.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered members for permissions
  const filteredMembers = members.filter(m => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.username.toLowerCase().includes(q) || m.memberNumber.toString().includes(q);
  });

  // Handle Save Settings
  const handleSaveSettings = () => {
    updateSettings(configSettings);
    setSimulatorFeedback('✓ অটো-এডমিন ও পানিশমেন্ট সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!');
    setTimeout(() => setSimulatorFeedback(null), 3500);
  };

  // Handle Run Check Now
  const handleRunScan = (options?: { forceMidnightCheck?: boolean; forceCutoffCheck?: boolean }) => {
    const res = runAutoAdminPunishmentCheck(options);
    setSimulatorFeedback(`✓ ${res.message}`);
    setTimeout(() => setSimulatorFeedback(null), 4500);
  };

  // Handle Revoke Link Submission
  const handleConfirmRevoke = () => {
    if (!revokeModalMember) return;
    toggleMemberLinkSubmitPermission(revokeModalMember.id, false, revokeReason.trim() || 'প্রশাসনিক নির্দেশনা ও প্ল্যাটফর্ম রুলস ভঙ্গের কারণে');
    setRevokeModalMember(null);
    setRevokeReason('');
  };

  // Handle Support Form Save
  const handleSaveSupportLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportFormData.supportUrl) return;

    addOrUpdateAdminSupportLink({
      ...supportFormData,
      adminId: currentUser?.id || 'admin',
      adminName: currentUser?.name || 'Admin',
      adminUsername: currentUser?.username || 'admin',
      adminAvatar: currentUser?.avatar,
      adminRole: currentUser?.role || 'admin'
    });

    setShowSupportModal(false);
    setSupportFormData({
      platformName: 'Facebook Messenger',
      supportUrl: '',
      displayLabel: '',
      notes: '',
      isActive: true
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Record ID', 'Member ID', 'Member Name', 'Username', 'Date', 'Deadline', 'Hours Late', 'Duration', 'Required Ads', 'Watched Ads', 'Status', 'Completed At', 'Notes'];
    const rows = latePenalties.map(p => [
      p.id,
      p.memberId,
      p.memberName,
      p.memberUsername,
      p.date,
      p.deadlineTime,
      p.hoursLate,
      `"${p.lateDurationFormatted || ''}"`,
      p.requiredAds,
      p.adsWatched,
      p.status,
      p.completedAt || '',
      `"${p.adminNotes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `punishment_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 shadow-sm">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              Punishment & Auto-Admin System
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              ১২:০০ AM All Done ডেডলাইন, লেট রিমুভ, স্কেলিং ভিডিও অ্যাডস এবং ১০:০০ AM অটো-সাসপেন্ড ম্যানেজমেন্ট
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunScan()}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
            title="বর্তমান সময়ে অটো-এডমিন স্ক্যান রান করুন"
          >
            <RefreshCw className="w-4 h-4" />
            <span>স্ক্যান চালান (Scan Now)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>CSV এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Simulator Feedback Notification Banner */}
      {simulatorFeedback && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm font-medium flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{simulatorFeedback}</span>
          </div>
          <button onClick={() => setSimulatorFeedback(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#141416] border border-amber-500/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">সাময়িক রিমুভ (Temp Removed)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{tempRemovedCount}</p>
          <p className="text-[11px] text-gray-400">১২:০০ AM পার হওয়ার পর পেন্ডিং সাপোর্ট</p>
        </div>

        <div className="p-4 rounded-xl bg-[#141416] border border-red-500/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-400">সাসপেন্ডেড মেম্বার (Suspended)</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white">{suspendedCount}</p>
          <p className="text-[11px] text-gray-400">১০:০০ AM কাটঅফ উইন্ডো অতিক্রমকারী</p>
        </div>

        <div className="p-4 rounded-xl bg-[#141416] border border-purple-500/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-400">লিংক সাবমিশন স্থগিত</span>
            <UserX className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{revokedPermissionCount}</p>
          <p className="text-[11px] text-gray-400">ম্যানুয়ালি পারমিশন ব্লকড মেম্বার</p>
        </div>

        <div className="p-4 rounded-xl bg-[#141416] border border-emerald-500/30 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">অটো ও অ্যাডমিন রিকভারি</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{reactivatedCount}</p>
          <p className="text-[11px] text-gray-400">বিজ্ঞাপন দেখে বা অনুমোদনে সক্রিয়</p>
        </div>
      </div>

      {/* Simulator & Quick Test Sandbox Box */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-800/80 border border-gray-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-bold uppercase tracking-wider">
              Admin Simulator & Diagnostics
            </span>
            <span className="text-xs text-gray-400">অটো-এডমিনের রিয়েলটাইম আচরণ পরীক্ষা করুন</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            রাত ১২:০০ টা বা পরদিন সকাল ১০:০০ টা পর্যন্ত অপেক্ষা না করেই নিচের টেস্ট সিমুলেটর দিয়ে যেকোনো মুহূর্তে ট্রানজিশন পরীক্ষা করা যাবে।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => handleRunScan({ forceMidnightCheck: true })}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all"
            title="সিমুলেট: রাত ১২:০০ টার চেক (যাদের সাপোর্ট বাকি আছে তারা সাময়িক রিমুভ হবে)"
          >
            🧪 Test 12:00 AM Scan
          </button>
          <button
            onClick={() => handleRunScan({ forceCutoffCheck: true })}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-semibold transition-all"
            title="সিমুলেট: সকাল ১০:০০ টার কাটঅফ চেক (সাময়িক রিমুভ মেম্বাররা সাসপেন্ড হবে)"
          >
            🧪 Test 10:00 AM Cutoff
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'logs'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          📋 পানিশমেন্ট অডিট লগ ({latePenalties.length})
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'permissions'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          🔒 লিংক সাবমিশন পারমিশন ({revokedPermissionCount} স্থগিত)
        </button>
        <button
          onClick={() => setActiveTab('support_links')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'support_links'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          📞 অ্যাডমিন সাপোর্ট আইডি বক্স ({adminSupportLinks.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'settings'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
        >
          ⚙️ রুলস ও কনফিগারেশন
        </button>
      </div>

      {/* Tab 1: Punishment Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="মেম্বারের নাম বা ইউজারনেম খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> ফিল্টার:
              </span>
              {['all', 'temp_removed', 'suspended', 'reactivated', 'admin_waived'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    statusFilter === st 
                      ? 'bg-gray-700 text-white font-bold' 
                      : 'bg-gray-900 text-gray-400 hover:text-gray-200 border border-gray-800'
                  }`}
                >
                  {st === 'all' ? 'সব' : st === 'temp_removed' ? 'সাময়িক রিমুভ' : st === 'suspended' ? 'সাসপেন্ড' : st === 'reactivated' ? 'স্বয়ংক্রিয় রি-অ্যাক্টিভ' : 'অ্যাডমিন মওকুফ'}
                </button>
              ))}
            </div>
          </div>

          {/* Logs Table */}
          <div className="rounded-xl border border-gray-800 bg-[#121214] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-900/80 text-gray-400 border-b border-gray-800 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">মেম্বার</th>
                    <th className="py-3 px-3">তারিখ ও সময়</th>
                    <th className="py-3 px-3">বিলম্বের পরিমাণ</th>
                    <th className="py-3 px-3 text-center">নির্ধারিত Ads</th>
                    <th className="py-3 px-3">স্ট্যাটাস</th>
                    <th className="py-3 px-3">মন্তব্য / সমাধান</th>
                    <th className="py-3 px-4 text-right">একশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredPenalties.length > 0 ? (
                    filteredPenalties.map(record => (
                      <tr key={record.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={record.memberAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={record.memberName}
                              className="w-8 h-8 rounded-full object-cover border border-gray-700"
                            />
                            <div>
                              <p className="font-semibold text-white">{record.memberName}</p>
                              <p className="text-[10px] text-gray-400">@{record.memberUsername}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <p className="font-medium text-gray-200">{record.date}</p>
                          <p className="text-[10px] text-gray-400">ডেডলাইন: {record.deadlineTime}</p>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-semibold text-amber-400">
                            {record.lateDurationFormatted || `${record.hoursLate} ঘণ্টা`}
                          </span>
                          {record.completedAt && (
                            <p className="text-[10px] text-gray-400">অল ডান: {record.completedAt}</p>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700 font-mono text-[11px] font-bold text-gray-200">
                            {record.adsWatched} / {record.requiredAds}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {record.status === 'temp_removed' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                              TEMP REMOVED
                            </span>
                          )}
                          {record.status === 'suspended' && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold">
                              SUSPENDED
                            </span>
                          )}
                          {record.status === 'reactivated' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                              ✓ REACTIVATED
                            </span>
                          )}
                          {record.status === 'admin_waived' && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold">
                              ADMIN WAIVED
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-xs text-gray-400 max-w-xs truncate">
                          {record.adminNotes || 'অটো-এডমিন পলিসি'}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {(record.status === 'temp_removed' || record.status === 'suspended') && (
                              <button
                                onClick={() => adminWaivePenalty(record.id, 'অ্যাডমিন কর্তৃক ম্যানুয়ালি পেনাল্টি মওকুফ')}
                                className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold transition-colors"
                                title="তাৎক্ষণিক অ্যাকাউন্ট সচল করুন"
                              >
                                সচল করুন
                              </button>
                            )}
                            <button
                              onClick={() => deletePenaltyRecord(record.id)}
                              className="p-1.5 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                              title="রেকর্ড মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-gray-500">
                        কোনো পানিশমেন্ট লগ রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Link Submission Permissions */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">মেম্বার লিংক সাবমিশন পারমিশন কন্ট্রোল</h3>
              <p className="text-xs text-gray-400">
                এডমিন চাইলে যেকোনো সদস্যের লিংক সাবমিট করার ক্ষমতা সাময়িকভাবে স্থগিত বা পুনর্বহাল করতে পারেন।
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="সদস্য সার্চ করুন..."
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-800 bg-[#121214] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-gray-900/80 text-gray-400 border-b border-gray-800 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">মেম্বার</th>
                    <th className="py-3 px-3">রোল ও স্ট্যাটাস</th>
                    <th className="py-3 px-3">লিংক সাবমিশন অনুমতি</th>
                    <th className="py-3 px-3">স্থগিতের কারণ</th>
                    <th className="py-3 px-4 text-right">একশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredMembers.map(member => {
                    const isAllowed = member.canSubmitLink !== false;
                    return (
                      <tr key={member.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover border border-gray-700"
                            />
                            <div>
                              <p className="font-semibold text-white">{member.name}</p>
                              <p className="text-[10px] text-gray-400">#{member.memberNumber} • @{member.username}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="capitalize px-2 py-0.5 bg-gray-800 rounded text-[10px] font-medium text-gray-300">
                            {member.role} ({member.status})
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {isAllowed ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" /> উন্মুক্ত (Allowed)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-xs">
                              <UserX className="w-3.5 h-3.5" /> স্থগিত (Revoked)
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-xs text-gray-400 max-w-xs truncate">
                          {member.canSubmitLinkRevokeReason || '—'}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {isAllowed ? (
                            <button
                              onClick={() => {
                                setRevokeModalMember(member);
                                setRevokeReason('');
                              }}
                              className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors"
                            >
                              ক্ষমতা কেরে নিন (Revoke)
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleMemberLinkSubmitPermission(member.id, true)}
                              className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                            >
                              অনুমতি ফিরিয়ে দিন (Restore)
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Admin Support IDs Directory */}
      {activeTab === 'support_links' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">অ্যাডমিন সাপোর্ট আইডি ও কন্টাক্ট ডিরেক্টরি</h3>
              <p className="text-xs text-gray-400">
                সাসপেন্ড হওয়া মেম্বাররা এই আইডিগুলোর মাধ্যমে যোগাযোগ করে অ্যাকাউন্ট রি-অ্যাপ্রুভাল আবেদন করবে।
              </p>
            </div>
            <button
              onClick={() => setShowSupportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সাপোর্ট আইডি যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminSupportLinks.map(admin => (
              <div 
                key={admin.id}
                className="p-4 rounded-xl bg-[#141416] border border-gray-800 hover:border-gray-700 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={admin.adminAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={admin.adminName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-700"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{admin.adminName}</h4>
                      <p className="text-xs text-blue-400 font-medium">{admin.platformName}</p>
                      <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{admin.displayLabel}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAdminSupportLink(admin.id)}
                    className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {admin.notes && (
                  <p className="text-xs text-gray-400 bg-gray-900/60 p-2 rounded-lg border border-gray-800/80">
                    {admin.notes}
                  </p>
                )}

                <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    admin.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-800 text-gray-500'
                  }`}>
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </span>

                  <a
                    href={admin.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <span>লিংক টেস্ট করুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Rules & System Configuration */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-[#141416] border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              অটো-এডমিন পানিশমেন্ট কনফিগারেশন
            </h3>
            <p className="text-xs text-gray-400">
              ১২:০০ AM All Done নিয়ম, লেট রিকভারি উইন্ডো ও স্কেলিং ভিডিও বিজ্ঞাপনের প্যারামিটার
            </p>
          </div>

          <div className="space-y-4 text-xs text-gray-200">
            {/* Engine Master Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900 border border-gray-800">
              <div>
                <p className="font-bold text-sm text-white">অটো-এডমিন পানিশমেন্ট সিস্টেম সক্রিয় রাখুন</p>
                <p className="text-gray-400 text-xs">বন্ধ থাকলে রাত ১২:০০ টার পর কাউকে সাময়িক রিমুভ করা হবে না</p>
              </div>
              <input
                type="checkbox"
                checked={configSettings.punishmentEnabled}
                onChange={e => setConfigSettings({ ...configSettings, punishmentEnabled: e.target.checked })}
                className="w-5 h-5 accent-red-500 rounded cursor-pointer"
              />
            </div>

            {/* Midnight All Done Deadline */}
            <div className="space-y-1.5">
              <label className="font-semibold text-gray-300 block">
                All Done ডেডলাইন সময় (BST Asia/Dhaka):
              </label>
              <input
                type="text"
                value={configSettings.allDoneDeadlineTime}
                onChange={e => setConfigSettings({ ...configSettings, allDoneDeadlineTime: e.target.value })}
                placeholder="00:00 (রাত ১২:০০ AM)"
                className="w-full p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white focus:border-red-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-500">ডিফল্ট: রাত ১২:০০ টা (00:00 BST)। এই সময়ের মধ্যে All Done না করলে সাপোর্ট পেন্ডিং থাকবে ও সাময়িক রিমুভ হবে।</p>
            </div>

            {/* Late Recovery Duration / Cutoff */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300 block">
                  রিকভারি উইন্ডো শেষ হওয়ার সময়:
                </label>
                <input
                  type="text"
                  value={configSettings.lateRecoveryEndTime}
                  onChange={e => setConfigSettings({ ...configSettings, lateRecoveryEndTime: e.target.value })}
                  placeholder="10:00"
                  className="w-full p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white focus:border-red-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-500">পরদিন সকাল ১০:০০ টা (10:00 BST)</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300 block">
                  রিকভারি সময়সীমা (ঘণ্টা):
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={configSettings.lateRecoveryDurationHours}
                  onChange={e => setConfigSettings({ ...configSettings, lateRecoveryDurationHours: parseInt(e.target.value, 10) || 10 })}
                  className="w-full p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white focus:border-red-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-500">ডিফল্ট: ১০ ঘণ্টা (১২:০০ AM থেকে ১০:০০ AM)</p>
              </div>
            </div>

            {/* Scaling Ads Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300 block">
                  প্রতি বিলম্বে ঘণ্টা প্রতি Ad সংখ্যা:
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={configSettings.adsPerLateHour}
                  onChange={e => setConfigSettings({ ...configSettings, adsPerLateHour: parseInt(e.target.value, 10) || 1 })}
                  className="w-full p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white focus:border-red-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-500">+1 Ad per hour late (e.g. 1st hr = 1 ad, 2nd hr = 2 ads)</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-300 block">
                  সর্বোচ্চ Ad সংখ্যা লিমিট (Ad-Fatigue Cap):
                </label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={configSettings.maxPenaltyAdsCap}
                  onChange={e => setConfigSettings({ ...configSettings, maxPenaltyAdsCap: parseInt(e.target.value, 10) || 5 })}
                  className="w-full p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white focus:border-red-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-500">মেম্বারদের বিরক্তি এড়াতে সর্বোচ্চ ৫ বা ১০ টির বেশি Ad দেওয়া হবে না।</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
          >
            সেটিংস সংরক্ষণ করুন (Save Configuration)
          </button>
        </div>
      )}

      {/* Revoke Permission Modal */}
      {revokeModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#161618] border border-red-500/40 rounded-2xl p-6 space-y-4 text-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">লিংক সাবমিশন স্থগিত করুন</h4>
                <p className="text-xs text-gray-400">মেম্বার: {revokeModalMember.name}</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              আপনি কি নিশ্চিত যে <strong>{revokeModalMember.name}</strong> (@{revokeModalMember.username}) এর লিংক সাবমিট করার ক্ষমতা সাময়িকভাবে বন্ধ করতে চান?
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">স্থগিত করার কারণ (মেম্বার দেখতে পাবেন):</label>
              <textarea
                rows={3}
                value={revokeReason}
                onChange={e => setRevokeReason(e.target.value)}
                placeholder="যেমন: ৩ বার ফেক সাপোর্ট রিপোর্ট পাওয়া গেছে / নিয়ম লঙ্ঘন..."
                className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRevokeModalMember(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow transition-colors"
              >
                হ্যাঁ, স্থগিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Support Link Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleSaveSupportLink} className="w-full max-w-md bg-[#161618] border border-blue-500/40 rounded-2xl p-6 space-y-4 text-gray-200">
            <h4 className="font-bold text-base text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-blue-400" />
              নতুন অ্যাডমিন সাপোর্ট আইডি যোগ করুন
            </h4>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-300">প্ল্যাটফর্মের নাম:</label>
                <select
                  value={supportFormData.platformName}
                  onChange={e => setSupportFormData({ ...supportFormData, platformName: e.target.value })}
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Facebook Profile">Facebook Profile</option>
                  <option value="Facebook Messenger">Facebook Messenger</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Email Support">Email Support</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-300">কন্টাক্ট / প্রোফাইল লিংক (URL):</label>
                <input
                  type="url"
                  required
                  placeholder="https://facebook.com/... or https://wa.me/..."
                  value={supportFormData.supportUrl}
                  onChange={e => setSupportFormData({ ...supportFormData, supportUrl: e.target.value })}
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-300">ডিসপ্লে লেবেল / শিরোনাম:</label>
                <input
                  type="text"
                  placeholder="যেমন: মুরাদ সিহাব (Super Admin Support)"
                  value={supportFormData.displayLabel}
                  onChange={e => setSupportFormData({ ...supportFormData, displayLabel: e.target.value })}
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-300">হেল্পডেস্ক নোট / সময়সীমা:</label>
                <input
                  type="text"
                  placeholder="যেমন: সকাল ১০টা - রাত ১০টা পর্যন্ত সক্রিয়"
                  value={supportFormData.notes}
                  onChange={e => setSupportFormData({ ...supportFormData, notes: e.target.value })}
                  className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-colors"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
