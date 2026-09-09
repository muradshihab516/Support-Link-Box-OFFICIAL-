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
  Link as LinkIcon,
  Lock,
  Unlock,
  Check,
  X,
  Copy,
  FileCode,
  FileSpreadsheet,
  ShieldCheck,
  Clock,
  CheckCheck,
  AlertCircle,
  Crown,
  UserX,
  UserCheck
} from 'lucide-react';
import { Member, MemberRole, MemberStatus, NameChangeRequest } from '../../types';
import { exportToCSV, getStatusBadgeColor } from '../../utils/helpers';
import { LinkSubmissionModal } from '../member/LinkSubmissionModal';
import { normalizeFacebookName } from '../../utils/facebookIdentity';

export const MemberManagement: React.FC = () => {
  const { 
    members, 
    updateMemberStatus, 
    updateMemberPoints, 
    registerMember, 
    removeMember, 
    issueNotice,
    exportGapCheckerMemberList,
    nameChangeRequests,
    reviewNameChangeRequest,
    adminUpdateMemberFacebookName,
    toggleMemberNameLock,
    toggleMemberNameMismatch,
    approveMemberRegistration,
    rejectMemberRegistration,
    isDeveloper,
    promoteToAdmin,
    demoteAdminToMember
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Role promotion / demotion confirmation states
  const [promotingMember, setPromotingMember] = useState<Member | null>(null);
  const [promotionNote, setPromotionNote] = useState('');
  const [demotingMember, setDemotingMember] = useState<Member | null>(null);
  const [demotionNote, setDemotionNote] = useState('');
  
  // Modals state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApprovalsModal, setShowApprovalsModal] = useState(false);
  const [proxySubmitMemberId, setProxySubmitMemberId] = useState<string | null>(null);
  const [warningTarget, setWarningTarget] = useState<Member | null>(null);
  const [warningText, setWarningText] = useState('');
  const [warningType, setWarningType] = useState<'simple_warning' | 'alert_warning' | 'kickout_warning'>('simple_warning');

  // Name Change Requests Modal
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [reviewNote, setReviewNote] = useState<{ [id: string]: string }>({});

  // Direct Edit Facebook Name Modal
  const [editingFbNameMember, setEditingFbNameMember] = useState<Member | null>(null);
  const [newFbNameValue, setNewFbNameValue] = useState('');
  const [adminNoteValue, setAdminNoteValue] = useState('');
  const [fbNameEditMsg, setFbNameEditMsg] = useState('');

  // Add Member Form
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFacebookUrl, setNewFacebookUrl] = useState('');
  const [addMsg, setAddMsg] = useState('');

  // Copy GapChecker button state
  const [copiedTxt, setCopiedTxt] = useState(false);

  // Pending requests count
  const pendingRequestsCount = nameChangeRequests.filter(r => r.status === 'pending').length;
  const pendingApprovalsCount = members.filter(m => m.status === 'pending_approval').length;
  const mismatchCount = members.filter(m => m.nameMismatchFlag).length;

  // Filtered members
  const filtered = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.facebookName && m.facebookName.toLowerCase().includes(search.toLowerCase())) ||
      m.username.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.normalizedFbId && m.normalizedFbId.toLowerCase().includes(search.toLowerCase())) ||
      m.memberNumber.toString().includes(search);

    if (!matchesSearch) return false;

    if (statusFilter === 'admins') return m.role === 'admin' || m.role === 'super_admin' || m.role === 'developer' || m.role === 'moderator';
    if (statusFilter === 'members') return m.role === 'member';
    if (statusFilter === 'mismatch') return m.nameMismatchFlag;
    if (statusFilter === 'locked') return m.nameLocked;
    if (statusFilter === 'unlocked') return !m.nameLocked;
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
      'Facebook Name': m.facebookName || m.name,
      'Normalized Name': m.normalizedName || '',
      'Normalized FB ID': m.normalizedFbId || '',
      'Name Locked': m.nameLocked ? 'YES' : 'NO',
      'Name Mismatch': m.nameMismatchFlag ? 'YES' : 'NO',
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

  const handleCopyGapCheckerList = () => {
    const activeNames = members
      .filter(m => m.status === 'active')
      .map(m => (m.facebookName || m.name).trim())
      .filter(Boolean);
    navigator.clipboard.writeText(activeNames.join('\n'));
    setCopiedTxt(true);
    setTimeout(() => setCopiedTxt(false), 2000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const cleanUsername = newUsername.trim() || newName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const res = registerMember({
      name: newName.trim(),
      facebookName: newName.trim(),
      username: cleanUsername,
      email: newEmail.trim() || `${cleanUsername}@gmail.com`,
      facebookUrl: newFacebookUrl.trim() || `https://facebook.com/${cleanUsername}`
    });
    if (res.success) {
      setAddMsg('সদস্য সফলভাবে যোগ করা হয়েছে!');
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

  const handleOpenEditFbName = (m: Member) => {
    setEditingFbNameMember(m);
    setNewFbNameValue(m.facebookName || m.name);
    setAdminNoteValue('');
    setFbNameEditMsg('');
  };

  const handleSaveFbName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFbNameMember || !newFbNameValue.trim()) return;

    const res = adminUpdateMemberFacebookName(
      editingFbNameMember.id, 
      newFbNameValue.trim(), 
      adminNoteValue.trim()
    );

    if (res.success) {
      setFbNameEditMsg(res.message);
      setTimeout(() => {
        setEditingFbNameMember(null);
      }, 900);
    } else {
      setFbNameEditMsg(res.message);
    }
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
            Member Directory & Identity Governance
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {members.length} registered members — Facebook name locking, GapChecker verification & Supabase auth.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* GapChecker One-Click Copy */}
          <button
            onClick={handleCopyGapCheckerList}
            className="px-3 py-2 bg-[#131315] hover:bg-[#1E1E20] border border-[#1E1E20] text-gray-300 hover:text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            title="Copy active member names formatted for GapChecker"
          >
            {copiedTxt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{copiedTxt ? 'Copied!' : 'Copy for GapChecker'}</span>
          </button>

          {/* GapChecker TXT Export */}
          <button
            onClick={() => exportGapCheckerMemberList('txt')}
            className="px-3 py-2 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            title="Download active member names (.txt) for GapChecker"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>GapChecker .TXT</span>
          </button>

          {/* Pending Registration Approvals Badge Button */}
          <button
            onClick={() => {
              setStatusFilter('pending_approval');
              setShowApprovalsModal(true);
            }}
            className={`px-3 py-2 border font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all ${
              pendingApprovalsCount > 0 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 animate-pulse' 
                : 'bg-[#131315] border-[#1E1E20] text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>রেজিস্ট্রেশন অনুমোদন ({pendingApprovalsCount})</span>
          </button>

          {/* Name Change Requests Badge Button */}
          <button
            onClick={() => setShowRequestsModal(true)}
            className={`px-3 py-2 border font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors ${
              pendingRequestsCount > 0 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30' 
                : 'bg-[#131315] border-[#1E1E20] text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>নাম পরিবর্তন আবেদন ({pendingRequestsCount})</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleBulkExport}
            className="px-3 py-2 bg-[#131315] border border-[#1E1E20] text-gray-300 hover:text-white font-bold text-xs rounded-lg flex items-center gap-1.5 hover:bg-[#1E1E20] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>

          {/* Add Member */}
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
          {['all', 'admins', 'members', 'pending_approval', 'active', 'inactive', 'frozen', 'mismatch', 'locked', 'unlocked'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-colors flex items-center gap-1 ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : st === 'admins'
                    ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                    : st === 'pending_approval' && pendingApprovalsCount > 0
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                      : st === 'mismatch' && mismatchCount > 0
                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                        : 'bg-[#0E0E10] border border-[#1E1E20] text-gray-400 hover:text-white hover:bg-[#1E1E20]'
              }`}
            >
              {st === 'admins' ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-purple-400" />
                  <span>Admins ({members.filter(m => m.role !== 'member').length})</span>
                </>
              ) : st === 'members' ? (
                <>
                  <Users className="w-3 h-3 text-gray-400" />
                  <span>Members ({members.filter(m => m.role === 'member').length})</span>
                </>
              ) : st === 'pending_approval' ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Pending Approval ({pendingApprovalsCount})</span>
                </>
              ) : st === 'mismatch' ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>Mismatch ({mismatchCount})</span>
                </>
              ) : st === 'locked' ? (
                <>
                  <Lock className="w-3 h-3 text-indigo-400" />
                  <span>Locked ({members.filter(m => m.nameLocked).length})</span>
                </>
              ) : st === 'unlocked' ? (
                <>
                  <Unlock className="w-3 h-3 text-gray-400" />
                  <span>Unlocked ({members.filter(m => !m.nameLocked).length})</span>
                </>
              ) : (
                <>
                  {st} {st !== 'all' && `(${members.filter(m => m.status === st).length})`}
                </>
              )}
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
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, ID, FB ID, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-400">
            <thead className="bg-[#0E0E10] text-[11px] uppercase tracking-wider text-gray-500 border-b border-[#1E1E20]">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={toggleSelectAll}
                    className="rounded bg-[#0E0E10] border-[#1E1E20] text-indigo-600 focus:ring-0"
                  />
                </th>
                <th className="py-3 px-3">Member</th>
                <th className="py-3 px-4">Facebook Identity (GapChecker)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Name Lock</th>
                <th className="py-3 px-3 text-center">Links</th>
                <th className="py-3 px-3 text-center">Supports</th>
                <th className="py-3 px-3 text-center">Rate</th>
                <th className="py-3 px-3 text-center">Points</th>
                <th className="py-3 px-3 text-center">Streak</th>
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

                    {/* Member Details */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-[#1E1E20] shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate flex items-center gap-1.5">
                            <span className="font-mono text-gray-500 text-[11px]">#{member.memberNumber}</span>
                            <span>{member.name}</span>
                            {member.role !== 'member' && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded font-semibold capitalize">
                                {member.role.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Facebook Identity & Verification */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs">
                            {member.facebookName || member.name}
                          </span>
                          {member.nameMismatchFlag && (
                            <span className="px-1.5 py-0.2 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[9px] font-bold rounded flex items-center gap-0.5" title="GapChecker Alert: Facebook comment name mismatch">
                              <AlertTriangle className="w-2.5 h-2.5" /> Mismatch
                            </span>
                          )}
                          <button
                            onClick={() => handleOpenEditFbName(member)}
                            className="p-1 text-gray-400 hover:text-indigo-400 hover:bg-[#0E0E10] rounded transition-colors"
                            title="Edit verified Facebook Name"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
                          {member.normalizedName && (
                            <span className="px-1.5 py-0.2 bg-[#0E0E10] border border-[#1E1E20] text-gray-400 rounded font-mono">
                              Norm: {member.normalizedName}
                            </span>
                          )}
                          {member.normalizedFbId && (
                            <span className="px-1.5 py-0.2 bg-[#0E0E10] border border-[#1E1E20] text-indigo-400 font-mono">
                              ID: {member.normalizedFbId}
                            </span>
                          )}
                          {member.facebookUrl && (
                            <a
                              href={member.facebookUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline flex items-center gap-0.5"
                            >
                              <ExternalLink className="w-2.5 h-2.5" /> View FB
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${getStatusBadgeColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>

                    {/* Name Lock Toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleMemberNameLock(member.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          member.nameLocked
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                            : 'bg-[#0E0E10] border-[#1E1E20] text-gray-500 hover:text-gray-300'
                        }`}
                        title={member.nameLocked ? "নাম লক করা আছে (ক্লিক করে আনলক করুন)" : "নাম আনলক করা (ক্লিক করে লক করুন)"}
                      >
                        {member.nameLocked ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>

                    {/* Links */}
                    <td className="py-3 px-3 text-center font-mono font-semibold text-gray-300">
                      {member.linksSubmitted}
                    </td>

                    {/* Supports */}
                    <td className="py-3 px-3 text-center font-mono font-semibold text-gray-300">
                      {member.supportsCompleted}
                    </td>

                    {/* Rate */}
                    <td className="py-3 px-3 text-center">
                      <span className={`font-bold font-mono ${member.completionRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {member.completionRate}%
                      </span>
                    </td>

                    {/* Points */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-indigo-400">
                      {member.totalPoints}
                    </td>

                    {/* Streak */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-0.5 text-orange-400 font-bold">
                        <Flame className="w-3 h-3 fill-orange-400" />
                        {member.currentStreak}d
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* If Developer / System Admin: Show Protected Badge */}
                        {isDeveloper(member) ? (
                          <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black rounded-lg flex items-center gap-1 shadow-xs" title="Developer / System Admin (Protected)">
                            <Crown className="w-3 h-3 text-amber-400" /> Developer
                          </span>
                        ) : (
                          <>
                            {/* If Admin: Show Demote Button */}
                            {member.role === 'admin' || member.role === 'moderator' ? (
                              <button
                                onClick={() => setDemotingMember(member)}
                                title={`Demote ${member.name} to regular Member`}
                                className="px-2 py-1 text-[11px] font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <UserX className="w-3.5 h-3.5 text-rose-400" /> Demote
                              </button>
                            ) : member.status !== 'pending_approval' ? (
                              /* If Regular Member: Show Make Admin Button */
                              <button
                                onClick={() => setPromotingMember(member)}
                                title={`Make ${member.name} Admin`}
                                className="px-2 py-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Make Admin
                              </button>
                            ) : null}
                          </>
                        )}

                        {/* If Pending Approval: Show prominent Approve and Reject buttons */}
                        {member.status === 'pending_approval' ? (
                          <>
                            <button
                              onClick={() => {
                                const res = approveMemberRegistration(member.id);
                                alert(res.message);
                              }}
                              title="রেজিস্ট্রেশন অনুমোদন (Approve)"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" /> এপ্রুভ
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Reject registration for ${member.name}?`)) {
                                  const res = rejectMemberRegistration(member.id);
                                  alert(res.message);
                                }
                              }}
                              title="রেজিস্ট্রেশন বাতিল (Reject)"
                              className="px-2 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" /> রিজেক্ট
                            </button>
                          </>
                        ) : null}

                        {/* Toggle Name Mismatch Flag */}
                        <button
                          onClick={() => toggleMemberNameMismatch(member.id)}
                          title={member.nameMismatchFlag ? "Remove Name Mismatch warning" : "Flag Name Mismatch (GapChecker warning)"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            member.nameMismatchFlag
                              ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                              : 'text-gray-500 hover:text-rose-400 hover:bg-[#1E1E20]'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>

                        {/* Quick Freeze / Unfreeze (Hidden for Developer) */}
                        {!isDeveloper(member) && (
                          member.status === 'frozen' ? (
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
                          )
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

                        {/* Remove (Hidden for Developer) */}
                        {!isDeveloper(member) && (
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
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 0: REVIEW PENDING REGISTRATION APPROVALS */}
      {showApprovalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#131315] rounded-2xl shadow-2xl border border-emerald-500/30 w-full max-w-2xl p-5 space-y-4 text-white max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#1E1E20] pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  নতুন মেম্বার রেজিস্ট্রেশন অনুমোদন (Admin Approval)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  ফেসবুকের আসল নাম, আসল প্রোফাইল ছবি ও লিঙ্ক যাচাই করে অনুমোদন করুন। অনুমোদন ব্যতীত মেম্বার লগইন করতে পারবে না।
                </p>
              </div>
              <button 
                onClick={() => setShowApprovalsModal(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {members.filter(m => m.status === 'pending_approval').length === 0 ? (
                <div className="text-center py-12 text-gray-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mx-auto" />
                  <p className="text-sm font-semibold text-gray-300">কোনো মুলতুবি (Pending) রেজিস্ট্রেশন নেই</p>
                  <p className="text-xs text-gray-500">সব নতুন মেম্বার অনুমোদিত বা প্রক্রিয়াজাত হয়েছে।</p>
                </div>
              ) : (
                members.filter(m => m.status === 'pending_approval').map(m => (
                  <div 
                    key={m.id}
                    className="p-4 rounded-xl border border-emerald-500/30 bg-[#16191E] space-y-3 shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar preview */}
                      <div className="relative shrink-0">
                        <img 
                          src={m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                          alt={m.name} 
                          className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/60 shadow"
                        />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-[#16191E]" title="Awaiting Approval" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                            {m.name}
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              আবেদনকারী #{m.memberNumber}
                            </span>
                          </h4>
                          <span className="text-[11px] text-gray-400 shrink-0">
                            {m.joinDate || 'Today'}
                          </span>
                        </div>

                        <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-300">
                          <div>
                            <span className="text-gray-500">FB Name:</span>{' '}
                            <span className="font-semibold text-emerald-400">{m.facebookName || m.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Username:</span>{' '}
                            <span className="font-mono text-gray-300">@{m.username}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Email:</span>{' '}
                            <span className="font-mono text-gray-300">{m.email}</span>
                          </div>
                          {m.normalizedFbId && (
                            <div>
                              <span className="text-gray-500">Norm ID:</span>{' '}
                              <span className="font-mono text-indigo-300">{m.normalizedFbId}</span>
                            </div>
                          )}
                        </div>

                        {/* FB Profile URL Link */}
                        {m.facebookUrl && (
                          <div className="mt-2 flex items-center gap-2">
                            <a 
                              href={m.facebookUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              ফেসবুক প্রোফাইল চেক করুন
                            </a>
                            <span className="text-[11px] text-gray-500 truncate max-w-xs">{m.facebookUrl}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="pt-2 border-t border-[#1E1E20] flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          if (confirm(`Reject and delete registration for ${m.name}?`)) {
                            const res = rejectMemberRegistration(m.id);
                            alert(res.message);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> আবেদন বাতিল
                      </button>

                      <button
                        onClick={() => {
                          const res = approveMemberRegistration(m.id);
                          alert(res.message);
                        }}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                      >
                        <Check className="w-3.5 h-3.5" /> অনুমোদন করুন (Approve)
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-[#1E1E20] pt-3 flex items-center justify-between text-xs text-gray-400">
              <span>মোট মুলতুবি আবেদন: {members.filter(m => m.status === 'pending_approval').length} জন</span>
              <button
                onClick={() => setShowApprovalsModal(false)}
                className="px-4 py-1.5 bg-[#1E1E20] text-gray-300 hover:text-white rounded-lg font-medium transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REVIEW NAME CHANGE REQUESTS */}
      {showRequestsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#131315] rounded-2xl shadow-2xl border border-[#1E1E20] w-full max-w-2xl p-5 space-y-4 text-white max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1E1E20] pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  সদস্যদের ফেসবুক নাম পরিবর্তনের আবেদন
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  অনুমোদন করলে মেম্বারের ফেসবুক নাম আপডেট হবে এবং নাম লক বহাল থাকবে।
                </p>
              </div>
              <button 
                onClick={() => setShowRequestsModal(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {nameChangeRequests.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs">
                  কোনো নাম পরিবর্তনের আবেদন জমা পড়েনি।
                </div>
              ) : (
                nameChangeRequests.map(req => {
                  const reqMember = members.find(m => m.id === req.memberId);
                  const isPending = req.status === 'pending';

                  return (
                    <div 
                      key={req.id}
                      className={`p-4 rounded-xl border space-y-3 ${
                        isPending 
                          ? 'bg-[#18181B] border-amber-500/30' 
                          : 'bg-[#0E0E10] border-[#1E1E20] opacity-80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">
                            {reqMember ? `${reqMember.name} (#${reqMember.memberNumber})` : 'সদস্য'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            req.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          তারিখ: {req.createdAt}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-[#0E0E10] border border-[#1E1E20] rounded-lg">
                          <span className="text-gray-500 text-[10px] block">বর্তমান নাম:</span>
                          <span className="font-semibold text-gray-300">{req.oldName}</span>
                        </div>
                        <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                          <span className="text-indigo-400 text-[10px] block">অনুরোধকৃত নতুন নাম:</span>
                          <span className="font-bold text-white">{req.requestedName}</span>
                        </div>
                      </div>

                      {req.reason && (
                        <div className="text-xs text-gray-300 bg-[#0E0E10] p-2.5 rounded-lg border border-[#1E1E20]">
                          <span className="text-gray-500 text-[10px] block">আবেদনের কারণ:</span>
                          <span>{req.reason}</span>
                        </div>
                      )}

                      {req.adminNote && (
                        <div className="text-xs text-gray-400 bg-[#0E0E10] p-2 rounded-lg">
                          <strong>অ্যাডমিন নোট:</strong> {req.adminNote}
                        </div>
                      )}

                      {isPending && (
                        <div className="pt-2 border-t border-[#1E1E20] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="অ্যাডমিন নোট (ঐচ্ছিক)..."
                            value={reviewNote[req.id] || ''}
                            onChange={e => setReviewNote({ ...reviewNote, [req.id]: e.target.value })}
                            className="px-3 py-1.5 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 flex-1"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                reviewNameChangeRequest(req.id, 'rejected', reviewNote[req.id]);
                              }}
                              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <X className="w-3 h-3" /> বাতিল
                            </button>
                            <button
                              onClick={() => {
                                reviewNameChangeRequest(req.id, 'approved', reviewNote[req.id]);
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-emerald-600/20"
                            >
                              <Check className="w-3.5 h-3.5" /> অনুমোদন করুন
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DIRECT EDIT FACEBOOK NAME */}
      {editingFbNameMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#131315] rounded-2xl shadow-2xl border border-[#1E1E20] w-full max-w-md p-5 space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-400" />
                Edit Facebook Name — #{editingFbNameMember.memberNumber}
              </h3>
              <button 
                onClick={() => setEditingFbNameMember(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {fbNameEditMsg && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl">
                {fbNameEditMsg}
              </div>
            )}

            <form onSubmit={handleSaveFbName} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  ফেসবুক প্রোফাইল নাম (Exact Facebook Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed (রানা)"
                  value={newFbNameValue}
                  onChange={e => setNewFbNameValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500 placeholder-gray-600"
                />
                {newFbNameValue && (
                  <div className="mt-1 text-[11px] text-gray-500">
                    GapChecker Normalized: <span className="text-indigo-400 font-mono">{normalizeFacebookName(newFbNameValue)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  পরিবর্তনের কারণ / অডিট নোট (Audit Reason)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: নামের বানান ভুল ছিল / ফেসবুক আইডি রিনেম করেছে"
                  value={adminNoteValue}
                  onChange={e => setAdminNoteValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500 placeholder-gray-600"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 leading-relaxed">
                ℹ️ নাম পরিবর্তন সম্পন্ন হলে মেম্বারের নাম স্বয়ংক্রিয়ভাবে <strong>LOCKED</strong> থাকবে যাতে পরবর্তীতে কোনো কনফ্লিক্ট না ঘটে।
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFbNameMember(null)}
                  className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-600/20"
                >
                  Save Facebook Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member General Details Modal */}
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
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Facebook Profile Name *</label>
                <input
                  type="text"
                  required
                  placeholder="হুবহু ফেসবুক নাম, যেমন: Mahfuzur Rahman"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500 placeholder-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. mahfuz@gmail.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500 placeholder-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Facebook URL (Profile Link) *</label>
                <input
                  type="url"
                  placeholder="https://www.facebook.com/profile.php?id=..."
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

      {/* Promotion Confirmation Modal */}
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
                  এডমিন নিয়োগ নিশ্চিতকরণ উইন্ডো
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
                ⚠️ <strong>সংরক্ষণ নীতি:</strong> Developer/System Admin (Murad Shihab) এই permission-এর বাইরে থাকবে।
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                কারণ / নোট (ঐচ্ছিক):
              </label>
              <input
                type="text"
                value={promotionNote}
                onChange={(e) => setPromotionNote(e.target.value)}
                placeholder="যেমন: বিশ্বস্ত এডমিন হিসেবে দায়িত্ব প্রদান..."
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
                onClick={() => {
                  const res = promoteToAdmin(promotingMember.id, promotionNote.trim() || undefined);
                  alert(res.message);
                  if (res.success) {
                    setPromotingMember(null);
                    setPromotionNote('');
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                🛡️ Make Admin
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Demotion Confirmation Modal */}
      {demotingMember && (
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
                  এডমিন রোল প্রত্যাহার উইন্ডো
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#0A0A0C] border border-[#1E1E20] rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2.5">
                <img 
                  src={demotingMember.avatar} 
                  alt={demotingMember.name} 
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-rose-500/30"
                />
                <div>
                  <div className="font-bold text-white text-sm">
                    {demotingMember.name}
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono">
                    Member #{demotingMember.memberNumber} • {demotingMember.email}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-gray-300 leading-relaxed">
                আপনি <strong className="text-white">{demotingMember.name}</strong>-কে Admin পদ থেকে সাধারণ Member হিসেবে ডিমোট করতে যাচ্ছেন।
              </div>

              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-[11px] leading-relaxed">
                ⚠️ ডিমোট করার পর তিনি আর এডমিন প্যানেল এক্সেস করতে পারবেন না।
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
                placeholder="যেমন: দায়িত্বে অব্যাহতি..."
                className="w-full px-3 py-2 bg-[#0A0A0C] border border-[#1E1E20] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1E1E20]">
              <button
                onClick={() => {
                  setDemotingMember(null);
                  setDemotionNote('');
                }}
                className="px-4 py-2 bg-[#0E0E10] hover:bg-[#1E1E20] border border-[#1E1E20] text-gray-300 font-bold text-xs rounded-xl transition-colors"
              >
                বাতিল (Cancel)
              </button>
              
              <button
                onClick={() => {
                  const res = demoteAdminToMember(demotingMember.id, demotionNote.trim() || undefined);
                  alert(res.message);
                  if (res.success) {
                    setDemotingMember(null);
                    setDemotionNote('');
                  }
                }}
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
