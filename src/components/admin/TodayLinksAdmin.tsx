import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Flame, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Trash2, 
  ShieldCheck, 
  Eye, 
  AlertTriangle,
  Download,
  PlusCircle,
  Image as ImageIcon,
  Video,
  Crown,
  Bell,
  UserCheck,
  Tag,
  Edit3,
  Layers,
  Calendar,
  Clock,
  Zap,
  X,
  Plus,
  AlertCircle
} from 'lucide-react';
import { exportToCSV } from '../../utils/helpers';
import { LinkSubmissionModal } from '../member/LinkSubmissionModal';
import { LinkEditModal } from '../member/LinkEditModal';
import { LinkCategoryType, DailyLink, ScheduledLink } from '../../types';

export const TodayLinksAdmin: React.FC = () => {
  const { 
    dailyLinks, 
    supportRecords, 
    members, 
    removeDailyLink,
    scheduledLinks,
    forceSubmitScheduledLink,
    cancelScheduledLink,
    deleteScheduledLink,
    editScheduledLink
  } = useApp();

  // Top view tab: Live vs Scheduled
  const [adminViewTab, setAdminViewTab] = useState<'live' | 'scheduled'>('live');

  // Live links filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'member' | 'admin' | 'vip' | 'notice' | 'proxy'>('all');
  const [partFilter, setPartFilter] = useState<'all' | number>('all');
  const [selectedLinkAudit, setSelectedLinkAudit] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitModalTab, setSubmitModalTab] = useState<'instant' | 'schedule'>('instant');
  const [editingLink, setEditingLink] = useState<DailyLink | null>(null);

  // Scheduled links filters & state
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<'all' | 'scheduled' | 'submitted' | 'cancelled'>('all');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleFeedback, setScheduleFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ScheduledLink | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editInstruction, setEditInstruction] = useState('');
  const [editError, setEditError] = useState('');

  // Dynamic available parts (20 links per part)
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

  const filteredLinks = dailyLinks.filter(l => {
    // Search match
    const matchesSearch = 
      l.memberName.toLowerCase().includes(search.toLowerCase()) ||
      l.memberUsername.toLowerCase().includes(search.toLowerCase()) ||
      (l.caption && l.caption.toLowerCase().includes(search.toLowerCase())) ||
      (l.instruction && l.instruction.toLowerCase().includes(search.toLowerCase())) ||
      l.linkNumber.toString().includes(search);

    if (!matchesSearch) return false;

    // Part filter
    if (partFilter !== 'all') {
      const p = l.partNumber || Math.max(1, Math.ceil((l.linkNumber || 1) / 20));
      if (p !== partFilter) return false;
    }

    // Category filter
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'proxy') return l.isSubmittedByAdmin === true;
    if (categoryFilter === 'member') return !l.category || l.category === 'member';
    if (categoryFilter === 'admin') return l.category === 'admin';
    if (categoryFilter === 'vip') return l.category === 'vip';
    if (categoryFilter === 'notice') return l.category === 'notice';

    return true;
  });

  const auditLink = dailyLinks.find(l => l.id === selectedLinkAudit);
  const supportersForLink = auditLink 
    ? supportRecords.filter(r => r.dailyLinkId === auditLink.id)
    : [];

  const handleExportToday = () => {
    const data = dailyLinks.map(l => ({
      'Link #': l.linkNumber,
      Member: l.memberName,
      Username: `@${l.memberUsername}`,
      Category: l.category || 'member',
      'Post Type': l.postType || 'photo',
      'Post URL': l.postUrl,
      Caption: l.caption || 'N/A',
      Instruction: l.instruction || 'N/A',
      'Submitted By': l.isSubmittedByAdmin ? `Admin (${l.submittedByAdminName || 'Admin'})` : 'Self (Member)',
      'Supports Received': l.supportCount,
      'Submitted At': l.submittedAt
    }));
    exportToCSV('Today_Links_Support_Report', data);
  };

  // Filtered scheduled links
  const filteredScheduledLinks = scheduledLinks.filter(s => {
    const matchesSearch = 
      s.memberName.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
      s.memberUsername.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
      s.postUrl.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
      (s.caption && s.caption.toLowerCase().includes(scheduleSearch.toLowerCase()));
    if (!matchesSearch) return false;

    if (scheduleStatusFilter !== 'all' && s.status !== scheduleStatusFilter) {
      return false;
    }
    return true;
  });

  const scheduledPendingCount = scheduledLinks.filter(s => s.status === 'scheduled').length;
  const scheduledSubmittedCount = scheduledLinks.filter(s => s.status === 'submitted').length;
  const scheduledCancelledCount = scheduledLinks.filter(s => s.status === 'cancelled').length;

  const handleForceReleaseSchedule = (id: string) => {
    if (window.confirm('অ্যাডমিন অ্যাকশন: আপনি কি এখনই এই শিডিউল লিংকটি দৈনিক লিংকে রিলিজ করতে চান? এর ফলে অবিলম্বে একটি সিরিয়াল নাম্বার বরাদ্দ হবে।')) {
      const res = forceSubmitScheduledLink(id);
      setScheduleFeedback({ type: res.success ? 'success' : 'error', message: res.message });
      setTimeout(() => setScheduleFeedback(null), 3500);
    }
  };

  const handleCancelSchedule = (id: string) => {
    if (window.confirm('আপনি কি এই শিডিউল বুকিংটি বাতিল করতে চান?')) {
      const res = cancelScheduledLink(id);
      setScheduleFeedback({ type: res.success ? 'success' : 'error', message: res.message });
      setTimeout(() => setScheduleFeedback(null), 3500);
    }
  };

  const handleDeleteSchedule = (id: string) => {
    if (window.confirm('আপনি কি এই শিডিউল রেকর্ডটি ডাটাবেজ থেকে মুছে ফেলতে চান?')) {
      const res = deleteScheduledLink(id);
      setScheduleFeedback({ type: res.success ? 'success' : 'error', message: res.message });
      setTimeout(() => setScheduleFeedback(null), 3500);
    }
  };

  const handleStartEditSchedule = (item: ScheduledLink) => {
    setEditingScheduleItem(item);
    setEditUrl(item.postUrl);
    setEditDate(item.scheduledForDate);
    setEditTime(item.scheduledForTime);
    setEditCaption(item.caption || '');
    setEditInstruction(item.instruction || '');
    setEditError('');
  };

  const handleSaveEditSchedule = () => {
    if (!editingScheduleItem) return;
    if (!editUrl.trim()) {
      setEditError('ফেসবুক লিংক দেওয়া আবশ্যক');
      return;
    }
    const res = editScheduledLink(editingScheduleItem.id, {
      postUrl: editUrl.trim(),
      scheduledForDate: editDate,
      scheduledForTime: editTime,
      caption: editCaption,
      instruction: editInstruction
    });
    if (res.success) {
      setScheduleFeedback({ type: 'success', message: res.message });
      setEditingScheduleItem(null);
      setTimeout(() => setScheduleFeedback(null), 3000);
    } else {
      setEditError(res.message);
    }
  };

  const handleExportScheduled = () => {
    const data = scheduledLinks.map(s => ({
      ID: s.id,
      Member: s.memberName,
      Username: `@${s.memberUsername}`,
      'Scheduled Date': s.scheduledForDate,
      'Scheduled Time': s.scheduledForTime,
      Status: s.status,
      'Assigned Link #': s.assignedLinkNumber || 'N/A',
      'Post URL': s.postUrl,
      'Post Type': s.postType || 'photo',
      Caption: s.caption || '',
      Instruction: s.instruction || '',
      'Cancellation Reason': s.cancellationReason || '',
      'Scheduled By Admin': s.isScheduledByAdmin ? 'Yes' : 'No',
      'Created At': s.createdAt
    }));
    exportToCSV('Scheduled_Links_Report', data);
  };

  const getRemainingTimeText = (timestamp: number, status: string) => {
    if (status === 'submitted') return '✅ লাইভ সম্পন্ন';
    if (status === 'cancelled') return '❌ বাতিল';
    if (status === 'failed') return '⚠️ ব্যর্থ';

    const now = Date.now();
    const diff = timestamp - now;
    if (diff <= 0) return '⏳ প্রসেসিং...';

    const totalMinutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `⏳ আর ${days} দিন ${hours % 24} ঘণ্টা`;
    }
    if (hours > 0) {
      return `⏳ আর ${hours} ঘণ্টা ${mins} মিনিট`;
    }
    return `⏳ আর ${mins} মিনিট`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            {adminViewTab === 'live' ? (
              <>
                <Flame className="w-6 h-6 text-orange-400" />
                <span>Today's Link Submissions & Support Matrix</span>
              </>
            ) : (
              <>
                <Calendar className="w-6 h-6 text-indigo-400" />
                <span>Scheduled Links Management & Auto-Release</span>
              </>
            )}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {adminViewTab === 'live' 
              ? `Live monitor for today's ${dailyLinks.length} submitted Facebook posts, post types, categories, and mutual support verification.`
              : `সার্ভার-সাইড শিডিউলার মনিটর: ${scheduledPendingCount} টি অপেক্ষমান লিংক নির্ধারিত সময়ে স্বয়ংক্রিয়ভাবে সিরিয়াল বরাদ্দ পেয়ে লাইভ হবে।`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {adminViewTab === 'live' ? (
            <>
              <button
                onClick={() => {
                  setSubmitModalTab('instant');
                  setShowSubmitModal(true);
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Submit Link (Admin / Proxy)</span>
              </button>

              <button
                onClick={handleExportToday}
                className="px-3.5 py-2 bg-[#131315] border border-[#1E1E20] text-gray-300 hover:text-white font-bold text-xs rounded-lg flex items-center gap-1.5 hover:bg-[#1E1E20] transition-colors"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setSubmitModalTab('schedule');
                  setShowSubmitModal(true);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ নতুন শিডিউল লিংক বুক করুন</span>
              </button>

              <button
                onClick={handleExportScheduled}
                className="px-3.5 py-2 bg-[#131315] border border-[#1E1E20] text-gray-300 hover:text-white font-bold text-xs rounded-lg flex items-center gap-1.5 hover:bg-[#1E1E20] transition-colors"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main View Tab Switcher: Live Submissions vs Scheduled Links */}
      <div className="flex rounded-xl bg-[#131315] p-1.5 border border-[#1E1E20] gap-2">
        <button
          onClick={() => setAdminViewTab('live')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            adminViewTab === 'live'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-400" />
          <span>আজকের লাইভ লিংক ({dailyLinks.length})</span>
        </button>
        <button
          onClick={() => setAdminViewTab('scheduled')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            adminViewTab === 'scheduled'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4 text-purple-300" />
          <span>শিডিউল লিংক বুকিং তালিকা ({scheduledPendingCount} অপেক্ষমান)</span>
        </button>
      </div>

      {/* Feedback banner */}
      {scheduleFeedback && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          scheduleFeedback.type === 'success' 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {scheduleFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{scheduleFeedback.message}</span>
        </div>
      )}

      {/* VIEW 1: LIVE SUBMISSIONS */}
      {adminViewTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Links Table */}
        <div className="lg:col-span-2 bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Submitted Links ({filteredLinks.length})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-56">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search link #, creator, caption..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:border-indigo-500 text-white placeholder-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Part Filter Pills (20 links per part) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <div className="flex items-center gap-1 text-gray-400 shrink-0 font-semibold mr-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>পার্ট:</span>
            </div>
            <button
              onClick={() => setPartFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                partFilter === 'all'
                  ? 'bg-cyan-600 text-white border-cyan-500'
                  : 'bg-[#0E0E10] text-gray-400 border-[#1E1E20] hover:text-white'
              }`}
            >
              সব পার্ট ({dailyLinks.length})
            </button>
            {availableParts.map(p => (
              <button
                key={p.partNumber}
                onClick={() => setPartFilter(p.partNumber)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                  partFilter === p.partNumber
                    ? 'bg-cyan-600 text-white border-cyan-500'
                    : 'bg-[#0E0E10] text-gray-400 border-[#1E1E20] hover:text-white'
                }`}
              >
                {p.label} ({p.count})
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All Links' },
              { id: 'member', label: 'Regular Members' },
              { id: 'proxy', label: '👤 Proxy by Admin' },
              { id: 'admin', label: '🛡️ Admin Links' },
              { id: 'vip', label: '👑 VIP Links' },
              { id: 'notice', label: '📢 Notice Links' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                  categoryFilter === tab.id
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-[#0E0E10] text-gray-400 border-[#1E1E20] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto border border-[#1E1E20] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E0E10] text-gray-400 font-semibold border-b border-[#1E1E20]">
                <tr>
                  <th className="py-2.5 px-3 w-14">Link #</th>
                  <th className="py-2.5 px-3">Member & Attribution</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-center">Supports</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1E20]">
                {filteredLinks.map(link => {
                  const isSelected = selectedLinkAudit === link.id;

                  return (
                    <tr 
                      key={link.id}
                      onClick={() => setSelectedLinkAudit(link.id)}
                      className={`cursor-pointer hover:bg-[#18181B] transition-colors ${
                        isSelected ? 'bg-indigo-600/10 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-indigo-400">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono font-bold">
                            Part {link.partNumber || Math.ceil(link.linkNumber / 20)}
                          </span>
                          <span>#{link.linkNumber}</span>
                          {link.category === 'vip' && <Crown className="w-3 h-3 text-amber-400" />}
                          {link.category === 'admin' && <ShieldCheck className="w-3 h-3 text-indigo-400" />}
                          {link.category === 'notice' && <Bell className="w-3 h-3 text-rose-400" />}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img src={link.memberAvatar} alt={link.memberName} className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-[#1E1E20]" />
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate flex items-center gap-1.5">
                              <span>{link.memberName}</span>
                              {link.category && link.category !== 'member' && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${
                                  link.category === 'vip' ? 'bg-amber-500/20 text-amber-300' :
                                  link.category === 'admin' ? 'bg-indigo-500/20 text-indigo-300' :
                                  'bg-rose-500/20 text-rose-300'
                                }`}>
                                  {link.category}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="text-gray-500">@{link.memberUsername}</span>
                              {link.isSubmittedByAdmin && (
                                <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                                  • 👤 Admin Proxy ({link.submittedByAdminName || 'Admin'})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                          link.postType === 'video'
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                        }`}>
                          {link.postType === 'video' ? (
                            <><Video className="w-3 h-3" /> Video</>
                          ) : (
                            <><ImageIcon className="w-3 h-3" /> Photo</>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-full font-mono text-[10px]">
                          {link.supportCount}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-gray-500 text-[11px]">
                        {link.submittedAt}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                          <a
                            href={link.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Facebook post"
                            className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-[#1E1E20] rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => setEditingLink(link)}
                            title="Edit link (Admin Override)"
                            className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-[#1E1E20] rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove link #${link.linkNumber} by ${link.memberName}?`)) {
                                removeDailyLink(link.id);
                              }
                            }}
                            title="Delete link"
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-[#1E1E20] rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Support Matrix & Audit Details */}
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Support Audit & Verification
          </h3>

          {auditLink ? (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#0E0E10] rounded-xl space-y-2.5 border border-[#1E1E20]">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-400 text-sm">Link #{auditLink.linkNumber}</span>
                  <span className="text-gray-500">{auditLink.submittedAt}</span>
                </div>

                <div className="font-bold text-white">{auditLink.memberName} (@{auditLink.memberUsername})</div>

                {/* Metadata badges */}
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    auditLink.postType === 'video'
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}>
                    {auditLink.postType === 'video' ? '🎬 Video' : '🖼️ Photo'}
                  </span>

                  <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-[10px] font-bold capitalize">
                    Category: {auditLink.category || 'Member'}
                  </span>

                  {auditLink.isSubmittedByAdmin && (
                    <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded text-[10px] font-bold">
                      👤 Proxy by Admin ({auditLink.submittedByAdminName})
                    </span>
                  )}
                </div>

                {auditLink.caption && (
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold">ক্যাপশন:</div>
                    <p className="text-gray-300 italic">"{auditLink.caption}"</p>
                  </div>
                )}

                {auditLink.instruction && (
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300">
                    <div className="text-[10px] text-indigo-400 font-bold">সাপোর্ট ইন্সট্রাকশন:</div>
                    <p className="text-xs">{auditLink.instruction}</p>
                  </div>
                )}

                <a
                  href={auditLink.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold pt-1"
                >
                  Inspect Facebook Post <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <div className="font-bold text-gray-300 mb-2 flex items-center justify-between">
                  <span>Verified Supporters ({supportersForLink.length}):</span>
                  <span className="text-emerald-400 font-bold">{auditLink.supportCount} completed</span>
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {supportersForLink.map(record => (
                    <div 
                      key={record.id}
                      className="p-2 bg-[#0E0E10] border border-[#1E1E20] rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <img src={record.supporterAvatar} alt={record.supporterName} className="w-6 h-6 rounded-full object-cover ring-1 ring-[#1E1E20]" />
                        <div>
                          <div className="font-semibold text-white">{record.supporterName}</div>
                          <div className="text-[10px] text-gray-500">@{record.supporterUsername}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold font-mono">
                        {record.supportedAt.split(' ')[1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 text-xs">
              Click any submitted link on the table to audit supporters, post type, instruction, and proxy records.
            </div>
          )}
        </div>

      </div>
      )}

      {/* VIEW 2: SCHEDULED LINKS MANAGEMENT DASHBOARD */}
      {adminViewTab === 'scheduled' && (
        <div className="space-y-6">
          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-[#131315] border border-[#1E1E20] rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-gray-400">মোট শিডিউল লিংক</div>
              <div className="text-2xl font-black text-white mt-1 font-mono">{scheduledLinks.length}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">সব তারিখ মিলিয়ে</div>
            </div>

            <div className="bg-[#131315] border border-[#1E1E20] rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>অপেক্ষমান লিংক</span>
              </div>
              <div className="text-2xl font-black text-indigo-300 mt-1 font-mono">{scheduledPendingCount}</div>
              <div className="text-[10px] text-indigo-400/80 mt-0.5">নির্ধারিত সময়ে লাইভ হবে</div>
            </div>

            <div className="bg-[#131315] border border-[#1E1E20] rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>লাইভ সম্পন্ন</span>
              </div>
              <div className="text-2xl font-black text-emerald-300 mt-1 font-mono">{scheduledSubmittedCount}</div>
              <div className="text-[10px] text-emerald-500/80 mt-0.5">দৈনিক তালিকায় যুক্ত হয়েছে</div>
            </div>

            <div className="bg-[#131315] border border-[#1E1E20] rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
                <span>বাতিল / ফেইল্ড</span>
              </div>
              <div className="text-2xl font-black text-rose-300 mt-1 font-mono">{scheduledCancelledCount}</div>
              <div className="text-[10px] text-rose-500/80 mt-0.5">অ্যাকশন নেওয়া হয়েছে</div>
            </div>
          </div>

          {/* Controls: Search & Status Filters */}
          <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: `সব শিডিউল (${scheduledLinks.length})` },
                { id: 'scheduled', label: `⏳ অপেক্ষমান (${scheduledPendingCount})` },
                { id: 'submitted', label: `✅ লাইভ হয়েছে (${scheduledSubmittedCount})` },
                { id: 'cancelled', label: `❌ বাতিল (${scheduledCancelledCount})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setScheduleStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
                    scheduleStatusFilter === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500'
                      : 'bg-[#0E0E10] text-gray-400 border-[#1E1E20] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="মেম্বার, লিংক বা বিবরণ খুঁজুন..."
                value={scheduleSearch}
                onChange={e => setScheduleSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:border-indigo-500 text-white placeholder-gray-600"
              />
            </div>
          </div>

          {/* Scheduled Links Table */}
          <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#1E1E20] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  শিডিউল কিউ তালিকা ({filteredScheduledLinks.length})
                </h3>
              </div>
              <span className="text-[11px] text-gray-400">
                স্বয়ংক্রিয় ব্যাকএন্ড ক্রন প্রতি মিনিটে রান করে
              </span>
            </div>

            {filteredScheduledLinks.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-xs">
                কোনো শিডিউল লিংক রেকর্ড পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0E0E10] text-gray-400 font-bold border-b border-[#1E1E20]">
                    <tr>
                      <th className="py-3 px-4">মেম্বার</th>
                      <th className="py-3 px-3">শিডিউল সময়</th>
                      <th className="py-3 px-4">পোস্ট ও লিংক</th>
                      <th className="py-3 px-3">ক্যাপশন / বিবরণ</th>
                      <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">অ্যাডমিন অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E1E20]">
                    {filteredScheduledLinks.map(s => {
                      const isPending = s.status === 'scheduled';
                      return (
                        <tr key={s.id} className="hover:bg-[#18181C] transition-colors">
                          {/* Member */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={s.memberAvatar}
                                alt={s.memberName}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#2A2A35]"
                              />
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{s.memberName}</span>
                                  {s.isScheduledByAdmin && (
                                    <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold border border-purple-500/30">
                                      অ্যাডমিন বুকিং
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-500">@{s.memberUsername}</div>
                              </div>
                            </div>
                          </td>

                          {/* Scheduled Date & Time */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="font-semibold text-white font-mono">{s.scheduledForDate}</div>
                            <div className="text-xs text-indigo-400 font-mono font-bold flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{s.scheduledForTime}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1">
                              {getRemainingTimeText(s.scheduledForTimestamp, s.status)}
                            </div>
                          </td>

                          {/* Post URL & Details */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                s.postType === 'video'
                                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                              }`}>
                                {s.postType === 'video' ? '🎬 Video' : '🖼️ Photo'}
                              </span>
                              <span className="px-1.5 py-0.2 bg-gray-800 text-gray-400 rounded text-[9px]">
                                {s.category || 'Member'}
                              </span>
                            </div>
                            <a
                              href={s.postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 truncate font-mono"
                              title={s.postUrl}
                            >
                              <span className="truncate">{s.postUrl}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </td>

                          {/* Caption / Instruction */}
                          <td className="py-3.5 px-3 max-w-xs text-gray-300">
                            {s.caption ? (
                              <p className="line-clamp-2 italic text-[11px]">"{s.caption}"</p>
                            ) : (
                              <span className="text-gray-600 italic text-[11px]">— কোনো ক্যাপশন নেই —</span>
                            )}
                            {s.instruction && (
                              <p className="text-[10px] text-amber-400/80 mt-1 line-clamp-1">
                                নির্দেশনা: {s.instruction}
                              </p>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            {s.status === 'scheduled' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                <Clock className="w-3 h-3" />
                                <span>অপেক্ষমান</span>
                              </span>
                            )}
                            {s.status === 'submitted' && (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>লাইভ #{s.assignedLinkNumber}</span>
                                </span>
                              </div>
                            )}
                            {s.status === 'cancelled' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30" title={s.cancellationReason}>
                                <X className="w-3 h-3" />
                                <span>বাতিল</span>
                              </span>
                            )}
                            {s.status === 'failed' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                <AlertTriangle className="w-3 h-3" />
                                <span>ফেইল্ড</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleForceReleaseSchedule(s.id)}
                                    className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                    title="এখনই এই শিডিউল লিংকটি সিরিয়াল বরাদ্দ দিয়ে লাইভ করুন"
                                  >
                                    <Zap className="w-3 h-3" />
                                    <span>রিলিজ</span>
                                  </button>

                                  <button
                                    onClick={() => handleStartEditSchedule(s)}
                                    className="p-1.5 bg-[#1E1E24] hover:bg-[#2A2A35] text-gray-300 hover:text-white rounded-lg transition-colors border border-[#2B2B36]"
                                    title="শিডিউল তথ্য এডিট করুন"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleCancelSchedule(s.id)}
                                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition-colors border border-rose-500/20"
                                    title="শিডিউল বাতিল করুন"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => handleDeleteSchedule(s.id)}
                                className="p-1.5 bg-gray-800/40 hover:bg-rose-900/30 text-gray-500 hover:text-rose-400 rounded-lg transition-colors"
                                title="রেকর্ড মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Explanatory Policy Notice */}
          <div className="p-4 bg-[#131315] border border-[#1E1E20] rounded-2xl text-xs text-gray-400 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>শিডিউল সিস্টেম রুলস ও অ্যাডমিন কন্ট্রোল</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-400 text-[11px]">
              <li><strong className="text-gray-300">১০:০০ - ১২:০০ ব্লকেড:</strong> সকাল ১০টা থেকে দুপুর ১২টার মধ্যে কোনো শিডিউল নেওয়া হয় না; যাতে ম্যানুয়াল মেম্বাররা লিংক বক্সে অগ্রাধিকার পান।</li>
              <li><strong className="text-gray-300">স্বয়ংক্রিয় সিরিয়াল নম্বর:</strong> শিডিউল করা সময় আসার পূর্বমুহূর্তে কোনো সিরিয়াল বুক থাকে না। নির্দিষ্ট সময়ে ব্যাকএন্ড প্রসেসর চেক করে মেম্বার রিমুভ হয়নি কি না; সব ঠিক থাকলে ওই মুহূর্তে পরবর্তী অব্যবহৃত সিরিয়াল নাম্বার বরাদ্দ দেয়।</li>
              <li><strong className="text-gray-300">অ্যাডমিন ফোর্স রিলিজ:</strong> অ্যাডমিন যেকোনো জরুরি প্রয়োজনে "রিলিজ" বাটনে ক্লিক করে তাত্ক্ষণিকভাবে লিংকটিকে আজকের লাইভ লিংকে প্রমোট করতে পারেন।</li>
            </ul>
          </div>
        </div>
      )}

      {/* Admin Link Submission Modal */}
      {showSubmitModal && (
        <LinkSubmissionModal
          isOpen={showSubmitModal}
          initialTab={submitModalTab}
          onClose={() => setShowSubmitModal(false)}
        />
      )}

      {/* Admin Link Edit Modal (Unlimited Admin Override) */}
      <LinkEditModal
        link={editingLink}
        isOpen={Boolean(editingLink)}
        onClose={() => setEditingLink(null)}
      />

      {/* Admin Scheduled Link Edit Modal */}
      {editingScheduleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141418] border border-[#24242E] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#24242E] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">শিডিউল লিংক সম্পাদনা (Admin)</h3>
              </div>
              <button
                onClick={() => setEditingScheduleItem(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-gray-400">
              মেম্বার: <span className="font-bold text-white">{editingScheduleItem.memberName}</span> (@{editingScheduleItem.memberUsername})
            </div>

            {editError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">ফেসবুক পোস্ট লিংক *</label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={e => setEditUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0E0E10] border border-[#24242E] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">তারিখ (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0E0E10] border border-[#24242E] rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">সময় (HH:MM)</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={e => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0E0E10] border border-[#24242E] rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">ক্যাপশন / পোস্টের বিষয়</label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={e => setEditCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0E0E10] border border-[#24242E] rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">মেম্বারদের জন্য নির্দেশনা</label>
                <input
                  type="text"
                  value={editInstruction}
                  onChange={e => setEditInstruction(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0E0E10] border border-[#24242E] rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#24242E] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingScheduleItem(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveEditSchedule}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-indigo-600/20"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
