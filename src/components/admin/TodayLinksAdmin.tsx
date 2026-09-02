import React, { useState } from 'react';
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
  Download
} from 'lucide-react';
import { exportToCSV } from '../../utils/helpers';

export const TodayLinksAdmin: React.FC = () => {
  const { dailyLinks, supportRecords, members, removeDailyLink } = useApp();
  const [search, setSearch] = useState('');
  const [selectedLinkAudit, setSelectedLinkAudit] = useState<string | null>(null);

  const filteredLinks = dailyLinks.filter(l => 
    l.memberName.toLowerCase().includes(search.toLowerCase()) ||
    l.memberUsername.toLowerCase().includes(search.toLowerCase()) ||
    l.linkNumber.toString().includes(search)
  );

  const auditLink = dailyLinks.find(l => l.id === selectedLinkAudit);
  const supportersForLink = auditLink 
    ? supportRecords.filter(r => r.dailyLinkId === auditLink.id)
    : [];

  const handleExportToday = () => {
    const data = dailyLinks.map(l => ({
      'Link #': l.linkNumber,
      Member: l.memberName,
      Username: `@${l.memberUsername}`,
      'Post URL': l.postUrl,
      Caption: l.caption || 'N/A',
      'Supports Received': l.supportCount,
      'Submitted At': l.submittedAt
    }));
    exportToCSV('Today_Links_Support_Report', data);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Flame className="w-6 h-6 text-orange-400" />
            Today's Link Submissions & Support Matrix
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Live monitor for today's {dailyLinks.length} submitted Facebook posts and mutual support verification.
          </p>
        </div>

        <button
          onClick={handleExportToday}
          className="px-3.5 py-2 bg-[#131315] border border-[#1E1E20] text-gray-300 hover:text-white font-bold text-xs rounded-lg flex items-center gap-1.5 hover:bg-[#1E1E20] transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export Report CSV
        </button>
      </div>

      {/* Grid Layout: Links Table + Audit Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Links Table */}
        <div className="lg:col-span-2 bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white">
              Submitted Links ({filteredLinks.length})
            </h3>
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search link # or creator..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:border-indigo-500 text-white placeholder-gray-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-[#1E1E20] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E0E10] text-gray-400 font-semibold border-b border-[#1E1E20]">
                <tr>
                  <th className="py-2.5 px-3 w-14">Link #</th>
                  <th className="py-2.5 px-3">Member</th>
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
                        #{link.linkNumber}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img src={link.memberAvatar} alt={link.memberName} className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-[#1E1E20]" />
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">{link.memberName}</div>
                            <div className="text-[10px] text-gray-500">@{link.memberUsername}</div>
                          </div>
                        </div>
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
              <div className="p-3.5 bg-[#0E0E10] rounded-xl space-y-2 border border-[#1E1E20]">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-400 text-sm">Link #{auditLink.linkNumber}</span>
                  <span className="text-gray-500">{auditLink.submittedAt}</span>
                </div>
                <div className="font-bold text-white">{auditLink.memberName} (@{auditLink.memberUsername})</div>
                {auditLink.caption && (
                  <p className="text-gray-400 italic">"{auditLink.caption}"</p>
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
              Click any submitted link on the table to audit supporters and timestamps.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
