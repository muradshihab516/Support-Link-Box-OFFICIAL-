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
  ShieldCheck
} from 'lucide-react';

export const ReportsAdmin: React.FC = () => {
  const { reports, resolveReport } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const filteredReports = reports.filter(r => {
    if (filter === 'all') return true;
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
        <div className="flex bg-[#0E0E10] p-1 rounded-xl border border-[#1E1E20]">
          {(['all', 'pending', 'resolved', 'dismissed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                filter === tab
                  ? 'bg-[#1E1E20] text-indigo-400 shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab} ({reports.filter(r => tab === 'all' || r.status === tab).length})
            </button>
          ))}
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-3">
        {filteredReports.map(report => (
          <div
            key={report.id}
            className={`p-5 rounded-2xl border transition-all ${
              report.status === 'pending'
                ? 'bg-[#131315] border-amber-500/30 shadow-xs'
                : 'bg-[#131315]/60 border-[#1E1E20] opacity-80'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    report.status === 'pending'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                      : report.status === 'resolved'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                      : 'bg-white/5 text-gray-400'
                  }`}>
                    {report.status}
                  </span>
                  <span className="text-xs font-bold text-white capitalize">
                    {report.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Reported by <strong className="text-gray-300">{report.reporterName}</strong> (@{report.reporterUsername}) on {report.createdAt}
                </div>
              </div>

              {report.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setResolvingId(report.id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-600/20 transition-colors"
                  >
                    Take Action / Resolve
                  </button>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-300 p-3 bg-[#0E0E10] border border-[#1E1E20] rounded-xl my-2">
              "{report.description}"
            </p>

            {report.adminNotes && (
              <div className="text-xs text-indigo-400 font-medium">
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
        ))}

        {filteredReports.length === 0 && (
          <div className="p-8 text-center bg-[#131315] rounded-2xl border border-[#1E1E20]">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-white">All Clear!</div>
            <p className="text-xs text-gray-500 mt-0.5">No reports found in this category.</p>
          </div>
        )}
      </div>

    </div>
  );
};
