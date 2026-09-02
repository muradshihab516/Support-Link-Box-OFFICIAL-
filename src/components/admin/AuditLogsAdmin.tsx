import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Search, 
  Clock, 
  User, 
  Download, 
  ShieldCheck 
} from 'lucide-react';
import { exportToCSV } from '../../utils/helpers';

export const AuditLogsAdmin: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase()) ||
    log.adminName.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const data = auditLogs.map(l => ({
      Timestamp: l.timestamp,
      'Admin Name': l.adminName,
      Action: l.action,
      Details: l.details
    }));
    exportToCSV('Support_Link_Box_Audit_Logs', data);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <FileText className="w-6 h-6 text-indigo-400" />
            System Audit & Administrative Action Logs
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Immutable chronological record of all administrative actions, status changes, and weekly finalizations.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-3.5 py-2 bg-[#0E0E10] hover:bg-[#1E1E20] border border-[#1E1E20] text-gray-300 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export Audit Log CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white">
            Audit Activity History ({filteredLogs.length})
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit actions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white placeholder-gray-600 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-[#1E1E20] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E0E10] text-gray-400 font-semibold border-b border-[#1E1E20]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Admin</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E20]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#18181B] transition-colors">
                  <td className="py-3 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                    {log.adminName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 whitespace-nowrap">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-300">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
