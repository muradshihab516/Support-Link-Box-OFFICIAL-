import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LateSupportReport, LateSupportReportStatus } from '../../types';
import { 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileText, 
  Trash2, 
  Sparkles, 
  ExternalLink,
  RefreshCw,
  Eye,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { getBangladeshCurrentTime12h } from '../../utils/bangladeshTime';

export const LateSupportReportsAdmin: React.FC = () => {
  const { 
    lateSupportReports, 
    members,
    adminApproveLateReport, 
    adminRejectLateReport, 
    evaluateLateSupportReports,
    deleteLateSupportReport 
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<LateSupportReportStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<LateSupportReport | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtered list
  const filteredReports = useMemo(() => {
    return lateSupportReports.filter(report => {
      if (filterStatus !== 'all' && report.status !== filterStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMember = report.memberName.toLowerCase().includes(q) || 
                              report.memberUsername.toLowerCase().includes(q);
        const matchesReason = report.reason.toLowerCase().includes(q) || 
                              report.details.toLowerCase().includes(q);
        if (!matchesMember && !matchesReason) return false;
      }
      return true;
    });
  }, [lateSupportReports, filterStatus, searchQuery]);

  // Metric counts
  const counts = useMemo(() => {
    return {
      total: lateSupportReports.length,
      pending: lateSupportReports.filter(r => r.status === 'pending').length,
      completedInGrace: lateSupportReports.filter(r => r.status === 'completed_in_grace').length,
      recoveryExpired: lateSupportReports.filter(r => r.status === 'recovery_expired').length,
      approved: lateSupportReports.filter(r => r.status === 'admin_approved').length,
      rejected: lateSupportReports.filter(r => r.status === 'admin_rejected').length,
    };
  }, [lateSupportReports]);

  // Handle Approve / Reject submission
  const handleActionSubmit = () => {
    if (!selectedReport || !actionType) return;

    if (actionType === 'approve') {
      const res = adminApproveLateReport(selectedReport.id, actionNotes);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
      } else {
        setFeedbackMsg({ type: 'error', text: res.message });
      }
    } else if (actionType === 'reject') {
      if (!actionNotes.trim()) {
        setFeedbackMsg({ type: 'error', text: 'রিপোর্ট বাতিলের কারণ উল্লেখ করুন।' });
        return;
      }
      const res = adminRejectLateReport(selectedReport.id, actionNotes);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
      } else {
        setFeedbackMsg({ type: 'error', text: res.message });
      }
    }

    setSelectedReport(null);
    setActionType(null);
    setActionNotes('');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const getStatusBadge = (status: LateSupportReportStatus, recoveryDeadlineTimestamp?: number) => {
    const isOverdue = recoveryDeadlineTimestamp && Date.now() > recoveryDeadlineTimestamp;

    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>গ্রেস উইন্ডো চলমান (In Grace)</span>
          </span>
        );
      case 'completed_in_grace':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>গ্রেস টাইমে অল ডান সম্পন্ন (Bypassed Ads)</span>
          </span>
        );
      case 'recovery_expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>২৪ ঘণ্টা অতিক্রান্ত (Approval Pending)</span>
          </span>
        );
      case 'admin_approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>এডমিন অনুমোদিত (Approved)</span>
          </span>
        );
      case 'admin_rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/15 border border-red-500/30 text-red-400">
            <XCircle className="w-3.5 h-3.5" />
            <span>বাতিলকৃত (Rejected)</span>
          </span>
        );
    }
  };

  const calculateHoursRemaining = (deadlineTimestamp?: number) => {
    if (!deadlineTimestamp) return 'অজানা';
    const diffMs = deadlineTimestamp - Date.now();
    if (diffMs <= 0) return 'সময় শেষ (Exceeded)';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} ঘণ্টা ${minutes} মিনিট বাকি`;
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="late-support-reports-admin-panel">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-amber-400" />
            <span>Late Support Reports & Exceptions</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            রাত ১২:০০ টার পূর্বের মেম্বারদের দেরিতে সাপোর্টের আবেদন, ২৪ ঘণ্টার গ্রেস উইন্ডো মনিটরিং ও ম্যানুয়াল অ্যাপ্রুভাল।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const res = evaluateLateSupportReports();
              setFeedbackMsg({
                type: 'success',
                text: `স্ক্যান সম্পন্ন: ${res.activeCount} টি সক্রিয় রিপোর্ট, ${res.expiredCount} টি ২৪ ঘণ্টা মেয়াদোত্তীর্ণ চিহ্নিত হয়েছে।`
              });
              setTimeout(() => setFeedbackMsg(null), 4000);
            }}
            className="px-3 py-2 bg-[#1A1A22] hover:bg-[#262634] border border-[#2E2E3E] text-gray-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="২৪ ঘণ্টার মেয়াদোত্তীর্ণ রিপোর্টসমূহ পুনর্মূল্যায়ন করুন"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <span>Evaluate 24h Expiry</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterStatus === 'all'
              ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
              : 'bg-[#141418] border-[#22222C] text-gray-400 hover:border-gray-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">সর্বমোট রিপোর্ট</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{counts.total}</div>
        </button>

        <button
          onClick={() => setFilterStatus('pending')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterStatus === 'pending'
              ? 'bg-amber-600/15 border-amber-500/40 text-amber-300'
              : 'bg-[#141418] border-[#22222C] text-gray-400 hover:border-gray-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">গ্রেস চলমান (24h)</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{counts.pending}</div>
        </button>

        <button
          onClick={() => setFilterStatus('completed_in_grace')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterStatus === 'completed_in_grace'
              ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-300'
              : 'bg-[#141418] border-[#22222C] text-gray-400 hover:border-gray-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">গ্রেস টাইমে অল ডান</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{counts.completedInGrace}</div>
        </button>

        <button
          onClick={() => setFilterStatus('recovery_expired')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterStatus === 'recovery_expired'
              ? 'bg-rose-600/15 border-rose-500/40 text-rose-300'
              : 'bg-[#141418] border-[#22222C] text-gray-400 hover:border-gray-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Approval Pending</div>
          <div className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5">{counts.recoveryExpired}</div>
        </button>

        <button
          onClick={() => setFilterStatus('admin_approved')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterStatus === 'admin_approved'
              ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300'
              : 'bg-[#141418] border-[#22222C] text-gray-400 hover:border-gray-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Approved</div>
          <div className="text-xl sm:text-2xl font-black text-indigo-400 mt-0.5">{counts.approved}</div>
        </button>

        <button
          onClick={() => setFilterStatus('admin_rejected')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterStatus === 'admin_rejected'
              ? 'bg-red-600/15 border-red-500/40 text-red-400'
              : 'bg-[#141418] border-[#22222C] text-gray-400 hover:border-gray-700'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-red-400">Rejected</div>
          <div className="text-xl sm:text-2xl font-black text-red-400 mt-0.5">{counts.rejected}</div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 sm:p-4 rounded-xl bg-[#141418] border border-[#22222C] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="মেম্বারের নাম, ইউজারনেম বা কারণ দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#1A1A22] border border-[#2A2A38] rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-gray-400 font-semibold flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>ফিল্টার:</span>
          </span>
          {(['all', 'pending', 'completed_in_grace', 'recovery_expired', 'admin_approved', 'admin_rejected'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors ${
                filterStatus === st 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-[#1A1A22] text-gray-400 hover:text-white border border-[#2A2A38]'
              }`}
            >
              {st === 'all' && 'সব'}
              {st === 'pending' && 'চলমান গ্রেস'}
              {st === 'completed_in_grace' && 'সম্পন্ন'}
              {st === 'recovery_expired' && 'Approval Pending'}
              {st === 'admin_approved' && 'অনুমোদিত'}
              {st === 'admin_rejected' && 'বাতিল'}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table / Card List */}
      <div className="rounded-2xl bg-[#141418] border border-[#22222C] overflow-hidden shadow-xl">
        {filteredReports.length === 0 ? (
          <div className="py-14 text-center space-y-2">
            <Clock className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-sm text-gray-400 font-semibold">কোনো Late Support রিপোর্ট পাওয়া যায়নি</p>
            <p className="text-xs text-gray-600">মেম্বাররা রাত ১২:০০ টার আগে রিপোর্ট করলে এখানে তালিকাভুক্ত হবে।</p>
          </div>
        ) : (
          <div className="divide-y divide-[#20202A]">
            {filteredReports.map(report => {
              const targetMember = members.find(m => m.id === report.memberId);
              const isOverdue = Date.now() > report.recoveryDeadlineTimestamp;

              return (
                <div key={report.id} className="p-4 sm:p-5 hover:bg-[#181820] transition-colors space-y-3">
                  
                  {/* Top line: Member & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={report.memberAvatar || targetMember?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                        alt={report.memberName}
                        className="w-10 h-10 rounded-xl object-cover border border-gray-700 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{report.memberName}</h3>
                          <span className="text-xs text-gray-400">@{report.memberUsername}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-medium">
                            তারিখ: {report.reportDate}
                          </span>
                        </div>
                        <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                          কারণ: {report.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      {getStatusBadge(report.status, report.recoveryDeadlineTimestamp)}
                    </div>
                  </div>

                  {/* Details block */}
                  <div className="p-3 rounded-xl bg-[#1A1A22] border border-[#282836] text-xs text-gray-300 space-y-1.5">
                    <div className="flex items-center justify-between text-gray-400 text-[11px]">
                      <span>জমা দেওয়ার সময় (BD Time): <strong className="text-gray-200">{report.submittedAt}</strong></span>
                      <span>২৪ ঘণ্টার গ্রেস বাকি: <strong className={isOverdue ? 'text-rose-400' : 'text-amber-400'}>{calculateHoursRemaining(report.recoveryDeadlineTimestamp)}</strong></span>
                    </div>
                    <p className="text-gray-200 leading-relaxed font-normal">
                      "{report.details}"
                    </p>
                    {report.screenshotUrl && (
                      <div className="pt-1">
                        <a 
                          href={report.screenshotUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>প্রমাণ / স্ক্রিনশট লিংক দেখুন</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Admin review trail if reviewed */}
                  {report.adminActionBy && (
                    <div className="text-[11px] text-gray-400 bg-gray-900/60 p-2 rounded-lg border border-gray-800 flex items-center justify-between">
                      <span>অ্যাকশন নিয়েছেন: <strong>{report.adminActionBy}</strong> ({report.adminActionAt})</span>
                      {report.adminNotes && <span className="text-gray-300">নোট: {report.adminNotes}</span>}
                      {report.rejectionReason && <span className="text-rose-400">বাতিলের কারণ: {report.rejectionReason}</span>}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-gray-500">
                      ID: {report.id}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Action trigger for Approval / Rejection */}
                      {(report.status === 'pending' || report.status === 'recovery_expired') && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setActionType('approve');
                              setActionNotes('২৪ ঘণ্টার রিকভারি বিবেচনা করে অ্যাডমিন কর্তৃক অনুমোদন দেওয়া হলো।');
                            }}
                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Active</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setActionType('reject');
                              setActionNotes('');
                            }}
                            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject & Suspend</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি এই রিপোর্টটি (${report.memberName}) মুছে ফেলতে চান?`)) {
                            deleteLateSupportReport(report.id);
                          }
                        }}
                        className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="রিপোর্ট রেকর্ড মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Modal (Approve / Reject Dialog) */}
      {selectedReport && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#16161C] border border-[#282836] rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                {actionType === 'approve' ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Approve Late Report: {selectedReport.memberName}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>Reject Late Report: {selectedReport.memberName}</span>
                  </>
                )}
              </h3>
              <button onClick={() => { setSelectedReport(null); setActionType(null); }} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              {actionType === 'approve' ? (
                'অনুমোদন দিলে মেম্বারের অ্যাকাউন্ট সক্রিয় (Active) করা হবে, কোনো Ad punishment থাকবে না এবং লিংক সাবমিট করার ক্ষমতা সচল থাকবে।'
              ) : (
                'বাতিল করলে মেম্বারের অ্যাকাউন্ট সাসপেন্ডেড অবস্থায় থাকবে এবং লিংক সাবমিট ব্লক থাকবে।'
              )}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                {actionType === 'approve' ? 'অ্যাডমিন নোট (ঐচ্ছিক)' : 'বাতিলের সুস্পষ্ট কারণ (বাধ্যতামূলক) *'}
              </label>
              <textarea
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                placeholder={actionType === 'approve' ? 'অনুমোদনের নোট লিখুন...' : 'কেন বাতিল করা হলো তার কারণ লিখুন...'}
                rows={3}
                className="w-full px-3 py-2 bg-[#1C1C24] border border-[#2E2E3C] focus:border-indigo-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => { setSelectedReport(null); setActionType(null); }}
                className="px-3.5 py-1.5 bg-[#22222C] text-gray-300 text-xs font-semibold rounded-lg hover:bg-[#2A2A36]"
              >
                বাতিল
              </button>
              <button
                onClick={handleActionSubmit}
                className={`px-4 py-1.5 font-bold text-xs rounded-lg shadow-lg flex items-center gap-1.5 ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                }`}
              >
                {actionType === 'approve' ? 'অনুমোদন নিশ্চিত করুন' : 'বাতিল নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
