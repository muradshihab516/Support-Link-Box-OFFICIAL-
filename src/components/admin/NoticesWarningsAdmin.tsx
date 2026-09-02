import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldAlert, 
  Send, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Megaphone, 
  Users, 
  User,
  Clock
} from 'lucide-react';
import { NoticeType } from '../../types';

export const NoticesWarningsAdmin: React.FC = () => {
  const { notices, members, issueNotice } = useApp();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NoticeType>('simple_warning');
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [targetMemberId, setTargetMemberId] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const target = targetType === 'all' ? 'all' : targetMemberId;
    if (targetType === 'specific' && !targetMemberId) {
      alert('Please select a target member.');
      return;
    }

    issueNotice(title.trim(), message.trim(), type, target);
    setStatusMsg('Notice issued successfully!');
    setTitle('');
    setMessage('');
    setTimeout(() => setStatusMsg(''), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
          <ShieldAlert className="w-6 h-6 text-amber-400" />
          Community Notices & Warning System
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Dispatch official announcements, support reminders, 3-day inactivity alerts, or kickout warnings.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/20">
          {statusMsg}
        </div>
      )}

      {/* Grid: Create Notice + Active Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Notice Form */}
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-400" />
            Issue New Official Notice
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Notice Severity *</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as NoticeType)}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-semibold focus:border-indigo-500"
              >
                <option value="announcement" className="bg-[#131315]">📢 Community Announcement (General)</option>
                <option value="simple_warning" className="bg-[#131315]">⚠️ Simple Support Warning (1st Notice)</option>
                <option value="alert_warning" className="bg-[#131315]">🚨 Alert Warning (3+ Days Inactivity)</option>
                <option value="kickout_warning" className="bg-[#131315]">⛔ Final Kickout Notice (Account Isolation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Audience Target *</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setTargetType('all')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
                    targetType === 'all'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-[#0E0E10] border border-[#1E1E20] text-gray-400 hover:text-white'
                  }`}
                >
                  All Members
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('specific')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
                    targetType === 'specific'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-[#0E0E10] border border-[#1E1E20] text-gray-400 hover:text-white'
                  }`}
                >
                  Specific Member
                </button>
              </div>

              {targetType === 'specific' && (
                <select
                  value={targetMemberId}
                  onChange={e => setTargetMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500"
                >
                  <option value="" className="bg-[#131315]">Select a member...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id} className="bg-[#131315]">
                      {m.name} (@{m.username} • #{m.memberNumber})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Notice Headline *</label>
              <input
                type="text"
                required
                placeholder="e.g. 59th Week Support Deadline Reminder"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white placeholder-gray-600 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Detailed Message *</label>
              <textarea
                rows={3}
                required
                placeholder="Write message content here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white placeholder-gray-600 resize-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-600/20 transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Broadcast Notice
            </button>
          </form>
        </div>

        {/* Active Notices Feed */}
        <div className="lg:col-span-2 bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Active Official Notices ({notices.length})
            </h3>
            <span className="text-xs text-gray-500">Shown in member dashboards</span>
          </div>

          <div className="space-y-3">
            {notices.map(notice => {
              const targetMember = members.find(m => m.id === notice.targetMemberId);

              return (
                <div
                  key={notice.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-2 ${
                    notice.type === 'kickout_warning'
                      ? 'bg-red-500/10 border-red-500/20 text-red-300'
                      : notice.type === 'alert_warning'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                      : notice.type === 'simple_warning'
                      ? 'bg-orange-500/10 border-orange-500/20 text-orange-300'
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">
                          {notice.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-white/10">
                          {notice.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1">
                        {notice.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-white/5">
                    <span>Target: {notice.targetMemberId === 'all' ? 'All Community Members' : targetMember?.name || notice.targetMemberId}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {notice.issuedAt} by {notice.issuedBy}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
