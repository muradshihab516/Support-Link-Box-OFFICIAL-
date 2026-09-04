import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Snowflake, 
  ShieldAlert, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  MoreVertical, 
  Download, 
  Flame,
  ExternalLink,
  Plus,
  Link as LinkIcon
} from 'lucide-react';
import { Member, MemberRole, MemberStatus } from '../../types';
import { exportToCSV, getStatusBadgeColor } from '../../utils/helpers';
import { LinkSubmissionModal } from '../member/LinkSubmissionModal';

export const MemberManagement: React.FC = () => {
  const { 
    members, 
    updateMemberStatus, 
    updateMemberPoints, 
    registerMember, 
    removeMember, 
    issueNotice 
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modals state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [proxySubmitMemberId, setProxySubmitMemberId] = useState<string | null>(null);
  const [warningTarget, setWarningTarget] = useState<Member | null>(null);
  const [warningText, setWarningText] = useState('');
  const [warningType, setWarningType] = useState<'simple_warning' | 'alert_warning' | 'kickout_warning'>('simple_warning');

  // Add Member Form
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFacebookUrl, setNewFacebookUrl] = useState('');
  const [addMsg, setAddMsg] = useState('');

  // Filtered members
  const filtered = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.username.toLowerCase().includes(search.toLowerCase()) ||
      m.memberNumber.toString().includes(search);

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(m => m.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkFreeze = () => {
    if (!selectedIds.size) return;
    if (confirm(`Freeze ${selectedIds.size} selected members?`)) {
      selectedIds.forEach(id => updateMemberStatus(id, 'frozen'));
      setSelectedIds(new Set());
    }
  };

  const handleBulkExport = () => {
    const exportData = filtered.map(m => ({
      'Member #': m.memberNumber,
      Name: m.name,
      Username: `@${m.username}`,
      Email: m.email,
      Role: m.role,
      Status: m.status,
      'Links Submitted': m.linksSubmitted,
      'Supports Completed': m.supportsCompleted,
      'Completion %': m.completionRate,
      'Total Points': m.totalPoints,
      'Streak (Days)': m.currentStreak,
      'Inactivity (Days)': m.inactivityDays,
      'Warnings Count': m.warningCount,
      'Facebook URL': m.facebookUrl,
      'Join Date': m.joinedAt
    }));
    exportToCSV('Support_Link_Box_Members', exportData);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUsername) return;
    const res = registerMember({
      name: newName,
      username: newUsername,
      email: newEmail || `${newUsername}@gmail.com`,
      facebookUrl: newFacebookUrl || `https://facebook.com/${newUsername}`
    });
    if (res.success) {
      setAddMsg('Member added successfully!');
      setTimeout(() => {
        setNewName('');
        setNewUsername('');
        setNewEmail('');
        setNewFacebookUrl('');
        setAddMsg('');
        setShowAddModal(false);
      }, 1000);
    } else {
      setAddMsg(res.message);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    updateMemberPoints(editingMember.id, editingMember.totalPoints);
    updateMemberStatus(editingMember.id, editingMember.status);
    setEditingMember(null);
  };

  const handleSendWarning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warningTarget || !warningText.trim()) return;
    issueNotice(
      warningType === 'kickout_warning' ? 'Final Kickout Notice' : warningType === 'alert_warning' ? 'Inactivity Alert Warning' : 'Support Reminder Notice',
      warningText.trim(),
      warningType,
      warningTarget.id
    );
    setWarningTarget(null);
    setWarningText('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Users className="w-6 h-6 text-indigo-400" />
            Member Directory & Governance
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage {members.length} registered community creators, adjust points, status and penalties.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkExport}
            className="px-3 py-2 bg-[#131315] border border-[#1E1E20] text-gray-300 hover:text-white font-bold text-xs rounded-lg flex items-center gap-1.5 hover:bg-[#1E1E20] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Filter and Bulk Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#131315] p-3 rounded-2xl border border-[#1E1E20] shadow-xs">
        
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'active', 'inactive', 'frozen', 'suspended'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#0E0E10] border border-[#1E1E20] text-gray-400 hover:text-white hover:bg-[#1E1E20]'
              }`}
            >
              {st} {st !== 'all' && `(${members.filter(m => m.status === st).length})`}
            </button>
          ))}
        </div>

        {/* Search & Bulk Actions */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs text-indigo-400 font-bold">{selectedIds.size} selected</span>
              <button
                onClick={handleBulkFreeze}
                className="px-2.5 py-1 text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-1"
              >
                <Snowflake className="w-3 h-3" /> Freeze
              </button>
            </div>
          )}

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search member, username, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:border-indigo-500 text-white placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E0E10] text-gray-400 font-semibold border-b border-[#1E1E20]">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded bg-[#0E0E10] border-[#1E1E20] text-indigo-600 focus:ring-0"
                  />
                </th>
                <th className="py-3 px-3 w-14">#ID</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Links</th>
                <th className="py-3 px-3 text-center">Supports</th>
                <th className="py-3 px-3 text-center">Rate</th>
                <th className="py-3 px-3 text-center">Points</th>
                <th className="py-3 px-3 text-center">Streak</th>
                <th className="py-3 px-3 text-center">Inactivity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E20]">
              {filtered.map(member => {
                const isSelected = selectedIds.has(member.id);

                return (
                  <tr 
                    key={member.id}
                    className={`hover:bg-[#18181B] transition-colors ${
                      isSelected ? 'bg-indigo-600/10' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(member.id)}
                        className="rounded bg-[#0E0E10] border-[#1E1E20] text-indigo-600 focus:ring-0"
                      />
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-gray-500">
                      #{member.memberNumber}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-[#1E1E20] shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate flex items-center gap-1.5">
                            {member.name}
                            {member.role !== 'member' && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded font-semibold capitalize">
                                {member.role.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">
                            @{member.username} • {member.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusBadgeColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-semibold text-gray-300">
                      {member.linksSubmitted}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-semibold text-gray-300">
                      {member.supportsCompleted}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`font-bold font-mono ${member.completionRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {member.completionRate}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-indigo-400">
                      {member.totalPoints}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-0.5 text-orange-400 font-bold">
                        <Flame className="w-3 h-3 fill-orange-400" />
                        {member.currentStreak}d
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      <span className={member.inactivityDays >= 3 ? 'text-red-400 font-bold' : 'text-gray-500'}>
                        {member.inactivityDays}d
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* Quick Freeze / Unfreeze */}
                        {member.status === 'frozen' ? (
                          <button
                            onClick={() => updateMemberStatus(member.id, 'active')}
                            title="Unfreeze member"
                            className="p-1.5 text-blue-400 hover:bg-[#1E1E20] rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateMemberStatus(member.id, 'frozen')}
                            title="Freeze member"
                            className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-[#1E1E20] rounded-lg transition-colors"
                          >
                            <Snowflake className="w-4 h-4" />
                          </button>
                        )}

                        {/* Submit Link on behalf of Member (Proxy) */}
                        <button
                          onClick={() => setProxySubmitMemberId(member.id)}
                          title={`মেম্বারের হয়ে লিংক সাবমিট করুন (#${member.memberNumber} ${member.name})`}
                          className="p-1.5 text-gray-500 hover:text-emerald-400 hover:bg-[#1E1E20] rounded-lg transition-colors"
                        >
                          <LinkIcon className="w-4 h-4 text-emerald-400" />
                        </button>

                        {/* Direct Warning Button */}
                        <button
                          onClick={() => setWarningTarget(member)}
                          title="Issue Warning Notice"
                          className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-[#1E1E20] rounded-lg transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingMember(member)}
                          title="Edit member points & details"
                          className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-[#1E1E20] rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Remove */}
                        <button
                          onClick={() => {
                            if (confirm(`Remove member ${member.name} (#${member.memberNumber})?`)) {
                              removeMember(member.id);
                            }
                          }}
                          title="Remove Member"
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-[#1E1E20] rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#131315] rounded-2xl shadow-2xl border border-[#1E1E20] w-full max-w-md p-5 space-y-4 text-white">
            <h3 className="text-sm font-bold text-white">
              Edit Member: {editingMember.name} (#{editingMember.memberNumber})
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
                <select
                  value={editingMember.status}
                  onChange={e => setEditingMember({ ...editingMember, status: e.target.value as MemberStatus })}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500"
                >
                  <option value="active" className="bg-[#131315]">Active</option>
                  <option value="inactive" className="bg-[#131315]">Inactive</option>
                  <option value="frozen" className="bg-[#131315]">Frozen</option>
                  <option value="suspended" className="bg-[#131315]">Suspended</option>
                  <option value="removed" className="bg-[#131315]">Removed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Role</label>
                <select
                  value={editingMember.role}
                  onChange={e => setEditingMember({ ...editingMember, role: e.target.value as MemberRole })}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500"
                >
                  <option value="member" className="bg-[#131315]">Member</option>
                  <option value="admin" className="bg-[#131315]">Admin</option>
                  <option value="super_admin" className="bg-[#131315]">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Total Points</label>
                <input
                  type="number"
                  value={editingMember.totalPoints}
                  onChange={e => setEditingMember({ ...editingMember, totalPoints: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Current Streak (Days)</label>
                <input
                  type="number"
                  value={editingMember.currentStreak}
                  onChange={e => setEditingMember({ ...editingMember, currentStreak: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {warningTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#131315] rounded-2xl shadow-2xl border border-[#1E1E20] w-full max-w-md p-5 space-y-4 text-white">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Issue Notice to {warningTarget.name}
            </h3>

            <form onSubmit={handleSendWarning} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Warning Severity</label>
                <select
                  value={warningType}
                  onChange={e => setWarningType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500"
                >
                  <option value="simple_warning" className="bg-[#131315]">Simple Support Warning (1st Notice)</option>
                  <option value="alert_warning" className="bg-[#131315]">Alert Warning (3+ Days Inactive)</option>
                  <option value="kickout_warning" className="bg-[#131315]">Final Kickout / Freeze Warning</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Notice Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="You missed daily link supports on 27 & 28 August. Complete pending supports today or your account will be frozen."
                  value={warningText}
                  onChange={e => setWarningText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500 resize-none placeholder-gray-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWarningTarget(null)}
                  className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-xs"
                >
                  Issue Official Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#131315] rounded-2xl shadow-2xl border border-[#1E1E20] w-full max-w-md p-5 space-y-4 text-white">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              Add Single Member
            </h3>

            {addMsg && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl">
                {addMsg}
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahfuzur Rahman"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500 placeholder-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Username (without @) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mahfuz_rahman"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500 placeholder-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Facebook URL</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/mahfuz_rahman"
                  value={newFacebookUrl}
                  onChange={e => setNewFacebookUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500 placeholder-gray-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-600/20"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proxy Link Submission Modal */}
      {proxySubmitMemberId && (
        <LinkSubmissionModal
          isOpen={!!proxySubmitMemberId}
          onClose={() => setProxySubmitMemberId(null)}
          initialTargetMemberId={proxySubmitMemberId}
        />
      )}

    </div>
  );
};
