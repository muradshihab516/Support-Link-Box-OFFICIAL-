import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Flag, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  AlertTriangle, 
  Clock, 
  MessageSquare,
  ShieldCheck,
  CornerDownRight
} from 'lucide-react';

export const ReportsAdmin: React.FC = () => {
  const { reports, dailyLinks, resolveReport, setActiveReportModalId, currentUser } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_discussion' | 'resolved' | 'dismissed'>('all');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  const filteredReports = reports.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'pending' || r.status === 'open';
    return r.status === filter;
  });

  const handleResolve = (id: string, status: 'resolved' | 'dismissed') => {
    resolveReport(id, status, adminNotes.trim() || undefined);
    setResolvingId(null);
    setAdminNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Flag className="w-6 h-6 text-rose-400" />
            Member Reports & Anti-Abuse Moderation
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Review community-submitted reports for broken links, missing reactions, or suspicious profiles.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-[#0E0E10] p-1 rounded-xl border border-[#1E1E20] flex-wrap gap-1">
          {(['all', 'pending', 'in_discussion', 'resolved', 'dismissed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                filter === tab
                  ? 'bg-[#1E1E20] text-indigo-400 shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'pending' ? 'Open / Pending' : tab === 'in_discussion' ? 'In Discussion' : tab} ({reports.filter(r => {
                if (tab === 'all') return true;
                if (tab === 'pending') return r.status === 'pending' || r.status === 'open';
                return r.status === tab;
              }).length})
            </button>
          ))}
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-3">
        {filteredReports.map(report => {
          const matchedLink = report.targetLinkId ? dailyLinks.find(l => l.id === report.targetLinkId) : null;
          const linkNumber = report.targetLinkNumber || matchedLink?.linkNumber;
          const isPending = report.status === 'pending' || report.status === 'open';

          return (
            <div
              key={report.id}
              className={`p-5 rounded-2xl border transition-all ${
                report.status === 'in_discussion'
                  ? 'bg-[#131315] border-indigo-500/40 shadow-xs'
                  : isPending
                  ? 'bg-[#131315] border-amber-500/30 shadow-xs'
                  : 'bg-[#131315]/60 border-[#1E1E20] opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      report.status === 'in_discussion'
                        ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300'
                        : isPending
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                        : report.status === 'resolved'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                        : 'bg-white/5 text-gray-400'
                    }`}>
                      {report.status === 'in_discussion' ? '💬 In Discussion' : report.status}
                    </span>
                    <span className="text-xs font-bold text-white capitalize">
                      {report.category.replace('_', ' ')}
                    </span>
                    {linkNumber && (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] font-bold">
                        Link #{linkNumber}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Reported by <strong className="text-gray-200">{report.reporterName}</strong> (@{report.reporterUsername}) on {report.createdAt.replace('T', ' ').slice(0, 16)}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {matchedLink?.postUrl && (
                    <a
                      href={matchedLink.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-[#181822] hover:bg-[#222230] border border-[#2A2A38] text-gray-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="ফেসবুকে পোস্টটি টেস্ট করুন"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                      <span>পোস্ট দেখুন</span>
                    </a>
                  )}

                  {/* Conversation / Discussion Thread Button */}
                  <button
                    onClick={() => setActiveReportModalId(report.id)}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    title="রিপোর্টকারী এবং লিংক ওনারের সাথে থ্রেডে কথা বলুন"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>আলোচনা ও রিপ্লাই ({report.replies ? report.replies.length : 0})</span>
                  </button>

                  {(isPending || report.status === 'in_discussion') && (
                    <button
                      onClick={() => setResolvingId(report.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-600/20 transition-colors"
                    >
                      Take Action / Resolve
                    </button>
                  )}
                </div>
              </div>

              {/* Latest Reply Snippet in admin list */}
              {report.replies && report.replies.length > 0 && (
                <div 
                  onClick={() => setActiveReportModalId(report.id)}
                  className="my-2 p-2.5 bg-[#0C0C10] border border-indigo-500/20 rounded-xl cursor-pointer hover:border-indigo-500/40 transition-colors flex items-start gap-2 text-xs"
                >
                  <CornerDownRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-bold text-gray-200">
                        {report.replies[report.replies.length - 1].senderName}
                        <span className="text-[10px] text-gray-400 ml-1 font-normal">
                          ({report.replies[report.replies.length - 1].senderRole === 'admin' ? 'এডমিন' : report.replies[report.replies.length - 1].senderRole === 'link_owner' ? 'লিংক ওনার' : 'রিপোর্টার'})
                        </span>
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {report.replies[report.replies.length - 1].createdAt.slice(11, 16)} • {report.replies.length}টি মেসেজ
                      </span>
                    </div>
                    <p className="text-gray-300 italic line-clamp-1">
                      "{report.replies[report.replies.length - 1].message}"
                    </p>
                  </div>
                </div>
              )}

              {/* Pre-defined selected tags */}
              {report.reasons && report.reasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 my-2">
                  {report.reasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-lg"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}

              {/* Description text */}
              {report.description && (!report.reasons || report.description !== report.reasons.join(', ')) && (
                <p className="text-xs text-gray-300 p-3 bg-[#0E0E10] border border-[#1E1E20] rounded-xl my-2">
                  "{report.description}"
                </p>
              )}

              {/* Attached Screenshot */}
              {report.screenshotUrl && (
                <div className="my-2">
                  <button
                    type="button"
                    onClick={() => setPreviewScreenshotUrl(report.screenshotUrl || null)}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/25 transition-colors"
                  >
                    <span>📷 প্রুফ স্ক্রিনশট দেখুন</span>
                  </button>
                </div>
              )}

              {report.adminNotes && (
                <div className="text-xs text-indigo-400 font-medium mt-2">
                  Admin Action: {report.adminNotes}
                </div>
              )}

              {/* Resolving Action Box */}
              {resolvingId === report.id && (
                <div className="mt-3 p-4 bg-[#0E0E10] rounded-xl border border-indigo-500/30 space-y-3">
                  <label className="block text-xs font-bold text-white">
                    Resolution Notes / Action Taken:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified link was broken and notified creator to update post link."
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#131315] border border-[#1E1E20] rounded-xl text-white placeholder-gray-600 focus:border-indigo-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setResolvingId(null)}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResolve(report.id, 'dismissed')}
                      className="px-3 py-1.5 bg-[#1E1E20] hover:bg-[#27272A] text-gray-300 font-bold text-xs rounded-lg"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleResolve(report.id, 'resolved')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-emerald-600/20"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="p-8 text-center bg-[#131315] rounded-2xl border border-[#1E1E20]">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-white">All Clear!</div>
            <p className="text-xs text-gray-500 mt-0.5">No reports found in this category.</p>
          </div>
        )}
      </div>

      {/* Screenshot Lightbox Modal */}
      {previewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-2xl w-full bg-[#121216] border border-[#2A2A38] rounded-2xl overflow-hidden p-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#242432]">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                📷 প্রুফ স্ক্রিনশট
              </span>
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="px-2.5 py-1 text-xs font-bold text-gray-400 hover:text-white bg-[#1C1C26] rounded-lg"
              >
                বন্ধ করুন ✕
              </button>
            </div>
            <div className="flex items-center justify-center max-h-[75vh] overflow-auto">
              <img 
                src={previewScreenshotUrl} 
                alt="Report Screenshot" 
                className="max-h-[70vh] object-contain rounded-lg border border-[#222230]"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
