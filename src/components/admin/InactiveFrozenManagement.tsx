import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Snowflake, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  UserCheck, 
  Clock, 
  Send,
  Zap
} from 'lucide-react';
import { getStatusBadgeColor } from '../../utils/helpers';

export const InactiveFrozenManagement: React.FC = () => {
  const { members, updateMemberStatus, issueNotice } = useApp();
  const [inactivityThreshold, setInactivityThreshold] = useState<number>(3);
  const [selectedTab, setSelectedTab] = useState<'inactive' | 'frozen'>('inactive');

  const inactiveMembers = members.filter(m => m.status === 'inactive' || m.inactivityDays >= inactivityThreshold);
  const frozenMembers = members.filter(m => m.status === 'frozen');

  const handleAutoFreezeEligible = () => {
    const eligible = members.filter(m => m.inactivityDays >= 7 && m.status !== 'frozen');
    if (eligible.length === 0) {
      alert('No members currently meet the 7+ days inactivity threshold for auto-freeze.');
      return;
    }
    if (confirm(`Freeze ${eligible.length} members with 7+ days of inactivity?`)) {
      eligible.forEach(m => updateMemberStatus(m.id, 'frozen'));
    }
  };

  const handleSendReminderToAllInactive = () => {
    if (inactiveMembers.length === 0) return;
    if (confirm(`Send urgent support reminder notices to all ${inactiveMembers.length} inactive members?`)) {
      inactiveMembers.forEach(m => {
        issueNotice(
          'Support Inactivity Alert',
          `You have missed support exchange tasks for ${m.inactivityDays} days. Please resume submitting and supporting to avoid account freeze.`,
          'alert_warning',
          m.id
        );
      });
      alert('Notices dispatched successfully!');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Snowflake className="w-6 h-6 text-blue-400" />
            Inactive & Frozen Member Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Auto-isolation of inactive members protects community fulfillment rates from dragging down.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendReminderToAllInactive}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Alert to Inactive ({inactiveMembers.length})</span>
          </button>

          <button
            onClick={handleAutoFreezeEligible}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Auto-Freeze 7d+ Inactive</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#0E0E10] p-1 rounded-xl w-fit border border-[#1E1E20]">
        <button
          onClick={() => setSelectedTab('inactive')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            selectedTab === 'inactive'
              ? 'bg-[#1E1E20] text-amber-400 shadow-xs'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Inactive Members ({inactiveMembers.length})</span>
        </button>

        <button
          onClick={() => setSelectedTab('frozen')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            selectedTab === 'frozen'
              ? 'bg-[#1E1E20] text-blue-400 shadow-xs'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Snowflake className="w-4 h-4 text-blue-400" />
          <span>Frozen Members ({frozenMembers.length})</span>
        </button>
      </div>

      {/* Inactive Tab */}
      {selectedTab === 'inactive' && (
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              Members with inactive consecutive days without submitting or supporting:
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400">Inactivity Threshold:</span>
              <select
                value={inactivityThreshold}
                onChange={e => setInactivityThreshold(Number(e.target.value))}
                className="px-2.5 py-1 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-lg text-white font-bold focus:border-indigo-500"
              >
                <option value={1} className="bg-[#131315]">1+ Day</option>
                <option value={3} className="bg-[#131315]">3+ Days (Alert Warning)</option>
                <option value={5} className="bg-[#131315]">5+ Days</option>
                <option value={7} className="bg-[#131315]">7+ Days (Freeze Eligible)</option>
                <option value={11} className="bg-[#131315]">11+ Days (High Risk)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#1E1E20] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E0E10] text-gray-400 font-semibold border-b border-[#1E1E20]">
                <tr>
                  <th className="py-2.5 px-3">#ID</th>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3 text-center">Inactive Days</th>
                  <th className="py-2.5 px-3 text-center">Warnings</th>
                  <th className="py-2.5 px-3 text-center">Past Rate</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1E20]">
                {inactiveMembers.map(m => (
                  <tr key={m.id} className="hover:bg-[#18181B] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-gray-500">#{m.memberNumber}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-[#1E1E20]" />
                        <div>
                          <div className="font-bold text-white">{m.name}</div>
                          <div className="text-[10px] text-gray-500">@{m.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-400 font-mono">
                      {m.inactivityDays} days
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-gray-400">
                      {m.warningCount} notices
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-gray-300">
                      {m.completionRate}%
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            issueNotice(
                              'Support Warning Alert',
                              `You have missed support tasks for ${m.inactivityDays} days. Please resume activity.`,
                              'alert_warning',
                              m.id
                            );
                            alert(`Notice issued to ${m.name}`);
                          }}
                          className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Send Notice
                        </button>
                        <button
                          onClick={() => updateMemberStatus(m.id, 'frozen')}
                          className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Freeze
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Frozen Tab */}
      {selectedTab === 'frozen' && (
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 space-y-4 shadow-xs">
          <div className="text-xs text-gray-500">
            Frozen members cannot submit links until reactivated by an admin. Points and records remain preserved.
          </div>

          <div className="overflow-x-auto border border-[#1E1E20] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E0E10] text-gray-400 font-semibold border-b border-[#1E1E20]">
                <tr>
                  <th className="py-2.5 px-3">#ID</th>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Total Points</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1E20]">
                {frozenMembers.map(m => (
                  <tr key={m.id} className="hover:bg-[#18181B] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-gray-500">#{m.memberNumber}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-[#1E1E20]" />
                        <div>
                          <div className="font-bold text-white">{m.name}</div>
                          <div className="text-[10px] text-gray-500">@{m.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        Frozen
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-indigo-400">
                      {m.totalPoints}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => updateMemberStatus(m.id, 'active')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-emerald-600/20"
                      >
                        Unfreeze & Restore Active
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
