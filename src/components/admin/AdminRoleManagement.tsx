import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { 
  ShieldCheck, 
  Crown, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  Search, 
  ExternalLink, 
  Clock, 
  Users, 
  Check, 
  X, 
  Info,
  Shield,
  Download,
  Flame,
  FileText
} from 'lucide-react';
import { exportToCSV } from '../../utils/helpers';

export const AdminRoleManagement: React.FC = () => {
  const { 
    members, 
    currentUser, 
    isDeveloper, 
    promoteToAdmin, 
    demoteAdminToMember,
    auditLogs,
    isSupabaseActive
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'admins' | 'all_members' | 'role_audit'>('admins');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Promotion confirmation modal state
  const [promotingMember, setPromotingMember] = useState<Member | null>(null);
  const [promotionNote, setPromotionNote] = useState('');
  
  // Demotion confirmation modal state
  const [demotingAdmin, setDemotingAdmin] = useState<Member | null>(null);
  const [demotionNote, setDemotionNote] = useState('');
  
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Group members into roles
  const developerMember = members.find(m => isDeveloper(m)) || 
    members.find(m => m.email?.toLowerCase() === 'muradshihab515@gmail.com') || 
    members.find(m => m.id === 'user_dev_shihab');
  
  const flatAdmins = members.filter(m => 
    !isDeveloper(m) && (m.role === 'admin' || m.role === 'moderator')
  );

  const regularMembers = members.filter(m => 
    !isDeveloper(m) && m.role !== 'admin' && m.role !== 'moderator'
  );

  // Filtered lists based on search
  const filteredAdmins = flatAdmins.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.memberNumber.toString().includes(searchQuery)
  );

  const filteredMembers = regularMembers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.memberNumber.toString().includes(searchQuery)
  );

  // Role audit logs
  const roleAuditLogs = auditLogs.filter(log => 
    log.action.includes('PROMOTE') || 
    log.action.includes('DEMOTE') || 
    log.action.includes('ROLE') ||
    log.details.toLowerCase().includes('admin') ||
    log.details.toLowerCase().includes('promoted') ||
    log.details.toLowerCase().includes('demoted')
  );

  const handleConfirmPromote = () => {
    if (!promotingMember) return;
    const res = promoteToAdmin(promotingMember.id, promotionNote.trim() || undefined);
    if (res.success) {
      setActionFeedback({ type: 'success', message: res.message });
      setPromotingMember(null);
      setPromotionNote('');
    } else {
      setActionFeedback({ type: 'error', message: res.message });
    }
  };

  const handleConfirmDemote = () => {
    if (!demotingAdmin) return;
    const res = demoteAdminToMember(demotingAdmin.id, demotionNote.trim() || undefined);
    if (res.success) {
      setActionFeedback({ type: 'success', message: res.message });
      setDemotingAdmin(null);
      setDemotionNote('');
    } else {
      setActionFeedback({ type: 'error', message: res.message });
    }
  };

  const handleExportRoleAudit = () => {
    const data = roleAuditLogs.map(log => ({
      Timestamp: log.timestamp,
      'Performed By': log.adminName,
      'Admin Role': log.adminRole,
      Action: log.action,
      Target: log.targetName || log.targetId,
      Details: log.details
    }));
    exportToCSV('Admin_Role_Management_Audit_Log', data);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Admins & Role Management (এডমিন ও রোল নিয়ন্ত্রণ)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            মেসেঞ্জার-স্টাইল ফ্ল্যাট এডমিন সিস্টেম — যেকোনো এডমিন মেম্বারদের এডমিন বানাতে ও ডিমোট করতে পারবেন, কিন্তু সিস্টেম ডেভেলপার সুরক্ষিত।
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeSubTab === 'role_audit' && (
            <button
              onClick={handleExportRoleAudit}
              className="px-3.5 py-2 bg-[#131315] hover:bg-[#1E1E20] border border-[#1E1E20] text-gray-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" /> Export Role Log
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          actionFeedback.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <span>{actionFeedback.message}</span>
          <button 
            onClick={() => setActionFeedback(null)} 
            className="p-1 hover:opacity-75 rounded transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Security Protocol & Hard Rules Banner */}
      <div className="bg-[#111114] rounded-2xl border border-indigo-500/20 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            সিস্টেম রোল সিকিউরিটি রুলস (Role Security Protocols)
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            Active RBAC Guard
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#0A0A0C] border border-[#1E1E20] rounded-xl">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              Developer / System Admin
            </div>
            <p className="text-gray-400 text-[11px] mt-1">
              মো: শিহাব খান (Md Shihab Khan)। ডাটাবেস ও সিস্টেম সুরক্ষিত। কোনো এডমিন ডিমোট বা পরিবর্তন করতে পারবে না।
            </p>
          </div>

          <div className="p-3 bg-[#0A0A0C] border border-[#1E1E20] rounded-xl">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Flat Admins ({flatAdmins.length})
            </div>
            <p className="text-gray-400 text-[11px] mt-1">
              সকল এডমিন সমান ক্ষমতার অধিকারী। একে অপরকে বা যেকোনো মেম্বারকে রোল দিতে/নিতে পারেন।
            </p>
          </div>

          <div className="p-3 bg-[#0A0A0C] border border-[#1E1E20] rounded-xl">
            <div className="font-bold text-blue-400 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-400" />
              Promotion & Demotion
            </div>
            <p className="text-gray-400 text-[11px] mt-1">
              Admin ➔ Member ➔ Admin ✅ | Admin ➔ Admin ➔ Member ✅ | Admin ➔ Dev ❌
            </p>
          </div>

          <div className="p-3 bg-[#0A0A0C] border border-[#1E1E20] rounded-xl">
            <div className="font-bold text-purple-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-400" />
              Automatic Audit Trail
            </div>
            <p className="text-gray-400 text-[11px] mt-1">
              প্রতিটি রোল পরিবর্তন স্বয়ংক্রিয়ভাবে অডিট লগে সেভ হবে ও নোটিফিকেশন পাঠানো হবে।
            </p>
          </div>
        </div>
      </div>

      {/* Developer / System Admin Card */}
      {developerMember && (
        <div className="bg-gradient-to-r from-amber-500/10 via-[#131315] to-[#131315] rounded-2xl border border-amber-500/30 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-15 pointer-events-none">
            <Crown className="w-32 h-32 text-amber-400" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={developerMember.avatar} 
                  alt={developerMember.name} 
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-400 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black rounded-full p-1 shadow">
                  <Crown className="w-3.5 h-3.5" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">
                    {developerMember.name}
                  </h2>
                  <span className="px-2.5 py-0.5 bg-amber-400 text-black text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3 fill-black" /> System Developer
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    #{developerMember.memberNumber}
                  </span>
                </div>

                <div className="text-xs text-gray-400 flex flex-wrap items-center gap-3 mt-1">
                  <span>{developerMember.email}</span>
                  {developerMember.facebookUrl && (
                    <a 
                      href={developerMember.facebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Facebook Profile
                    </a>
                  )}
                  <span className="text-emerald-400 font-medium">Status: {developerMember.status}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" />
                Protected Developer / Owner
              </div>
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase Database Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E1E20] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('admins')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'admins'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#131315] hover:bg-[#1E1E20] text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Active Admins ({flatAdmins.length})
          </button>

          <button
            onClick={() => setActiveSubTab('all_members')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'all_members'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-[#131315] hover:bg-[#1E1E20] text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Members Pool ({regularMembers.length})
          </button>

          <button
            onClick={() => setActiveSubTab('role_audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'role_audit'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[#131315] hover:bg-[#1E1E20] text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Role Audit Log ({roleAuditLogs.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, #..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#131315] border border-[#1E1E20] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Sub-Tab 1: Active Admins */}
      {activeSubTab === 'admins' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              বিশ্বস্ত এডমিন টিম (Trusted Flat Admins) — {filteredAdmins.length} জন
            </h3>
            <p className="text-[11px] text-gray-400">
              যে কোনো এডমিন অপর এডমিনকে ডিমোট করতে পারবেন, কিন্তু ডেভেলপারকে পারবেন না।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAdmins.map((admin) => (
              <div 
                key={admin.id} 
                className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-4 flex flex-col justify-between hover:border-[#2E2E32] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={admin.avatar} 
                      alt={admin.name} 
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-emerald-500/40"
                    />
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span className="font-mono text-gray-500 text-xs">#{admin.memberNumber}</span>
                        <span>{admin.name}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-[170px]">
                        {admin.email}
                      </div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md">
                        🛡️ Flat Admin
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E1E20] flex items-center justify-between text-xs">
                  <div className="text-[11px] text-gray-400">
                    <div>Supports: <span className="font-mono text-white font-bold">{admin.supportsCompleted}</span></div>
                    <div>Points: <span className="font-mono text-indigo-400 font-bold">{admin.totalPoints}</span></div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {admin.facebookUrl && (
                      <a
                        href={admin.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-[#0E0E10] border border-[#1E1E20] hover:text-blue-400 text-gray-400 rounded-lg transition-colors"
                        title="View Facebook Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Demote Button */}
                    <button
                      onClick={() => setDemotingAdmin(admin)}
                      className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                      title="Demote this admin to regular member"
                    >
                      <UserX className="w-3.5 h-3.5" /> Demote
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAdmins.length === 0 && (
            <div className="p-8 text-center bg-[#131315] rounded-2xl border border-[#1E1E20] text-gray-500 text-xs">
              কোনো এডমিন পাওয়া যায়নি।
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 2: Members Pool (Eligible to be promoted) */}
      {activeSubTab === 'all_members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              মেম্বার তালিকা থেকে নতুন এডমিন বানান ({filteredMembers.length})
            </h3>
            <p className="text-[11px] text-gray-400">
              যেকোনো সক্রিয় মেম্বারকে এক ক্লিকে এডমিন হিসেবে উন্নীত করতে পারেন।
            </p>
          </div>

          <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-400">
                <thead className="bg-[#0E0E10] text-[11px] uppercase tracking-wider text-gray-500 border-b border-[#1E1E20]">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Facebook Identity</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Rate</th>
                    <th className="py-3 px-3 text-center">Points</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E1E20]">
                  {filteredMembers.map(member => (
                    <tr key={member.id} className="hover:bg-[#18181B] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={member.avatar} 
                            alt={member.name} 
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-[#1E1E20] shrink-0" 
                          />
                          <div>
                            <div className="font-bold text-white truncate flex items-center gap-1.5">
                              <span className="font-mono text-gray-500 text-[11px]">#{member.memberNumber}</span>
                              <span>{member.name}</span>
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white font-medium">
                          {member.facebookName || member.name}
                        </div>
                        {member.facebookUrl && (
                          <a
                            href={member.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <ExternalLink className="w-2.5 h-2.5" /> FB Profile
                          </a>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 capitalize">
                          {member.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-white">
                        {member.completionRate}%
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-indigo-400">
                        {member.totalPoints}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {member.status === 'pending_approval' ? (
                          <span className="text-[11px] text-amber-400 font-semibold">
                            Pending Approval
                          </span>
                        ) : (
                          <button
                            onClick={() => setPromotingMember(member)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 ml-auto shadow-sm transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Role Audit Log */}
      {activeSubTab === 'role_audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              রোল পরিবর্তন অডিট হিস্টোরি (Role Promotion & Demotion History)
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              Total {roleAuditLogs.length} Records
            </span>
          </div>

          <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-400">
                <thead className="bg-[#0E0E10] text-[11px] uppercase tracking-wider text-gray-500 border-b border-[#1E1E20]">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Performed By</th>
                    <th className="py-3 px-3 text-center">Action</th>
                    <th className="py-3 px-4">Target Member</th>
                    <th className="py-3 px-4">Details & Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E1E20]">
                  {roleAuditLogs.map(log => {
                    const isPromote = log.action.includes('PROMOTE');
                    return (
                      <tr key={log.id} className="hover:bg-[#18181B] transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>

                        <td className="py-3 px-4 font-bold text-white">
                          <span className="px-1.5 py-0.5 bg-[#1E1E20] rounded text-[10px] text-indigo-300 font-mono mr-1.5">
                            {log.adminRole}
                          </span>
                          {log.adminName}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPromote 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          }`}>
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-semibold text-white">
                          {log.targetName || log.targetId}
                        </td>

                        <td className="py-3 px-4 text-gray-300">
                          {log.details}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {roleAuditLogs.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-xs">
                এখনও কোনো রোল পরিবর্তনের রেকর্ড নেই।
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROMOTION CONFIRMATION MODAL */}
      {promotingMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131315] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  🛡️ Make Admin?
                </h3>
                <p className="text-xs text-gray-400">
                  নিশ্চিতকরণ উইন্ডো (Role Promotion Confirmation)
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#0A0A0C] border border-[#1E1E20] rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2.5">
                <img 
                  src={promotingMember.avatar} 
                  alt={promotingMember.name} 
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-emerald-500/30"
                />
                <div>
                  <div className="font-bold text-white text-sm">
                    {promotingMember.name}
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono">
                    Member #{promotingMember.memberNumber} • {promotingMember.email}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-gray-300 leading-relaxed">
                আপনি <strong className="text-white">{promotingMember.name}</strong>-কে Admin করতে যাচ্ছেন।
              </div>

              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300 text-[11px] leading-relaxed">
                ℹ️ <strong>ক্ষমতা:</strong> Admin হলে এই ব্যক্তি অন্যান্য Member এবং Admin-এর Role পরিবর্তন করতে পারবে।
              </div>

              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-[11px] leading-relaxed">
                ⚠️ <strong>সংরক্ষণ নীতি:</strong> Developer / System Admin (Murad Shihab) সবসময় এই permission-এর বাইরে ও সংরক্ষিত থাকবে।
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                অতিরিক্ত নোট / কারণ (ঐচ্ছিক):
              </label>
              <input
                type="text"
                value={promotionNote}
                onChange={(e) => setPromotionNote(e.target.value)}
                placeholder="যেমন: বিশ্বস্ত পার্টনার হিসেবে এডমিন নিয়োগ..."
                className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#1E1E20] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E1E20]">
              <button
                onClick={() => {
                  setPromotingMember(null);
                  setPromotionNote('');
                }}
                className="px-4 py-2 bg-[#0E0E10] hover:bg-[#1E1E20] border border-[#1E1E20] text-gray-300 font-bold text-xs rounded-xl transition-colors"
              >
                বাতিল (Cancel)
              </button>
              
              <button
                onClick={handleConfirmPromote}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                🛡️ Make Admin
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DEMOTION CONFIRMATION MODAL */}
      {demotingAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131315] border border-rose-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  ⚠️ Demote Admin?
                </h3>
                <p className="text-xs text-gray-400">
                  এডমিন প্রত্যাহার উইন্ডো (Admin Demotion Confirmation)
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#0A0A0C] border border-[#1E1E20] rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2.5">
                <img 
                  src={demotingAdmin.avatar} 
                  alt={demotingAdmin.name} 
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-rose-500/30"
                />
                <div>
                  <div className="font-bold text-white text-sm">
                    {demotingAdmin.name}
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono">
                    Member #{demotingAdmin.memberNumber} • {demotingAdmin.email}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-gray-300 leading-relaxed">
                আপনি <strong className="text-white">{demotingAdmin.name}</strong>-কে Admin পদ থেকে সাধারণ Member হিসেবে ডিমোট করতে যাচ্ছেন।
              </div>

              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-[11px] leading-relaxed">
                ⚠️ ডিমোট করার পর তিনি আর এডমিন প্যানেল এক্সেস করতে পারবেন না এবং সাধারণ মেম্বারের মতো সাপোর্ট বিনিময় করবেন।
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                ডিমোটের কারণ (ঐচ্ছিক):
              </label>
              <input
                type="text"
                value={demotionNote}
                onChange={(e) => setDemotionNote(e.target.value)}
                placeholder="যেমন: নিয়ম লঙ্ঘন অথবা ব্যক্তিগত অনুরোধ..."
                className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#1E1E20] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E1E20]">
              <button
                onClick={() => {
                  setDemotingAdmin(null);
                  setDemotionNote('');
                }}
                className="px-4 py-2 bg-[#0E0E10] hover:bg-[#1E1E20] border border-[#1E1E20] text-gray-300 font-bold text-xs rounded-xl transition-colors"
              >
                বাতিল (Cancel)
              </button>
              
              <button
                onClick={handleConfirmDemote}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
              >
                <UserX className="w-4 h-4" />
                ⚠️ Demote to Member
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
